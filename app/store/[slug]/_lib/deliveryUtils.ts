export const FREE_DELIVERY_THRESHOLD = 500; // MAD
export const BASE_DELIVERY_FEE = 30; // MAD

/**
 * Returns the delivery fee in MAD.
 * @param subtotal - cart subtotal in MAD
 * @param threshold - free-delivery threshold in MAD (defaults to FREE_DELIVERY_THRESHOLD)
 */
export function getDeliveryFee(
  subtotal: number,
  threshold: number = FREE_DELIVERY_THRESHOLD,
): number {
  return subtotal >= threshold ? 0 : BASE_DELIVERY_FEE;
}

// SAAD-003: generateOrderNumber() removed — order numbers are now generated
// server-side by the Postgres order_number_seq sequence (PLZ-062 migration).
// Format: PLZ-NNNN (4+ digits, e.g. PLZ-1000, PLZ-1001 …)
