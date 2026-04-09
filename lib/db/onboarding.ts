/**
 * lib/db/onboarding.ts — Data fetch for OnboardingChecklist.
 */

import { createClient } from '@/lib/supabase/server';
import type { OnboardingData } from '@/components/onboarding/OnboardingChecklist';
import type { Merchant } from '@/types/supabase';

type MerchantRow = Pick<
  Merchant,
  'id' | 'store_name' | 'store_slug' | 'logo_url' | 'is_online'
  | 'description' | 'category' | 'location_lat' | 'location_lng'
>;

export async function getOnboardingData(userId: string): Promise<OnboardingData | null> {
  const supabase = await createClient();

  const { data: merchant, error: merchantErr } = await supabase
    .from('merchants')
    .select('id, store_name, store_slug, logo_url, is_online, description, category, location_lat, location_lng')
    .eq('user_id', userId)
    .maybeSingle<MerchantRow>();

  if (merchantErr) throw new Error(`getOnboardingData (merchant): ${merchantErr.message}`);
  if (!merchant) return null;

  // Count visible products
  const { count: visibleProductCount, error: productsErr } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)
    .eq('is_visible', true);

  if (productsErr) throw new Error(`getOnboardingData (products): ${productsErr.message}`);

  return {
    merchantId: merchant.id,
    storeName: merchant.store_name ?? null,
    hasLocation: merchant.location_lat !== null && merchant.location_lng !== null,
    logoUrl: merchant.logo_url ?? null,
    hasDescription: merchant.description !== null && merchant.description.trim().length > 0,
    hasCategory: merchant.category !== null,
    isOnline: merchant.is_online,
    storeSlug: merchant.store_slug,
    visibleProductCount: visibleProductCount ?? 0,
  };
}
