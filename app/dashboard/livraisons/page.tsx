import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDeliveryQueue } from '@/lib/db/orders';
import type { Merchant } from '@/types/supabase';
import { LivraisonsClient } from './LivraisonsClient';

export const metadata = { title: 'Livraisons — Plaza' };

export default async function LivraisonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id'>>();

  if (!merchant) redirect('/onboarding');

  const orders = await getDeliveryQueue(merchant.id);

  return <LivraisonsClient orders={orders} />;
}
