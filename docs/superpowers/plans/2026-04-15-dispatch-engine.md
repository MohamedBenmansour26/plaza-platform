# Plaza Dispatch Engine (PLZ-058) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pool-based delivery dispatch engine that automatically creates a delivery when a merchant confirms an order, notifies eligible drivers in real-time, and atomically assigns the first driver who accepts.

**Architecture:** Next.js server actions handle the dispatch pipeline (create delivery, accept delivery). Supabase Realtime pushes pool updates to driver clients. A pg_cron job monitors timeouts. All dispatch logic lives in `lib/dispatch/` — no Edge Functions.

**Spec:** `docs/superpowers/specs/2026-04-15-dispatch-engine-design.md`

**Tech Stack:** Next.js 14 App Router, Supabase (Postgres + Realtime + pg_cron), TypeScript strict, Tailwind CSS

---

## File Map

**Create:**
- `supabase/migrations/20260415000001_plz058_dispatch_engine.sql` — all DB changes
- `lib/dispatch/haversine.ts` — pure Haversine distance function
- `lib/dispatch/createDispatchDelivery.ts` — main dispatch server action
- `lib/dispatch/types.ts` — shared dispatch types
- `app/driver/livraisons/_components/PoolCard.tsx` — pool delivery card UI
- `app/driver/profil/horaires/page.tsx` — weekly schedule editor
- `app/driver/profil/horaires/actions.ts` — save schedule server action

**Modify:**
- `types/supabase.ts` — add dispatch_config, driver_schedules, dispatch_errors, new deliveries/drivers columns
- `lib/db/driver.ts` — add getPoolDeliveries, acceptDelivery, getDriverProfile (add city field)
- `app/dashboard/commandes/actions.ts` — wire createDispatchDelivery after confirmOrderAction
- `app/dashboard/commandes/OrderDetailSheet.tsx` — add Livraison section
- `app/dashboard/commandes/OrdersClient.tsx` — add timed_out badge
- `app/driver/livraisons/page.tsx` — fetch pool deliveries in parallel with active
- `app/driver/livraisons/_components/LivraisonsClient.tsx` — pool section + Realtime
- `app/driver/profil/page.tsx` — add horaires link + fix earnings stub
- `app/driver/auth/pin-setup/actions.ts` — seed driver_schedules on PIN setup
- `middleware.ts` — add /driver/profil/horaires to PROTECTED_PREFIXES

**Tests:**
- `tests/unit/haversine.test.ts` — unit tests for Haversine + earnings formula

---

## Task 1 — DB Migration

**Files:**
- Create: `supabase/migrations/20260415000001_plz058_dispatch_engine.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260415000001_plz058_dispatch_engine.sql`:

```sql
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
  UNIQUE (driver_id, day_of_week)
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
  ON deliveries (pickup_city, status, pool_expires_at)
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
-- Enable pg_cron extension if not already enabled (run once).
-- NOTE: pg_cron must be enabled via Supabase Dashboard: Extensions → pg_cron → Enable
-- Then run this schedule:
SELECT cron.schedule(
  'dispatch-pool-timeout',
  '* * * * *',
  $$
    UPDATE deliveries
    SET status = 'timed_out'
    WHERE status = 'available'
      AND pool_expires_at < now()
  $$
) ON CONFLICT DO NOTHING;

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
CREATE POLICY "deliveries: driver can see pool in own city"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    status = 'available'
    AND pickup_city = (
      SELECT city FROM drivers WHERE user_id = auth.uid() LIMIT 1
    )
  );
```

- [ ] **Step 2: Verify the migration file is valid SQL**

```bash
cd "C:/Users/benmansour mohamed/Documents/plaza-platform"
# Check for syntax issues by reviewing key sections
grep -c "CREATE\|ALTER\|UPDATE\|INSERT\|SELECT cron" supabase/migrations/20260415000001_plz058_dispatch_engine.sql
```

Expected: count ≥ 15 (each major statement present).

- [ ] **Step 3: Commit the migration**

```bash
git add supabase/migrations/20260415000001_plz058_dispatch_engine.sql
git commit -m "feat(PLZ-058): dispatch engine DB migration — tables, columns, indexes, accept_delivery fn"
```

---

## Task 2 — Supabase Types Update

**Files:**
- Modify: `types/supabase.ts`

- [ ] **Step 1: Read current types file to find insertion points**

Open `types/supabase.ts`. Find the `Tables` section. Note the current line numbers for `deliveries`, `drivers`.

- [ ] **Step 2: Add dispatch_config Row type**

In the `Tables` block, add after the existing tables (alphabetical order near 'd'):

```typescript
dispatch_config: {
  Row: {
    id:                   string
    base_fee_mad:         number
    per_km_rate_mad:      number
    pool_timeout_minutes: number
    updated_at:           string
  }
  Insert: {
    id?:                   string
    base_fee_mad?:         number
    per_km_rate_mad?:      number
    pool_timeout_minutes?: number
    updated_at?:           string
  }
  Update: {
    base_fee_mad?:         number
    per_km_rate_mad?:      number
    pool_timeout_minutes?: number
    updated_at?:           string
  }
  Relationships: []
}
```

- [ ] **Step 3: Add dispatch_errors Row type**

```typescript
dispatch_errors: {
  Row: {
    id:            string
    order_id:      string | null
    error_message: string
    created_at:    string
  }
  Insert: {
    id?:            string
    order_id?:      string | null
    error_message:  string
    created_at?:    string
  }
  Update: {
    error_message?: string
  }
  Relationships: [
    {
      foreignKeyName: 'dispatch_errors_order_id_fkey'
      columns: ['order_id']
      isOneToOne: false
      referencedRelation: 'orders'
      referencedColumns: ['id']
    }
  ]
}
```

