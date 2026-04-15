# PLZ-058 — Dispatch Engine Schema Plan

**Author:** Youssef, Backend & Data Agent  
**Date:** 2026-04-15  
**Status:** PLANNING — no migration has run yet. Awaiting full spec approval before writing SQL.  
**Reviewed by:** Antonio (data model review, 3 corrections applied — see section 3)

---

## 1. Overview

This schema enables pool-based delivery assignment for the Plaza platform. When a merchant confirms an order, a delivery row enters the pool with status `available`. Eligible drivers — those in the same city, currently online, with no active delivery, and within their scheduled working hours — see it in real-time via Supabase Realtime. The first driver to accept triggers an atomic status update; all other drivers see the delivery disappear from the pool immediately. If no driver accepts within `pool_timeout_minutes` (configurable per `dispatch_config`), the delivery transitions to `timed_out` and is flagged in the admin panel for manual intervention.

---

## 2. Table Definitions

### 2.1 New table: `dispatch_config`

Singleton configuration table. One row for the entire platform. Edited by admin via the admin panel. No driver or merchant can write to this table.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `base_fee_mad` | `decimal(10,2)` | NOT NULL, default `10.00` | Fixed portion of every driver earning |
| `per_km_rate_mad` | `decimal(10,2)` | NOT NULL, default `3.00` | Per-kilometre rate applied to `distance_km` |
| `pool_timeout_minutes` | `int` | NOT NULL, default `15` | Minutes before an unaccepted delivery becomes `timed_out` |
| `updated_at` | `timestamptz` | default `now()` | Last admin edit timestamp |

**Earnings formula** (calculated at delivery creation and frozen into `deliveries.driver_earnings_mad`):

```
driver_earnings_mad = base_fee_mad + (per_km_rate_mad × distance_km)
```

The value is frozen at creation time so that subsequent changes to `dispatch_config` do not retroactively alter a driver's agreed earnings for an in-progress delivery.

---

### 2.2 New table: `driver_schedules`

One row per driver per day of week. Driver sets their schedule in the app profile. The dispatch engine checks this table during eligibility filtering to determine whether a driver is within their declared working hours at the time a delivery enters the pool.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `driver_id` | `uuid` | NOT NULL, FK → `drivers(id)` ON DELETE CASCADE | |
| `day_of_week` | `int` | NOT NULL | 0 = Monday … 6 = Sunday — see day_of_week convention in section 4 |
| `start_time` | `time` | NOT NULL | Local clock time; engine compares against `now()` at Casablanca/Rabat TZ |
| `end_time` | `time` | NOT NULL | |
| `is_active` | `boolean` | NOT NULL, default `true` | Driver can disable a day without deleting the row |
| — | — | UNIQUE `(driver_id, day_of_week)` | One schedule row per driver per day |

---

### 2.3 Changes to `drivers` table

#### ADD column

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `is_online` | `boolean` | NOT NULL, default `false` | Toggled by driver on the Livraisons screen. Dispatch engine only presents deliveries to drivers where `is_online = true`. |

#### Do NOT add `current_delivery_id`

