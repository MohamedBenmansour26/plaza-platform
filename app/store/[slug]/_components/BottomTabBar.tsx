'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingCart, Info } from 'lucide-react';
import { useCart } from './CartProvider';

interface BottomTabBarProps {
  slug: string;
}

export function BottomTabBar({ slug }: BottomTabBarProps) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { label: 'Accueil', icon: Home, href: `/store/${slug}` },
    { label: 'Produits', icon: Grid3X3, href: `/store/${slug}/produits` },
    { label: 'Panier', icon: ShoppingCart, href: null, badge: cartCount > 0 ? cartCount : null },
    { label: 'Infos', icon: Info, href: `/store/${slug}/infos` },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-40 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.href
          ? pathname === tab.href || pathname.startsWith(tab.href + '/')
          : false;
        return (
          <div
            key={tab.label}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
          >
            {tab.href ? (
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 ${isActive ? '' : 'text-[#A8A29E]'}`}
                style={isActive ? { color: 'var(--color-primary)' } : {}}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            ) : (
              <button className="flex flex-col items-center gap-0.5 text-[#A8A29E]">
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge != null && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
