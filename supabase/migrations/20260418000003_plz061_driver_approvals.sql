-- ============================================================
-- PLZ-061 — Driver approval columns + backfill
-- Adds admin-approval workflow fields to drivers. Backfill marks
-- already-active drivers (onboarding_status = 'active') as approved
-- so the testing-mode cohort keeps working post-revert.
-- ============================================================

-- Extend onboarding_status with 'rejected' (used by rejectDriverAction).
-- We drop + re-add the CHECK constraint to include the new value.
DO $$
DECLARE
  conname text;
BEGIN
  SELECT c.conname
    INTO conname
  FROM pg_constraint c
  WHERE c.conrelid = 'public.drivers'::regclass
    AND c.contype  = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%onboarding_status%';

  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.drivers DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE public.drivers
  ADD CONSTRAINT drivers_onboarding_status_check
  CHECK (onboarding_status IN (
    'pending_onboarding',
    'pending_validation',
    'active',
    'suspended',
    'rejected'
  ));

-- Approval workflow columns.
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending','approved','rejected','resubmit')),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS license_approved   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS id_front_approved  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS id_back_approved   boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS drivers_approval_status_idx
  ON public.drivers(approval_status);

-- Backfill: any driver already onboarded + active is implicitly approved
-- (testing-mode cohort, production-seeded drivers). This keeps them
-- logged in and dispatchable after the testing-mode revert.
UPDATE public.drivers
SET
  approval_status    = 'approved',
  approved_at        = COALESCE(approved_at, now()),
  license_approved   = true,
  insurance_approved = true,
  id_front_approved  = true,
  id_back_approved   = true
WHERE onboarding_status = 'active'
  AND approval_status   = 'pending';
