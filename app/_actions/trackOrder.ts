'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * PLZ-047: Added explicit error handling to all Supabase calls.
 * PGRST116 (no rows) is treated as null return, not an error.
 */
export async function getSlugByOrderNumber(
  orderNumber: string,
): Promise<{ slug: string; orderId: string } | null> {
  const supabase = await createClient();

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id, merchant_id')
    .eq('order_number', orderNumber)
    .returns<{ id: string; merchant_id: string }[]>()
    .single();

  if (orderError) {
    // PGRST116 = no rows found — not an error for a lookup
    if (orderError.code === 'PGRST116') return null;
    throw new Error(`getSlugByOrderNumber (order lookup): ${orderError.message}`);
  }
  if (!orderData) return null;

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('store_slug')
    .eq('id', orderData.merchant_id)
    .returns<{ store_slug: string }[]>()
    .single();

  if (merchantError) {
    if (merchantError.code === 'PGRST116') return null;
    throw new Error(`getSlugByOrderNumber (merchant lookup): ${merchantError.message}`);
  }
  if (!merchant?.store_slug) return null;

  return { slug: merchant.store_slug, orderId: orderData.id };
}
