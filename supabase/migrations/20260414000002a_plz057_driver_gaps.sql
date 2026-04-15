-- ============================================================
-- PLZ-057 — Driver Schema Gap-Fill (pre-migration)
-- Author: Mehdi (Dev Agent)
-- Date: 2026-04-15
--
-- PURPOSE:
--   PLZ-057 migrations (000003 and 000004) ALTER existing tables
--   and reference objects that were never created via migration.
--   This file fills every gap so those migrations run cleanly.
--
-- GAPS ADDRESSED:
--   1. `drivers` table — never created; PLZ-057 tries to ALTER it
--   2. `deliveries.driver_id` — referenced by PLZ-057 RLS policies
--   3. `delivery_status` enum — missing 'assigned','picked_up','delivered'
--   4. `orders.customer_pin` — referenced by driver app flow
--   5. `orders.customer_id` — referenced in existing RLS policies
--      (20260411000001, 20260414000001) but never added via migration
--
-- All statements are idempotent (safe to run multiple times).
-- ============================================================


-- ── 1. drivers table ─────────────────────────────────────────
--
-- Base shape only. PLZ-057 (000003) will ADD the remaining columns
-- (user_id, otp_attempts, vehicle_type, etc.) via ALTER TABLE.

CREATE TABLE IF NOT EXISTS drivers (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text        NOT NULL,
  phone         text        NOT NULL UNIQUE,
  is_available  boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE drivers IS
  'Delivery drivers. Base columns created by gap-fill (PLZ-057); '
  'auth + onboarding columns added by 20260414000003.';


-- ── 2. deliveries.driver_id ──────────────────────────────────
--
-- FK to drivers. NULL until a driver is assigned.
-- PLZ-057 RLS policies filter deliveries by driver_id.

ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES drivers (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS deliveries_driver_id_idx ON deliveries (driver_id);

COMMENT ON COLUMN deliveries.driver_id IS
  'Assigned driver. NULL = unassigned. Set by dispatcher or auto-assign (PLZ-057).';


-- ── 3. delivery_status enum — add missing values ─────────────
--
-- Current values: pending, dispatched, completed, failed
-- Required by PLZ-057: assigned, picked_up, delivered
--
-- PostgreSQL does not support IF NOT EXISTS on ALTER TYPE ADD VALUE,
-- so each addition is wrapped in a DO block that checks pg_enum first.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'delivery_status'::regtype
      AND enumlabel = 'assigned'
  ) THEN
    ALTER TYPE delivery_status ADD VALUE 'assigned';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'delivery_status'::regtype
      AND enumlabel = 'picked_up'
  ) THEN
    ALTER TYPE delivery_status ADD VALUE 'picked_up';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'delivery_status'::regtype
      AND enumlabel = 'delivered'
  ) THEN
    ALTER TYPE delivery_status ADD VALUE 'delivered';
  END IF;
END $$;


-- ── 4. orders.customer_pin ───────────────────────────────────
--
-- 6-digit PIN shown to customer at checkout; driver must confirm
-- at doorstep delivery to close the loop (PLZ-057 driver flow).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_pin integer;

COMMENT ON COLUMN orders.customer_pin IS
  '6-digit PIN generated at order creation, shown to customer. '
  'Driver confirms at doorstep to complete delivery (PLZ-057).';


-- ── 5. orders.customer_id ────────────────────────────────────
--
-- FK to customers. Already referenced in RLS policies added by
-- 20260411000001 and 20260414000001, but the column itself was
-- never created via migration.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);

COMMENT ON COLUMN orders.customer_id IS
  'Links order to a customers row. Nullable for legacy orders placed '
  'before the customers table was introduced.';
