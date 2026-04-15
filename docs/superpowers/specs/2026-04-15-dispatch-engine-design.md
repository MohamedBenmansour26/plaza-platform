# Plaza Dispatch Engine — Design Spec

**Date:** 2026-04-15  
**Author:** Othmane (PM) + founder  
**Status:** Approved — ready for implementation plan

---

## 1. Problem

When a customer order is confirmed by a merchant, a driver must be assigned to collect and deliver it. Currently this is manual. The dispatch engine automates this end-to-end — merchant confirms once, everything else is handled by the platform.

---

## 2. Decisions Locked

| Decision | Choice | Rationale |
|---|---|---|
| Assignment model | Pool / marketplace (C) | Drivers see eligible deliveries, first to accept wins |
| Concurrent deliveries | One at a time (A) | Driver fully accountable per delivery, no split attention |
| Timeout fallback | Flag to admin (A) | No auto-cancel; admin resolves manually at MVP |
| Driver availability | Weekly schedule + real-time override (C) | Planning data + daily flexibility |
| Pool card info | Zone + distance + duration + earnings (custom) | No COD amount, no merchant name |
| Driver payment | Base fee + rate per km (B) | Configurable in admin panel |
| Dispatch trigger | On merchant order confirmation (B) | Merchant validates stock; engine handles the rest |
| Engine location | Next.js server actions + pg_cron (B) | One codebase, no Edge Functions |
| Distance calculation | Haversine × 1.10 margin | No external API; 10% margin baked in from day one |
| Status terminology | `accepted` (not `assigned`) | Rename from PLZ-057 in PLZ-058 migration |
| Photo column | `pickup_photo_url` (not `collection_photo_url`) | Rename from PLZ-057 in PLZ-058 migration |

---

## 3. Data Model

### 3.1 New table: `dispatch_config`

Singleton row — one per platform. Admin edits only.

```sql
id                  uuid pk default gen_random_uuid()
base_fee_mad        decimal(10,2) not null default 10.00
per_km_rate_mad     decimal(10,2) not null default 3.00
pool_timeout_minutes int not null default 15
updated_at          timestamptz default now()
```

**Earnings formula:** `driver_earnings_mad = base_fee_mad + (per_km_rate_mad × distance_km)`

### 3.2 New table: `driver_schedules`

One row per driver per day of week.

```sql
id           uuid pk default gen_random_uuid()
driver_id    uuid not null references drivers(id) on delete cascade
day_of_week  int not null  -- 0=Monday, 6=Sunday
                            -- JS getDay() returns 0=Sunday; convert: dbDay = (jsDay + 6) % 7
start_time   time not null
end_time     time not null
is_active    boolean not null default true
unique (driver_id, day_of_week)
```

Default on PIN setup: 7 rows inserted for the driver, all `is_active = false`. Driver must configure schedule before appearing in the pool.

### 3.3 Extended: `drivers`

New columns:
- `city text` — driver's operating city. Used for pool eligibility matching against `deliveries.pickup_city`. Added in PLZ-058 migration; driver sets during onboarding (vehicle step).

**`is_available` already exists** (from PLZ-057 gap-fill) and is the online/offline toggle. Do NOT add `is_online` — use `is_available` everywhere in the dispatch engine.

**No `current_delivery_id` column.** "Is driver busy?" is derived:
```sql
SELECT id FROM deliveries
WHERE driver_id = $driver_id
  AND status IN ('accepted', 'picked_up')
LIMIT 1
```

### 3.4 Extended: `deliveries`

**Status field is `text`, not a Postgres enum.** The "rename" `'assigned'` → `'accepted'` is done via:
```sql
UPDATE deliveries SET status = 'accepted' WHERE status = 'assigned';
```
No `ALTER TYPE` needed. New values (`'available'`, `'timed_out'`, `'cancelled'`) simply work as text.

**Column rename from PLZ-057:**
- `collection_photo_url` → `pickup_photo_url` via `ALTER TABLE deliveries RENAME COLUMN`

**New status values:** `'available'`, `'timed_out'`

**Full status lifecycle:** `available → accepted → picked_up → delivered | failed | timed_out | cancelled`

