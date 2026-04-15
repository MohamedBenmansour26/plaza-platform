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
 * Dispatch distance = haversine × 1.10 margin.
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
 * Formula: base_fee_mad + per_km_rate_mad × distance_km
 */
export function driverEarnings(
  baseFee: number,
  perKmRate: number,
  distanceKm: number,
): number {
  return baseFee + perKmRate * distanceKm
}
