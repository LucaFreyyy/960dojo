-- Revert everything applied by supabase/rls.sql (emergency rollback).
-- Run in Supabase → SQL Editor. Restores "no RLS" behavior like before.
--
-- Does NOT remove Feedback.email (data may exist). To drop it manually:
--   ALTER TABLE public."Feedback" DROP COLUMN IF EXISTS email;
--
-- App code: revert the RLS-related commits with git if you also want the old
-- API behavior (e.g. createOpeningRating without Bearer token).

-- Policies first, then disable RLS, then drop helper function.

DROP POLICY IF EXISTS "User_select_all" ON public."User";
DROP POLICY IF EXISTS "User_update_own" ON public."User";

DROP POLICY IF EXISTS "Rating_select_all" ON public."Rating";

DROP POLICY IF EXISTS "Game_select_all" ON public."Game";

DROP POLICY IF EXISTS "Tactic_select_all" ON public."Tactic";

DROP POLICY IF EXISTS "UserOpening_select_own" ON public."UserOpening";
DROP POLICY IF EXISTS "UserOpening_insert_own" ON public."UserOpening";
DROP POLICY IF EXISTS "UserOpening_update_own" ON public."UserOpening";
DROP POLICY IF EXISTS "UserOpening_delete_own" ON public."UserOpening";

DROP POLICY IF EXISTS "FriendRequest_select_involved" ON public."FriendRequest";
DROP POLICY IF EXISTS "FriendRequest_insert_as_requester" ON public."FriendRequest";
DROP POLICY IF EXISTS "FriendRequest_update_receiver" ON public."FriendRequest";
DROP POLICY IF EXISTS "FriendRequest_delete_receiver" ON public."FriendRequest";

DO $follower_revert$
BEGIN
  IF to_regclass('public."Follower"') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Follower_select_all" ON public."Follower"';
    EXECUTE 'DROP POLICY IF EXISTS "Follower_insert_self" ON public."Follower"';
    EXECUTE 'DROP POLICY IF EXISTS "Follower_delete_self" ON public."Follower"';
  END IF;
END
$follower_revert$;

-- UserTactic had RLS enabled but no named policies for API roles.

ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Rating" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Game" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tactic" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserTactic" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserOpening" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."FriendRequest" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Feedback" DISABLE ROW LEVEL SECURITY;

DO $follower_disable$
BEGIN
  IF to_regclass('public."Follower"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."Follower" DISABLE ROW LEVEL SECURITY';
  END IF;
END
$follower_disable$;

DROP FUNCTION IF EXISTS public.current_app_user_id();
