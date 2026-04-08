/**
 * lib/db/onboarding.ts — Data fetch for OnboardingChecklist.
 *
 * Schema gaps (flagged to Othmane — need founder approval before migration):
 *   - merchants.city does NOT exist in current schema → always returns null
 *   - delivery_zones table does NOT exist → hasDeliveryZone always returns false
 */

import { createClient } from '@/lib/supabase/server';
import type { OnboardingData } from '@/components/onboarding/OnboardingChecklist';
import type { Merchant } from '@/types/supabase';

type MerchantRow = Pick<Merchant, 'id' | 'store_name' | 'store_slug' | 'logo_url' | 'is_online'>;

export async function getOnboardingData(userId: string): Promise<OnboardingData | null> {
  const supabase = await createClient();

  const { data: merchant, error: merchantErr } = await supabase
    .from('merchants')
    .select('id, store_name, store_slug, logo_url, is_online')
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
    // city column does not exist yet — always null until schema migration
    city: null,
    logoUrl: merchant.logo_url ?? null,
    isOnline: merchant.is_online,
    storeSlug: merchant.store_slug,
    visibleProductCount: visibleProductCount ?? 0,
    // delivery_zones table does not exist yet — always false until schema migration
    hasDeliveryZone: false,
  };
}
