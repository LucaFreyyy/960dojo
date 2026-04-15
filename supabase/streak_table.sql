-- Daily play streak (tactics + openings), UTC calendar days.
-- Run in Supabase SQL Editor after reviewing. Then append policies from rls.sql (Streak block)
-- or run the Streak section added to rls.sql.

CREATE TABLE IF NOT EXISTS public."Streak" (
  "userId" text PRIMARY KEY REFERENCES public."User"(id) ON DELETE CASCADE,
  "currentStreak" integer NOT NULL DEFAULT 0,
  "longestStreak" integer NOT NULL DEFAULT 0,
  "lastActivityDate" date NULL,
  "playedToday" boolean NOT NULL DEFAULT false,
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_streak_longest_desc ON public."Streak" ("longestStreak" DESC, "currentStreak" DESC);

COMMENT ON TABLE public."Streak" IS 'One row per user: daily UTC streak from UserTactic/UserOpening finished timestamps.';
