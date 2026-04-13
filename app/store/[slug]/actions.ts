'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Merchant,
  Product,
  Order,
  OrderItem,
  Customer,
  PaymentMethod,
} from '@/types/supabase';

// ---------------------------------------------------------------------------
// Payload type for createOrder (implemented by Hamza)
// ---------------------------------------------------------------------------

export type CreateOrderPayload = {
  orderNumber: string;
  merchantId: string;
  merchantSlug: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerCity: string | null;
  deliveryDate?: string | null;    // ISO date string YYYY-MM-DD
  deliverySlot?: string | null;    // "09:00-10:00"
  paymentMethod: PaymentMethod;
  notes: string | null;
  items: Array<{
    productId: string;
    nameFr: string;
    quantity: number;
    unitPrice: number; // in MAD
  }>;
  subtotal: number; // in MAD
  deliveryFee: number; // in MAD
  total: number; // in MAD
};

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

export async function getMerchantBySlug(
  slug: string,
): Promise<Merchant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('merchants')
    .select('*')
    .eq('store_slug', slug)
    .single<Merchant>();
  return data ?? null;
}

export async function getProductsByMerchant(
  merchantId: string,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .returns<Product[]>();
  return data ?? [];
}

export async function getProductById(
  id: string,
  merchantId: string,
): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', merchantId)
    .eq('is_visible', true)
    .single<Product>();
  return data ?? null;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<{ orderNumber: string; customerPin: number; orderId: string }> {
  if (payload.items.length === 0) {
    throw new Error('Panier vide');
  }
  const computedSubtotal = payload.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  if (computedSubtotal <= 0) {
    throw new Error('Total invalide');
  }

  const supabase = await createClient();

  // Stock pre-flight check — throws so the caller's existing catch block handles it
  for (const item of payload.items) {
    const { data: product } = await supabase
      .from('products')
      .select('stock, name_fr')
      .eq('id', item.productId)
      .maybeSingle<{ stock: number | null; name_fr: string }>();

    if (product && product.stock !== null && product.stock < item.quantity) {
      throw new Error(
        `Stock insuffisant: ${product.name_fr} (${product.stock} disponible, ${item.quantity} demandé)`,
      );
    }
  }

  const customerPin = Math.floor(1000 + Math.random() * 9000);

  // Pre-generate UUIDs server-side so we can avoid .select() after insert.
  // Anon users cannot SELECT from customers/orders (merchant-only SELECT policy),
  // so .insert().select('id').single() always fails with an RLS violation even
  // though the INSERT itself is permitted. By supplying the id up-front we skip
  // the post-insert SELECT entirely.
  const customerId = crypto.randomUUID();
  const orderId = crypto.randomUUID();

  // 1. Insert customer
  const { error: custError } = await supabase
    .from('customers')
    .insert({
      id: customerId,
      full_name: payload.customerName,
      phone: payload.customerPhone,
      address: payload.customerAddress,
      city: payload.customerCity,
    } as never);
  if (custError) {
    console.error('[createOrder] customer insert failed:', custError);
    throw new Error(`Customer insert failed: ${JSON.stringify(custError)}`);
  }

  // 2. Insert order (retry on order_number collision)
  // DB stores monetary values in centimes (integer); payload values are in MAD → multiply by 100
  // Each attempt pre-generates its own UUID so we never need .select() after insert.
  let orderNumber = payload.orderNumber;
  let finalOrderId = orderId;
  let orderInserted = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    finalOrderId = attempt === 0 ? orderId : crypto.randomUUID();
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: finalOrderId,
        order_number: orderNumber,
        merchant_id: payload.merchantId,
        customer_id: customerId,
        payment_method: payload.paymentMethod,
        subtotal: Math.round(payload.subtotal * 100),
        delivery_fee: Math.round(payload.deliveryFee * 100),
        total: Math.round(payload.total * 100),
        notes: payload.notes,
        customer_pin: customerPin,
        delivery_date: payload.deliveryDate ?? null,
        delivery_slot: payload.deliverySlot ?? null,
      } as never);
    if (!orderError) {
      orderInserted = true;
      break;
    }
    if (attempt === 2) {
      console.error('[createOrder] order insert failed after 3 attempts:', orderError);
      throw new Error(`Order insert failed: ${JSON.stringify(orderError)}`);
    }
    // regenerate on collision
    orderNumber = `PLZ-${Math.floor(Math.random() * 900 + 100)}`;
  }
  if (!orderInserted) throw new Error('Failed to create order');

  // 3. Insert order_items
  // unit_price in DB is centimes (integer); payload unitPrice is in MAD → multiply by 100
  const orderItems = payload.items.map((item) => ({
    order_id: finalOrderId,
    product_id: item.productId || null,
    name_fr: item.nameFr,
    quantity: item.quantity,
    unit_price: Math.round(item.unitPrice * 100),
  }));
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems as never);
  if (itemsError) {
    console.error('[createOrder] order_items insert failed:', itemsError);
    throw new Error(`Order items insert failed: ${itemsError.message}`);
  }

  return { orderNumber, customerPin, orderId: finalOrderId };
}

// ---------------------------------------------------------------------------
// Storefront order select — explicitly lists columns to prevent data leaks.
// Both functions gate on merchant_id to ensure cross-merchant isolation.
// ---------------------------------------------------------------------------

const STOREFRONT_ORDER_SELECT = `
  id, order_number, merchant_id, status, payment_method,
  subtotal, delivery_fee, total, notes, customer_pin,
  created_at, updated_at, delivery_date, delivery_slot,
  customer:customers(
    id, full_name, phone, address, city
  ),
  order_items(
    id, product_id, name_fr, quantity, unit_price,
    products(name_fr, image_url, price)
  )
` as const;

export async function getOrderByNumber(
  orderNumber: string,
  merchantId: string,
): Promise<(Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(STOREFRONT_ORDER_SELECT)
    .eq('order_number', orderNumber)
    .eq('merchant_id', merchantId)
    .single();
  if (error || !data) return null;
  return data as Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] };
}

export async function getOrderById(
  id: string,
  merchantId: string,
): Promise<(Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(STOREFRONT_ORDER_SELECT)
    .eq('id', id)
    .eq('merchant_id', merchantId)
    .single();
  if (error || !data) return null;
  return data as Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] };
}

// getSlugByOrderNumber lives in app/_actions/trackOrder.ts — import from there
