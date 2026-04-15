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
