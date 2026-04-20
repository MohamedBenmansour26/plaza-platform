import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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
