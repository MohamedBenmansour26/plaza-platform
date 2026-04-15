-- ============================================================
-- PLZ-058 — Dispatch Engine
-- 1. Rename 'assigned' → 'accepted' in existing deliveries rows
-- 2. Rename collection_photo_url → pickup_photo_url
-- 3. New tables: dispatch_config, driver_schedules, dispatch_errors
-- 4. Extend drivers: add city column
-- 5. Extend deliveries: add dispatch columns
-- 6. Indexes for pool eligibility and driver busy check
-- 7. accept_delivery() SECURITY DEFINER function
-- 8. pg_cron timeout monitor
-- 9. RLS policies
-- ============================================================

-- ── 1. Status rename: 'assigned' → 'accepted' ──────────────
-- deliveries.status is text (not enum), safe to UPDATE directly.
UPDATE deliveries SET status = 'accepted' WHERE status = 'assigned';

-- If a delivery_status enum type exists (local dev), add the new values.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'delivery_status'::regtype AND enumlabel = 'available') THEN
      ALTER TYPE delivery_status ADD VALUE 'available';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'delivery_status'::regtype AND enumlabel = 'timed_out') THEN
      ALTER TYPE delivery_status ADD VALUE 'timed_out';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'delivery_status'::regtype AND enumlabel = 'cancelled') THEN
      ALTER TYPE delivery_status ADD VALUE 'cancelled';
    END IF;
  END IF;
END $$;

-- ── 2. Rename collection_photo_url → pickup_photo_url ──────
ALTER TABLE deliveries
  RENAME COLUMN collection_photo_url TO pickup_photo_url;

