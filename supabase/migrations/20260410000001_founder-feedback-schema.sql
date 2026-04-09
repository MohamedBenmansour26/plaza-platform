-- ============================================================
-- DRAFT MIGRATION — DO NOT RUN WITHOUT FOUNDER APPROVAL
-- ============================================================
-- Author: Othmane (Dev Lead)
-- Date: 2026-04-10
-- Ticket: PLZ-037 — Founder feedback session 2026-04-09
-- Status: DRAFT — pending Othmane / founder approval
--
-- FLAG TO OTHMANE: review all 4 change groups below before
-- running in any environment. Schema changes are listed in
-- PRIORITY order from the feedback session.
-- ============================================================

-- ── 1. merchants.is_online DEFAULT false ─────────────────────
--
-- Merchants are created offline. The "Publier ma boutique" CTA
-- in OnboardingChecklist is the ONLY path to is_online = true.
-- Existing rows are unaffected (ALTER COLUMN DEFAULT only changes
-- new INSERTs going forward).

ALTER TABLE merchants
  ALTER COLUMN is_online SET DEFAULT false;


-- ── 2. Store location — Mapbox map pin ───────────────────────
--
-- Replaces the old city text field in /dashboard/boutique.
-- Merchant drops a pin; coordinates + optional description are
-- stored here. Delivery drivers see the pin + description.
-- The legacy `city` column is kept (nullable) for backward
-- compat and deprecated — it will be dropped in a later migration.

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS location_lat         numeric(10,7),
  ADD COLUMN IF NOT EXISTS location_lng         numeric(10,7),
  ADD COLUMN IF NOT EXISTS location_description text;

COMMENT ON COLUMN merchants.location_lat         IS
  'Latitude from Mapbox map pin. Replaces city text field.';
COMMENT ON COLUMN merchants.location_lng         IS
  'Longitude from Mapbox map pin.';
COMMENT ON COLUMN merchants.location_description IS
  'Freeform delivery directions: floor, landmarks, etc. '
  'E.g. "2ème étage, porte bleue, en face du café..."';


-- ── 3. Product categories — 3-level hierarchy ────────────────
--
-- Cascading dropdowns in the product form.
-- L1 (main): Mode | Beauté | Alimentation | Maison |
--            Électronique | Sport | Bijoux | Enfants | Autre
-- L2 (sub):  depends on L1 selection
-- L3 (item): optional, depends on L2 selection

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_l1 text,
  ADD COLUMN IF NOT EXISTS category_l2 text,
  ADD COLUMN IF NOT EXISTS category_l3 text;

COMMENT ON COLUMN products.category_l1 IS
  'Level 1 product category (e.g. Mode, Beauté, Alimentation)';
COMMENT ON COLUMN products.category_l2 IS
  'Level 2 subcategory (e.g. Femme, Homme, Soins visage)';
COMMENT ON COLUMN products.category_l3 IS
  'Level 3 specific type — optional (e.g. Robes, Crèmes)';


-- ── 4. Product discounts ─────────────────────────────────────
--
-- "Activer une promotion" toggle in product form.
-- When discount_active = true: original_price is shown struck
-- through in gray; price field shows the discounted price.
-- Badge: "-XX%" in orange (#E8632A) on product card.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS original_price  integer,
  ADD COLUMN IF NOT EXISTS discount_active boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN products.original_price  IS
  'Original price in centimes MAD before discount. '
  'NULL when no promotion is active.';
COMMENT ON COLUMN products.discount_active IS
  'When true, original_price is displayed struck-through and '
  'price shows the promotional rate.';


-- ── 5. delivery_zones — NO CHANGE ────────────────────────────
--
-- The delivery_zones table is kept as-is for Plaza admin use.
-- It is removed from the merchant-facing UI (Priority 3 UI work)
-- but no DDL is needed here.
