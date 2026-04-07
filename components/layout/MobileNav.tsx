'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3x3, List, TrendingUp, MoreHorizontal } from 'lucide-react';

const tabs = [
  { href: '/dashboard',           label: 'Accueil',   icon: Home,          exact: true },
  { href: '/dashboard/produits',  label: 'Produits',  icon: Grid3x3,       exact: false },
  { href: '/dashboard/commandes', label: 'Commandes', icon: List,          exact: false },
  { href: '/dashboard/finances',  label: 'Finances',  icon: TrendingUp,    exact: false },
  { href: '/dashboard/boutique',  label: 'Plus',      icon: MoreHorizontal, exact: false },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href || pathname === `${href}/` : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] h-16 flex items-center justify-around z-50 md:hidden">
      {tabs.map((tab) => {
        const active = isActive(tab.href, tab.exact);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1"
          >
            <Icon
              size={20}
              className={active ? 'text-[#2563EB]' : 'text-[#78716C]'}
              strokeWidth={2}
            />
            <span
              className={`text-[10px] ${
                active ? 'text-[#2563EB] font-semibold' : 'text-[#78716C]'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
