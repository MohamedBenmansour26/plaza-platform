import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';
import { BoutiqueForm } from './BoutiqueForm';

export default async function BoutiquePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle<Merchant>();

  if (!merchant) redirect('/onboarding');

  return <BoutiqueForm merchant={merchant} />;
}
