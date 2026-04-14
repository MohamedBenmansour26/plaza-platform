import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/driver/livraisons', '/driver/historique', '/driver/profil', '/driver/onboarding'];
// Internal pages that are exempt from auth (no merchant data exposed).
const PUBLIC_OVERRIDES = ['/dashboard/agents'];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

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
  const SKIP_INTL = ["/", "/auth", "/onboarding", "/dashboard", "/store", "/driver", "/track"];
  if (SKIP_INTL.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  // Let next-intl handle locale routing for all other requests.
  return intlMiddleware(request) as NextResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
