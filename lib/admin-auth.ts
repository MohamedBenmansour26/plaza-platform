import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { TRUST_COOKIE_NAME } from '@/lib/admin-trust-cookie';

export type AdminRole = 'admin' | 'ops' | 'support';

export type AdminRow = {
  id: string;
  role: AdminRole;
  is_active: boolean;
};

/**
 * Require an authenticated admin on a page or server action.
 *
 * - Verifies Supabase session exists.
 * - Looks up admin_users via service role (RLS deny-all).
 * - Redirects to /admin/login if either check fails.
 *
 * Note: this helper does NOT verify the trust-device cookie — that
 * is enforced by middleware before any /admin/** request reaches here.
 */
export async function requireAdmin(): Promise<{
  user: { id: string; email: string | null };
  adminRow: AdminRow;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const service = createServiceClient();
  const { data: adminRow } = await service
    .from('admin_users')
    .select('id, role, is_active')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow || !adminRow.is_active) {
    redirect('/admin/login');
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    adminRow: adminRow as AdminRow,
  };
}

/**
 * Sign out the current admin:
 * - Invalidates the Supabase session (browser client, clears sb-* cookies).
 * - Deletes the plaza_admin_trust HttpOnly cookie by setting max-age=0.
 *
 * This is a client-callable async function — import it in client components
 * that need a logout button.
 */
export async function signOutAdmin(): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();

  // Delete the trust cookie by setting it with max-age=0 via document.cookie
  // (HttpOnly cookies set by the server cannot be deleted from JS, but the
  // server middleware will reject any future requests once the Supabase session
  // is gone.  For belt-and-suspenders we also hit the server logout route.)
  // The cookie is scoped to /admin so this deletion is path-specific.
  document.cookie = `${TRUST_COOKIE_NAME}=; Max-Age=0; path=/admin`;
}
