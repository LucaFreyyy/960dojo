-- 960dojo Row Level Security
-- Run in Supabase → SQL Editor (once). Service role bypasses RLS.
-- To undo: run supabase/rls_revert.sql in the SQL Editor.
--
-- Written for your schema: "User", "Rating", "Game", "Tactic", "UserTactic",
-- "UserOpening", "FriendRequest", "Feedback", "Follower" with columns as used
-- in the app (userId, requesterId, receiverId, followerId, followingId, …).
-- Identifiers are double-quoted in SQL so they match those names exactly.

-- ---------------------------------------------------------------------------
-- Feedback: guest email (API inserts email for non-logged-in users)
-- ---------------------------------------------------------------------------
ALTER TABLE public."Feedback" ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public."Feedback" ADD COLUMN IF NOT EXISTS "read" boolean NOT NULL DEFAULT false;
-- If the column already existed without NOT NULL: UPDATE public."Feedback" SET "read" = false WHERE "read" IS NULL;

-- ---------------------------------------------------------------------------
-- Helper: JWT email → public "User".id (SHA-256 hex of email in your app)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id
  FROM public."User" u
  WHERE lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.current_app_user_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_user_id() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Follower — only if table exists (safe to run even without this table)
-- ---------------------------------------------------------------------------
DO $follower_rls$
BEGIN
  IF to_regclass('public."Follower"') IS NULL THEN
    RAISE NOTICE 'Skipping Follower RLS: public."Follower" not found.';
  ELSE
    EXECUTE 'ALTER TABLE public."Follower" ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Follower_select_all" ON public."Follower"';
    EXECUTE $p$
      CREATE POLICY "Follower_select_all"
        ON public."Follower" FOR SELECT
        TO anon, authenticated
        USING (true)
    $p$;

    EXECUTE 'DROP POLICY IF EXISTS "Follower_insert_self" ON public."Follower"';
    EXECUTE $p$
      CREATE POLICY "Follower_insert_self"
        ON public."Follower" FOR INSERT
        TO authenticated
        WITH CHECK ("followerId" = public.current_app_user_id())
    $p$;

    EXECUTE 'DROP POLICY IF EXISTS "Follower_delete_self" ON public."Follower"';
    EXECUTE $p$
      CREATE POLICY "Follower_delete_self"
        ON public."Follower" FOR DELETE
        TO authenticated
        USING ("followerId" = public.current_app_user_id())
    $p$;
  END IF;
END
$follower_rls$;

-- ---------------------------------------------------------------------------
-- User  (matches: id, email, name, bio)
-- ---------------------------------------------------------------------------
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User_select_all" ON public."User";
CREATE POLICY "User_select_all"
  ON public."User" FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "User_update_own" ON public."User";
CREATE POLICY "User_update_own"
  ON public."User" FOR UPDATE
  TO authenticated
  USING (id = public.current_app_user_id())
  WITH CHECK (id = public.current_app_user_id());

-- No INSERT/DELETE policies for anon,authenticated → only service role (signup API, etc.)

-- ---------------------------------------------------------------------------
-- Rating  (matches: id, userId, type, value, createdAt)
-- ---------------------------------------------------------------------------
ALTER TABLE public."Rating" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rating_select_all" ON public."Rating";
CREATE POLICY "Rating_select_all"
  ON public."Rating" FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Game  (matches: id, whiteId, blackId, …)
-- ---------------------------------------------------------------------------
ALTER TABLE public."Game" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Game_select_all" ON public."Game";
CREATE POLICY "Game_select_all"
  ON public."Game" FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Tactic  (matches: id, rating, pgn, numTimesPlayed, disLikes, …)
-- ---------------------------------------------------------------------------
ALTER TABLE public."Tactic" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tactic_select_all" ON public."Tactic";
CREATE POLICY "Tactic_select_all"
  ON public."Tactic" FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- UserTactic  (matches: id, userId, tacticId, solved, finished)
-- No client policies — browser never queries this; tactics use service role APIs.
-- ---------------------------------------------------------------------------
ALTER TABLE public."UserTactic" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- UserOpening  (matches: id, userId, openingNr, color, pgn, finished, evalHistory)
-- Rated flow always has a logged-in userId (see pages/openings.js).
-- ---------------------------------------------------------------------------
ALTER TABLE public."UserOpening" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "UserOpening_select_own" ON public."UserOpening";
CREATE POLICY "UserOpening_select_own"
  ON public."UserOpening" FOR SELECT
  TO authenticated
  USING ("userId" = public.current_app_user_id());

DROP POLICY IF EXISTS "UserOpening_insert_own" ON public."UserOpening";
CREATE POLICY "UserOpening_insert_own"
  ON public."UserOpening" FOR INSERT
  TO authenticated
  WITH CHECK ("userId" = public.current_app_user_id());

DROP POLICY IF EXISTS "UserOpening_update_own" ON public."UserOpening";
CREATE POLICY "UserOpening_update_own"
  ON public."UserOpening" FOR UPDATE
  TO authenticated
  USING ("userId" = public.current_app_user_id())
  WITH CHECK ("userId" = public.current_app_user_id());

DROP POLICY IF EXISTS "UserOpening_delete_own" ON public."UserOpening";
CREATE POLICY "UserOpening_delete_own"
  ON public."UserOpening" FOR DELETE
  TO authenticated
  USING ("userId" = public.current_app_user_id());

-- ---------------------------------------------------------------------------
-- FriendRequest  (matches: id, requesterId, receiverId, status, createdAt, updatedAt)
-- notifications.js: UPDATE status (receiver only), DELETE (receiver only)
-- friends.js: SELECT, INSERT
-- ---------------------------------------------------------------------------
ALTER TABLE public."FriendRequest" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "FriendRequest_select_involved" ON public."FriendRequest";
CREATE POLICY "FriendRequest_select_involved"
  ON public."FriendRequest" FOR SELECT
  TO authenticated
  USING (
    "requesterId" = public.current_app_user_id()
    OR "receiverId" = public.current_app_user_id()
  );

DROP POLICY IF EXISTS "FriendRequest_insert_as_requester" ON public."FriendRequest";
CREATE POLICY "FriendRequest_insert_as_requester"
  ON public."FriendRequest" FOR INSERT
  TO authenticated
  WITH CHECK (
    "requesterId" = public.current_app_user_id()
    AND "receiverId" <> public.current_app_user_id()
  );

DROP POLICY IF EXISTS "FriendRequest_update_receiver" ON public."FriendRequest";
CREATE POLICY "FriendRequest_update_receiver"
  ON public."FriendRequest" FOR UPDATE
  TO authenticated
  USING ("receiverId" = public.current_app_user_id())
  WITH CHECK ("receiverId" = public.current_app_user_id());

DROP POLICY IF EXISTS "FriendRequest_delete_receiver" ON public."FriendRequest";
CREATE POLICY "FriendRequest_delete_receiver"
  ON public."FriendRequest" FOR DELETE
  TO authenticated
  USING ("receiverId" = public.current_app_user_id());

-- ---------------------------------------------------------------------------
-- Feedback  (matches: id, userId, message, type, createdAt, read + email added above)
-- No policies for anon/authenticated → inserts only via service role (/api/feedback).
-- ---------------------------------------------------------------------------
ALTER TABLE public."Feedback" ENABLE ROW LEVEL SECURITY;
