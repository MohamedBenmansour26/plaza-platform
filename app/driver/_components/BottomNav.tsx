'use client';
// BottomNav — visible on: /driver/livraisons, /driver/historique, /driver/profil
// Three tabs: Package/Livraisons, Clock/Historique, User/Profil
// Active tab: icon + label in var(--color-primary). Inactive: #78716C

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Clock, User } from 'lucide-react';

const TABS = [
  { href: '/driver/livraisons', icon: Package, label: 'Livraisons' },
  { href: '/driver/historique', icon: Clock,   label: 'Historique' },
  { href: '/driver/profil',     icon: User,    label: 'Profil'     },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-gray-200 flex items-center z-40">
      {TABS.map(({ href, icon: Icon, label }) => {
        const isActive = href === '/driver/livraisons'
          ? pathname === '/driver/livraisons'
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
            style={{ color: isActive ? 'var(--color-primary)' : '#78716C' }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
