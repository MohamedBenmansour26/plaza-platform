'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Home,
  Grid3x3,
  ListOrdered,
  BarChart3,
  Store,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';

type Props = {
  merchantName: string | null;
};

export function SidebarNav({ merchantName }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard',           label: t('home'),     icon: Home,          exact: true },
    { href: '/dashboard/produits',  label: t('products'), icon: Grid3x3,       exact: false },
    { href: '/dashboard/commandes', label: t('orders'),   icon: ListOrdered,   exact: false },
    { href: '/dashboard/finances',  label: t('finances'), icon: BarChart3,     exact: false },
    { href: '/dashboard/boutique',  label: t('store'),    icon: Store,         exact: false },
    { href: '/dashboard/support',   label: t('support'),  icon: MessageCircle, exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact
      ? pathname === href || pathname === `${href}/`
      : pathname.startsWith(href);

  const displayName = merchantName ?? 'Ma boutique';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <>
      {/* Logo */}
      <div className="pt-6 px-6 pb-6">
        <div className="text-[22px] font-bold text-[#2563EB]">Plaza</div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-11 px-3 rounded-lg transition-colors ${
                active
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#78716C] hover:bg-[#F8FAFC]'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom merchant info */}
      <div className="p-4 space-y-3">
        <button
          onClick={() => router.push('/dashboard/compte')}
          className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] text-sm font-semibold flex-shrink-0">
            {initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#1C1917] truncate">{displayName}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#78716C] flex-shrink-0" />
        </button>

        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => router.push('/dashboard/parametres')}
            className="text-[#78716C] hover:underline"
          >
            {t('settings')}
          </button>
          <span className="text-[#78716C]">/</span>
          <form action="/auth/logout" method="POST" className="inline">
            <button type="submit" className="text-[#DC2626] hover:underline">
              {t('logout')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
