import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMerchantMetrics } from '@/lib/db/metrics';
import type { Merchant } from '@/types/supabase';
import type { Period } from '@/lib/db/metrics';
import { FinancesClient } from './FinancesClient';

export const metadata = { title: 'Finances — Plaza' };

const VALID_PERIODS: Period[] = ['week', 'month', 'all'];

type Props = {
  searchParams: Promise<{ period?: string }>;
};

export default async function FinancesPage({ searchParams }: Props) {
  const { period: periodParam } = await searchParams;
  const period: Period = VALID_PERIODS.includes(periodParam as Period)
    ? (periodParam as Period)
    : 'week';

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

  const metrics = await getMerchantMetrics(merchant.id, period);

  return <FinancesClient metrics={metrics} period={period} />;
}
