import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getMerchantBySlug, getProductsByMerchant } from './actions';
import { StoreHomeClient } from './_components/StoreHomeClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await getMerchantBySlug(slug);

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
  const merchant = await getMerchantBySlug(slug);

  if (!merchant) {
    notFound();
  }

  const products = await getProductsByMerchant(merchant.id);

  return (
    <StoreHomeClient merchant={merchant} products={products} slug={slug} />
  );
}
