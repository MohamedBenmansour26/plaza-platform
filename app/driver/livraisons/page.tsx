import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getActiveDeliveries } from '@/lib/db/driver';
import { redirect } from 'next/navigation';
import { LivraisonsClient } from './_components/LivraisonsClient';

export default async function LivraisonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');
  if (driver.onboarding_status !== 'active') redirect('/driver/onboarding/pending');

  const deliveries = await getActiveDeliveries(driver.id);

  return <LivraisonsClient driver={driver} initialDeliveries={deliveries} />;
}
