import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';
import { OnboardingForm } from './OnboardingForm';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Explicit Pick generic bypasses Supabase JS 2.x / TS 5.9 inferred-type
  // regression where column-select results resolve to `never`.
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id,store_slug')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id' | 'store_slug'>>();

  // If the merchant row already has a store_slug, onboarding is done.
  if (merchant?.store_slug) {
    redirect('/dashboard');
  }

  return <OnboardingForm merchantId={merchant?.id ?? null} />;
}
