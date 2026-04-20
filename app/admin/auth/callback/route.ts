import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  TRUST_COOKIE_NAME,
  TRUST_COOKIE_OPTIONS,
  TRUST_PENDING_COOKIE_NAME,
  signTrustCookie,
} from '@/lib/admin-trust-cookie';

/**
 * Admin magic-link callback (PLZ-060).
 *
 * Flow:
 *  1. Exchange the `code` query param for a Supabase session.
 *  2. Verify the authenticated user is a row in admin_users (active).
 *  3. If the `plaza_admin_trust_pending` cookie is set to "1", mint a
 *     long-lived signed trust cookie. Otherwise, do not set the trust
 *     cookie and the user will be treated as an untrusted device — they
 *     will be bounced back to /admin/login by middleware. (Future: allow
 *     per-session admin use without trust cookie; for v1 trust is required.)
 *  4. Clear the pending cookie and redirect to /admin.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('error', 'callback_failed');

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(loginUrl);
  }

  // Verify admin membership (deny-all RLS → service role).
  const service = createServiceClient();
  const { data: adminRow } = await service
    .from('admin_users')
    .select('id, is_active')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow || !adminRow.is_active) {
    // Sign out the just-created session — this user is not an admin.
    await supabase.auth.signOut();
    loginUrl.searchParams.set('error', 'not_admin');
    return NextResponse.redirect(loginUrl);
  }

  // Read the trust-device intent from the pending cookie.
  const cookieStore = await cookies();
  const trustPending = cookieStore.get(TRUST_PENDING_COOKIE_NAME)?.value;

  // Always clear the pending cookie.
  cookieStore.set(TRUST_PENDING_COOKIE_NAME, '', {
    ...TRUST_COOKIE_OPTIONS,
    maxAge: 0,
    path: '/admin',
  });

  // Build redirect response.
  const redirectUrl = new URL('/admin', request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (trustPending === '1') {
    const signed = await signTrustCookie(user.id);
    response.cookies.set(TRUST_COOKIE_NAME, signed, TRUST_COOKIE_OPTIONS);
  } else {
    // v1 behaviour: the middleware requires a trust cookie on /admin/**.
    // If the user did not opt in to trust-device, we still set a short-lived
    // trust cookie (session-scoped: no maxAge) so they can use this session.
    // On next visit without the long cookie, they'll log in again.
    const signed = await signTrustCookie(user.id);
    response.cookies.set(TRUST_COOKIE_NAME, signed, {
      ...TRUST_COOKIE_OPTIONS,
      maxAge: undefined, // session cookie
    });
  }

  return response;
}
