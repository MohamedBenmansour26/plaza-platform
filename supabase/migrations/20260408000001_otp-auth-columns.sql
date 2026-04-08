-- ============================================================
-- DRAFT MIGRATION — DO NOT RUN WITHOUT FOUNDER APPROVAL
-- ============================================================
-- Author: Mehdi (Dev Agent)
-- Date: 2026-04-08
-- Ticket: PLZ-031 — Phone OTP Auth
-- Status: DRAFT — pending Othmane review and founder approval
--
-- REASON THIS IS A DRAFT:
-- These columns extend the merchants table to support phone-based
-- PIN authentication. Running this on production requires:
--   1. Founder approval (Tier 1 schema change)
--   2. Othmane to review RLS implications
--   3. Supabase service role to run this — never run from client
--
-- FLAG TO OTHMANE: please review before running in any environment.
-- ============================================================

-- Add OTP/PIN auth columns to merchants table
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS phone text UNIQUE;

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS pin_hash          text,
  ADD COLUMN IF NOT EXISTS recovery_email    text,
  ADD COLUMN IF NOT EXISTS otp_attempts      integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS locked_until      timestamptz;

-- Column comments
COMMENT ON COLUMN merchants.pin_hash IS
  'bcrypt hash of the merchant PIN. Never store plain PIN.';
COMMENT ON COLUMN merchants.recovery_email IS
  'Optional recovery email for phone number change. Collected at signup.';
COMMENT ON COLUMN merchants.otp_attempts IS
  'Number of failed OTP attempts. Reset on successful verification.';
COMMENT ON COLUMN merchants.locked_until IS
  'If set and in the future, merchant is locked out of OTP verification.';
