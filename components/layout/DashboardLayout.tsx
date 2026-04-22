import type { ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';
import { MobileNav } from './MobileNav';

type Props = {
  children: ReactNode;
  merchantName: string | null;
};

export function DashboardLayout({ children, merchantName }: Props) {
  return (
    // `bg-background` reads the merchant-refresh token (#F8F9FA) set in PR #1.
    // Sidebar uses the dark-slate `bg-sidebar` token (#111827) per brief §2.5.
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only (lg = 1024px+) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[240px] bg-sidebar border-r border-sidebar-border flex-col z-40">
        <SidebarNav merchantName={merchantName} />
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-[240px] pb-16 lg:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile only (hidden on lg+) */}
      <MobileNav />
    </div>
  );
}
