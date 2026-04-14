-- PLZ-056: add merchant_pickup_code to orders for driver handoff verification
--
-- This column was designed in PLZ-052 (order timeline feature) but deferred
-- from that sprint's migration. The UI and TypeScript types already reference
-- this column; this migration brings the DB schema into alignment.
--
-- The pickup code is a 6-digit integer generated at order creation time and
-- displayed to the merchant. The driver must quote it at pickup to verify
-- they have the correct order.
--
-- Rollback: ALTER TABLE orders DROP COLUMN IF EXISTS merchant_pickup_code;
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS merchant_pickup_code integer;

COMMENT ON COLUMN orders.merchant_pickup_code IS
  '6-digit code shown to merchant; driver must quote at pickup for handoff verification (PLZ-056)';
