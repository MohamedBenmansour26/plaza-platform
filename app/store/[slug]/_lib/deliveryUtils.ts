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

export function generateOrderNumber(): string {
  return `PLZ-${Math.floor(Math.random() * 900 + 100)}`;
}
