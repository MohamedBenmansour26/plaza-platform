import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';

export default async function DashboardRootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let merchantName: string | null = null;

  if (user) {
    const { data } = await supabase
      .from('merchants')
      .select('store_name')
      .eq('user_id', user.id)
      .maybeSingle<Pick<Merchant, 'store_name'>>();
    merchantName = data?.store_name ?? null;
  }

  return <DashboardLayout merchantName={merchantName}>{children}</DashboardLayout>;
}