**New columns:**
```
distance_km             decimal(10,2)     -- haversine_raw × 1.10, calculated at dispatch
estimated_duration_min  int               -- ceil(distance_km / 0.5), ~30 km/h
driver_earnings_mad     decimal(10,2)     -- frozen at dispatch time; rate changes don't backfill
pickup_city             text              -- for eligibility query
pool_created_at         timestamptz       -- when delivery entered pool
pool_expires_at         timestamptz       -- pool_created_at + pool_timeout_minutes
accepted_at             timestamptz       -- when driver accepted
merchant_pickup_code    text              -- copied from orders at dispatch; frozen; no join needed
pickup_photo_url        text nullable     -- renamed from collection_photo_url
delivery_photo_url      text nullable     -- already exists from PLZ-057
```

### 3.5 Indexes

```sql
-- Pool eligibility query
CREATE INDEX deliveries_pool_eligible_idx
  ON deliveries (pickup_city, status, pool_expires_at)
  WHERE status = 'available';

-- Driver busy check
CREATE INDEX deliveries_driver_active_idx
  ON deliveries (driver_id, status)
  WHERE status IN ('accepted', 'picked_up');

-- Schedule lookup
CREATE INDEX driver_schedules_driver_idx
  ON driver_schedules (driver_id, day_of_week);

-- Timeout monitor
CREATE INDEX deliveries_timeout_idx
  ON deliveries (pool_expires_at)
  WHERE status = 'available';
```

### 3.6 Postgres function: `accept_delivery`

```sql
CREATE OR REPLACE FUNCTION accept_delivery(
  p_delivery_id uuid,
  p_driver_id   uuid
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  updated_count int;
BEGIN
  UPDATE deliveries
  SET status     = 'accepted',
      driver_id  = p_driver_id,
      accepted_at = now()
  WHERE id     = p_delivery_id
    AND status = 'available';
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;
```

Returns `true` = accepted, `false` = already taken by another driver.

### 3.7 pg_cron timeout monitor

Runs every minute via Supabase pg_cron:

```sql
SELECT cron.schedule(
  'dispatch-pool-timeout',
  '* * * * *',
  $$
    UPDATE deliveries
    SET status = 'timed_out'
    WHERE status = 'available'
      AND pool_expires_at < now()
  $$
);
```

### 3.8 RLS policies (new)

