import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  // Don't prefix the default locale (fr) in the URL
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internals (_next)
  // - Static files (favicon, images, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
