import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryById } from '@/lib/db/driver';
import { redirect, notFound } from 'next/navigation';
import { DeliveryDetailClient } from './_components/DeliveryDetailClient';

export default async function DeliveryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/driver/auth/phone');

  const driver = await getDriverProfile(user.id);
  if (!driver) redirect('/driver/auth/phone');

  const delivery = await getDeliveryById(params.id, driver.id);
  if (!delivery) notFound();

  return <DeliveryDetailClient delivery={delivery} />;
}
