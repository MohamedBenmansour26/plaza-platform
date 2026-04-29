import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getMerchantBySlug } from './actions';
import { CartProvider } from './_components/CartProvider';
import { ConditionalStoreFooter } from './_components/ConditionalStoreFooter';

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

  const primaryColor = merchant.primary_color?.trim() || '#1A6BFF';

  // BottomTabBar is rendered by each client component (StoreHomeClient,
  // ProductDetailClient, etc.) so the `onInfoClick` / `onCartClick` handlers
  // are wired to that page's local sheet state. Linear checkout / verification
  // / confirmation flows intentionally omit the tab bar (they use their own
  // back buttons + CTAs). The global StoreFooter is hidden on those same
  // linear flow pages by ConditionalStoreFooter so the fixed-bottom CTA can
  // pin to the viewport without stacking against the footer.
  return (
    <CartProvider slug={slug}>
      <div
        style={{ '--color-primary': primaryColor } as React.CSSProperties}
        className="storefront-scope"
      >
        {children}
        <ConditionalStoreFooter />
      </div>
    </CartProvider>
  );
}
