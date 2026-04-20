'use client';

import { createClient } from '@/lib/supabase/client';
import { TRUST_COOKIE_NAME } from '@/lib/admin-trust-cookie';

/**
 * Sign out the current admin (browser-safe).
 *
 * - Invalidates the Supabase session via the browser client (clears sb-* cookies).
 * - Clears the plaza_admin_trust cookie for belt-and-suspenders cleanup.
 *   (HttpOnly cookies set by the server cannot be deleted from JS, but the
 *   server middleware will reject any future requests once the Supabase session
 *   is gone.)
 *
 * Import this in 'use client' components — NOT lib/admin-auth.ts which is
 * server-only (it imports next/headers via lib/supabase/server.ts).
 */
export async function signOutAdmin(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();

  // Best-effort removal of the trust cookie from the browser side.
  // The cookie path must match the one used when it was set (/admin).
  document.cookie = `${TRUST_COOKIE_NAME}=; Max-Age=0; path=/admin`;
}
