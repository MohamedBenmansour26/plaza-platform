-- ============================================================
-- PLZ-068 — Customer location columns
-- Adds location_lat / location_lng to customers table so that
-- createDispatchDelivery can compute Haversine distance between
-- merchant and customer for driver earnings calculation.
-- ============================================================

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS location_lat numeric(10,7),
  ADD COLUMN IF NOT EXISTS location_lng numeric(10,7);

COMMENT ON COLUMN customers.location_lat IS
  'Customer delivery pin latitude. Set at checkout if customer drops map pin. '
  'Null if customer typed address only (no map interaction).';

COMMENT ON COLUMN customers.location_lng IS
  'Customer delivery pin longitude. Set at checkout if customer drops map pin. '
  'Null if customer typed address only (no map interaction).';
