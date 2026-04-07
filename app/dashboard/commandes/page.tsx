import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrders } from '@/lib/db/orders';
import type { Merchant } from '@/types/supabase';
import { OrdersClient } from './OrdersClient';

export const metadata = { title: 'Commandes — Plaza' };

export default async function CommandesPage() {
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

  const orders = await getOrders(merchant.id);

  return <OrdersClient orders={orders} />;
}
