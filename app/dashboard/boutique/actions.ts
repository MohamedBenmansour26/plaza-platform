'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';

// ─── Delivery Zone Actions ─────────────────────────────────────────────────────

export async function addDeliveryZone(formData: FormData): Promise<void> {
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

  const zoneName = (formData.get('zone_name') as string).trim();
  const feeRaw = parseFloat(formData.get('delivery_fee') as string);
  const deliveryFee = isNaN(feeRaw) ? 0 : Math.round(feeRaw * 100);

  await supabase.from('delivery_zones').insert({
    merchant_id: merchant.id,
    zone_name: zoneName,
    delivery_fee: deliveryFee,
  } as never);

  revalidatePath('/dashboard/boutique');
  revalidatePath('/dashboard');
}

export async function deleteDeliveryZone(zoneId: string): Promise<void> {
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

  // Only delete zones belonging to this merchant
  await supabase
    .from('delivery_zones')
    .delete()
    .eq('id', zoneId)
    .eq('merchant_id', merchant.id);

  revalidatePath('/dashboard/boutique');
  revalidatePath('/dashboard');
}

export async function updateBoutique(formData: FormData): Promise<void> {
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

  const storeName = (formData.get('store_name') as string).trim();
  const storeSlug = (formData.get('store_slug') as string)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
  const description = (formData.get('description') as string | null)?.trim() || null;
  const category = (formData.get('category') as string | null) || null;
  const logoUrl = (formData.get('logo_url') as string | null) || null;
  const bannerUrl = (formData.get('banner_url') as string | null) || null;
  const primaryColor = (formData.get('primary_color') as string) || '#2563EB';
  const isOnline = formData.get('is_online') === 'true';
  const freeDeliveryRaw = formData.get('delivery_free_threshold');
  const deliveryFreeThreshold = freeDeliveryRaw
    ? Math.round(parseFloat(freeDeliveryRaw as string) * 100)
    : null;
  const locationLat = formData.get('location_lat');
  const locationLng = formData.get('location_lng');
  const locationDescription = formData.get('location_description') as string | null;

  await supabase
    .from('merchants')
    .update({
      store_name: storeName,
      store_slug: storeSlug,
      description,
      category,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      primary_color: primaryColor,
      is_online: isOnline,
      delivery_free_threshold: deliveryFreeThreshold,
      ...(locationLat ? { location_lat: parseFloat(locationLat as string) } : {}),
      ...(locationLng ? { location_lng: parseFloat(locationLng as string) } : {}),
      location_description: locationDescription || null,
    } as never)
    .eq('id', merchant.id);

  revalidatePath('/dashboard/boutique');
  revalidatePath('/dashboard');
}

// ─── Working Hours Action ──────────────────────────────────────────────────────

export type DaySchedule = { open: boolean; from: string; to: string }
export type WorkingHours = Record<string, DaySchedule>

export async function updateWorkingHours(
  workingHours: WorkingHours,
): Promise<{ schemaPending?: boolean }> {
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

  const { error } = await supabase
    .from('merchants')
    .update({ working_hours: workingHours } as never)
    .eq('id', merchant.id);

  if (error) {
    // Column doesn't exist yet — migration is pending approval
    console.warn('[updateWorkingHours] Schema change pending:', error.message);
    return { schemaPending: true };
  }

  revalidatePath('/dashboard/boutique');
  return {};
}
