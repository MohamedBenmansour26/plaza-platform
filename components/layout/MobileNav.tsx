'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Grid3x3, List, BarChart3, MoreHorizontal } from 'lucide-react';

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const tabs = [
    { href: '/dashboard',           label: t('home'),     icon: Home,          exact: true },
    { href: '/dashboard/produits',  label: t('products'), icon: Grid3x3,       exact: false },
    { href: '/dashboard/commandes', label: t('orders'),   icon: List,          exact: false },
    { href: '/dashboard/finances',  label: t('finances'), icon: BarChart3,     exact: false },
    { href: '/dashboard/boutique',  label: t('more'),     icon: MoreHorizontal, exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href || pathname === `${href}/` : pathname.startsWith(href);

  return (
    // Structure preserved per brief §2.5 — only tokens updated so the active
    // mobile tab inherits the new #1A6BFF primary (was hardcoded #2563EB).
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around z-50 lg:hidden">
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
              className={active ? 'text-primary' : 'text-muted-foreground'}
              strokeWidth={2}
            />
            <span
              className={`text-xs ${
                active ? 'text-primary font-semibold' : 'text-muted-foreground'
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
