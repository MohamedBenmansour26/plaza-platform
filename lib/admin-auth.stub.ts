/**
 * TEMPORARY STUB — DO NOT USE IN PRODUCTION
 *
 * This file provides a mock `requireAdmin()` helper + mock server actions
 * that the admin panel UI can import until Youssef's backend PR lands
 * (branch `plz-060-061-backend`).
 *
 * When Youssef's `lib/admin-auth.ts` is merged, swap every import of
 * `@/lib/admin-auth.stub` to `@/lib/admin-auth` across `app/admin/**`.
 * See the TODO comments in the consumer files for the exact lines.
 */

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  /**
   * ISO timestamp for when the current "trusted device" cookie was issued.
   * Used by the topbar to show "Poste de confiance jusqu'au JJ MMM AAAA".
   * Stub returns today + 30 days.
   */
  trustedUntil: string | null;
};

/**
 * Mock admin. Real version (Youssef) will throw / redirect if the caller
 * is not signed in as an admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return {
    id: 'stub-admin-00000000-0000-0000-0000-000000000000',
    email: 'othmane@plaza.ma',
    displayName: 'Othmane B.',
    trustedUntil: new Date(now + thirtyDaysMs).toISOString(),
  };
}

/**
 * Mock magic-link request. Real version (Youssef, `app/admin/login/actions.ts`)
 * will hit Supabase auth with an allow-listed email check.
 *
 * @returns `{ ok: true }` on success or `{ error }` on failure.
 */
export async function requestAdminMagicLinkStub(
  email: string,
  _trustDevice: boolean,
): Promise<{ ok: true } | { error: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'invalid_email' };
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
}

/** Mock sign-out. Real version clears admin cookies + Supabase session. */
export async function signOutAdminStub(): Promise<{ ok: true }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { ok: true };
}
