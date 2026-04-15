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
        merchant_pickup_code: number | null
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
        merchant_pickup_code:   order.merchant_pickup_code !== null
                                  ? String(order.merchant_pickup_code)
                                  : null,
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
