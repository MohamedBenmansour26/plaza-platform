'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Merchant,
  Product,
  Order,
  OrderItem,
  Customer,
  CustomerInsert,
  OrderInsert,
  OrderItemInsert,
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
  const supabase = await createClient();

  const customerPin = Math.floor(1000 + Math.random() * 9000);

  // 1. Insert customer
  const { data: customer, error: custError } = (await supabase
    .from('customers')
    .insert({
      full_name: payload.customerName,
      phone: payload.customerPhone,
      address: payload.customerAddress,
      city: payload.customerCity,
    } as never)
    .select('id')
    .single()) as { data: { id: string } | null; error: unknown };
  if (custError || !customer) throw new Error('Failed to create customer');

  // 2. Insert order (retry on order_number collision)
  let orderNumber = payload.orderNumber;
  let order: { id: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = (await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        merchant_id: payload.merchantId,
        customer_id: customer.id,
        payment_method: payload.paymentMethod,
        subtotal: payload.subtotal,
        delivery_fee: payload.deliveryFee,
        total: payload.total,
        notes: payload.notes,
        customer_pin: customerPin,
        delivery_date: payload.deliveryDate ?? null,
        delivery_slot: payload.deliverySlot ?? null,
      } as never)
      .select('id')
      .single()) as { data: { id: string } | null; error: unknown };
    if (!error && data) {
      order = data;
      break;
    }
    // regenerate on collision
    orderNumber = `PLZ-${Math.floor(Math.random() * 900 + 100)}`;
  }
  if (!order) throw new Error('Failed to create order');

  // 3. Insert order_items
  const orderItems = payload.items.map((item) => ({
    order_id: order!.id,
    product_id: item.productId || null,
    name_fr: item.nameFr,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems as never);
  if (itemsError) throw new Error('Failed to create order items');

  return { orderNumber, customerPin, orderId: order.id };
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<(Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:customers(*),
      order_items(*, products(name_fr, image_url, price))
    `,
    )
    .eq('order_number', orderNumber)
    .single();
  if (error || !data) return null;
  return data as Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] };
}

export async function getOrderById(
  id: string,
): Promise<(Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:customers(*),
      order_items(*, products(name_fr, image_url, price))
    `,
    )
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as Order & { customer: Customer; order_items: (OrderItem & { products: { name_fr: string; image_url: string | null; price: number } | null })[] };
}

// getSlugByOrderNumber lives in app/_actions/trackOrder.ts — import from there
