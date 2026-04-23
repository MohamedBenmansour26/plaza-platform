'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingBag, Info } from 'lucide-react';

import { useCart } from './CartProvider';

interface BottomTabBarProps {
  slug: string;
  onInfoClick?: () => void;
  onCartClick?: () => void;
}

export function BottomTabBar({ slug, onInfoClick, onCartClick }: BottomTabBarProps) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCart = onCartClick ?? (() => window.dispatchEvent(new CustomEvent('plaza:open-cart')));
  const handleInfo = onInfoClick ?? (() => {});

  const tabs = [
    { name: 'Accueil', icon: Home, href: `/store/${slug}` as const, onClick: undefined as (() => void) | undefined, badge: 0, testId: 'customer-store-tab-home-link' },
    { name: 'Produits', icon: Grid3X3, href: `/store/${slug}#produits` as const, onClick: undefined as (() => void) | undefined, badge: 0, testId: 'customer-store-tab-products-link' },
    { name: 'Panier', icon: ShoppingBag, href: null, onClick: handleCart, badge: cartCount, testId: 'customer-store-tab-cart-btn' },
    { name: 'Infos', icon: Info, href: null, onClick: handleInfo, badge: 0, testId: 'customer-store-tab-info-btn' },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] h-14 flex items-center justify-around z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.href
          ? tab.name === 'Accueil'
            ? pathname === `/store/${slug}`
            : pathname === tab.href || pathname.startsWith(tab.href.split('#')[0] + '/')
          : false;

        const content = (
          <div className="relative">
            <Icon
              className="w-5 h-5"
              strokeWidth={2}
              style={isActive ? { color: 'var(--color-primary)' } : { color: '#78716C' }}
            />
            {tab.badge > 0 && (
              <div
                className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {tab.badge}
              </div>
            )}
          </div>
        );

        const label = (
          <span
            className="text-[10px]"
            style={isActive ? { color: 'var(--color-primary)', fontWeight: 600 } : { color: '#78716C' }}
          >
            {tab.name}
          </span>
        );

        if (tab.onClick) {
          return (
            <button
              key={tab.name}
              onClick={tab.onClick}
              className="flex flex-col items-center justify-center gap-1 relative flex-1 transition-transform active:scale-[0.95]"
              data-testid={tab.testId}
            >
              {content}
              {label}
            </button>
          );
        }

        return (
          <Link
            key={tab.name}
            href={tab.href!}
            className="flex flex-col items-center justify-center gap-1 relative flex-1 transition-transform active:scale-[0.95]"
            data-testid={tab.testId}
          >
            {content}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
