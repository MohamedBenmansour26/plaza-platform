/**
 * lib/db/orders.ts — Order query functions for the merchant dashboard.
 *
 * All functions use the server Supabase client (anon key + RLS).
 * RLS on the orders table ensures a merchant only sees their own orders.
 *
 * Live schema (07 Apr 2026):
 *   orders.customer_id → customers.id  (no inline customer_name/phone)
 *   orders.total       (was total_amount in PLZ-006)
 *   deliveries has no merchant_id — ownership verified via orders join
 */

import { createClient } from '@/lib/supabase/server';
import type { OrderStatus, DeliveryStatus } from '@/types/supabase';

// ─── Domain types ──────────────────────────────────────────────────────────

export type OrderCustomer = {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  city: string | null;
};

export type OrderLineItem = {
  id: string;
  name_fr: string;
  quantity: number;
  unit_price: number;
  /** Product image — null when product deleted or product_id was not set */
  image_url: string | null;
};

export type OrderDelivery = {
  id: string;
  status: DeliveryStatus;
  driver_id: string | null;
  pickup_time: string | null;
  delivered_at: string | null;
  created_at: string;
} | null;

export type OrderWithDetails = {
  id: string;
  order_number: string;
  merchant_id: string;
  customer: OrderCustomer | null;
  status: OrderStatus;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  plaza_commission: number | null;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
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

// ─── Raw Supabase row shape ─────────────────────────────────────────────────

type RawOrderRow = {
  id: string;
  order_number: string;
  merchant_id: string;
  status: OrderStatus;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  plaza_commission: number | null;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers: {
    id: string;
    full_name: string;
    phone: string;
    address: string | null;
    city: string | null;
  } | null;
  order_items: {
    id: string;
    name_fr: string;
    quantity: number;
    unit_price: number;
    products: { image_url: string | null } | null;
  }[];
  deliveries: {
    id: string;
    status: DeliveryStatus;
    driver_id: string | null;
    pickup_time: string | null;
    delivered_at: string | null;
    created_at: string;
  } | null;
};

function normaliseOrder(row: RawOrderRow): OrderWithDetails {
  return {
    id: row.id,
    order_number: row.order_number,
    merchant_id: row.merchant_id,
    customer: row.customers ?? null,
    status: row.status,
    payment_method: row.payment_method,
    subtotal: row.subtotal,
    delivery_fee: row.delivery_fee,
    plaza_commission: row.plaza_commission,
    total: row.total,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      name_fr: i.name_fr,
      quantity: i.quantity,
      unit_price: i.unit_price,
      image_url: i.products?.image_url ?? null,
    })),
    delivery: row.deliveries ?? null,
  };
}

