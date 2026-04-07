/**
 * lib/db/orders.ts — Order query functions for the merchant dashboard.
 *
 * All functions use the server Supabase client (anon key + RLS).
 * RLS on the orders table ensures a merchant only sees their own orders.
 * Never pass the service role key here.
 */

import { createClient } from '@/lib/supabase/server';
import type { OrderStatus, DeliveryStatus, DeliveryType, PaymentMethod, PaymentStatus } from '@/types/supabase';

// ─── Domain types ──────────────────────────────────────────────────────────

export type OrderLineItem = {
  id: string;
  quantity: number;
  unit_price: number;
  product: {
    name_fr: string;
    name_ar: string;
    image_url: string | null;
  } | null;
};

export type OrderDelivery = {
  id: string;
  delivery_type: DeliveryType;
  fee: number;
  status: DeliveryStatus;
  created_at: string;
} | null;

export type OrderWithDetails = {
  id: string;
  merchant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  created_at: string;
  items: OrderLineItem[];
  delivery: OrderDelivery;
};

// ─── Status transition guard ────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered:  [],
  cancelled:  [],
};

function assertValidTransition(from: OrderStatus, to: OrderStatus): void {
  if (!VALID_TRANSITIONS[from].includes(to)) {
    throw new Error(
      `Invalid order status transition: ${from} → ${to}. ` +
      `Allowed: ${VALID_TRANSITIONS[from].join(', ') || 'none'}.`,
    );
  }
}

// ─── Raw Supabase row shape (from nested select) ────────────────────────────

type RawOrderRow = {
  id: string;
  merchant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    products: {
      name_fr: string;
      name_ar: string;
      image_url: string | null;
    } | null;
  }[];
  deliveries: {
    id: string;
    delivery_type: DeliveryType;
    fee: number;
    status: DeliveryStatus;
    created_at: string;
  } | null;
};

function normaliseOrder(row: RawOrderRow): OrderWithDetails {
  return {
    id: row.id,
    merchant_id: row.merchant_id,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone,
    customer_address: row.customer_address,
    total_amount: row.total_amount,
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    status: row.status,
    created_at: row.created_at,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      product: i.products ?? null,
    })),
    delivery: row.deliveries ?? null,
  };
}

const ORDER_SELECT = `
  id, merchant_id, customer_name, customer_phone,
  customer_address, total_amount, payment_method,
  payment_status, status, created_at,
  order_items (
    id, quantity, unit_price,
    products ( name_fr, name_ar, image_url )
  ),
  deliveries (
    id, delivery_type, fee, status, created_at
  )
` as const;

// ─── Query functions ────────────────────────────────────────────────────────

/**
 * Fetch all orders for a merchant, optionally filtered by status.
 * Results are sorted newest-first.
 */
export async function getOrders(
  merchantId: string,
  status?: OrderStatus,
): Promise<OrderWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.returns<RawOrderRow[]>();

  if (error) {
    throw new Error(`getOrders: ${error.message}`);
  }

  return (data ?? []).map(normaliseOrder);
}

/**
 * Fetch a single order with full detail.
 * Returns null if the order is not found or does not belong to the merchant.
 */
export async function getOrderById(
  orderId: string,
  merchantId: string,
): Promise<OrderWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .eq('merchant_id', merchantId)
    .maybeSingle<RawOrderRow>();

  if (error) {
    throw new Error(`getOrderById: ${error.message}`);
  }

  return data ? normaliseOrder(data) : null;
}

/**
 * Update an order's status.
 * Validates the transition before writing to prevent illegal state changes.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: 'confirmed' | 'dispatched' | 'delivered' | 'cancelled',
  merchantId: string,
): Promise<void> {
  const supabase = await createClient();

  // Read current status first (owns-check via RLS + explicit merchant_id filter)
  const { data: current, error: fetchErr } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .eq('merchant_id', merchantId)
    .maybeSingle<{ status: OrderStatus }>();

  if (fetchErr) throw new Error(`updateOrderStatus (fetch): ${fetchErr.message}`);
  if (!current) throw new Error(`Order ${orderId} not found or access denied.`);

  assertValidTransition(current.status, newStatus);

  // Supabase JS v2 + TS 5.x: .update() param type collapses to `never` with chained .eq().
  // Cast to `never` explicitly so TypeScript accepts the call without widening to `any`.
  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: newStatus } as never)
    .eq('id', orderId)
    .eq('merchant_id', merchantId);

  if (updateErr) throw new Error(`updateOrderStatus (write): ${updateErr.message}`);
}

/**
 * Fetch orders ready for delivery dispatch:
 * order.status = 'confirmed' AND delivery.status = 'pending'.
 */
export async function getDeliveryQueue(
  merchantId: string,
): Promise<OrderWithDetails[]> {
  const supabase = await createClient();

  // Supabase foreign-table filters work via embedded filters on the join
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('merchant_id', merchantId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: true })
    .returns<RawOrderRow[]>();

  if (error) throw new Error(`getDeliveryQueue: ${error.message}`);

  // Filter client-side for delivery.status = 'pending'
  // (Supabase JS doesn't support filtering by embedded relation columns directly)
  return (data ?? [])
    .map(normaliseOrder)
    .filter((o) => o.delivery === null || o.delivery.status === 'pending');
}

/**
 * Book a delivery for an order: set deliveries.status = 'dispatched'.
 *
 * NOTE: The current schema's DeliveryStatus enum does not include 'booked'.
 * Using 'dispatched' as the nearest equivalent.
 * Schema gap flagged in PR — requires a new migration to add 'booked' status
 * and a 'booked_at' timestamp if needed.
 */
export async function bookDelivery(
  orderId: string,
  merchantId: string,
): Promise<void> {
  const supabase = await createClient();

  // Verify the order belongs to the merchant
  const { data: delivery, error: fetchErr } = await supabase
    .from('deliveries')
    .select('id')
    .eq('order_id', orderId)
    .eq('merchant_id', merchantId)
    .maybeSingle<{ id: string }>();

  if (fetchErr) throw new Error(`bookDelivery (fetch): ${fetchErr.message}`);
  if (!delivery) throw new Error(`No delivery found for order ${orderId}.`);

  // Supabase JS v2 + TS 5.x: same .update() never regression — cast to `never`.
  const { error: updateErr } = await supabase
    .from('deliveries')
    .update({ status: 'dispatched' as DeliveryStatus } as never)
    .eq('id', delivery.id);

  if (updateErr) throw new Error(`bookDelivery (write): ${updateErr.message}`);
}
