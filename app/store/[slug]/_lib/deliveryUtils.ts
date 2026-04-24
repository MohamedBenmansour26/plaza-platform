export const FREE_DELIVERY_THRESHOLD = 500; // MAD — platform default when merchant has no override
export const BASE_DELIVERY_FEE = 30; // MAD

/**
 * Returns the delivery fee in MAD.
 *
 * @param subtotalMad    cart subtotal in MAD
 * @param thresholdCents merchant free-delivery threshold in centimes (raw DB value).
 *                       `null`/`undefined` falls back to FREE_DELIVERY_THRESHOLD (MAD).
 *
 * NOTE: the threshold column in `merchants.delivery_free_threshold` is stored in
 * centimes like all other monetary integers. This helper normalizes to MAD
 * internally so callers can pass the raw DB value without converting.
 * PLZ-A2 (2026-04-24): the previous signature treated both args as MAD, which
 * overcharged PLZ-1008 (995 MAD subtotal with a 500 MAD threshold stored as
 * 50 000 centimes → compared 995 >= 50000 → charged 30 MAD instead of 0).
 */
export function getDeliveryFee(
  subtotalMad: number,
  thresholdCents?: number | null,
): number {
  const thresholdMad =
    thresholdCents == null ? FREE_DELIVERY_THRESHOLD : thresholdCents / 100;
  return subtotalMad >= thresholdMad ? 0 : BASE_DELIVERY_FEE;
}

// SAAD-003: generateOrderNumber() removed — order numbers are now generated
// server-side by the Postgres order_number_seq sequence (PLZ-062 migration).
// Format: PLZ-NNNN (4+ digits, e.g. PLZ-1000, PLZ-1001 …)
