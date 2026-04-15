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
