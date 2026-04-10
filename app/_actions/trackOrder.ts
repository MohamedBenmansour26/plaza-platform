'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSlugByOrderNumber(
  orderNumber: string,
): Promise<string | null> {
  const supabase = await createClient();
  const orderResult = await supabase
    .from('orders')
    .select('merchant_id')
    .eq('order_number', orderNumber)
    .returns<{ merchant_id: string }[]>()
    .single();
  const orderData = orderResult.data as { merchant_id: string } | null;
  if (!orderData) return null;
  const merchantResult = await supabase
    .from('merchants')
    .select('store_slug')
    .eq('id', orderData.merchant_id)
    .returns<{ store_slug: string }[]>()
    .single();
  const merchant = merchantResult.data as { store_slug: string } | null;
  return merchant?.store_slug ?? null;
}
