import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/request';
import {
  TRUST_COOKIE_NAME,
  verifyTrustCookie,
} from './lib/admin-trust-cookie';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/driver/livraisons', '/driver/historique', '/driver/profil', '/driver/onboarding'];
// Internal pages that are exempt from auth (no merchant data exposed).
const PUBLIC_OVERRIDES = ['/dashboard/agents'];

// Admin routes that should NOT require admin auth (login screen + callback).
const ADMIN_PUBLIC_PATHS = ['/admin/login', '/admin/auth/callback'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ── Admin guard (PLZ-060) ─────────────────────────────────────
  // /admin/** requires both a Supabase session AND a valid signed
  // trust cookie. Public paths (login, callback) are exempt.
  if (pathname.startsWith('/admin')) {
    const isAdminPublic = ADMIN_PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + '/'),
    );

    if (!isAdminPublic) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {
              // Intentionally empty.
            },
          },
        },
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const trustCookie = request.cookies.get(TRUST_COOKIE_NAME)?.value;
      const trustOk = user && trustCookie
        ? await verifyTrustCookie(trustCookie, user.id)
        : false;

      if (!user || !trustOk) {
        const loginUrl = new URL('/admin/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        // Clear stale trust cookie on failure.
        response.cookies.set(TRUST_COOKIE_NAME, '', {
          path: '/admin',
          maxAge: 0,
        });
        return response;
      }
    }

    // Admin paths never need intl rewriting (French-only for v1).
    return NextResponse.next();
  }

  const isPublicOverride = PUBLIC_OVERRIDES.some((p) => pathname.startsWith(p));
  const isProtected =
    !isPublicOverride &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    // Create a temporary Supabase client to read the session from cookies.
    // We use a no-op setAll because middleware doesn't need to persist token
    // refreshes — the server client in route handlers handles that.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Intentionally empty: session refresh is handled by server clients.
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Route driver users to driver auth, merchants to merchant auth
      const isDriverRoute = PROTECTED_PREFIXES
        .filter(p => p.startsWith('/driver'))
        .some(p => pathname.startsWith(p));
      const loginUrl = isDriverRoute
        ? new URL('/driver/auth/phone', request.url)
        : new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Skip intl rewriting for root — app/page.tsx
  // handles its own redirect to /dashboard or /auth/login
  // Skip intl rewriting for routes that do not use locale-prefixed folder structure
  const SKIP_INTL = ["/", "/auth", "/onboarding", "/dashboard", "/store", "/driver", "/track", "/admin"];
  if (SKIP_INTL.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  // Let next-intl handle locale routing for all other requests.
  return intlMiddleware(request) as NextResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
