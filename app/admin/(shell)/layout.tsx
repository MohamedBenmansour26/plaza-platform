export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
// TODO (Youssef swap): replace `@/lib/admin-auth.stub` import below with
// `@/lib/admin-auth` once the backend PR lands. `requireAdmin()` signature
// stays the same.
import { requireAdmin } from '@/lib/admin-auth.stub';
import { AdminShell } from '../_components/AdminShell';
import { ApprovalRouteMarker } from '../_components/ApprovalRouteMarker';
import { DesktopRequired } from '../_components/DesktopRequired';

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect('/admin/login');
  }
  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <>
      <ApprovalRouteMarker />
      <AdminShell
        adminEmail={admin.email}
        adminName={admin.displayName}
        trustedUntil={admin.trustedUntil}
      >
        {children}
      </AdminShell>
      <DesktopRequired />
    </>
  );
}
