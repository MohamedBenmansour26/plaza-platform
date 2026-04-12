-- ============================================================
-- DRAFT MIGRATION — DO NOT RUN WITHOUT FOUNDER APPROVAL
-- ============================================================
-- Author: Mehdi (Dev Agent)
-- Date: 2026-04-11
-- Ticket: PLZ-040 — P0 Bug: createOrder() fails for anonymous customers
-- Status: DRAFT — awaiting founder approval before running
--
-- ROOT CAUSE:
--   The `customers` table was added to the live DB (referenced in
--   types/supabase.ts) but no migration defined it and, critically,
--   no RLS policies were created for it. Anonymous buyers (anon role)
--   cannot INSERT into `customers`, so createOrder() throws
--   "Failed to create customer" before even reaching the orders insert.
--
-- WHAT THIS MIGRATION DOES:
--   1. Creates the `customers` table if it does not already exist
--      (idempotent — safe to run even if the table was created manually).
--   2. Enables RLS on `customers`.
--   3. Adds a public INSERT policy so anonymous buyers can create
--      their own customer record when placing an order.
--   4. Adds a merchant SELECT policy so merchants can view their
--      customers via the orders → customers join.
--
-- FLAG TO OTHMANE / FOUNDER:
--   - The `customers` table already exists in production (created
--     manually). Run only the POLICY section if the table exists.
--   - If the table does NOT exist, run the full migration.
--   - Do NOT run `supabase db push` until this is approved.
-- ============================================================


-- ── 1. Create customers table (idempotent) ───────────────────
--
-- This matches the shape in types/supabase.ts exactly.
-- If the table already exists in production, this is a no-op.

CREATE TABLE IF NOT EXISTS customers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  text NOT NULL,
  phone      text NOT NULL,
  address    text,
  city       text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 2. Enable RLS ────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;


-- ── 3. Public INSERT — anonymous buyers can create a customer record
--
-- Any visitor (anon role) can insert their own customer record
-- when placing an order. No auth required — this is the storefront.

CREATE POLICY "customers: public insert"
  ON customers FOR INSERT
  WITH CHECK (true);


-- ── 4. Merchant SELECT — merchants can read customer records linked
--       to their orders (for the dashboard order detail view).

CREATE POLICY "customers: merchant select"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN merchants ON merchants.id = orders.merchant_id
      WHERE orders.customer_id = customers.id
        AND merchants.user_id = auth.uid()
    )
  );
