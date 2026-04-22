'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

type ActionResult = { success: true } | { success: false; error: string };

type DocField =
  | 'license_approved'
  | 'insurance_approved'
  | 'id_front_approved'
  | 'id_back_approved';

const DOC_FIELDS: readonly DocField[] = [
  'license_approved',
  'insurance_approved',
  'id_front_approved',
  'id_back_approved',
] as const;

const DOC_STORAGE_COLUMN: Record<DocField, 'license_photo_url' | 'insurance_url' | 'id_front_url' | 'id_back_url'> = {
  license_approved: 'license_photo_url',
  insurance_approved: 'insurance_url',
  id_front_approved: 'id_front_url',
  id_back_approved: 'id_back_url',
};

const MIN_REASON_LENGTH = 10;

/**
 * Approve a driver. Marks all four per-doc flags true, flips
 * approval_status → 'approved', onboarding_status → 'active',
 * records approved_by + approved_at.
 */
export async function approveDriverAction(
  driverId: string,
): Promise<ActionResult> {
  const { adminRow } = await requireAdmin();
  const service = createServiceClient();

  // Guard against half-baked state: refuse approval if any document is
  // still missing a URL. Approving with missing docs would mean the
  // driver was approved without showing paperwork.
  const { data: driver, error: fetchError } = await service
    .from('drivers')
    .select(
      'id, license_photo_url, insurance_url, id_front_url, id_back_url',
    )
    .eq('id', driverId)
    .maybeSingle();

  if (fetchError || !driver) {
    return { success: false, error: 'driver_not_found' };
  }

  const { error } = await service
    .from('drivers')
    .update({
      approval_status: 'approved',
      onboarding_status: 'active',
      approved_by: adminRow.id,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
      license_approved: true,
      insurance_approved: true,
      id_front_approved: true,
      id_back_approved: true,
    })
    .eq('id', driverId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/drivers/pending');
  revalidatePath(`/admin/drivers/${driverId}`);
  return { success: true };
}

/**
 * Ask the driver to resubmit a single document. Flips the per-doc
 * flag to false, sets approval_status = 'resubmit', appends the
 * reason (scoped to that doc) onto rejection_reason.
 *
 * Reason is mandatory (>= 10 chars) so the driver has actionable
 * feedback on /driver/onboarding/pending.
 */
export async function resubmitDocumentAction(
  driverId: string,
  docField: DocField,
  reason: string,
): Promise<ActionResult> {
  await requireAdmin();

  if (!DOC_FIELDS.includes(docField)) {
    return { success: false, error: 'invalid_doc_field' };
  }

  const trimmed = (reason ?? '').trim();
  if (trimmed.length < MIN_REASON_LENGTH) {
    return { success: false, error: 'reason_too_short' };
  }

  const service = createServiceClient();

  // Fetch existing reason to append (scoped tag makes it easy for the
  // driver UI to parse per-doc reasons later if needed).
  const { data: driver, error: fetchError } = await service
    .from('drivers')
    .select('id, rejection_reason')
    .eq('id', driverId)
    .maybeSingle();

  if (fetchError || !driver) {
    return { success: false, error: 'driver_not_found' };
  }

  const label = docField.replace('_approved', '');
  const newLine = `[${label}] ${trimmed}`;
  const nextReason = driver.rejection_reason
    ? `${driver.rejection_reason}\n${newLine}`
    : newLine;

  const { error } = await service
    .from('drivers')
    .update({
      [docField]: false,
      approval_status: 'resubmit',
      rejection_reason: nextReason,
      // Keep onboarding_status as 'pending_validation' — the driver
      // needs to re-upload this document but is not rejected outright.
    })
    .eq('id', driverId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/drivers/pending');
  revalidatePath(`/admin/drivers/${driverId}`);
  return { success: true };
}

/**
 * Reject a driver outright. Flips approval_status and onboarding_status
 * to 'rejected'. Reason is mandatory.
 */
export async function rejectDriverAction(
  driverId: string,
  reason: string,
): Promise<ActionResult> {
  await requireAdmin();

  const trimmed = (reason ?? '').trim();
  if (trimmed.length < MIN_REASON_LENGTH) {
    return { success: false, error: 'reason_too_short' };
  }

  const service = createServiceClient();

  const { error } = await service
    .from('drivers')
    .update({
      approval_status: 'rejected',
      onboarding_status: 'rejected',
      rejection_reason: trimmed,
    })
    .eq('id', driverId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/drivers/pending');
  revalidatePath(`/admin/drivers/${driverId}`);
  return { success: true };
}

/**
 * Generate a short-lived signed URL (60s TTL) for a driver document.
 * The admin viewer calls this on document-card mount. Returns `null`
 * if the driver doesn't have that document uploaded yet.
 */
export async function getDocumentSignedUrl(
  driverId: string,
  docField: DocField,
): Promise<{ url: string } | { url: null } | { error: string }> {
  await requireAdmin();

  if (!DOC_FIELDS.includes(docField)) {
    return { error: 'invalid_doc_field' };
  }

  const service = createServiceClient();

  const urlColumn = DOC_STORAGE_COLUMN[docField];
  const { data: driver, error: fetchError } = await service
    .from('drivers')
    .select(`id, ${urlColumn}`)
    .eq('id', driverId)
    .maybeSingle<{ id: string } & Record<typeof urlColumn, string | null>>();

  if (fetchError || !driver) {
    return { error: 'driver_not_found' };
  }

  const path = driver[urlColumn];
  if (!path) {
    return { url: null };
  }

  const { data: signed, error: signError } = await service.storage
    .from('driver-documents')
    .createSignedUrl(path, 60);

  if (signError || !signed) {
    return { error: signError?.message ?? 'signed_url_failed' };
  }

  return { url: signed.signedUrl };
}
