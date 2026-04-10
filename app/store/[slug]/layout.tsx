import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getMerchantBySlug } from './actions';
import { CartProvider } from './_components/CartProvider';

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function StoreLayout({ children, params }: Props) {
  const { slug } = await params;
  const merchant = await getMerchantBySlug(slug);

  if (!merchant || !merchant.is_online) {
    notFound();
  }

  return <CartProvider slug={slug}>{children}</CartProvider>;
}