const ORDER_SELECT = `
  id, order_number, merchant_id, status, payment_method,
  subtotal, delivery_fee, plaza_commission, total, notes,
  created_at, updated_at,
  customers ( id, full_name, phone, address, city ),
  order_items (
    id, name_fr, quantity, unit_price,
    products ( image_url )
  ),
  deliveries (
    id, status, driver_id, pickup_time, delivered_at, created_at
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
  if (error) throw new Error(`getOrders: ${error.message}`);

  return (data ?? []).map(normaliseOrder);
}

/**
 * Fetch a single order with full detail.
 * Returns null if not found or not owned by merchantId.
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

  if (error) throw new Error(`getOrderById: ${error.message}`);
  return data ? normaliseOrder(data) : null;
}

/**
 * Update an order's status.
 * Validates the transition before writing to prevent illegal state changes.
 *
 * PLZ-047: N+1 patterns eliminated —
 *   confirmed path: single IN query for stock check instead of one query per item.
 *   cancelled path: single IN query to read current stock, then one UPDATE per product.
 *   decrement_stock() RPC is called once (already was correct), not in a loop.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: 'confirmed' | 'dispatched' | 'delivered' | 'cancelled',
  merchantId: string,
): Promise<void> {
  const supabase = await createClient();

  const { data: current, error: fetchErr } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .eq('merchant_id', merchantId)
    .maybeSingle<{ status: OrderStatus }>();

  if (fetchErr) throw new Error(`updateOrderStatus (fetch): ${fetchErr.message}`);
  if (!current) throw new Error(`Order ${orderId} not found or access denied.`);

  assertValidTransition(current.status, newStatus);

  // ── Stock guardrail: validate + decrement on pending → confirmed ────────────
  if (newStatus === 'confirmed') {
    type OrderItemRow = { product_id: string | null; quantity: number; name_fr: string };
    type ProductStockRow = { id: string; stock: number | null; name_fr: string };

    // 1. Fetch all order items — single query
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity, name_fr')
      .eq('order_id', orderId)
      .returns<OrderItemRow[]>();

    if (itemsError || !orderItems) throw new Error('Failed to fetch order items');

    // 2. Collect product IDs needing stock validation (skip custom items)
    const linkedItems = orderItems.filter(
      (i): i is OrderItemRow & { product_id: string } => i.product_id !== null,
    );

    if (linkedItems.length > 0) {
      // PLZ-047: single bulk IN query — eliminates N+1
      const productIds = linkedItems.map((i) => i.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock, name_fr')
        .in('id', productIds)
        .returns<ProductStockRow[]>();

      if (productsError || !products) throw new Error('Failed to fetch products for stock check');

      // Validate in-memory against fetched rows
      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of linkedItems) {
        const product = productMap.get(item.product_id);
        if (!product) throw new Error(`Product not found: ${item.product_id}`);
        if (product.stock !== null && product.stock < item.quantity) {
          throw new Error(
            `Stock insuffisant pour "${product.name_fr}": ${product.stock} en stock, ${item.quantity} demandé(s)`,
          );
        }
      }
    }

    // 3. All checks passed — decrement stock atomically via RPC (called once, not per item)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: decrementError } = await (supabase as any)
      .rpc('decrement_stock', { order_id: orderId });

    if (decrementError) {
      throw new Error(`Stock insuffisant pour certains produits`);
    }
  }

  // ── Stock restore: return stock to products when cancelling a confirmed order ─
  if (newStatus === 'cancelled' && current.status === 'confirmed') {
    type OrderItemStockRow = { product_id: string | null; quantity: number };
    type ProductStockOnly = { id: string; stock: number | null };

    // 1. Fetch all order items — single query
    const { data: orderItems, error: cancelItemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)
      .returns<OrderItemStockRow[]>();

    if (cancelItemsError) throw new Error(`updateOrderStatus (cancel items fetch): ${cancelItemsError.message}`);

    if (orderItems && orderItems.length > 0) {
      const linkedItems = orderItems.filter(
        (i): i is OrderItemStockRow & { product_id: string } => i.product_id !== null,
      );

      if (linkedItems.length > 0) {
        // PLZ-047: single IN query to read current stock values — eliminates N+1 reads
        const productIds = linkedItems.map((i) => i.product_id);
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, stock')
          .in('id', productIds)
          .returns<ProductStockOnly[]>();

        if (productsError) throw new Error(`updateOrderStatus (cancel stock fetch): ${productsError.message}`);

        if (products) {
          const productMap = new Map(products.map((p) => [p.id, p]));

          // One UPDATE per product — Supabase JS v2 lacks multi-row UPDATE with per-row
          // values, so this is irreducible. O(distinct_products), not O(order_items).
          for (const item of linkedItems) {
            const product = productMap.get(item.product_id);
            if (product?.stock !== null && product?.stock !== undefined) {
              const { error: restoreErr } = await supabase
                .from('products')
                .update({ stock: product.stock + item.quantity } as never)
                .eq('id', item.product_id);
              if (restoreErr) throw new Error(`updateOrderStatus (stock restore): ${restoreErr.message}`);
            }
          }
        }
      }
    }
  }

  // Supabase JS v2: .update() param collapses to `never` with chained .eq() — known SDK regression.
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

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('merchant_id', merchantId)
    .eq('status', 'confirmed' satisfies OrderStatus)
    .order('created_at', { ascending: true })
    .returns<RawOrderRow[]>();

  if (error) throw new Error(`getDeliveryQueue: ${error.message}`);

  // Filter client-side — Supabase JS can't filter by embedded relation columns directly
  return (data ?? [])
    .map(normaliseOrder)
    .filter((o) => o.delivery === null || o.delivery.status === 'pending');
}

/**
 * Book a delivery for an order: set deliveries.status = 'assigned'.
 * Ownership is verified via the orders join (deliveries has no merchant_id).
 */
export async function bookDelivery(
  orderId: string,
  merchantId: string,
): Promise<void> {
  const supabase = await createClient();

  // Verify order belongs to merchant, get delivery id via join
  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, deliveries ( id )')
    .eq('id', orderId)
    .eq('merchant_id', merchantId)
    .maybeSingle<{ id: string; deliveries: { id: string } | null }>();

  if (fetchErr) throw new Error(`bookDelivery (fetch): ${fetchErr.message}`);
  if (!order) throw new Error(`Order ${orderId} not found or access denied.`);
  if (!order.deliveries) throw new Error(`No delivery record for order ${orderId}.`);

  // Supabase JS v2: same .update() never regression.
  const { error: updateErr } = await supabase
    .from('deliveries')
    .update({ status: 'assigned' as DeliveryStatus } as never)
    .eq('id', order.deliveries.id);

  if (updateErr) throw new Error(`bookDelivery (write): ${updateErr.message}`);
}