- `dispatch_config`: SELECT for all authenticated users; INSERT/UPDATE/DELETE for service role only
- `driver_schedules`: full CRUD for own rows (`driver_id` matches driver's record for `auth.uid()`)
- `deliveries` pool SELECT: drivers can see `available` deliveries where `pickup_city` matches their city
  (existing RLS already covers driver's own deliveries for other statuses)

---

## 4. Dispatch Pipeline

**Trigger:** Merchant confirms order → `confirmOrderAction(orderId)` in `app/dashboard/commandes/actions.ts`

**Step 1 — Order confirmed** (existing logic, unchanged)
Order status → `'confirmed'`

**Step 2 — `createDispatchDelivery(orderId)`** (new server action, called inside `confirmOrderAction`)
1. Fetch order (total, payment_method, merchant_pickup_code) + merchant (location_lat, location_lng, city) + customer (location_lat, location_lng)
2. Compute `haversine_raw_km` from merchant → customer coordinates
3. `distance_km = haversine_raw_km * 1.10`
4. `estimated_duration_min = Math.ceil(distance_km / 0.5)`
5. Fetch `dispatch_config` (base_fee_mad, per_km_rate_mad, pool_timeout_minutes)
6. `driver_earnings_mad = base_fee_mad + per_km_rate_mad * distance_km`
7. `pool_expires_at = now() + pool_timeout_minutes`
8. INSERT delivery:
   - status = `'available'`
   - pickup_city = merchant.city
   - merchant_pickup_code = order.merchant_pickup_code (copied, frozen)
   - distance_km, estimated_duration_min, driver_earnings_mad
   - pool_created_at = now(), pool_expires_at

**Step 3 — Supabase Realtime notifies eligible drivers**
- Drivers subscribe to channel `deliveries:pool:{city}` via Supabase Realtime
- INSERT event → new card appears in pool
- Eligibility enforced by RLS: same city + driver is_available = true + no active delivery + `onboarding_status = 'active'`

**Step 4 — Driver taps "Accepter"**
- `acceptDeliveryAction(deliveryId)` calls `accept_delivery(deliveryId, driverId)` Postgres function
- Returns `{ accepted: true }` → navigate to delivery detail
- Returns `{ accepted: false }` → show toast "Désolé, cette livraison a déjà été prise"

**Step 5 — Realtime propagates acceptance**
- `UPDATE` event on delivery (status → `'accepted'`) → card disappears from all other drivers' pools

**Timeout path** — pg_cron marks `timed_out` → admin queue

---

## 5. Driver App Changes

### Changed screens (2)

**`livraisons` page:**
- Fetches pool deliveries (status=available, city match) + active delivery in parallel
- Pool section shows above active section
- Pool section hidden when driver has active delivery (one at a time enforced in UI)
- Pool cards: pickup zone, delivery zone, distance_km, estimated_duration_min, driver_earnings_mad, "Accepter" button
- Realtime subscription: INSERT (new card) + UPDATE (status change → card disappears)
- Cards ordered by `pool_created_at ASC` (oldest first = fairest)

**`profil` page:**
- Add "Mes horaires" link row → `/driver/profil/horaires`
- Gains display uses `driver_earnings_mad` from delivery record (replaces 8% stub)

### New screens (1)

**`/driver/profil/horaires`:**
- 7 rows (Mon–Sun)
- Each row: is_active toggle + start_time + end_time (hidden when inactive)
- Saves to `driver_schedules` table
- Default: all inactive (driver must configure before appearing in pool)

### Driver eligibility check (server-side, in RLS + server action)

A driver sees pool deliveries if ALL of:
- `onboarding_status = 'active'`
- `is_available = true`
- No delivery with `status IN ('accepted', 'picked_up')` for this driver
- Current time is within an active `driver_schedules` row for today

---

## 6. Merchant Dashboard Changes

### `confirmOrderAction` (`app/dashboard/commandes/actions.ts`)

After setting order status → `'confirmed'`, call `await createDispatchDelivery(orderId)`.
Wrapped in try/catch — if dispatch fails, order is still confirmed (log error, don't block merchant).

### `OrderDetailSheet`

New "Livraison" section below order summary. Shows delivery status label:
- `available` → "Recherche d'un livreur" (pulsing blue dot, countdown timer)
- `accepted` / `picked_up` → "Livreur en route" (green dot)
- `delivered` → "Livré ✓" (green)
- `timed_out` → "Non assignée — en attente admin" (red)
- `failed` → "Incident signalé" (red)

No driver personal details (name, phone) exposed to merchant.

### Order list badge

If delivery status = `timed_out`: order card shows amber "Livraison non assignée" badge.

---

## 7. Edge Cases

| Scenario | Handling |
|---|---|
| Two drivers accept simultaneously | Atomic `WHERE status='available'`; loser gets 0 rows → "Déjà prise" toast |
| Driver goes offline mid-delivery | Delivery stays locked; admin monitors for stuck (>30 min no update); no auto-reassign at MVP |
| No drivers online in city | Delivery sits in pool → `timed_out` → admin queue |
| Schedule ends during active delivery | No interruption; driver finishes; schedule only gates pool visibility |
| Merchant cancels order while `available` | Set delivery to `cancelled` atomically (same WHERE status guard) |
| Merchant cancels while `accepted`/`picked_up` | Flag in admin; no automated driver notification at MVP |
| Merchant changes pickup code after dispatch | Non-issue; `merchant_pickup_code` frozen on delivery record |
| Driver taps accept on expired pool card | Card gone via Realtime; if races: atomic SQL finds status ≠ `available` → same toast |

---

## 8. Admin Panel Requirements (tracked for future sprint)

### P0 — Day-1 operations
- Timed-out deliveries queue — view + manual re-dispatch
- Pending driver validation — approve/reject `onboarding_status`
- Dispatch config editor — `base_fee_mad`, `per_km_rate_mad`, `pool_timeout_minutes`
- Stuck delivery alerts — `accepted`/`picked_up` with no status update in 30+ min

### P1 — Operational visibility
- Driver availability view — online/offline by city
- Manual assignment override — assign `available` delivery to specific driver
- Order-delivery audit trail — which driver handled which order
- Cancel in-flight delivery — set to `cancelled`, handle driver state

### P2 — Analytics
- Driver utilization rate (planned vs actual hours online)
- Avg time-to-accept by city and time of day
- Delivery success rate per driver
- Pool timeout rate (signals under-supply)
- Weekly earnings summary per driver

**Note:** Admin panel is NOT in PLZ-058 scope. Until built, admin uses Supabase Studio as fallback.

---

## 9. Out of Scope (PLZ-058)

- Real SMS OTP (stub remains — PLZ-059)
- Auto-reassign on driver going offline
- Multi-city zone splitting (sub-city precision)
- Driver-to-customer messaging
- Push notifications (web push / FCM)
- Admin panel UI (tracked above, future sprint)
- Embedded Mapbox map (deferred to Part 4 per existing decision)
