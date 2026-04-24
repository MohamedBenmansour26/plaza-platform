import {
  getDeliveryFee,
  FREE_DELIVERY_THRESHOLD,
  BASE_DELIVERY_FEE,
} from '@/app/store/[slug]/_lib/deliveryUtils'

describe('getDeliveryFee — unit normalization (PLZ-A2 regression)', () => {
  it('PLZ-1008 repro: subtotal 995 MAD, threshold 50 000 centimes → free', () => {
    // Exact production case: merchant "Boutique test" had
    // delivery_free_threshold = 50 000 centimes (500 MAD).
    // Customer subtotal was 995 MAD. Expected fee = 0.
    // Pre-fix (helper treated threshold as MAD) this returned 30 MAD.
    expect(getDeliveryFee(995, 50000)).toBe(0)
  })

  it('subtotal strictly above threshold → free', () => {
    expect(getDeliveryFee(600, 50000)).toBe(0)
  })

  it('subtotal strictly below threshold → base fee', () => {
    expect(getDeliveryFee(200, 50000)).toBe(BASE_DELIVERY_FEE)
  })

  it('subtotal equal to threshold → free (inclusive boundary)', () => {
    expect(getDeliveryFee(500, 50000)).toBe(0)
  })
})

describe('getDeliveryFee — missing/edge-case thresholds', () => {
  it('threshold undefined → falls back to platform default (500 MAD)', () => {
    expect(getDeliveryFee(499)).toBe(BASE_DELIVERY_FEE)
    expect(getDeliveryFee(500)).toBe(0)
    expect(getDeliveryFee(501)).toBe(0)
  })

  it('threshold null → falls back to platform default (500 MAD)', () => {
    expect(getDeliveryFee(499, null)).toBe(BASE_DELIVERY_FEE)
    expect(getDeliveryFee(500, null)).toBe(0)
  })

  it('threshold 0 → always free (merchant opted for no threshold)', () => {
    expect(getDeliveryFee(1, 0)).toBe(0)
    expect(getDeliveryFee(0, 0)).toBe(0)
  })

  it('merchant threshold higher than platform default (20 000 MAD)', () => {
    expect(getDeliveryFee(1000, 2_000_000)).toBe(BASE_DELIVERY_FEE)
    expect(getDeliveryFee(20_000, 2_000_000)).toBe(0)
  })

  it('merchant threshold lower than platform default (100 MAD)', () => {
    expect(getDeliveryFee(99, 10000)).toBe(BASE_DELIVERY_FEE)
    expect(getDeliveryFee(100, 10000)).toBe(0)
  })
})

describe('getDeliveryFee — exported constants stay MAD', () => {
  it('FREE_DELIVERY_THRESHOLD is 500 MAD', () => {
    expect(FREE_DELIVERY_THRESHOLD).toBe(500)
  })

  it('BASE_DELIVERY_FEE is 30 MAD', () => {
    expect(BASE_DELIVERY_FEE).toBe(30)
  })
})
