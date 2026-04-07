'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/supabase';

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
  const imageUrl = (formData.get('image_url') as string | null) || null;
  const isVisible = formData.get('is_visible') === 'true';

  await supabase.from('products').insert({
    merchant_id: merchantId,
    name_fr: nameFr,
    name_ar: nameAr,
    description,
    price: Math.round(priceMAD * 100),
    stock,
    image_url: imageUrl,
    is_visible: isVisible,
  } as never);

  revalidatePath('/dashboard/produits');
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
  const imageUrl = (formData.get('image_url') as string | null) || null;
  const isVisible = formData.get('is_visible') === 'true';

  await supabase
    .from('products')
    .update({
      name_fr: nameFr,
      name_ar: nameAr,
      description,
      price: Math.round(priceMAD * 100),
      stock,
      image_url: imageUrl,
      is_visible: isVisible,
    } as never)
    .eq('id', productId)
    .eq('merchant_id', merchantId);

  revalidatePath('/dashboard/produits');
  revalidatePath(`/dashboard/produits/${productId}`);
  redirect('/dashboard/produits');
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
  redirect('/dashboard/produits');
}
