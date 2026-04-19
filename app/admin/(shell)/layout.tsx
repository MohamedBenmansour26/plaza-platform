export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/admin-auth';
import { TRUST_COOKIE_NAME } from '@/lib/admin-trust-cookie';
import { AdminShell } from '../_components/AdminShell';
import { ApprovalRouteMarker } from '../_components/ApprovalRouteMarker';
import { DesktopRequired } from '../_components/DesktopRequired';

const TRUSTED_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function trustedUntilFromCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 3) return null;
  const issuedAt = Number(parts[1]);
  if (!Number.isFinite(issuedAt)) return null;
  return new Date(issuedAt + TRUSTED_MAX_AGE_MS).toISOString();
}

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  const trustCookie = (await cookies()).get(TRUST_COOKIE_NAME)?.value;
  const trustedUntil = trustedUntilFromCookie(trustCookie);
  const email = user.email ?? '';
  const displayName = email ? email.split('@')[0] : 'Admin';

  return (
    <>
      <ApprovalRouteMarker />
      <AdminShell
        adminEmail={email}
        adminName={displayName}
        trustedUntil={trustedUntil}
      >
        {children}
      </AdminShell>
      <DesktopRequired />
    </>
  );
}
