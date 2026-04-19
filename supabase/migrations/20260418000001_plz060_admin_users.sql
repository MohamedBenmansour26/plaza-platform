-- ============================================================
-- PLZ-060 — Admin users table
-- Foundation for the Plaza admin panel. Admin reads happen via
-- service role only (deny-all RLS). Founder is seeded in the
-- follow-up migration 20260418000002_plz060_seed_founder_admin.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'admin'
    CHECK (role IN ('admin','ops','support')),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx
  ON public.admin_users(user_id);

CREATE INDEX IF NOT EXISTS admin_users_email_idx
  ON public.admin_users(email);

-- Deny-all RLS: admin reads go through service role only.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No policies added — with RLS enabled and no policies, all
-- anon/authenticated access is denied. Service role bypasses RLS.