See section 5 (Antonio correction #2) for the full decision and the derived query to use instead.

---

### 2.4 Changes to `deliveries` table

#### Extend status lifecycle

The existing `delivery_status` enum (or text CHECK constraint) must be extended with two new values:

```
available → accepted → picked_up → delivered
                                 → failed
available → timed_out
```

Full lifecycle values required:

| Value | Meaning |
|---|---|
| `available` | NEW — delivery is in pool, waiting for a driver to accept |
| `accepted` | Driver claimed the delivery (was previously `assigned` in PLZ-057 — see conflict note in section 7) |
| `picked_up` | Driver collected the package from merchant |
| `delivered` | Delivery complete |
| `failed` | Delivery failed (issue reported) |
| `timed_out` | NEW — no driver accepted within `pool_timeout_minutes` |

> **Schema conflict note:** PLZ-057 migration `20260414000005_plz057_driver_gaps.sql` added the value `assigned` to the `delivery_status` enum to represent "driver accepted." PLZ-058 renames this concept to `accepted` for clarity in the pool model. The migration must handle this transition carefully: either add `accepted` as a new value and deprecate `assigned`, or confirm that `assigned` rows from PLZ-057 are migrated. This decision must be made before the migration is written. Flagged to Othmane.

#### ADD columns to `deliveries`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `distance_km` | `decimal(10,2)` | nullable | Straight-line distance calculated at delivery creation. Input to earnings formula. |
| `estimated_duration_min` | `int` | nullable | Estimated delivery time in minutes. Calculated at creation. Displayed to driver on the pool card. |
| `driver_earnings_mad` | `decimal(10,2)` | nullable | Frozen at creation. Computed from `dispatch_config` at that moment. Never recalculated after assignment. |
| `pickup_city` | `text` | nullable | City used for driver eligibility matching. Copied from the merchant's city at delivery creation. |
| `pool_created_at` | `timestamptz` | nullable | Timestamp when the delivery entered the pool (`status` set to `available`). |
| `pool_expires_at` | `timestamptz` | nullable | `pool_created_at + pool_timeout_minutes`. The timeout background job filters on this column. |
| `accepted_at` | `timestamptz` | nullable | Timestamp when a driver atomically claimed the delivery. |
| `merchant_pickup_code` | `text` | nullable | Copied from `orders.merchant_pickup_code` at delivery creation. Avoids a join in `confirmCollection`. Type is `text` here (the orders column is `integer`; cast on copy). **See pipeline note below.** |
| `pickup_photo_url` | `text` | nullable | Photo taken by driver at package collection. See Antonio correction #3 and photo column note in section 7. |
| `delivery_photo_url` | `text` | nullable | Photo taken by driver at doorstep delivery. Already exists from PLZ-057. |

**Pipeline note — `merchant_pickup_code` copy timing (Othmane correction):**

`merchant_pickup_code` MUST be copied from `orders.merchant_pickup_code` at delivery record creation time, inside `createDispatchDelivery()`. It is NOT fetched later at collection time. The driver reads it from the delivery record locally — no live join to `orders` is needed at the merchant door.

The `INSERT INTO deliveries` statement in `createDispatchDelivery` must include:

```sql
merchant_pickup_code = (SELECT merchant_pickup_code FROM orders WHERE id = $order_id)
```

This means the value is embedded in the delivery row at the moment the delivery enters the pool. Any subsequent change to `orders.merchant_pickup_code` does NOT propagate to the delivery record. This is intentional: the code is frozen at dispatch time for consistency.

---

## 3. Antonio's Three Corrections (Designer Data Model Review)

Antonio reviewed the data model during the PLZ-058 design phase and flagged three issues. All three are incorporated into this document.

### Correction A-1: day_of_week 0=Monday (not 0=Sunday)

**Problem flagged:** The initial data model draft stored `day_of_week` using JavaScript's `Date.getDay()` convention (0 = Sunday). This is confusing in Moroccan operational context (workweek starts Monday) and would produce off-by-one errors in the driver-facing schedule UI.

**Correction applied:** `day_of_week` stores 0 = Monday, 6 = Sunday. The dispatch engine must convert from JavaScript's `getDay()` using:

```javascript
// JS getDay() → DB day_of_week
const dbDay = (jsDay + 6) % 7;
// Examples:
// getDay() = 0 (Sunday) → dbDay = 6
// getDay() = 1 (Monday) → dbDay = 0
// getDay() = 6 (Saturday) → dbDay = 5
```

This conversion is the engine's responsibility. The DB stores values 0–6 where 0 is always Monday.

### Correction A-2: No `current_delivery_id` on drivers (use derived query)

**Problem flagged:** An earlier draft added `current_delivery_id uuid` to the `drivers` table as a quick eligibility check ("is the driver busy?"). Antonio flagged this as a denormalization risk — the field can drift out of sync with the actual `deliveries` status if a delivery transitions via multiple paths (timeout, failure, rollback).

**Correction applied:** Do NOT add `current_delivery_id` to `drivers`. "Is driver busy?" is derived at query time:

```sql
SELECT id FROM deliveries
WHERE driver_id = $1
  AND status IN ('accepted', 'picked_up')
LIMIT 1;
```

If this query returns a row, the driver has an active delivery and is ineligible for the pool. The `deliveries_driver_active_idx` partial index (see section 8) makes this query fast enough to run on every pool refresh without performance concern.

### Correction A-3: Photo columns — pickup_photo_url vs collection_photo_url

**Problem flagged:** The dispatch engine spec introduced `pickup_photo_url` for the photo taken when the driver collects the package. PLZ-057 already added `collection_photo_url` to `deliveries` for exactly the same concept. Using two columns for the same thing would be a data model inconsistency.

**Correction applied:** See full analysis in section 7.

---

## 4. day_of_week Convention

`driver_schedules.day_of_week` uses the following encoding:

| Value | Day |
|---|---|
| 0 | Monday |
| 1 | Tuesday |
| 2 | Wednesday |
| 3 | Thursday |
| 4 | Friday |
| 5 | Saturday |
| 6 | Sunday |

**Why not JS convention?** JavaScript's `Date.getDay()` returns 0 for Sunday. Storing this directly in the DB would mean 0 = Sunday, 1 = Monday — counterintuitive for dispatch staff and drivers reading the schedule table directly in the admin panel.

**Engine conversion (mandatory):** When the dispatch engine evaluates schedule eligibility using the current JS timestamp, it must convert:

```javascript
const jsDay = new Date().getDay();  // 0=Sun, 1=Mon, ..., 6=Sat
const dbDay = (jsDay + 6) % 7;     // 0=Mon, 1=Tue, ..., 6=Sun
```

This conversion must be applied in every code path that reads `driver_schedules.day_of_week` against a JS-derived current day.

---

## 5. "No current_delivery_id" Decision

This decision is documented separately here (beyond the Antonio correction summary) because it has architectural implications.

**Decision:** The `drivers` table will NOT receive a `current_delivery_id` column.

**Rationale:**
- A denormalized foreign key (`current_delivery_id`) would need to be kept in sync across every delivery status transition: `available → accepted → picked_up → delivered/failed/timed_out`. Any missed update (network failure, partial transaction, timeout rollback) leaves `current_delivery_id` pointing at a completed delivery, making the driver appear permanently busy.
- The derived query is cheap because of the partial index on `(driver_id, status)` where `status IN ('accepted', 'picked_up')`. On a small-to-medium fleet (< 1,000 drivers), this is a sub-millisecond index scan.
- A derived query is always consistent with the source of truth.

**Derived query to use in the dispatch eligibility check:**

```sql
-- Check if driver has an active delivery (returns 0 or 1 row)
SELECT id FROM deliveries
WHERE driver_id = $1
  AND status IN ('accepted', 'picked_up')
LIMIT 1;
```

This query is called inside the pool eligibility filter, not in a hot path on every API request. Performance is acceptable at MVP scale.

---

## 6. Earnings Formula

Driver earnings for each delivery are calculated at the moment the delivery enters the pool and frozen into `deliveries.driver_earnings_mad`. The formula:

```
driver_earnings_mad = base_fee_mad + (per_km_rate_mad × distance_km)
```

Where:
- `base_fee_mad` — from `dispatch_config` at the time of delivery creation
- `per_km_rate_mad` — from `dispatch_config` at the time of delivery creation
- `distance_km` — haversine straight-line distance with a fixed 10% margin applied (see below)

**`distance_km` calculation (Othmane correction — 10% margin is fixed from day one):**

```
haversine_raw_km  = haversine(merchant_lat, merchant_lng, customer_lat, customer_lng)
distance_km       = haversine_raw_km * 1.10
```

The 10% margin is a fixed, mandatory part of the formula — not a future optional adjustment. It is applied at every delivery creation from the first day of PLZ-058. The rationale is that straight-line distance consistently underestimates the real road distance in urban Moroccan road grids. The 10% correction produces a fairer earnings estimate without requiring a live Mapbox API call.

**Why freeze?** Admin may update `dispatch_config.per_km_rate_mad` between when a delivery is created and when it is completed. Drivers must see (and rely on) the earnings figure shown at acceptance time. Freezing at creation prevents retroactive changes.

**Note:** `distance_km` uses the haversine formula (straight-line + 10% margin). The engine does not call any mapping API at this stage. A more accurate road-distance calculation can be added in a later sprint (Part 4 Mapbox integration), but the 10% margin stays in the formula regardless.

---

## 7. Photo Columns Note — PLZ-057 Overlap

**Existing column from PLZ-057** (`20260414000003_plz057_driver_app_schema.sql`):

```sql
alter table deliveries
  add column if not exists collection_photo_url text,
```

**PLZ-058 introduces:** `pickup_photo_url` — the photo taken by the driver when collecting the package from the merchant.

These two columns represent **the same concept**: the photo captured at collection/pickup.

**Decision (documented here, requires founder approval before migration):**

Option A — **Rename**: Write a migration that renames `collection_photo_url` to `pickup_photo_url` and updates all references in `lib/db/driver.ts`, `types/supabase.ts`, and any server actions. Clean schema going forward. Requires updating the `DELIVERY_SELECT` constant and `DriverDelivery` type shape.

Option B — **Keep both**: Add `pickup_photo_url` as a new column, leave `collection_photo_url` in place for backward compatibility. The `collection_photo_url` column becomes deprecated (noted with a DB comment). More columns, more confusion — not recommended.

**Recommendation:** Option A (rename). PLZ-057 shipped 2026-04-15. No external API consumers rely on `collection_photo_url` yet. A rename migration is low risk at this stage and keeps the schema clean.

**Action required:** Othmane to confirm Option A or B before the PLZ-058 migration is written. If Option A, the migration must include:

```sql
ALTER TABLE deliveries RENAME COLUMN collection_photo_url TO pickup_photo_url;
```

Plus corresponding updates to TypeScript types and the `DELIVERY_SELECT` query string in `lib/db/driver.ts`.

**Until this is resolved:** This planning document uses `pickup_photo_url` as the canonical name. The migration will resolve the rename vs. backward-compat question.

---

## 8. Indexes

All indexes are partial where possible to keep index size small and scans fast.

| Index | Table | Columns | Condition | Rationale |
|---|---|---|---|---|
| `deliveries_pool_eligible_idx` | `deliveries` | `(pickup_city, status, pool_expires_at)` | `WHERE status = 'available'` | Primary dispatch query — filters the pool by city and expiry. Partial on `available` so the index only covers live pool rows, not historical deliveries. |
| `deliveries_driver_active_idx` | `deliveries` | `(driver_id, status)` | `WHERE status IN ('accepted', 'picked_up')` | Powers the "is driver busy?" derived check. Partial index means it only indexes in-flight deliveries — very small set. |
| `driver_schedules_driver_idx` | `driver_schedules` | `(driver_id, day_of_week)` | — | Eligibility check reads schedule by driver + day. Composite covers both filter columns in one scan. |
| `deliveries_timeout_idx` | `deliveries` | `(pool_expires_at)` | `WHERE status = 'available'` | Background timeout job scans for rows where `pool_expires_at < now()` and `status = 'available'`. Partial index keeps it focused on live pool only. |

```sql
-- Dispatch eligibility query (pool feed by city)
CREATE INDEX deliveries_pool_eligible_idx ON deliveries (pickup_city, status, pool_expires_at)
  WHERE status = 'available';

-- Driver busy check
CREATE INDEX deliveries_driver_active_idx ON deliveries (driver_id, status)
  WHERE status IN ('accepted', 'picked_up');

-- Schedule lookup
CREATE INDEX driver_schedules_driver_idx ON driver_schedules (driver_id, day_of_week);

-- Timeout monitoring
CREATE INDEX deliveries_timeout_idx ON deliveries (pool_expires_at)
  WHERE status = 'available';
```

---

## 9. RLS Policies Required

These policies are documented for implementation reference. They will be written in the migration file, not here.

### `dispatch_config`

| Operation | Who | Policy |
|---|---|---|
| SELECT | All authenticated users (drivers + merchants) | `auth.role() = 'authenticated'` |
| INSERT / UPDATE / DELETE | Admin only | Service role only — no RLS policy for authenticated users; service role bypasses RLS |

Rationale: Drivers and merchants need to read the current fee rates and timeout to display correct earnings estimates. Only the admin panel (which runs as service role) may mutate the config.

### `driver_schedules`

| Operation | Who | Policy |
|---|---|---|
| SELECT | Driver (own rows only) | `driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())` |
| INSERT | Driver (own rows only) | Same check in `WITH CHECK` |
| UPDATE | Driver (own rows only) | Same check in `USING` and `WITH CHECK` |
| DELETE | Driver (own rows only) | Same check |

Rationale: Drivers manage their own availability windows. No cross-driver visibility needed.

### `deliveries` — new pool feed SELECT policy

| Operation | Who | Policy |
|---|---|---|
| SELECT (pool feed) | Any active driver | `status = 'available' AND pickup_city = (SELECT city FROM drivers WHERE user_id = auth.uid())` |

This is an additional policy layered on top of the existing `deliveries_driver_select` policy from PLZ-057 (which scopes `SELECT` to rows where `driver_id` matches the authenticated driver's id). The new policy covers the pool feed case where `driver_id` is NULL (no driver assigned yet) and `status = 'available'`.

> Note: Supabase RLS uses OR logic across policies on the same table/operation. Both the existing and new SELECT policy will be active simultaneously — a driver can see their own deliveries (existing policy) OR any available delivery in their city (new policy).

---

## 10. Migration Log Entry (to be added to memory.md when migration runs)

The following entry should be added to `.agents/backend/memory.md` under "Migration log" when the PLZ-058 migration is applied to production:

```
| 2026-04-XX | PLZ-058: dispatch engine schema — dispatch_config, driver_schedules, drivers.is_online, deliveries pool columns + status extension | ⏳ Pending | See rollback instructions below |
```

**Rollback instructions (to be documented in the migration file):**

```sql
-- Rollback PLZ-058 dispatch engine schema
DROP TABLE IF EXISTS dispatch_config;
DROP TABLE IF EXISTS driver_schedules;
ALTER TABLE drivers DROP COLUMN IF EXISTS is_online;
ALTER TABLE deliveries
  DROP COLUMN IF EXISTS distance_km,
  DROP COLUMN IF EXISTS estimated_duration_min,
  DROP COLUMN IF EXISTS driver_earnings_mad,
  DROP COLUMN IF EXISTS pickup_city,
  DROP COLUMN IF EXISTS pool_created_at,
  DROP COLUMN IF EXISTS pool_expires_at,
  DROP COLUMN IF EXISTS accepted_at,
  DROP COLUMN IF EXISTS merchant_pickup_code,
  DROP COLUMN IF EXISTS pickup_photo_url;
-- If collection_photo_url was renamed to pickup_photo_url (Option A):
-- ALTER TABLE deliveries RENAME COLUMN pickup_photo_url TO collection_photo_url;
-- Status enum rollback: remove 'available' and 'timed_out' values
-- Note: Postgres cannot remove enum values once added — requires full enum recreation.
-- Coordinate with Othmane before running on production.
DROP INDEX IF EXISTS deliveries_pool_eligible_idx;
DROP INDEX IF EXISTS deliveries_driver_active_idx;
DROP INDEX IF EXISTS driver_schedules_driver_idx;
DROP INDEX IF EXISTS deliveries_timeout_idx;
```

---

## 11. Open Questions (to resolve before migration is written)

1. **`assigned` → `accepted` status rename** — RESOLVED (Othmane, 2026-04-15). Use:

   ```sql
   ALTER TYPE delivery_status RENAME VALUE 'assigned' TO 'accepted';
   ```

   This rename will be placed at the top of the PLZ-058 migration file as a cleanup step, before any new columns are added. No data migration is required — the rename is atomic and in-place.

2. **`collection_photo_url` → `pickup_photo_url` column rename** — RESOLVED (Othmane, 2026-04-15). Use Option A (rename):

   ```sql
   ALTER TABLE deliveries RENAME COLUMN collection_photo_url TO pickup_photo_url;
   ```

   This rename will also be placed at the top of the PLZ-058 migration file as a cleanup step, alongside the enum rename above, before the new dispatch columns are added. TypeScript types (`types/supabase.ts`) and the `DELIVERY_SELECT` constant in `lib/db/driver.ts` must be updated to reflect the new column name.

   > **Note:** Both renames (items 1 and 2) are combined into a single PLZ-058 migration file. They are NOT separate migrations — they appear together at the top of the PLZ-058 migration SQL as cleanup steps before the new columns are added.

3. **`pickup_city` source** — confirm that the merchant's city column (from the `merchants` table or `delivery_zones`) is the correct source for `pickup_city`. Current assumption: copied from the merchant record at delivery creation.

4. **Timeout background job** — how is the timeout enforced? Options: Supabase Edge Function on a schedule (pg_cron or external cron), or a Postgres trigger on `pool_expires_at`. Architecture decision needed before implementation.

5. **`merchant_pickup_code` type** — the column is `integer` on `orders`. The dispatch schema defines it as `text` on `deliveries` for flexibility. Confirm the preferred type or keep as `integer` on both.

---

## 12. Driver App Changes for PLZ-058

This section documents what changes in the driver app code and schema when the dispatch engine is introduced. All items below apply to the branch that implements PLZ-058.

---

### 12.1 `lib/db/driver.ts` — `getActiveDeliveries`

**Change:** Update the status filter.

- Current (PLZ-057): `status IN ('assigned', 'picked_up')`
- After PLZ-058: `status IN ('accepted', 'picked_up')`

This reflects the `assigned → accepted` enum rename resolved in section 11 (item 1).

---

### 12.2 `lib/db/driver.ts` — new function `getPoolDeliveries(driverCity: string)`

Returns deliveries currently in the pool for the driver's city.

```typescript
// Query:
// SELECT id, distance_km, estimated_duration_min, driver_earnings_mad,
//        pickup_city, pool_created_at, pool_expires_at
// FROM deliveries
// WHERE status = 'available'
//   AND pickup_city = driverCity
//   AND pool_expires_at > now()
// ORDER BY pool_created_at ASC   -- oldest first = fairness
```

**Column selection note:** delivery address detail (street) is NOT included in the pool view — only zone (city). Full address detail is revealed after the driver accepts the delivery.

---

### 12.3 `lib/db/driver.ts` — new function `acceptDelivery(deliveryId: string, driverId: string)`

Atomic update to claim a pool delivery.

```typescript
// UPDATE deliveries
// SET status = 'accepted', driver_id = $driverId, accepted_at = now()
// WHERE id = $deliveryId AND status = 'available'
// RETURNING id

// Returns: { accepted: boolean }
// accepted = false means another driver was faster (no row returned by RETURNING)
```

**Implementation note:** Uses the `accept_delivery` Postgres function (see section 12.4) called from the server action, rather than a direct Supabase update. RLS cannot express "only if `status = 'available'`" on UPDATE without a helper function.

---

### 12.4 New Postgres function: `accept_delivery(p_delivery_id uuid, p_driver_id uuid)`

```sql
CREATE OR REPLACE FUNCTION accept_delivery(p_delivery_id uuid, p_driver_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_id uuid;
BEGIN
  UPDATE deliveries
  SET status = 'accepted',
      driver_id = p_driver_id,
      accepted_at = now()
  WHERE id = p_delivery_id
    AND status = 'available'
  RETURNING id INTO v_updated_id;

  RETURN v_updated_id IS NOT NULL;
END;
$$;
```

Returns `true` if the delivery was claimed (status was `'available'` at the moment of update), `false` if another driver was faster. `SECURITY DEFINER` allows the atomic conditional update without requiring service role in server actions.

---

### 12.5 `app/driver/livraisons/page.tsx` (server component)

**Change:** Currently fetches active deliveries only. After PLZ-058, also fetch pool deliveries for the driver's city.

```typescript
// Before:
const deliveries = await getActiveDeliveries(driverId);

// After:
const [deliveries, poolDeliveries] = await Promise.all([
  getActiveDeliveries(driverId),
  getPoolDeliveries(driverCity),
]);
// Pass both to LivraisonsClient
```

---

### 12.6 `app/driver/livraisons/_components/LivraisonsClient.tsx`

**Change:** Currently shows active delivery list only. After PLZ-058, add a "pool" section above the active deliveries.

Pool cards display:
- Distance (`distance_km`)
- Pickup zone (city)
- Delivery zone (city — no street detail until acceptance)
- Estimated time (`estimated_duration_min`)
- Earnings (`driver_earnings_mad`)
- "Accepter" button — calls `acceptDelivery(deliveryId, driverId)` server action

**Realtime subscription:** channel `deliveries:pool:{city}`
- `INSERT` events — new deliveries appear in the pool
- `UPDATE` events where `status != 'available'` — delivery disappears from pool (accepted by another driver or timed out)

---

### 12.7 `app/driver/profil/page.tsx`

**Change:** Add a "Mes horaires" section with a weekly schedule summary display. Section links to the new page `/driver/profil/horaires`.

---

### 12.8 New page: `app/driver/profil/horaires/page.tsx`

Weekly schedule editor for the driver.

- 7 rows: Monday through Sunday (`day_of_week` 0–6, see section 4 for encoding)
- Each row contains: active toggle (`is_active`), start time (`start_time`), end time (`end_time`)
- Saves to `driver_schedules` table (one row per driver per day, `UPSERT` on `(driver_id, day_of_week)`)

---

### 12.9 `app/driver/auth/pin-setup/actions.ts` — `completeDriverPinSetupAction`

**Change:** After PIN setup completes successfully, also `INSERT` default `driver_schedules` rows — one row per day of week, all with `is_active = false` by default.

```sql
INSERT INTO driver_schedules (driver_id, day_of_week, start_time, end_time, is_active)
VALUES
  ($driver_id, 0, '08:00', '20:00', false),
  ($driver_id, 1, '08:00', '20:00', false),
  ($driver_id, 2, '08:00', '20:00', false),
  ($driver_id, 3, '08:00', '20:00', false),
  ($driver_id, 4, '08:00', '20:00', false),
  ($driver_id, 5, '08:00', '20:00', false),
  ($driver_id, 6, '08:00', '20:00', false)
ON CONFLICT (driver_id, day_of_week) DO NOTHING;
```

**Why `is_active = false`:** Drivers start with no working hours set — they must configure their schedule in `/driver/profil/horaires` before they appear eligible in the dispatch pool. This prevents a newly registered driver from receiving deliveries before they have confirmed their availability windows.

---

*Document prepared by Youssef, Backend & Data Agent. Report any corrections or additions to Othmane.*