- [ ] **Step 4: Add driver_schedules Row type**

```typescript
driver_schedules: {
  Row: {
    id:          string
    driver_id:   string
    day_of_week: number  // 0=Monday, 6=Sunday
    start_time:  string  // "HH:MM:SS"
    end_time:    string
    is_active:   boolean
  }
  Insert: {
    id?:          string
    driver_id:    string
    day_of_week:  number
    start_time:   string
    end_time:     string
    is_active?:   boolean
  }
  Update: {
    day_of_week?: number
    start_time?:  string
    end_time?:    string
    is_active?:   boolean
  }
  Relationships: [
    {
      foreignKeyName: 'driver_schedules_driver_id_fkey'
      columns: ['driver_id']
      isOneToOne: false
      referencedRelation: 'drivers'
      referencedColumns: ['id']
    }
  ]
}
```

- [ ] **Step 5: Extend drivers Row**

Find the `drivers` Row type. Add:

```typescript
// Add to drivers Row:
city: string | null

// Add to drivers Insert:
city?: string | null

// Add to drivers Update:
city?: string | null
```

- [ ] **Step 6: Extend deliveries Row**

Find the `deliveries` Row type. Apply two changes:

1. Rename `collection_photo_url` → `pickup_photo_url` everywhere in the deliveries block.
2. Add new dispatch columns to Row/Insert/Update:

```typescript
// Add to deliveries Row:
distance_km:            number | null
estimated_duration_min: number | null
driver_earnings_mad:    number | null
pickup_city:            string | null
pool_created_at:        string | null
pool_expires_at:        string | null
accepted_at:            string | null
merchant_pickup_code:   string | null
// pickup_photo_url already exists (renamed from collection_photo_url)

// Add to deliveries Insert (all optional):
distance_km?:            number | null
estimated_duration_min?: number | null
driver_earnings_mad?:    number | null
pickup_city?:            string | null
pool_created_at?:        string | null
pool_expires_at?:        string | null
accepted_at?:            string | null
merchant_pickup_code?:   string | null

// Same additions to deliveries Update
```

- [ ] **Step 7: Run type-check**

```bash
cd "C:/Users/benmansour mohamed/Documents/plaza-platform"
npx tsc --noEmit
```

Expected: EXIT 0.

- [ ] **Step 8: Commit**

```bash
git add types/supabase.ts
git commit -m "feat(PLZ-058): extend Supabase types — dispatch_config, driver_schedules, dispatch_errors, new delivery columns"
```

---

## Task 3 — Haversine Utility + Unit Tests

**Files:**
- Create: `lib/dispatch/haversine.ts`
- Create: `tests/unit/haversine.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `tests/unit/haversine.test.ts`:

```typescript
import { haversineKm, dispatchDistance, driverEarnings } from '@/lib/dispatch/haversine'

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(33.5731, -7.5898, 33.5731, -7.5898)).toBeCloseTo(0, 2)
  })

  it('Casablanca Maarif → Ain Diab ≈ 3.5 km straight-line', () => {
    // Maarif: 33.5890, -7.6315  |  Ain Diab: 33.5831, -7.6731
    const km = haversineKm(33.5890, -7.6315, 33.5831, -7.6731)
    expect(km).toBeGreaterThan(3)
    expect(km).toBeLessThan(5)
  })
})

describe('dispatchDistance', () => {
  it('applies 1.10 margin to haversine result', () => {
    const raw = haversineKm(33.5890, -7.6315, 33.5831, -7.6731)
    expect(dispatchDistance(33.5890, -7.6315, 33.5831, -7.6731)).toBeCloseTo(raw * 1.10, 3)
  })
})

