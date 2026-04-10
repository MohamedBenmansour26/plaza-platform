import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getMerchantBySlug, getProductById } from '../../actions';
import { ProductDetailClient } from '../../_components/ProductDetailClient';

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const merchant = await getMerchantBySlug(slug);
  if (!merchant) return { title: 'Produit introuvable' };
  const product = await getProductById(id, merchant.id);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: `${product.name_fr} — ${merchant.store_name} — Plaza`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug, id } = await params;

  const merchant = await getMerchantBySlug(slug);
  if (!merchant) notFound();

  const product = await getProductById(id, merchant.id);
  if (!product) notFound();

  return (
    <ProductDetailClient product={product} merchant={merchant} slug={slug} />
  );
}
