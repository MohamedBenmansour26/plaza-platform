// Admin console uses dynamic rendering — every route depends on the
// authed admin user + Supabase session, so no static generation.
export const dynamic = 'force-dynamic';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

/**
 * Top-level admin layout.
 * Wraps every admin route in `.admin-scope` which:
 *  - scopes the admin font (Inter) via --font-inter
 *  - declares admin-specific CSS variables (see app/globals.css)
 *  - drives the `@media (max-width: 1023px)` desktop-required fallback
 *
 * The shell (sidebar + topbar) lives in `(shell)/layout.tsx` so the login
 * route opts out cleanly.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} admin-scope min-h-screen`}
      style={{ backgroundColor: 'var(--admin-color-bg)' }}
    >
      {children}
    </div>
  );
}
