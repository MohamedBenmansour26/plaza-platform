import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getMerchantBySlug } from './actions';
import { CartProvider } from './_components/CartProvider';
import { BottomTabBar } from './_components/BottomTabBar';
import { StoreFooter } from './_components/StoreFooter';

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

  const primaryColor = merchant.primary_color?.trim() || '#2563EB';

  return (
    <CartProvider slug={slug}>
      <div
        style={{ '--color-primary': primaryColor } as React.CSSProperties}
        className="pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0"
      >
        {children}
        <StoreFooter />
        <BottomTabBar slug={slug} />
      </div>
    </CartProvider>
  );
}
