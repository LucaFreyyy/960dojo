-- Daily rollover for playedToday.
-- Recommended: run once in Supabase SQL Editor to schedule a daily job.
-- Requires pg_cron + pg_net extensions (available on Supabase managed Postgres).

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old job if it exists.
DO $$
BEGIN
  PERFORM cron.unschedule('streak-reset-playedtoday-daily');
EXCEPTION
  WHEN OTHERS THEN
    -- no-op when not scheduled yet
    NULL;
END
$$;

-- Runs every day at 00:05 UTC.
SELECT cron.schedule(
  'streak-reset-playedtoday-daily',
  '5 0 * * *',
  $sql$
    UPDATE public."Streak"
    SET "playedToday" = false,
        "updatedAt" = now()
    WHERE "playedToday" = true
      AND (
        "lastActivityDate" IS NULL
        OR "lastActivityDate" < (timezone('utc', now()))::date
      );
  $sql$
);

-- Optional: run once immediately after creating schedule.
-- UPDATE public."Streak"
-- SET "playedToday" = false, "updatedAt" = now()
-- WHERE "playedToday" = true
--   AND ("lastActivityDate" IS NULL OR "lastActivityDate" < (timezone('utc', now()))::date);
