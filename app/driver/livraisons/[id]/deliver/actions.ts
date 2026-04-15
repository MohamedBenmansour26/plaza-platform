'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryById } from '@/lib/db/driver';
import type { DeliveryStatus, OrderStatus } from '@/types/supabase';

type DeliverResult = { error: string } | { invalidPin: true } | undefined;

export async function confirmDeliveryAction(
  deliveryId: string,
  enteredPin: string,
  deliveryPhotoPath: string,
  codConfirmed: boolean,
): Promise<DeliverResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const driver = await getDriverProfile(user.id);
  if (!driver) return { error: 'driver_not_found' };

  const delivery = await getDeliveryById(deliveryId, driver.id);
  if (!delivery) return { error: 'delivery_not_found' };

  const storedPin = delivery.order.customer_pin;
  if (!storedPin) return { error: 'no_customer_pin' };

  const storedStr = String(storedPin).padStart(4, '0');
  if (enteredPin !== storedStr) return { invalidPin: true };

  const now = new Date().toISOString();

  const { error: deliveryError } = await supabase
    .from('deliveries')
    .update({
      status: 'delivered' as DeliveryStatus,
      delivered_at: now,
      delivery_photo_url: deliveryPhotoPath,
      cod_confirmed: codConfirmed,
    } as never)
    .eq('id', deliveryId);

  if (deliveryError) return { error: deliveryError.message };

  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: 'delivered' as OrderStatus, delivered_at: now } as never)
    .eq('id', delivery.order.id);

  if (orderError) return { error: orderError.message };

  redirect(`/driver/livraisons/${deliveryId}/success`);
}
