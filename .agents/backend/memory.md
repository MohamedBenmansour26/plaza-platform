# Youssef memory log
_Updated after every session._

---

## Current state

Status: Sprint 2 — 13 April 2026.
PLZ-047 (P1) + PLZ-048 (P2) complete. PR #38 open, tagged Anas for review.

---

## Schema audit checklist (first session)

Read all files in `lib/db/` and `app/_actions/`
Check for:
- N+1 query patterns
- Missing error handling
- `select('*')` that should be specific columns
- Missing indexes on frequently queried columns
- RLS policies that are too permissive or too restrictive
- Server actions that don't validate input

Post findings to Notion: "Backend Audit — [date]"

---

## PLZ-047 findings and decisions (13 April 2026)

### N+1 patterns fixed

**`lib/db/orders.ts` — `updateOrderStatus` confirmed path**
- Was: 1 query for order_items + N queries for products (one per item)
- Fix: single `.in('id', productIds)` query + in-memory Map validation
- `decrement_stock()` RPC was already called once — correct, no change needed

**`lib/db/orders.ts` — `updateOrderStatus` cancelled path**
- Was: 1 query for order_items + N SELECT + N UPDATE on products
- Fix: 1 query for order_items + 1 IN query for stock + 1 UPDATE per product
- Note: Supabase JS v2 has no multi-row UPDATE with per-row values, so
  individual UPDATEs per product are irreducible without a custom RPC.
  O(distinct_products) not O(order_items) — acceptable at MVP scale.
  If this becomes hot, add an `increment_stock(order_id)` RPC mirror of `decrement_stock`.

**`app/store/[slug]/actions.ts` — `createOrder` stock pre-flight**
- Was: for loop, one SELECT per cart item — N queries per order submission
- Fix: single `.in('id', productIds)` query + in-memory Map validation

**`app/_actions/trackOrder.ts` — missing error handling**
- Was: bare `.data` access with no `.error` check — silent failures
- Fix: explicit error destructuring; PGRST116 (no rows) returns null; others throw

---

## PLZ-048 findings and decisions (13 April 2026)

### select('*') scoped

**`getMerchantBySlug` (app/store/[slug]/actions.ts)**
- Dropped 9 columns: user_id, banner_url, pin_hash, recovery_email, otp_attempts,
  locked_until, city (deprecated), created_at, phone_verified
- All remaining columns verified in use across layout.tsx, page.tsx, commande/page.tsx,
  produit/[id]/page.tsx, Header, TopNavBar, StoreInfoSheet, StoreFooter
- Return type cast to Merchant — callers unchanged

**`getProductsByMerchant` + `getProductById` (app/store/[slug]/actions.ts)**
- Dropped: merchant_id (filter only, never rendered), created_at (not displayed)
- All other Product columns are accessed by StoreHomeClient, ProductCard,
  ProductDetailClient
- Return types cast to Product — callers unchanged
- Changed order() from `created_at` to `id` (was using a dropped column)

**`generateTicketNumber` (lib/db/support.ts)**
- select('*', { head: true }) → select('id', { head: true })
- head:true means no rows returned anyway; 'id' is minimal valid selector
- Added error handling for the count query (was silently using count ?? 0)

### select('*') NOT changed (justified)

- `lib/db/orders.ts` ORDER_SELECT — already explicit column list, no issue
- `lib/db/metrics.ts` — already explicit, no issue
- `lib/db/onboarding.ts` — already explicit, no issue
- `lib/db/support.ts` getTickets/getTicketById — already explicit, no issue

---

## Migration log

| Date | Migration | Applied | Rollback |
|---|---|---|---|
| 2026-04-08 | OTP auth columns + delivery_zones | ✅ Production | DROP COLUMN pin_hash, recovery_email, otp_attempts, locked_until |
| 2026-04-10 | Store location columns | ✅ Production | DROP COLUMN location_lat, location_lng, location_description |
| 2026-04-13 | working_hours jsonb | ✅ Production | DROP COLUMN working_hours |
| 2026-04-13 | terminal_enabled, phone_verified, cmi_enabled | ✅ Production | DROP COLUMN terminal_enabled, phone_verified, cmi_enabled |
| 2026-04-13 | decrement_stock() function | ✅ Production | DROP FUNCTION decrement_stock(uuid) |

---

## Open items / next sprint candidates

- `updateOrderStatus` cancelled: consider adding `increment_stock(order_id uuid)`
  RPC mirror to make stock restore fully atomic (currently O(products) UPDATEs)
- PLZ-039: git history rewrite — remove hardcoded Mapbox token (deferred, run before next branch)
- Check indexes: orders(merchant_id), orders(status), products(merchant_id, is_visible)
  — not audited yet, needed for queries above to be fast at scale
