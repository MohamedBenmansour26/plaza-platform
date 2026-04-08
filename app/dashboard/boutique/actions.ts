'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';

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
    } as never)
    .eq('id', merchant.id);

  revalidatePath('/dashboard/boutique');
  revalidatePath('/dashboard');
}
