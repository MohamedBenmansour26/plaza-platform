'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDriverProfile, getDeliveryById } from '@/lib/db/driver';
import type { IssueType } from '@/lib/db/driver';
import type { DeliveryStatus } from '@/types/supabase';

const VALID_ISSUE_TYPES: readonly IssueType[] = [
  'client_absent',
  'client_refuse',
  'wrong_address',
  'damaged',
  'payment_issue',
  'other',
] as const;

const NOTES_MAX = 500;

type IssueResult = { error: string } | undefined;

function isIssueType(v: unknown): v is IssueType {
  return typeof v === 'string' && (VALID_ISSUE_TYPES as readonly string[]).includes(v);
}

export async function reportIssueAction(
  deliveryId: string,
  issueType: IssueType,
  issueNotes: string,
  issuePhotoPath: string | null,
): Promise<IssueResult> {
  // Validate inputs before touching the DB.
  if (!deliveryId || typeof deliveryId !== 'string') {
    return { error: 'invalid_delivery_id' };
  }
  if (!isIssueType(issueType)) {
    return { error: 'invalid_issue_type' };
  }
  const trimmedNotes = (issueNotes ?? '').trim();
  if (trimmedNotes.length > NOTES_MAX) {
    return { error: 'notes_too_long' };
  }
  // 'other' requires a non-empty note.
  if (issueType === 'other' && trimmedNotes.length === 0) {
    return { error: 'notes_required_for_other' };
  }

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
      issue_notes: trimmedNotes || null,
      issue_photo_url: issuePhotoPath,
    } as never)
    .eq('id', deliveryId);

  if (error) return { error: error.message };

  redirect(`/driver/livraisons/${deliveryId}/issue/success`);
}
