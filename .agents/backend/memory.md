# Youssef memory log
_Updated after every session._

---

## Current state

Status: 18 April 2026.
PLZ-047 (P1) + PLZ-048 (P2) complete. PR #38 merged.
PLZ-054 (P0): customers anon SELECT RLS policy — PR open, tagged Anas for review.

**New ownership (2026-04-18):** You now handle ALL Supabase requests and db topics.
Any migration that lands in `supabase/migrations/` is your responsibility to push.

### PLZ-060 + PLZ-061 — Admin panel backend (2026-04-18)

Branch: `plz-060-061-backend` (off main `12b3492`). Seven commits, all local, waiting on PM review before Anas merges via REST API.

What shipped:
- `admin_users` table + deny-all RLS + founder seed by email join.
- `lib/admin-trust-cookie.ts` HMAC-signed trust cookie helpers
  (30-day long / 10-min pending) using `ADMIN_TRUST_SECRET`.
- `lib/admin-auth.ts` `requireAdmin()` helper (service role → `admin_users`).
- Middleware admin guard requiring Supabase session + trust cookie on `/admin/**`
  except `/admin/login` and `/admin/auth/callback`. Added `/admin` to `SKIP_INTL`.
- Magic-link login: `app/admin/login/actions.ts` (`requestAdminMagicLink`) +
  `app/admin/auth/callback/route.ts` (code exchange, admin recheck, trust-cookie mint).
- `drivers` approval columns migration + backfill of `onboarding_status='active'`
  rows → `approval_status='approved'`. Extended `onboarding_status` CHECK to
  include `'rejected'`.
- `app/admin/drivers/[id]/actions.ts` with `approveDriverAction`,
  `resubmitDocumentAction`, `rejectDriverAction`, `getDocumentSignedUrl`
  (60s TTL). All gate on `requireAdmin()`; all use service role.
- **Testing-mode revert in `app/driver/onboarding/actions.ts`** —
  `saveIdentityAndSubmitAction` + `submitOnboardingAction` now set
  `pending_validation` + `approval_status='pending'` and redirect to
  `/driver/onboarding/pending`. Commit hash `1eeced6`.
- `types/supabase.ts` hand-updated for `admin_users` and new driver columns.
  Run `supabase gen types typescript` after migrations land on remote to
  replace the hand edit.
- `.env.local.example` adds `ADMIN_TRUST_SECRET` + `NEXT_PUBLIC_SITE_URL`.

### Pending migrations — NOT yet pushed to remote

| File | What it does | Priority | Row impact |
|---|---|---|---|
| `20260416000001_plz059_drivers_phone_unique.sql` | UNIQUE on `drivers.phone` | **P0** | 0 — constraint only |
| `20260416000002_plz059_drivers_city.sql` | `drivers.city text` + index | P1 | 0 — nullable column |
| `20260418000001_plz060_admin_users.sql` | New `admin_users` table + RLS | **P0 for PLZ-060** | 0 — new table |
| `20260418000002_plz060_seed_founder_admin.sql` | Seed founder by auth.users email join | P0 | 1 row (or 0 if founder hasn't magic-linked yet; idempotent) |
| `20260418000003_plz061_driver_approvals.sql` | `drivers` approval columns + backfill | **P0 for PLZ-061** | Schema + UPDATE on all `onboarding_status='active'` drivers (currently 1-3 test drivers) |

Push order: 059 files → 060 files (in order) → 061. Verify with:
```sql
SELECT conname FROM pg_constraint WHERE conrelid = 'drivers'::regclass AND contype = 'u';
SELECT column_name FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'city';
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='admin_users';
SELECT column_name FROM information_schema.columns WHERE table_name='drivers' AND column_name LIKE '%approval%';
SELECT email FROM public.admin_users WHERE is_active = true;
```

Hold: do NOT push to remote until Othmane ACKs the file list + row impact (per PM's brief).

### Open questions for PM

- The founder seed migration joins `auth.users` on email. If the founder hasn't
  yet been magic-linked in, the migration is a silent no-op. Options:
  (a) push migration now, have founder request magic link once (it will create
      the auth.users row), then re-run the seed migration idempotently, OR
  (b) manually insert the `auth.users` row via a second migration before the
      seed. Recommend (a) — less coupling.
- Should admins without the "trust this device" checkbox still get in for one
  session? Current implementation sets a session-scoped trust cookie so they do
  — otherwise middleware would immediately bounce them after login. Flag if
  this needs tightening.

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
| 2026-04-14 | PLZ-054: customers anon SELECT policy (storefront tracking) | ⏳ PR open | DROP POLICY "customers: public select by order" ON customers |
| 2026-04-16 | PLZ-059: `drivers.phone` UNIQUE constraint | ⏳ Not pushed | DROP CONSTRAINT drivers_phone_unique |
| 2026-04-16 | PLZ-059: `drivers.city` text column + index | ⏳ Not pushed | DROP COLUMN city; DROP INDEX drivers_city_idx |
| 2026-04-18 | PLZ-060: `admin_users` table + deny-all RLS | ⏳ Not pushed | DROP TABLE admin_users CASCADE |
| 2026-04-18 | PLZ-060: seed founder admin (idempotent) | ⏳ Not pushed | DELETE FROM admin_users WHERE email='m.benmansour2017@gmail.com' |
| 2026-04-18 | PLZ-061: `drivers` approval columns + backfill | ⏳ Not pushed | DROP COLUMN approval_status, approved_at, approved_by, rejection_reason, license_approved, insurance_approved, id_front_approved, id_back_approved; restore old `onboarding_status` CHECK |

---

## Open items / next sprint candidates

- `updateOrderStatus` cancelled: consider adding `increment_stock(order_id uuid)`
  RPC mirror to make stock restore fully atomic (currently O(products) UPDATEs)
- PLZ-039: git history rewrite — remove hardcoded Mapbox token (deferred, run before next branch)
- Check indexes: orders(merchant_id), orders(status), products(merchant_id, is_visible)
  — not audited yet, needed for queries above to be fast at scale
