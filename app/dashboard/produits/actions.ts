'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';
import { MAX_PRODUCT_IMAGES, type ProductImage } from '@/lib/product-images';

/**
 * Parse + sanitise the `images` JSON blob coming from the product form.
 * Defence-in-depth against the DB check constraint: we never send more than
 * MAX_PRODUCT_IMAGES entries, never send malformed shapes, and always fall
 * back to `[]` if the blob is missing / unparseable (draft-safe).
 */
function parseImages(raw: string | null): ProductImage[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (x): x is { url: string; alt?: string } =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as { url?: unknown }).url === 'string' &&
        ((x as { url: string }).url).length > 0,
    )
    .slice(0, MAX_PRODUCT_IMAGES)
    .map((x) => ({
      url: x.url,
      alt: typeof x.alt === 'string' ? x.alt : '',
    }));
}

async function getMerchantId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle<Pick<Merchant, 'id'>>();

  if (!data) redirect('/onboarding');
  return data.id;
}

export async function createProduct(formData: FormData): Promise<void> {
  const merchantId = await getMerchantId();
  const supabase = await createClient();

  const nameFr = (formData.get('name_fr') as string).trim();
  const nameAr = (formData.get('name_ar') as string | null)?.trim() || null;
  const description = (formData.get('description') as string | null)?.trim() || null;
  const priceMAD = parseFloat(formData.get('price') as string);
  const stock = Math.max(0, parseInt(formData.get('stock') as string) || 0);
  // PLZ-090c — images[] is the new source of truth. image_url is kept in
  // sync with images[0].url as a safety net (dropped in a follow-up migration).
  const images = parseImages(formData.get('images') as string | null);
  const imageUrl = images[0]?.url ?? null;
  const isVisible = formData.get('is_visible') === 'true';
  const discountActive = formData.get('discount_active') === 'true';
  const originalPriceRaw = formData.get('original_price');
  const originalPrice = originalPriceRaw ? parseInt(originalPriceRaw as string) : null;
  const catL1 = (formData.get('category_l1') as string) || null;
  const catL2 = (formData.get('category_l2') as string) || null;
  const catL3 = (formData.get('category_l3') as string) || null;

  await supabase.from('products').insert({
    merchant_id: merchantId,
    name_fr: nameFr,
    name_ar: nameAr,
    description,
    price: Math.round(priceMAD * 100),
    stock,
    image_url: imageUrl,
    images,
    is_visible: isVisible,
    discount_active: discountActive,
    original_price: originalPrice,
    category_l1: catL1,
    category_l2: catL2,
    category_l3: catL3,
  } as never);

  revalidatePath('/dashboard/produits');
  revalidatePath('/dashboard');
  redirect('/dashboard/produits');
}

export async function updateProduct(productId: string, formData: FormData): Promise<void> {
  const merchantId = await getMerchantId();
  const supabase = await createClient();

  const nameFr = (formData.get('name_fr') as string).trim();
  const nameAr = (formData.get('name_ar') as string | null)?.trim() || null;
  const description = (formData.get('description') as string | null)?.trim() || null;
  const priceMAD = parseFloat(formData.get('price') as string);
  const stock = Math.max(0, parseInt(formData.get('stock') as string) || 0);
  const images = parseImages(formData.get('images') as string | null);
  const imageUrl = images[0]?.url ?? null;
  const isVisible = formData.get('is_visible') === 'true';
  const discountActive = formData.get('discount_active') === 'true';
  const originalPriceRaw = formData.get('original_price');
  const originalPrice = originalPriceRaw ? parseInt(originalPriceRaw as string) : null;
  const catL1 = (formData.get('category_l1') as string) || null;
  const catL2 = (formData.get('category_l2') as string) || null;
  const catL3 = (formData.get('category_l3') as string) || null;

  await supabase
    .from('products')
    .update({
      name_fr: nameFr,
      name_ar: nameAr,
      description,
      price: Math.round(priceMAD * 100),
      stock,
      image_url: imageUrl,
      images,
      is_visible: isVisible,
      discount_active: discountActive,
      original_price: originalPrice,
      category_l1: catL1,
      category_l2: catL2,
      category_l3: catL3,
    } as never)
    .eq('id', productId)
    .eq('merchant_id', merchantId);

  revalidatePath('/dashboard/produits');
  revalidatePath(`/dashboard/produits/${productId}`);
  revalidatePath('/dashboard');
  redirect('/dashboard/produits');
}

export async function toggleProductVisibility(productId: string, isVisible: boolean): Promise<void> {
  const merchantId = await getMerchantId();
  const supabase = await createClient();

  await supabase
    .from('products')
    .update({ is_visible: isVisible } as never)
    .eq('id', productId)
    .eq('merchant_id', merchantId);

  revalidatePath('/dashboard/produits');
  revalidatePath('/dashboard');
}

export async function deleteProduct(productId: string): Promise<void> {
  const merchantId = await getMerchantId();
  const supabase = await createClient();

  await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('merchant_id', merchantId);

  revalidatePath('/dashboard/produits');
  revalidatePath('/dashboard');
  redirect('/dashboard/produits');
}
