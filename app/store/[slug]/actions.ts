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
  deliveryDate: string;
  deliveryTime: string;
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
): Promise<{ orderNumber: string }> {
  const supabase = await createClient();

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

  return { orderNumber };
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<(Order & { customer: Customer; order_items: OrderItem[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      customer:customers(*),
      order_items(*)
    `,
    )
    .eq('order_number', orderNumber)
    .single();
  if (error || !data) return null;
  return data as Order & { customer: Customer; order_items: OrderItem[] };
}

export async function getSlugByOrderNumber(
  orderNumber: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data: orderData } = (await supabase
    .from('orders')
    .select('merchant_id')
    .eq('order_number', orderNumber)
    .single()) as { data: { merchant_id: string } | null };
  if (!orderData) return null;
  const { data: merchant } = (await supabase
    .from('merchants')
    .select('store_slug')
    .eq('id', orderData.merchant_id)
    .single()) as { data: { store_slug: string } | null };
  return merchant?.store_slug ?? null;
}
