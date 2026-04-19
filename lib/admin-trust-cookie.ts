import crypto from 'node:crypto';

/**
 * Admin trust-device cookie (PLZ-060).
 *
 * Problem: Supabase session TTLs are project-wide — we can't set a 30-day
 * session for admins without also extending it for merchants/drivers.
 *
 * Solution: layer an HMAC-signed HttpOnly cookie on top of the Supabase session.
 * Admin middleware requires BOTH to be valid.
 *
 * Cookie format: `${userId}.${issuedAtMs}.${hmacSha256(userId.issuedAtMs)}`
 */

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.ADMIN_TRUST_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_TRUST_SECRET env var is missing or shorter than 32 chars. ' +
        'Generate one with: `openssl rand -hex 32` and add it to .env.local.',
    );
  }
  return secret;
}

export function signTrustCookie(userId: string): string {
  const issuedAt = Date.now();
  const payload = `${userId}.${issuedAt}`;
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

export function verifyTrustCookie(cookie: string, userId: string): boolean {
  const parts = cookie.split('.');
  if (parts.length !== 3) return false;
  const [cookieUserId, issuedAtRaw, sig] = parts;

  if (cookieUserId !== userId) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > MAX_AGE_SECONDS * 1000) return false;

  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(`${cookieUserId}.${issuedAt}`)
    .digest('hex');

  // Constant-time compare — both must be equal length or timingSafeEqual throws.
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export const TRUST_COOKIE_NAME = 'plaza_admin_trust';
export const TRUST_PENDING_COOKIE_NAME = 'plaza_admin_trust_pending';

export const TRUST_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/admin',
  maxAge: MAX_AGE_SECONDS,
};

// Short-lived cookie set on /admin/login, read on /admin/auth/callback.
export const TRUST_PENDING_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/admin',
  maxAge: 60 * 10, // 10 minutes
};
