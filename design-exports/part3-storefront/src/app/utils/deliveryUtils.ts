export const FREE_DELIVERY_THRESHOLD = 500;
export const BASE_DELIVERY_FEE = 30;

export function getDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE;
}

export function generateOrderNumber(): string {
  return `PLZ-${Math.floor(Math.random() * 900 + 100)}`;
}
