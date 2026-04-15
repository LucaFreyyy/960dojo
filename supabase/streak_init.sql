-- One-time backfill: set CURRENT streak from activity (UTC days), then set LONGEST = CURRENT only.
-- Does not scan for historical longest islands beyond the active tail (per product request).
-- After this, the app refresh recomputes longest from full history on next qualifying update.

CREATE OR REPLACE FUNCTION public._play_streak_init_row(p_uid text)
RETURNS TABLE("currentStreak" integer, "lastActivityDate" date, "playedToday" boolean)
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $func$
DECLARE
  today_utc date := (timezone('utc', now()))::date;
  arr date[];
  anchor date;
  cnt integer := 0;
  dd date;
  last_d date;
BEGIN
  SELECT coalesce(array_agg(x.d ORDER BY x.d), '{}'::date[]) INTO arr
  FROM (
    SELECT DISTINCT (ut.finished AT TIME ZONE 'UTC')::date AS d
    FROM public."UserTactic" ut
    WHERE ut."userId" = p_uid AND ut.finished IS NOT NULL
    UNION
    SELECT DISTINCT (uo.finished AT TIME ZONE 'UTC')::date AS d
    FROM public."UserOpening" uo
    WHERE uo."userId" = p_uid AND uo.finished IS NOT NULL
  ) x;

  IF arr = '{}'::date[] THEN
    "currentStreak" := 0;
    "lastActivityDate" := NULL;
    "playedToday" := false;
    RETURN NEXT;
    RETURN;
  END IF;

  last_d := arr[cardinality(arr)];

  IF arr @> ARRAY[today_utc]::date[] THEN
    anchor := today_utc;
  ELSIF arr @> ARRAY[(today_utc - 1)]::date[] THEN
    anchor := today_utc - 1;
  ELSE
    "currentStreak" := 0;
    "lastActivityDate" := last_d;
    "playedToday" := false;
    RETURN NEXT;
    RETURN;
  END IF;

  dd := anchor;
  WHILE dd = ANY(arr) LOOP
    cnt := cnt + 1;
    dd := dd - 1;
  END LOOP;

  "currentStreak" := cnt;
  "lastActivityDate" := last_d;
  "playedToday" := (last_d = today_utc);
  RETURN NEXT;
  RETURN;
END;
$func$;

INSERT INTO public."Streak" ("userId", "currentStreak", "longestStreak", "lastActivityDate", "playedToday", "updatedAt")
SELECT
  u.id,
  r."currentStreak",
  r."currentStreak",
  r."lastActivityDate",
  coalesce(r."playedToday", false),
  now()
FROM public."User" u
CROSS JOIN LATERAL public._play_streak_init_row(u.id) r
WHERE r."lastActivityDate" IS NOT NULL
ON CONFLICT ("userId") DO UPDATE SET
  "currentStreak" = EXCLUDED."currentStreak",
  "longestStreak" = EXCLUDED."longestStreak",
  "lastActivityDate" = EXCLUDED."lastActivityDate",
  "playedToday" = EXCLUDED."playedToday",
  "updatedAt" = EXCLUDED."updatedAt";

-- Optional: drop helper after run
-- DROP FUNCTION IF EXISTS public._play_streak_init_row(text);
