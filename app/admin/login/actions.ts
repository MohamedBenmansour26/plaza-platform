'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  TRUST_PENDING_COOKIE_NAME,
  TRUST_PENDING_COOKIE_OPTIONS,
} from '@/lib/admin-trust-cookie';

export type RequestMagicLinkResult =
  | { success: true }
  | { success: false; error: 'invalid_email' | 'not_admin' | 'send_failed' };

/**
 * Request a magic-link email for admin login.
 *
 * - Validates the email.
 * - Verifies the email belongs to an active admin user (service role).
 * - Sends a magic link via Supabase that redirects to /admin/auth/callback.
 * - Sets a short-lived cookie (10 min) carrying the trustDevice intent, so the
 *   callback route can mint the long-lived trust cookie when appropriate.
 *
 * We deliberately DO NOT leak whether an email is registered — always return
 * `{ success: true }` on non-admin emails to prevent enumeration. The only
 * visible error cases are `invalid_email` (user typo) and `send_failed`
 * (infra issue we want surfaced).
 */
export async function requestAdminMagicLink(
  email: string,
  trustDevice: boolean,
): Promise<RequestMagicLinkResult> {
  const trimmed = (email ?? '').trim().toLowerCase();

  // Basic email shape check — no need to over-engineer.
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { success: false, error: 'invalid_email' };
  }

  // Anti-enumeration: look up admin first via service role, but return
  // success even when not found so the UI doesn't disclose membership.
  const service = createServiceClient();
  const { data: adminRow } = await service
    .from('admin_users')
    .select('id, is_active')
    .eq('email', trimmed)
    .maybeSingle();

  if (!adminRow || !adminRow.is_active) {
    return { success: true };
  }

  // Stash trustDevice intent in a short-lived cookie that the callback reads.
  const cookieStore = await cookies();
  cookieStore.set(
    TRUST_PENDING_COOKIE_NAME,
    trustDevice ? '1' : '0',
    TRUST_PENDING_COOKIE_OPTIONS,
  );

  // PKCE flow: signInWithOtp sends a `code` query param (not a hash fragment)
  // so /admin/auth/callback can call exchangeCodeForSession(code) successfully.
  const supabase = await createClient({ flowType: 'pkce' });
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000';

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/admin/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: 'send_failed' };
  }

  return { success: true };
}
