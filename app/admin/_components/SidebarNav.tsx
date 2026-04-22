'use client';

import { usePathname } from 'next/navigation';
import {
  Banknote,
  LayoutDashboard,
  Map,
  MapPin,
  MessageCircle,
  ScrollText,
  Shield,
  Store,
  Truck,
} from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';

type Props = {
  adminEmail: string;
  adminName: string;
};

/**
 * Admin sidebar — 240px wide, 9 flat nav items.
 * In P0 only "Livreurs" is active; the rest are rendered but disabled.
 */
export function SidebarNav({ adminEmail, adminName }: Props) {
  const pathname = usePathname();

  const navItems: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    disabled: boolean;
    matchPrefix: string;
  }[] = [
    {
      href: '/admin',
      label: 'Accueil',
      icon: LayoutDashboard,
      disabled: true,
      matchPrefix: '/admin',
    },
    {
      href: '/admin/drivers/pending',
      label: 'Livreurs',
      icon: Truck,
      disabled: false,
      matchPrefix: '/admin/drivers',
    },
    {
      href: '/admin/merchants',
      label: 'Marchands',
      icon: Store,
      disabled: true,
      matchPrefix: '/admin/merchants',
    },
    {
      href: '/admin/dispatch',
      label: 'Dispatch',
      icon: Map,
      disabled: true,
      matchPrefix: '/admin/dispatch',
    },
    {
      href: '/admin/support',
      label: 'Support',
      icon: MessageCircle,
      disabled: true,
      matchPrefix: '/admin/support',
    },
    {
      href: '/admin/finances',
      label: 'Finances',
      icon: Banknote,
      disabled: true,
      matchPrefix: '/admin/finances',
    },
    {
      href: '/admin/zones',
      label: 'Zones',
      icon: MapPin,
      disabled: true,
      matchPrefix: '/admin/zones',
    },
    {
      href: '/admin/audit',
      label: 'Audit',
      icon: ScrollText,
      disabled: true,
      matchPrefix: '/admin/audit',
    },
    {
      href: '/admin/moderation',
      label: 'Modération',
      icon: Shield,
      disabled: true,
      matchPrefix: '/admin/moderation',
    },
  ];

  const isActive = (prefix: string) => {
    // Make "Accueil" (/admin) only match the exact path — not nested routes.
    if (prefix === '/admin') return pathname === '/admin' || pathname === '/admin/';
    return pathname.startsWith(prefix);
  };

  const initials = adminName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <aside
      data-admin-sidebar
      role="navigation"
      aria-label="Navigation principale"
      className="flex h-screen w-[240px] flex-col bg-[#0F172A] text-[#94A3B8]"
    >
      {/* Logo */}
      <div className="flex items-baseline gap-2 px-5 pb-6 pt-6">
        <span className="text-[18px] font-bold text-white">Plaza</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          Admin
        </span>
      </div>
      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.matchPrefix)}
            disabled={item.disabled}
          />
        ))}
      </nav>
      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A5F] text-[13px] font-semibold text-[#1A6BFF]">
            {initials || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium text-white">
              {adminName}
            </div>
            <div className="truncate text-[12px] text-[#94A3B8]">
              {adminEmail}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
