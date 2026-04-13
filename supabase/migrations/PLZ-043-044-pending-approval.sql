-- PLZ-043/PLZ-044: Payment guardrails + phone verification
-- STATUS: PENDING FOUNDER APPROVAL — do not run until approved
-- Apply via Supabase Management API after approval.

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS terminal_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS cmi_enabled boolean NOT NULL DEFAULT false;
