-- ============================================================
-- DRAFT MIGRATION — DO NOT RUN WITHOUT FOUNDER APPROVAL
-- ============================================================
-- Author: Hamza (Dev Agent 2)
-- Date: 2026-04-13
-- Ticket: PLZ-working-hours
-- Status: DRAFT — awaiting founder approval

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS working_hours jsonb;

-- Default: Mon-Fri 9-18h, Sat-Sun closed
COMMENT ON COLUMN merchants.working_hours IS
  'Working hours per day. Format: {"lundi": {"open": true, "from": "09:00", "to": "18:00"}, ...}';
