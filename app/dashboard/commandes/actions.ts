'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateOrderStatus } from '@/lib/db/orders';
import type { Merchant } from '@/types/supabase';

async function getMerchantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id'>>();

  if (!data) redirect('/onboarding');
  return data.id;
}

export async function confirmOrderAction(orderId: string): Promise<void> {
  const merchantId = await getMerchantId();
  const supabase = await createClient();
  const pickupCode = Math.floor(100000 + Math.random() * 900000);

  // Write pickup code before status update
  await supabase
    .from('orders')
    .update({ merchant_pickup_code: pickupCode } as never)
    .eq('id', orderId)
    .eq('merchant_id', merchantId);

  await updateOrderStatus(orderId, 'confirmed', merchantId);

  // Trigger dispatch engine — non-blocking: dispatch failure must not block merchant
  try {
    const { createDispatchDelivery } = await import('@/lib/dispatch/createDispatchDelivery')
    const result = await createDispatchDelivery(orderId)
    if (!result.success) {
      console.error('[confirmOrderAction] dispatch failed:', result.error)
    }
  } catch (err) {
    console.error('[confirmOrderAction] dispatch threw unexpectedly:', err)
  }

  revalidatePath('/dashboard/commandes');
}
