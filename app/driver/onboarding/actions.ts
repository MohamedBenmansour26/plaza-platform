'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Upload a document file to Supabase Storage bucket 'driver-documents'.
 * Returns the storage path (bucket is private).
 */
export async function uploadDriverDocumentAction(
  formData: FormData,
  docType: 'license' | 'insurance' | 'id_front' | 'id_back' | 'collection_photo' | 'delivery_photo' | 'issue_photo',
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const file = formData.get('file') as File | null;
  if (!file) return { error: 'no_file' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${docType}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('driver-documents')
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };
  return { url: path };
}

type VehicleType = 'moto' | 'velo' | 'voiture' | 'autre';

export async function saveVehicleTypeAction(
  vehicleType: VehicleType,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const { error } = await supabase
    .from('drivers')
    .update({ vehicle_type: vehicleType } as never)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  redirect('/driver/onboarding/license');
}

export async function saveDocumentUrlAction(
  column: 'license_photo_url' | 'insurance_url' | 'id_front_url' | 'id_back_url',
  url: string,
  next: string,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const { error } = await supabase
    .from('drivers')
    .update({ [column]: url } as never)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  redirect(next);
}

export async function saveIdentityAndSubmitAction(
  frontUrl: string,
  backUrl: string,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  // PLZ-061: testing-mode revert. Driver goes into the pending-validation
  // queue, admin must approve via /admin/drivers before onboarding_status
  // flips to 'active'.
  const { error } = await supabase
    .from('drivers')
    .update({
      id_front_url: frontUrl,
      id_back_url: backUrl,
      onboarding_status: 'pending_validation',
      approval_status: 'pending',
    } as never)
    .eq('user_id', user.id);
  if (error) return { error: error.message };
  redirect('/driver/onboarding/pending');
}

export async function submitOnboardingAction(): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  // PLZ-061: testing-mode revert. See saveIdentityAndSubmitAction.
  const { error } = await supabase
    .from('drivers')
    .update({
      onboarding_status: 'pending_validation',
      approval_status: 'pending',
    } as never)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  redirect('/driver/onboarding/pending');
}
