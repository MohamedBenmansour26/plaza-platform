'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export type OnboardingData = {
  merchantId: string | null;
  storeName: string;
  storeSlug: string;
  description: string;
  logoUrl: string | null;
  nameFr: string;
  nameAr: string;
  /** Price in centimes MAD (e.g. 10000 = 100 MAD) */
  price: number;
  stock: number;
  imageUrl: string | null;
};

export async function checkSlugAction(
  slug: string,
  currentMerchantId: string | null,
): Promise<{ available: boolean }> {
  if (!slug || slug.length < 2) return { available: false };

  const supabase = await createClient();

  let query = supabase
    .from('merchants')
    .select('id')
    .eq('store_slug', slug);

  // Exclude the current merchant so they can keep their own slug.
  if (currentMerchantId) {
    query = query.neq('id', currentMerchantId);
  }

  const { data } = await query.maybeSingle();
  return { available: data === null };
}

export async function submitOnboardingAction(
  data: OnboardingData,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'unauthenticated' };

  // Basic validation.
  if (!data.storeName || !data.storeSlug) return { error: 'validation' };
  if (!data.nameFr || !data.nameAr) return { error: 'validation' };
  if (data.price < 0 || data.stock < 0) return { error: 'validation' };

  const service = createServiceClient();
  let merchantId = data.merchantId;

  if (merchantId) {
    const { error } = await service
      .from('merchants')
      .update({
        store_name: data.storeName,
        store_slug: data.storeSlug,
        description: data.description || null,
        logo_url: data.logoUrl,
      })
      .eq('id', merchantId);

    if (error) {
      console.error('[onboarding] merchant update failed:', error.message);
      return { error: 'merchant_update_failed' };
    }
  } else {
    const { data: inserted, error } = await service
      .from('merchants')
      .insert({
        user_id: user.id,
        store_name: data.storeName,
        store_slug: data.storeSlug,
        description: data.description || null,
        logo_url: data.logoUrl,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error('[onboarding] merchant insert failed:', error?.message);
      return { error: 'merchant_insert_failed' };
    }
    merchantId = inserted.id;
  }

  const { error: productError } = await service.from('products').insert({
    merchant_id: merchantId,
    name_fr: data.nameFr,
    name_ar: data.nameAr,
    price: data.price,
    stock: data.stock,
    image_url: data.imageUrl,
    is_active: true,
  });

  if (productError) {
    console.error('[onboarding] product insert failed:', productError.message);
    return { error: 'product_insert_failed' };
  }

  return { error: null };
}
