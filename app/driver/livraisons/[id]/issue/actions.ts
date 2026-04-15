'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryById } from '@/lib/db/driver';
import type { IssueType } from '@/lib/db/driver';
import type { DeliveryStatus } from '@/types/supabase';

type IssueResult = { error: string } | undefined;

export async function reportIssueAction(
  deliveryId: string,
  issueType: IssueType,
  issueNotes: string,
  issuePhotoPath: string | null,
): Promise<IssueResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const driver = await getDriverProfile(user.id);
  if (!driver) return { error: 'driver_not_found' };

  const delivery = await getDeliveryById(deliveryId, driver.id);
  if (!delivery) return { error: 'delivery_not_found' };

  const { error } = await supabase
    .from('deliveries')
    .update({
      status: 'failed' as DeliveryStatus,
      issue_type: issueType,
      issue_notes: issueNotes || null,
      issue_photo_url: issuePhotoPath,
    } as never)
    .eq('id', deliveryId);

  if (error) return { error: error.message };

  redirect(`/driver/livraisons/${deliveryId}/issue/success`);
}
