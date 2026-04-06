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

  // Note: explicit cast needed — Supabase JS 2.x inferred result types break
  // under TypeScript 5.9's stricter conditional type evaluation.
  const { data: rawMerchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  const merchant = rawMerchant as Merchant | null;

  // If the merchant row already has a store_slug, onboarding is done.
  if (merchant?.store_slug) {
    redirect('/dashboard');
  }

  return <OnboardingForm merchantId={merchant?.id ?? null} />;
}
