import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Merchant, Product } from '@/types/supabase';
import { ProductForm } from '../ProductForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditProduitPage({ params }: Props) {
  const { id } = await params;
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

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', merchant.id)
    .maybeSingle<Product>();

  if (!product) notFound();

  return <ProductForm product={product} />;
}
