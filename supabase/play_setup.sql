-- 960dojo live play setup
-- Run in Supabase SQL editor before using the live play feature.

CREATE TABLE IF NOT EXISTS public."PlayRatingState" (
  "userId" text NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  rating integer NOT NULL DEFAULT 1500,
  rd double precision NOT NULL DEFAULT 350,
  volatility double precision NOT NULL DEFAULT 0.06,
  "gamesPlayed" integer NOT NULL DEFAULT 0,
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("userId", "type")
);

CREATE TABLE IF NOT EXISTS public."PlayNotification" (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "senderId" text NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
  "gameId" text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  "read" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "PlayNotification_userId_status_createdAt_idx"
  ON public."PlayNotification" ("userId", status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "PlayNotification_gameId_kind_status_idx"
  ON public."PlayNotification" ("gameId", kind, status);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Client-side read/update
GRANT SELECT, UPDATE ON TABLE public."PlayNotification" TO authenticated;
GRANT SELECT ON TABLE public."PlayRatingState" TO anon, authenticated;

-- Server-side (service role) full access
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."PlayNotification" TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."PlayRatingState" TO service_role;

ALTER TABLE public."PlayRatingState" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PlayNotification" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PlayRatingState_select_all" ON public."PlayRatingState";
CREATE POLICY "PlayRatingState_select_all"
  ON public."PlayRatingState" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "PlayNotification_select_own" ON public."PlayNotification";
CREATE POLICY "PlayNotification_select_own"
  ON public."PlayNotification" FOR SELECT
  TO authenticated
  USING ("userId" = public.current_app_user_id());

DROP POLICY IF EXISTS "PlayNotification_update_own" ON public."PlayNotification";
CREATE POLICY "PlayNotification_update_own"
  ON public."PlayNotification" FOR UPDATE
  TO authenticated
  USING ("userId" = public.current_app_user_id())
  WITH CHECK ("userId" = public.current_app_user_id());
