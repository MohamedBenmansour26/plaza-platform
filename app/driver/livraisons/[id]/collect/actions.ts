'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryById } from '@/lib/db/driver';
import type { DeliveryStatus } from '@/types/supabase';

type CollectResult = { error: string } | { invalidCode: true } | undefined;

export async function confirmCollectionAction(
  deliveryId: string,
  enteredCode: string,
  collectionPhotoPath: string,
): Promise<CollectResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const driver = await getDriverProfile(user.id);
  if (!driver) return { error: 'driver_not_found' };

  const delivery = await getDeliveryById(deliveryId, driver.id);
  if (!delivery) return { error: 'delivery_not_found' };

  // PLZ-058 / B3: validate against the frozen text code on the deliveries row,
  // NOT orders.merchant_pickup_code (integer). The two columns are a documented
  // schema inconsistency to be resolved by Youssef post-Sprint-2.
  const storedCode = delivery.merchant_pickup_code;
  if (!storedCode) return { error: 'no_pickup_code' };

  const storedStr = String(storedCode).padStart(6, '0');
  if (enteredCode !== storedStr) return { invalidCode: true };

  const { error: updateError } = await supabase
    .from('deliveries')
    .update({
      status: 'picked_up' as DeliveryStatus,
      pickup_time: new Date().toISOString(),
      pickup_photo_url: collectionPhotoPath,
    } as never)
    .eq('id', deliveryId);

  if (updateError) return { error: updateError.message };

  redirect('/driver/livraisons');
}
