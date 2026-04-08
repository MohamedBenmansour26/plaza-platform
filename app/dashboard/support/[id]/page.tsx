import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTicketById } from '@/lib/db/support';
import type { Merchant } from '@/types/supabase';
import { TicketDetailClient } from './TicketDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
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

  const ticket = await getTicketById(id, merchant.id);
  if (!ticket) notFound();

  return <TicketDetailClient ticket={ticket} />;
}
