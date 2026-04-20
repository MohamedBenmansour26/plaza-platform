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
 *
 * SAAD-001: Uses Web Crypto API (globalThis.crypto.subtle) instead of
 * node:crypto so this module is safe to import in the Next.js Edge Runtime.
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

async function hmacSha256(secret: string, data: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data),
  );
  return Buffer.from(sig).toString('hex');
}

export async function signTrustCookie(userId: string): Promise<string> {
  const issuedAt = Date.now();
  const payload = `${userId}.${issuedAt}`;
  const sig = await hmacSha256(getSecret(), payload);
  return `${payload}.${sig}`;
}

export async function verifyTrustCookie(cookie: string, userId: string): Promise<boolean> {
  const parts = cookie.split('.');
  if (parts.length !== 3) return false;
  const [cookieUserId, issuedAtRaw, sig] = parts;

  if (cookieUserId !== userId) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > MAX_AGE_SECONDS * 1000) return false;

  const expected = await hmacSha256(getSecret(), `${cookieUserId}.${issuedAt}`);

  // Constant-time compare via Web Crypto — import key with 'verify' and compare.
  // Manual hex comparison after constant-time-safe buffer compare.
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length) return false;

  // Use timingSafeEqual via Node.js Buffer (available in both Node and Edge Runtime
  // via the Next.js polyfill).
  let diff = 0;
  for (let i = 0; i < sigBuf.length; i++) {
    diff |= sigBuf[i] ^ expectedBuf[i];
  }
  return diff === 0;
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
