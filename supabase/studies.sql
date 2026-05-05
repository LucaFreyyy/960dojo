-- Studies (Analysis snapshots)
-- Run in Supabase → SQL Editor.
-- Depends on: public."User"(id) and public.current_app_user_id() (see supabase/rls.sql).

-- Optional: better title search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public."Study" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "ownerId" text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  title text,
  "isPublic" boolean NOT NULL DEFAULT false,
  analysis jsonb NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- PostgREST needs explicit grants; RLS policies only apply after privileges.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public."Study" TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public."Study" TO authenticated;

-- Keep updatedAt current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_updated_at() TO anon, authenticated;

DROP TRIGGER IF EXISTS set_study_updated_at ON public."Study";
CREATE TRIGGER set_study_updated_at
BEFORE UPDATE ON public."Study"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes for listing / filtering
CREATE INDEX IF NOT EXISTS "Study_owner_createdAt_idx"
  ON public."Study" ("ownerId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Study_public_createdAt_idx"
  ON public."Study" ("isPublic", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Study_updatedAt_idx"
  ON public."Study" ("updatedAt" DESC);

-- Title search (case-insensitive + partial matches)
CREATE INDEX IF NOT EXISTS "Study_title_trgm_idx"
  ON public."Study" USING gin (lower(title) gin_trgm_ops)
  WHERE title IS NOT NULL;

-- RLS
ALTER TABLE public."Study" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Study_select_public_or_owner" ON public."Study";
CREATE POLICY "Study_select_public_or_owner"
  ON public."Study" FOR SELECT
  TO anon, authenticated
  USING ("isPublic" = true OR "ownerId" = public.current_app_user_id());

DROP POLICY IF EXISTS "Study_insert_own" ON public."Study";
CREATE POLICY "Study_insert_own"
  ON public."Study" FOR INSERT
  TO authenticated
  WITH CHECK ("ownerId" = public.current_app_user_id());

DROP POLICY IF EXISTS "Study_update_own" ON public."Study";
CREATE POLICY "Study_update_own"
  ON public."Study" FOR UPDATE
  TO authenticated
  USING ("ownerId" = public.current_app_user_id())
  WITH CHECK ("ownerId" = public.current_app_user_id());

DROP POLICY IF EXISTS "Study_delete_own" ON public."Study";
CREATE POLICY "Study_delete_own"
  ON public."Study" FOR DELETE
  TO authenticated
  USING ("ownerId" = public.current_app_user_id());

