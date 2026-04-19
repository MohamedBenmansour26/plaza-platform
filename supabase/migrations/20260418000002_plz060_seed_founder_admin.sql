-- ============================================================
-- PLZ-060 — Seed founder admin user
-- Inserts the founder into admin_users by looking up the matching
-- auth.users row by email. If the founder account doesn't exist
-- yet in auth.users, the INSERT is a no-op (WHERE clause filters it
-- out). In that case, sign up via magic link and re-run this migration
-- (or seed manually) — the migration is idempotent via ON CONFLICT.
-- ============================================================

INSERT INTO public.admin_users (user_id, email, role, is_active)
SELECT u.id, u.email, 'admin', true
FROM auth.users u
WHERE u.email = 'm.benmansour2017@gmail.com'
ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      updated_at = now();