describe('driverEarnings', () => {
  it('base_fee + per_km_rate × distance', () => {
    expect(driverEarnings(10, 3, 5)).toBeCloseTo(25, 2)
  })

  it('zero distance returns base fee', () => {
    expect(driverEarnings(10, 3, 0)).toBeCloseTo(10, 2)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd "C:/Users/benmansour mohamed/Documents/plaza-platform"
npx jest tests/unit/haversine.test.ts --no-coverage 2>&1 | head -20
```

Expected: FAIL — `Cannot find module '@/lib/dispatch/haversine'`

- [ ] **Step 3: Implement `lib/dispatch/haversine.ts`**

Create `lib/dispatch/haversine.ts`:

```typescript
const R = 6371 // Earth radius in km

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Straight-line distance between two lat/lng points in km.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

/**
 * Dispatch distance = haversine × 1.10 margin. Used everywhere in the engine.
 * The 10% margin accounts for road routing vs straight-line distance.
 */
export function dispatchDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  return haversineKm(lat1, lng1, lat2, lng2) * 1.10
}

/**
 * Driver earnings for a delivery.
 * Earnings formula: base_fee_mad + per_km_rate_mad × distance_km
 */
export function driverEarnings(
  baseFee: number,
  perKmRate: number,
  distanceKm: number,
): number {
  return baseFee + perKmRate * distanceKm
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest tests/unit/haversine.test.ts --no-coverage
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/dispatch/haversine.ts tests/unit/haversine.test.ts
git commit -m "feat(PLZ-058): Haversine distance + earnings utility with unit tests"
```

---

## Task 4 — Dispatch Types

**Files:**
- Create: `lib/dispatch/types.ts`

- [ ] **Step 1: Create the types file**

Create `lib/dispatch/types.ts`:

```typescript
/**
 * lib/dispatch/types.ts
 * Shared types for the Plaza dispatch engine.
 */

export type DispatchConfig = {
  id:                   string
  base_fee_mad:         number
  per_km_rate_mad:      number
  pool_timeout_minutes: number
}

/** A delivery visible in the driver's pool (before acceptance). */
export type PoolDelivery = {
  id:                     string
  pickup_city:            string
  distance_km:            number
  estimated_duration_min: number
  driver_earnings_mad:    number
  pool_created_at:        string
  pool_expires_at:        string
}

export type AcceptDeliveryResult =
  | { accepted: true;  deliveryId: string }
  | { accepted: false; reason: 'already_taken' | 'not_available' }

export type DispatchResult =
  | { success: true;  deliveryId: string }
  | { success: false; error: string }
```

- [ ] **Step 2: Run type-check**

```bash
npx tsc --noEmit
```

Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add lib/dispatch/types.ts
git commit -m "feat(PLZ-058): dispatch engine shared types"
```

---

## Task 5 — createDispatchDelivery Server Action

**Files:**
- Create: `lib/dispatch/createDispatchDelivery.ts`

- [ ] **Step 1: Create the server action**

Create `lib/dispatch/createDispatchDelivery.ts`:

```typescript
'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { dispatchDistance, driverEarnings } from '@/lib/dispatch/haversine'
import type { DispatchConfig, DispatchResult } from '@/lib/dispatch/types'

/**
 * Called immediately after confirmOrderAction succeeds.
 * Creates a delivery record in the pool (status='available').
 *
 * On any failure, writes to dispatch_errors and returns { success: false }.
 * Order confirmation is NOT rolled back — merchant is unblocked regardless.
 */
export async function createDispatchDelivery(orderId: string): Promise<DispatchResult> {
  const service = createServiceClient()

  try {
    // ── 1. Fetch order + merchant + customer ──────────────────
    const { data: order, error: orderErr } = await service
      .from('orders')
      .select(`
        id,
        merchant_pickup_code,
        merchants (
          city,
          location_lat,
          location_lng
        ),
        customers (
          location_lat,
          location_lng
        )
      `)
      .eq('id', orderId)
      .single<{
        id: string
        merchant_pickup_code: string | null
        merchants: { city: string | null; location_lat: number | null; location_lng: number | null }
        customers: { location_lat: number | null; location_lng: number | null } | null
      }>()

    if (orderErr || !order) throw new Error(`Order fetch failed: ${orderErr?.message ?? 'not found'}`)

    const merchant = order.merchants
    const customer = order.customers

    if (!merchant.location_lat || !merchant.location_lng) {
      throw new Error('Merchant location coordinates missing — cannot dispatch')
    }
    if (!customer?.location_lat || !customer?.location_lng) {
      throw new Error('Customer location coordinates missing — cannot dispatch')
    }
    if (!merchant.city) {
      throw new Error('Merchant city missing — cannot match drivers')
    }

    // ── 2. Distance + duration ────────────────────────────────
    const distanceKm = dispatchDistance(
      merchant.location_lat, merchant.location_lng,
      customer.location_lat, customer.location_lng,
    )
    const estimatedDurationMin = Math.ceil(distanceKm / 0.5) // ~30 km/h

    // ── 3. Fetch dispatch config ──────────────────────────────
    const { data: config, error: configErr } = await service
      .from('dispatch_config')
      .select('id, base_fee_mad, per_km_rate_mad, pool_timeout_minutes')
      .single<DispatchConfig>()

    if (configErr || !config) throw new Error(`dispatch_config fetch failed: ${configErr?.message ?? 'missing'}`)

    // ── 4. Earnings + pool window ─────────────────────────────
    const driverEarningsMad = driverEarnings(config.base_fee_mad, config.per_km_rate_mad, distanceKm)
    const poolCreatedAt = new Date()
    const poolExpiresAt = new Date(poolCreatedAt.getTime() + config.pool_timeout_minutes * 60_000)

    // ── 5. Insert delivery into pool ──────────────────────────
    const { data: delivery, error: insertErr } = await service
      .from('deliveries')
      .insert({
        order_id:               orderId,
        status:                 'available',
        pickup_city:            merchant.city,
        distance_km:            Math.round(distanceKm * 100) / 100,
        estimated_duration_min: estimatedDurationMin,
        driver_earnings_mad:    Math.round(driverEarningsMad * 100) / 100,
        merchant_pickup_code:   order.merchant_pickup_code,
        pool_created_at:        poolCreatedAt.toISOString(),
        pool_expires_at:        poolExpiresAt.toISOString(),
      })
      .select('id')
      .single<{ id: string }>()

    if (insertErr || !delivery) throw new Error(`Delivery insert failed: ${insertErr?.message ?? 'no data'}`)

    return { success: true, deliveryId: delivery.id }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    // Write to audit log — visible in Supabase Studio
    await service
      .from('dispatch_errors')
      .insert({ order_id: orderId, error_message: message })
      .then() // fire-and-forget; don't throw if this also fails

    console.error('[createDispatchDelivery]', message)
    return { success: false, error: message }
  }
}
```

- [ ] **Step 2: Run type-check**

```bash
npx tsc --noEmit
```

Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add lib/dispatch/createDispatchDelivery.ts
git commit -m "feat(PLZ-058): createDispatchDelivery server action — pool creation + dispatch_errors audit log"
```

---

## Task 6 — Wire Dispatch into confirmOrderAction

**Files:**
- Modify: `app/dashboard/commandes/actions.ts`

- [ ] **Step 1: Read the file**

```bash
grep -n "confirmOrder\|export async" "app/dashboard/commandes/actions.ts" | head -20
```

Note the line number where the function ends and where `status: 'confirmed'` is set.

- [ ] **Step 2: Add the dispatch call**

Find the `confirmOrderAction` function. After the line that sets order status to `'confirmed'` and before the final `return { success: true }`, add:

```typescript
import { createDispatchDelivery } from '@/lib/dispatch/createDispatchDelivery'

// Inside confirmOrderAction, after order is set to 'confirmed':
const dispatchResult = await createDispatchDelivery(orderId)
if (!dispatchResult.success) {
  // Order is confirmed — merchant is unblocked. Log dispatch failure only.
  console.error('[confirmOrderAction] dispatch failed:', dispatchResult.error)
}
```

- [ ] **Step 3: Run type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/commandes/actions.ts
git commit -m "feat(PLZ-058): wire createDispatchDelivery into confirmOrderAction"
```

---

## Task 7 — Pool Queries + Accept Function in lib/db/driver.ts

**Files:**
- Modify: `lib/db/driver.ts`

- [ ] **Step 1: Read current lib/db/driver.ts**

Note the existing `getActiveDeliveries` function — it currently filters `status IN ('assigned', 'picked_up')`.

- [ ] **Step 2: Update getActiveDeliveries status filter**

Find:
```typescript
.in('status', ['assigned', 'picked_up'] satisfies DeliveryStatus[])
```

Replace with:
```typescript
.in('status', ['accepted', 'picked_up'])
```

- [ ] **Step 3: Add getPoolDeliveries function**

After `getActiveDeliveries`, add:

```typescript
import type { PoolDelivery } from '@/lib/dispatch/types'

/**
 * Returns available pool deliveries for the driver's city.
 * Ordered oldest-first (fairest distribution).
 * Caller must verify driver is eligible (active, online, no current delivery).
 */
export async function getPoolDeliveries(city: string): Promise<PoolDelivery[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('deliveries')
    .select('id, pickup_city, distance_km, estimated_duration_min, driver_earnings_mad, pool_created_at, pool_expires_at')
    .eq('status', 'available')
    .eq('pickup_city', city)
    .gt('pool_expires_at', now)
    .order('pool_created_at', { ascending: true })
    .returns<PoolDelivery[]>()
  if (error) throw new Error(`getPoolDeliveries: ${error.message}`)
  return data ?? []
}
```

- [ ] **Step 4: Add acceptDelivery function**

After `getPoolDeliveries`, add:

```typescript
import type { AcceptDeliveryResult } from '@/lib/dispatch/types'

/**
 * Atomically claims an available delivery via the accept_delivery() Postgres function.
 * Returns { accepted: true } if this driver won the race.
 * Returns { accepted: false } if another driver was faster.
 */
export async function acceptDelivery(
  deliveryId: string,
  driverId: string,
): Promise<AcceptDeliveryResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('accept_delivery', {
      p_delivery_id: deliveryId,
      p_driver_id:   driverId,
    })

  if (error) throw new Error(`acceptDelivery RPC failed: ${error.message}`)

  return data === true
    ? { accepted: true,  deliveryId }
    : { accepted: false, reason: 'already_taken' }
}
```

- [ ] **Step 5: Update DriverDelivery type — rename collection_photo_url**

In the `DriverDelivery` type definition and `DELIVERY_SELECT` constant, find `collection_photo_url` and rename to `pickup_photo_url` everywhere in this file.

Also add `driver_earnings_mad` to `DriverDelivery` and `DELIVERY_SELECT`:

```typescript
// In DriverDelivery type:
pickup_photo_url:      string | null  // was collection_photo_url
driver_earnings_mad:   number | null  // new — used in historique earnings display
```

In `DELIVERY_SELECT`:
```typescript
id, status, pickup_photo_url, delivery_photo_url, cod_confirmed, pickup_time, delivered_at,
driver_earnings_mad,
orders ( ... )
```

- [ ] **Step 6: Run type-check**

```bash
npx tsc --noEmit
```

Expected: EXIT 0. Fix any TS errors from the rename before proceeding.

- [ ] **Step 7: Commit**

```bash
git add lib/db/driver.ts
git commit -m "feat(PLZ-058): add getPoolDeliveries + acceptDelivery to lib/db/driver.ts, fix status rename"
```

---

## Task 8 — Accept Delivery Server Action (Driver App)

**Files:**
- Create: `app/driver/livraisons/accept/actions.ts`

- [ ] **Step 1: Create the server action**

Create `app/driver/livraisons/accept/actions.ts`:

```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDriverProfile } from '@/lib/db/driver'
import { acceptDelivery } from '@/lib/db/driver'
import type { AcceptDeliveryResult } from '@/lib/dispatch/types'

export async function acceptDeliveryAction(
  deliveryId: string,
): Promise<AcceptDeliveryResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { accepted: false, reason: 'not_available' }

  const driver = await getDriverProfile(user.id)
  if (!driver || driver.onboarding_status !== 'active') {
    return { accepted: false, reason: 'not_available' }
  }

  const result = await acceptDelivery(deliveryId, driver.id)

  if (result.accepted) {
    redirect(`/driver/livraisons/${deliveryId}`)
  }

  return result
}
```

- [ ] **Step 2: Run type-check**

```bash
npx tsc --noEmit
```

Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add app/driver/livraisons/accept/actions.ts
git commit -m "feat(PLZ-058): acceptDeliveryAction server action"
```

---

## Task 9 — Pool Card Component

**Files:**
- Create: `app/driver/livraisons/_components/PoolCard.tsx`

- [ ] **Step 1: Create the component**

Create `app/driver/livraisons/_components/PoolCard.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { MapPin, Clock, Banknote, Loader2 } from 'lucide-react'
import { acceptDeliveryAction } from '@/app/driver/livraisons/accept/actions'
import type { PoolDelivery } from '@/lib/dispatch/types'

type Props = {
  delivery: PoolDelivery
}

export function PoolCard({ delivery }: Props) {
  const [loading, setLoading] = useState(false)
  const [taken, setTaken] = useState(false)

  const expiresAt = new Date(delivery.pool_expires_at)
  const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60_000))

  async function handleAccept() {
    setLoading(true)
    const result = await acceptDeliveryAction(delivery.id)
    if (!result.accepted) {
      setTaken(true)
      setLoading(false)
    }
    // On success: server action redirects — no further client state needed
  }

  if (taken) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-400">
        Livraison déjà prise
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      {/* Zones */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-white px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400">Retrait</p>
          <p className="text-[13px] font-semibold text-gray-900">{delivery.pickup_city}</p>
        </div>
        <span className="text-gray-400">→</span>
        <div className="flex-1 rounded-lg bg-white px-3 py-2 text-center">
          <p className="text-[10px] text-gray-400">Livraison</p>
          <p className="text-[13px] font-semibold text-gray-900">{delivery.pickup_city}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 flex gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[12px] font-semibold text-gray-900">
            {delivery.distance_km.toFixed(1)} km
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[12px] font-semibold text-gray-900">
            ~{delivery.estimated_duration_min} min
          </span>
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white px-3 py-2">
          <Banknote className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[12px] font-semibold text-green-700">
            {delivery.driver_earnings_mad.toFixed(0)} MAD
          </span>
        </div>
      </div>

      {/* Expiry hint */}
      {minutesLeft <= 5 && (
        <p className="mb-2 text-center text-[11px] text-amber-600">
          Expire dans {minutesLeft} min
        </p>
      )}

      {/* Accept button */}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] font-semibold text-sm text-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accepter'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Run type-check**

```bash
npx tsc --noEmit
```

Expected: EXIT 0.

- [ ] **Step 3: Commit**

```bash
git add app/driver/livraisons/_components/PoolCard.tsx
git commit -m "feat(PLZ-058): PoolCard component — pool delivery card with accept button"
```

---

## Task 10 — Livraisons Page + Client (Pool Section + Realtime)

**Files:**
- Modify: `app/driver/livraisons/page.tsx`
- Modify: `app/driver/livraisons/_components/LivraisonsClient.tsx`

- [ ] **Step 1: Read both files**

Read `app/driver/livraisons/page.tsx` and `app/driver/livraisons/_components/LivraisonsClient.tsx` fully.

- [ ] **Step 2: Update livraisons/page.tsx — parallel fetch**

The server component should fetch pool deliveries + driver city alongside the active deliveries. Find where `getActiveDeliveries` is called and add a parallel call:

```typescript
import { getActiveDeliveries, getPoolDeliveries, getDriverProfile } from '@/lib/db/driver'

// Inside the page server component:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/driver/auth/phone')

const driver = await getDriverProfile(user.id)
if (!driver) redirect('/driver/auth/phone')

// Parallel fetch: pool + active deliveries
const [poolDeliveries, activeDeliveries] = await Promise.all([
  driver.city && driver.is_available && driver.onboarding_status === 'active'
    ? getPoolDeliveries(driver.city)
    : Promise.resolve([]),
  getActiveDeliveries(driver.id),
])
```

Pass `poolDeliveries`, `activeDeliveries`, and `driverId: driver.id` to `LivraisonsClient`.

- [ ] **Step 3: Update LivraisonsClient — add pool section + Realtime**

Add pool section above the active delivery section. Add a Realtime subscription that refreshes the pool when deliveries change. The component receives `initialPool: PoolDelivery[]` and `driverCity: string` as props.

Key additions:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { PoolCard } from './PoolCard'
import type { PoolDelivery } from '@/lib/dispatch/types'

// Inside LivraisonsClient:
const [pool, setPool] = useState<PoolDelivery[]>(initialPool)
const hasActiveDelivery = activeDeliveries.some(
  d => d.status === 'accepted' || d.status === 'picked_up'
)

useEffect(() => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const channel = supabase
    .channel(`deliveries:pool:${driverCity}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deliveries',
        filter: `pickup_city=eq.${driverCity}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.status === 'available') {
          setPool(prev => {
            const exists = prev.some(d => d.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new as PoolDelivery].sort(
              (a, b) => new Date(a.pool_created_at).getTime() - new Date(b.pool_created_at).getTime()
            )
          })
        }
        if (payload.eventType === 'UPDATE' && payload.new.status !== 'available') {
          setPool(prev => prev.filter(d => d.id !== payload.new.id))
        }
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [driverCity])
```

Pool section in the render (only shown when no active delivery):
```tsx
{!hasActiveDelivery && pool.length > 0 && (
  <section className="mb-4">
    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
      Dans votre zone
    </p>
    <div className="flex flex-col gap-3">
      {pool.map(d => <PoolCard key={d.id} delivery={d} />)}
    </div>
  </section>
)}
{!hasActiveDelivery && pool.length === 0 && (
  <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
    Aucune livraison disponible pour le moment
  </div>
)}
```

- [ ] **Step 4: Run type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 5: Commit**

```bash
git add app/driver/livraisons/page.tsx app/driver/livraisons/_components/LivraisonsClient.tsx
git commit -m "feat(PLZ-058): livraisons page — pool section + Realtime subscription"
```

---

## Task 11 — Working Hours Screen

**Files:**
- Create: `app/driver/profil/horaires/page.tsx`
- Create: `app/driver/profil/horaires/actions.ts`
- Modify: `app/driver/profil/page.tsx`
- Modify: `middleware.ts`

- [ ] **Step 1: Add /driver/profil/horaires to middleware PROTECTED_PREFIXES**

In `middleware.ts`, find the `PROTECTED_PREFIXES` array and add `'/driver/profil/horaires'` if it is not already covered by a `/driver/profil` prefix.

Verify the existing prefix list covers `/driver/profil` broadly. If it does, no change needed.

- [ ] **Step 2: Create the save schedule server action**

Create `app/driver/profil/horaires/actions.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getDriverProfile } from '@/lib/db/driver'

type DaySchedule = {
  day_of_week: number  // 0=Monday, 6=Sunday
  is_active:   boolean
  start_time:  string  // "HH:MM"
  end_time:    string  // "HH:MM"
}

export async function saveScheduleAction(
  schedule: DaySchedule[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const driver = await getDriverProfile(user.id)
  if (!driver) return { success: false, error: 'Driver not found' }

  // Upsert all 7 rows atomically
  const rows = schedule.map(day => ({
    driver_id:   driver.id,
    day_of_week: day.day_of_week,
    is_active:   day.is_active,
    start_time:  day.start_time + ':00',  // Postgres time format HH:MM:SS
    end_time:    day.end_time   + ':00',
  }))

  const { error } = await supabase
    .from('driver_schedules')
    .upsert(rows, { onConflict: 'driver_id,day_of_week' })

  if (error) return { success: false, error: error.message }

  revalidatePath('/driver/profil/horaires')
  return { success: true }
}

export async function getScheduleAction(): Promise<DaySchedule[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return defaultSchedule()

  const driver = await getDriverProfile(user.id)
  if (!driver) return defaultSchedule()

  const { data } = await supabase
    .from('driver_schedules')
    .select('day_of_week, is_active, start_time, end_time')
    .eq('driver_id', driver.id)
    .order('day_of_week')

  if (!data || data.length === 0) return defaultSchedule()

  return data.map(row => ({
    day_of_week: row.day_of_week,
    is_active:   row.is_active,
    start_time:  row.start_time.slice(0, 5),  // "HH:MM:SS" → "HH:MM"
    end_time:    row.end_time.slice(0, 5),
  }))
}

function defaultSchedule(): DaySchedule[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i,
    is_active:   false,
    start_time:  '08:00',
    end_time:    '18:00',
  }))
}
```

- [ ] **Step 3: Create the horaires page**

Create `app/driver/profil/horaires/page.tsx`:

```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveScheduleAction, getScheduleAction } from './actions'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

