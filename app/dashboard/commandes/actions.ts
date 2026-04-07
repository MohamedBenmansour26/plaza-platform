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
  await updateOrderStatus(orderId, 'confirmed', merchantId);
  revalidatePath('/dashboard/commandes');
}

export async function dispatchOrderAction(orderId: string): Promise<void> {
  const merchantId = await getMerchantId();
  await updateOrderStatus(orderId, 'dispatched', merchantId);
  revalidatePath('/dashboard/commandes');
}

export async function deliverOrderAction(orderId: string): Promise<void> {
  const merchantId = await getMerchantId();
  await updateOrderStatus(orderId, 'delivered', merchantId);
  revalidatePath('/dashboard/commandes');
}

export async function cancelOrderAction(orderId: string): Promise<void> {
  const merchantId = await getMerchantId();
  await updateOrderStatus(orderId, 'cancelled', merchantId);
  revalidatePath('/dashboard/commandes');
}