-- ── 3a. New table: dispatch_config ─────────────────────────
CREATE TABLE IF NOT EXISTS dispatch_config (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  base_fee_mad         decimal(10,2) NOT NULL DEFAULT 10.00,
  per_km_rate_mad      decimal(10,2) NOT NULL DEFAULT 3.00,
  pool_timeout_minutes int         NOT NULL DEFAULT 15,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Seed default config row (idempotent)
INSERT INTO dispatch_config (base_fee_mad, per_km_rate_mad, pool_timeout_minutes)
SELECT 10.00, 3.00, 15
WHERE NOT EXISTS (SELECT 1 FROM dispatch_config);

COMMENT ON TABLE dispatch_config IS
  'Singleton dispatch engine config. Admin edits via Supabase Studio or future admin panel.';

-- ── 3b. New table: driver_schedules ────────────────────────
-- day_of_week convention: 0 = Monday, 6 = Sunday.
-- JS Date.getDay() returns 0 = Sunday — convert in app code: dbDay = (jsDay + 6) % 7
CREATE TABLE IF NOT EXISTS driver_schedules (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id    uuid  NOT NULL REFERENCES drivers (id) ON DELETE CASCADE,
  day_of_week  int   NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time  NOT NULL,
  end_time     time  NOT NULL,
  is_active    boolean NOT NULL DEFAULT true,
  UNIQUE (driver_id, day_of_week),
  CONSTRAINT start_before_end CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS driver_schedules_driver_idx
  ON driver_schedules (driver_id, day_of_week);

COMMENT ON COLUMN driver_schedules.day_of_week IS
  '0=Monday, 6=Sunday. JS getDay() returns 0=Sunday — convert: dbDay = (jsDay + 6) % 7';

-- ── 3c. New table: dispatch_errors ─────────────────────────
CREATE TABLE IF NOT EXISTS dispatch_errors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid        REFERENCES orders (id),
  error_message text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE dispatch_errors IS
  'Audit log for failed createDispatchDelivery calls. '
  'No RLS — service role writes, admin reads via Studio.';

-- ── 4. Extend drivers: add city ────────────────────────────
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS city text;

COMMENT ON COLUMN drivers.city IS
  'Driver operating city. Must match deliveries.pickup_city for pool eligibility.';

-- ── 5. Extend deliveries: dispatch columns ─────────────────
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS distance_km             decimal(10,2),
  ADD COLUMN IF NOT EXISTS estimated_duration_min  int,
  ADD COLUMN IF NOT EXISTS driver_earnings_mad     decimal(10,2),
  ADD COLUMN IF NOT EXISTS pickup_city             text,
  ADD COLUMN IF NOT EXISTS pool_created_at         timestamptz,
  ADD COLUMN IF NOT EXISTS pool_expires_at         timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at             timestamptz,
  ADD COLUMN IF NOT EXISTS merchant_pickup_code    text;

COMMENT ON COLUMN deliveries.merchant_pickup_code IS
  'Copied from orders.merchant_pickup_code at dispatch creation. Frozen. '
  'Driver reads locally — no join to orders needed at collection.';
COMMENT ON COLUMN deliveries.distance_km IS
  'Haversine distance merchant→customer * 1.10 margin. Computed once at dispatch.';
COMMENT ON COLUMN deliveries.driver_earnings_mad IS
  'base_fee_mad + per_km_rate_mad * distance_km. Frozen at dispatch. '
  'Rate changes in dispatch_config do not backfill existing deliveries.';

-- ── 6. Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS deliveries_pool_eligible_idx
  ON deliveries (pickup_city, pool_expires_at)
  WHERE status = 'available';

CREATE INDEX IF NOT EXISTS deliveries_driver_active_idx
  ON deliveries (driver_id, status)
  WHERE status IN ('accepted', 'picked_up');

CREATE INDEX IF NOT EXISTS deliveries_timeout_idx
  ON deliveries (pool_expires_at)
  WHERE status = 'available';

-- ── 7. accept_delivery() SECURITY DEFINER function ─────────
CREATE OR REPLACE FUNCTION accept_delivery(
  p_delivery_id uuid,
  p_driver_id   uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count int;
BEGIN
  -- Verify the caller owns this driver record (defense in depth; app also checks).
  IF NOT EXISTS (
    SELECT 1 FROM drivers WHERE id = p_driver_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'driver_id does not belong to calling user';
  END IF;

  UPDATE deliveries
  SET status      = 'accepted',
      driver_id   = p_driver_id,
      accepted_at = now()
  WHERE id     = p_delivery_id
    AND status = 'available';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

COMMENT ON FUNCTION accept_delivery IS
  'Atomically claims an available delivery. Returns true if this driver won, '
  'false if another driver already accepted it.';

-- ── 8. pg_cron timeout monitor ─────────────────────────────
-- NOTE: pg_cron must be enabled via Supabase Dashboard: Extensions → pg_cron → Enable
-- These DO blocks are no-ops if pg_cron is not installed (safe for local dev).
DO $$
BEGIN
  PERFORM cron.unschedule('dispatch-pool-timeout');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule(
    'dispatch-pool-timeout',
    '* * * * *',
    'UPDATE deliveries SET status = ''timed_out'' WHERE status = ''available'' AND pool_expires_at < now()'
  );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── 9. RLS policies ────────────────────────────────────────

-- dispatch_config: all authenticated users can read; no direct writes (service role only)
ALTER TABLE dispatch_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dispatch_config: authenticated read"
  ON dispatch_config FOR SELECT
  TO authenticated
  USING (true);

-- driver_schedules: driver owns their rows
ALTER TABLE driver_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_schedules: driver full access"
  ON driver_schedules FOR ALL
  TO authenticated
  USING (
    driver_id = (
      SELECT id FROM drivers WHERE user_id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    driver_id = (
      SELECT id FROM drivers WHERE user_id = auth.uid() LIMIT 1
    )
  );

-- deliveries pool: driver can see available deliveries in their city
-- Note: deliveries RLS may already be enabled from PLZ-057; this is idempotent.
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliveries: driver can see pool in own city"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    status = 'available'
    AND pickup_city = (
      SELECT city FROM drivers WHERE user_id = auth.uid() LIMIT 1
    )
  );
