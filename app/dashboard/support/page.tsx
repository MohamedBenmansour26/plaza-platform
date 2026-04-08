import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTickets } from '@/lib/db/support';
import type { Merchant } from '@/types/supabase';
import { SupportClient } from './SupportClient';

export const metadata = { title: 'Support — Plaza' };

export default async function SupportPage() {
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

  const tickets = await getTickets(merchant.id);

  return <SupportClient tickets={tickets} />;
}
