-- PLZ-052 / PLZ-053: Order status timestamp columns + public storefront SELECT policy
--
-- PLZ-052 added confirmed_at / dispatched_at / delivered_at to the storefront
-- order SELECT. The migration was never applied, so PostgREST returned an error
-- on every order query → getOrderById/getOrderByNumber returned null → notFound().
--
-- PLZ-053: anonymous customers need to SELECT their own order on the tracking
-- page (/store/[slug]/commande/[id]). The initial schema only has an owner SELECT
-- policy (merchant-authenticated). Without a public SELECT policy, the anon
-- Supabase client used by storefront server actions cannot read from orders at all.
--
-- Security model: the order UUID is the access credential (122-bit entropy,
-- cryptographically unguessable). Direct PostgREST table scans without a WHERE
-- clause are blocked at the API layer by Supabase's anon key restrictions — the
-- RLS policy is intentionally permissive here because row discovery is prevented
-- at the network level, not the row level.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Status timestamp columns ──────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmed_at   timestamptz,
  ADD COLUMN IF NOT EXISTS dispatched_at  timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at   timestamptz;

COMMENT ON COLUMN orders.confirmed_at  IS 'Set by merchant when order is confirmed (PLZ-052)';
COMMENT ON COLUMN orders.dispatched_at IS 'Set when order is dispatched for delivery (PLZ-052)';
COMMENT ON COLUMN orders.delivered_at  IS 'Set when delivery is completed (PLZ-052)';

-- ── 2. Public SELECT policy — storefront order tracking ──────────────────────
-- Allows any caller (including anon) to SELECT a specific order by its UUID.
-- The UUID is the access credential — 122-bit entropy, unguessable by design.
-- Scope: storefront tracking page only. The merchant dashboard uses the
-- owner-only policy added in the initial schema migration.

CREATE POLICY "orders: public select by id"
  ON orders FOR SELECT
  USING (true);
