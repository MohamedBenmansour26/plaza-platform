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
      {/* Logo — Plaza wordmark on the dark sidebar uses the primary blue #1A6BFF */}
      <div className="pt-6 px-6 pb-6">
        <div className="text-[22px] font-bold text-primary">Plaza</div>
      </div>

      {/* Nav items — brief §2.5 dark-slate sidebar.
          Default: muted #9CA3AF on #111827 (bg-sidebar + text-sidebar-foreground).
          Hover: #1F2937/50 (bg-sidebar-accent/50).
          Active: #1F2937 bg + 3px left-accent in primary blue. */}
      <nav className="flex-1 flex flex-col gap-0 px-4">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 h-12 px-3 rounded-lg mb-1 transition-colors ${
                active
                  ? 'bg-sidebar-accent text-primary border-l-[3px] border-l-primary -ml-1 pl-[13px]'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom merchant info — dark-theme footer */}
      <div className="p-4 space-y-3 border-t border-sidebar-border">
        <button
          onClick={() => router.push('/dashboard/compte')}
          className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
            {initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{displayName}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-foreground flex-shrink-0" />
        </button>

        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => router.push('/dashboard/parametres')}
            className="text-sidebar-foreground hover:text-white hover:underline"
          >
            {t('settings')}
          </button>
          <span className="text-sidebar-foreground">/</span>
          <form action="/auth/logout" method="POST" className="inline">
            <button type="submit" className="text-destructive hover:underline">
              {t('logout')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
