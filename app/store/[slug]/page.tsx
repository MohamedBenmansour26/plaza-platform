import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { createClient } from '@/lib/supabase/server';
import type { Merchant, Product } from '@/types/supabase';
import { StorefrontClient } from './StorefrontClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: merchant } = await supabase
    .from('merchants')
    .select('store_name, description')
    .eq('store_slug', slug)
    .single<Pick<Merchant, 'store_name' | 'description'>>();

  if (!merchant) {
    return { title: 'Boutique introuvable' };
  }

  return {
    title: `${merchant.store_name} — Plaza`,
    description: merchant.description ?? undefined,
  };
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('store_slug', slug)
    .single<Merchant>();

  if (!merchant) {
    notFound();
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .returns<Product[]>();

  return (
    <StorefrontClient
      merchant={merchant}
      products={products ?? []}
      locale={locale}
    />
  );
}