type DaySchedule = {
  day_of_week: number
  is_active:   boolean
  start_time:  string
  end_time:    string
}

export default function HorairesPage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      is_active:   false,
      start_time:  '08:00',
      end_time:    '18:00',
    }))
  )
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getScheduleAction().then(setSchedule)
  }, [])

  function updateDay(index: number, patch: Partial<DaySchedule>) {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, ...patch } : d))
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await saveScheduleAction(schedule)
      setSaved(true)
    })
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[var(--color-primary)] px-4 py-3">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[15px] font-bold text-white">Mes horaires</h1>
      </div>

      <div className="px-4 pt-4">
        <p className="mb-4 text-[13px] text-gray-500">
          Définissez vos jours et heures de travail. Vous apparaissez dans le pool uniquement pendant vos créneaux actifs.
        </p>

        <div className="flex flex-col gap-2">
          {schedule.map((day, i) => (
            <div
              key={day.day_of_week}
              className={`rounded-xl border px-4 py-3 ${day.is_active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                {/* Day label */}
                <span className="w-8 text-[13px] font-semibold text-gray-900">
                  {DAY_LABELS[i]}
                </span>

                {/* Toggle */}
                <button
                  onClick={() => updateDay(i, { is_active: !day.is_active })}
                  className={`relative h-5 w-9 rounded-full transition-colors ${day.is_active ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${day.is_active ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>

                {/* Time inputs — only when active */}
                {day.is_active ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="time"
                      value={day.start_time}
                      onChange={e => updateDay(i, { start_time: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-[13px] text-gray-900"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      type="time"
                      value={day.end_time}
                      onChange={e => updateDay(i, { end_time: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-[13px] text-gray-900"
                    />
                  </div>
                ) : (
                  <span className="flex-1 text-[13px] text-gray-400">Jour de repos</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="mt-6 flex h-13 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] font-semibold text-white disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add horaires link to profil page**

In `app/driver/profil/page.tsx`, find the settings/menu rows section and add "Mes horaires" as a row:

```tsx
import { Calendar } from 'lucide-react'

// In the menu list, add before or alongside existing items:
{ Icon: Calendar, label: 'Mes horaires', color: 'var(--color-primary)', href: '/driver/profil/horaires' },
```

- [ ] **Step 5: Run type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 6: Commit**

```bash
git add app/driver/profil/horaires/page.tsx app/driver/profil/horaires/actions.ts \
        app/driver/profil/page.tsx middleware.ts
git commit -m "feat(PLZ-058): working hours screen — driver weekly schedule editor"
```

---

## Task 12 — Seed driver_schedules on PIN Setup

**Files:**
- Modify: `app/driver/auth/pin-setup/actions.ts`

- [ ] **Step 1: Read the current pin-setup actions file**

Note where `completeDriverPinSetupAction` returns or redirects.

- [ ] **Step 2: Add schedule seed after PIN setup succeeds**

After the driver record is created/updated and before redirecting, add:

```typescript
import { createServiceClient } from '@/lib/supabase/service'

// After successful PIN setup, seed 7 inactive schedule rows:
const service = createServiceClient()
const { data: driverRow } = await service
  .from('drivers')
  .select('id')
  .eq('user_id', user.id)
  .single<{ id: string }>()

if (driverRow) {
  const scheduleRows = Array.from({ length: 7 }, (_, i) => ({
    driver_id:   driverRow.id,
    day_of_week: i,
    is_active:   false,
    start_time:  '08:00:00',
    end_time:    '18:00:00',
  }))
  await service
    .from('driver_schedules')
    .upsert(scheduleRows, { onConflict: 'driver_id,day_of_week', ignoreDuplicates: true })
    // ignoreDuplicates: returning drivers who set up a new PIN won't lose existing schedule
}
```

- [ ] **Step 3: Run type-check**

```bash
npx tsc --noEmit
```

Expected: EXIT 0.

- [ ] **Step 4: Commit**

```bash
git add app/driver/auth/pin-setup/actions.ts
git commit -m "feat(PLZ-058): seed driver_schedules on PIN setup"
```

---

## Task 13 — Merchant Dashboard: Delivery Status Card

**Files:**
- Modify: `app/dashboard/commandes/OrderDetailSheet.tsx` (or equivalent file — read first)

- [ ] **Step 1: Read the order detail file**

```bash
ls app/dashboard/commandes/
```

Identify the order detail component file name (may be `OrderDetailSheet.tsx`, `OrderDetailDrawer.tsx`, or similar).

- [ ] **Step 2: Add delivery status query**

In the server-side data fetch for the order detail, add a query for the associated delivery:

```typescript
// After fetching the order, also fetch its delivery:
const { data: delivery } = await supabase
  .from('deliveries')
  .select('id, status, pool_expires_at, accepted_at')
  .eq('order_id', order.id)
  .maybeSingle<{
    id: string
    status: string
    pool_expires_at: string | null
    accepted_at: string | null
  }>()
```

- [ ] **Step 3: Add the Livraison card to the detail view**

Add below the order summary section:

```tsx
{delivery && (
  <div className="border-t border-gray-100 px-4 py-4">
    <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">
      Livraison
    </p>
    <DeliveryStatusBadge status={delivery.status} expiresAt={delivery.pool_expires_at} />
  </div>
)}
```

Create the `DeliveryStatusBadge` inline or as a small sub-component in the same file:

```tsx
function DeliveryStatusBadge({
  status,
  expiresAt,
}: {
  status: string
  expiresAt: string | null
}) {
  const configs: Record<string, { dot: string; text: string; bg: string; border: string }> = {
    available:  { dot: 'bg-blue-500 animate-pulse', text: 'Recherche d\'un livreur', bg: 'bg-blue-50', border: 'border-blue-200' },
    accepted:   { dot: 'bg-green-500', text: 'Livreur en route — récupération', bg: 'bg-green-50', border: 'border-green-200' },
    picked_up:  { dot: 'bg-green-500', text: 'En livraison — chez le client', bg: 'bg-green-50', border: 'border-green-200' },
    delivered:  { dot: 'bg-green-500', text: 'Livré ✓', bg: 'bg-green-50', border: 'border-green-200' },
    timed_out:  { dot: 'bg-red-500', text: 'Non assignée — en attente admin', bg: 'bg-red-50', border: 'border-red-200' },
    failed:     { dot: 'bg-red-500', text: 'Incident signalé', bg: 'bg-red-50', border: 'border-red-200' },
    cancelled:  { dot: 'bg-gray-400', text: 'Annulée', bg: 'bg-gray-50', border: 'border-gray-200' },
  }
  const c = configs[status] ?? configs.available

  const minutesLeft = expiresAt && status === 'available'
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60_000))
    : null

  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${c.dot}`} />
      <div>
        <p className="text-[13px] font-semibold text-gray-900">{c.text}</p>
        {minutesLeft !== null && (
          <p className="text-[11px] text-gray-500">Expire dans {minutesLeft} min</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/commandes/
git commit -m "feat(PLZ-058): add Livraison status card to merchant order detail"
```

---

## Task 14 — Merchant Dashboard: Timed-Out Badge in Order List

**Files:**
- Modify: `app/dashboard/commandes/OrdersClient.tsx`

- [ ] **Step 1: Read the current OrdersClient**

Identify where order cards are rendered and what data is available per order.

- [ ] **Step 2: Fetch delivery statuses alongside orders**

In the server data fetch that populates `OrdersClient`, extend the orders query to include the delivery status:

```typescript
// Extend orders select to include delivery status:
.select(`
  ...,
  deliveries ( status )
`)
```

The delivery status array will be at `order.deliveries[0]?.status`.

- [ ] **Step 3: Add the timed_out badge to order cards**

In the order card render, after the existing status badge:

```tsx
{order.deliveries?.[0]?.status === 'timed_out' && (
  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
    Livraison non assignée
  </span>
)}
```

- [ ] **Step 4: Run type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/commandes/OrdersClient.tsx
git commit -m "feat(PLZ-058): add timed_out badge to merchant order list"
```

---

## Task 15 — Fix Historique Earnings (remove stub, use real field)

**Files:**
- Modify: `app/driver/historique/page.tsx`

- [ ] **Step 1: Read current historique page**

Find where earnings are displayed. Currently uses `Math.round(row.orders.total * 0.08)` as a stub.

- [ ] **Step 2: Update the earnings display**

Update the query and display to use `driver_earnings_mad` from the delivery record:

```typescript
// In the query, add driver_earnings_mad to the select:
.select(`
  id, delivered_at, driver_earnings_mad,
  orders (
    order_number, payment_method, delivery_slot,
    customers ( full_name, city )
  )
`)

// In the mapping, use:
earnings: row.driver_earnings_mad ?? 0,
```

- [ ] **Step 3: Run type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 4: Commit**

```bash
git add app/driver/historique/page.tsx
git commit -m "feat(PLZ-058): use driver_earnings_mad for historique earnings display"
```

---

## Task 16 — Full Build Verification + PR

**Files:** none new

- [ ] **Step 1: Full type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: EXIT 0 both.

- [ ] **Step 2: Run unit tests**

```bash
npx jest tests/unit/ --no-coverage
```

Expected: all pass.

- [ ] **Step 3: Start dev server and verify**

```bash
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npm run dev
```

Manual checks:
1. Merchant order detail → "Livraison" section visible after confirming an order
2. `/driver/livraisons` → pool section shows if driver is active + online + no active delivery
3. `/driver/profil/horaires` → weekly schedule editor loads and saves
4. Accept a pool delivery → redirects to delivery detail; same delivery disappears from another driver's pool
5. Timed-out delivery → amber badge visible in merchant order list

- [ ] **Step 4: Open PR**

```bash
git push origin feat/PLZ-058-dispatch-engine
gh pr create \
  --title "feat(PLZ-058): Smart dispatch engine — pool model, driver schedules, real-time assignment" \
  --body "$(cat <<'EOF'
## Summary
- DB migration: dispatch_config, driver_schedules, dispatch_errors, new delivery columns, accept_delivery() function, pg_cron timeout
- createDispatchDelivery server action: Haversine × 1.10, earnings formula, pool creation, dispatch_errors audit log
- Driver app: pool section on livraisons with Realtime, PoolCard component, working hours screen
- Merchant dashboard: Livraison status card on order detail, timed_out badge on order list
- PLZ-057 cleanup: assigned→accepted rename, collection_photo_url→pickup_photo_url

## Test plan
- [ ] tsc + lint: EXIT 0
- [ ] Unit tests (haversine + earnings): PASS
- [ ] Anas 6-phase QA: P0=0, P1=0
- [ ] Confirm order → delivery enters pool → driver sees it in real-time
- [ ] Two drivers race acceptance → atomic SQL, one wins
- [ ] Pool expires → status timed_out → merchant sees badge
- [ ] Driver sets working hours → saved to driver_schedules

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Tag Anas for review**

Post a comment on the PR: "Anas — PLZ-058 ready for 6-phase QA. Note: pg_cron schedule must be applied manually via Supabase Dashboard (Extensions → pg_cron) before Phase 5 testing. Migration SQL is in the file but the cron.schedule() call requires pg_cron to be enabled first."

---

## Self-Review Notes

**Spec coverage check:**
- ✅ dispatch_config table → Task 1
- ✅ driver_schedules table → Task 1
- ✅ dispatch_errors table → Task 1
- ✅ drivers.city column → Task 1
- ✅ deliveries new columns → Task 1
- ✅ accept_delivery() function → Task 1
- ✅ pg_cron monitor → Task 1
- ✅ RLS policies → Task 1
- ✅ Haversine × 1.10 → Task 3
- ✅ driverEarnings formula → Task 3
- ✅ createDispatchDelivery → Task 5
- ✅ dispatch_errors write on failure → Task 5
- ✅ confirmOrderAction wired → Task 6
- ✅ getPoolDeliveries → Task 7
- ✅ acceptDelivery (RPC) → Task 7
- ✅ status rename assigned→accepted → Task 7
- ✅ pickup_photo_url rename → Task 7
- ✅ acceptDeliveryAction → Task 8
- ✅ PoolCard component → Task 9
- ✅ Livraisons pool section + Realtime → Task 10
- ✅ Working hours screen → Task 11
- ✅ Seed schedules on PIN setup → Task 12
- ✅ Merchant order detail status card → Task 13
- ✅ Merchant order list timed_out badge → Task 14
- ✅ Historique earnings from driver_earnings_mad → Task 15
- ✅ Full build verification + PR → Task 16

**Type consistency:**
- `PoolDelivery` defined in `lib/dispatch/types.ts` (Task 4), used in Task 7 (getPoolDeliveries), Task 9 (PoolCard), Task 10 (LivraisonsClient) — consistent
- `AcceptDeliveryResult` defined in types.ts, used in Task 7 (acceptDelivery) and Task 8 (acceptDeliveryAction) — consistent
- `DispatchConfig` defined in types.ts, used in Task 5 (createDispatchDelivery) — consistent
- `dispatchDistance` / `driverEarnings` defined in Task 3, used in Task 5 — consistent
