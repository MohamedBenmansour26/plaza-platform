'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { signOutAdmin } from '@/lib/admin-auth';
import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';

type Props = {
  adminEmail: string;
  adminName: string;
  trustedUntil: string | null;
  children: React.ReactNode;
};

/**
 * Client-side shell wrapper. The server layout passes in the authed
 * admin's details; this component owns the logout transition + routing.
 */
export function AdminShell({
  adminEmail,
  adminName,
  trustedUntil,
  children,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAdmin();
      router.push('/admin/login');
    });
  };

  return (
    <div
      data-admin-shell
      className="flex min-h-screen bg-[#FAFAF9]"
      aria-busy={pending}
    >
      <SidebarNav adminEmail={adminEmail} adminName={adminName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          adminEmail={adminEmail}
          trustedUntil={trustedUntil}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
