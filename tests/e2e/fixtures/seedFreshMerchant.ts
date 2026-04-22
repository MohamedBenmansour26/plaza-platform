import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

loadEnvConfig(process.cwd());

/**
 * PLZ-078 — seedFreshMerchant Playwright fixture
 *
 * Drives the real UI merchant signup + onboarding flow end-to-end and returns
 * a handle the test can use to authenticate and interact as that merchant.
 *
 * Flow driven (matches the live product):
 *   1. /auth/login (phone entry) → OTP
 *   2. /auth/otp (stub accepts any 6 digits) → pin-setup
 *   3. /auth/pin-setup (enter PIN twice) → /dashboard → middleware to /onboarding
 *   4. /onboarding (store name) → /dashboard
 *   5. merchantId + storeSlug resolved via admin read (UI-created state only)
 *   6. (PLZ-081) /dashboard/boutique — geolocation-driven pin-drop at
 *      Casablanca, then Enregistrer. Lets tests reach "Publier ma boutique"
 *      since the checklist's 4th step (Localisation) gates the publish.
 *
 * Note on the brief's "/auth/signup" wording:
 *   That route is the deprecated email/password flow (its banner redirects
 *   users to /auth/login). The real phone+PIN signup starts at /auth/login.
 *
 * Hard rules (enforced):
 *   - Zero direct DB writes. Reads only, to resolve the merchantId the UI created.
 *   - Every input is selected by `data-testid` (see testid-convention.md).
 *   - Fails loudly with a named step + testid if any step fails.
 */

// The login input requires 9 digits starting with '6' (Moroccan mobile), so
// we can't use a +2125 range. Using prefix 69 keeps fixture merchants
// distinguishable from real testers (typically +2126[01-08] / +2127).
const FIXTURE_PHONE_PREFIX = '69';

export interface FreshMerchantHandle {
  merchantId: string;
  storeSlug: string;
  phone: string; // E.164 Moroccan, e.g. "+212691234567"
  pin: string;
  /**
   * PLZ-081 — Present (and always `true`) when the fixture successfully drove
   * the `/dashboard/boutique` location pin-drop flow and persisted
   * `location_lat` + `location_lng` on the merchant row. When the Mapbox token
   * is unavailable or the location step is skipped, the field is absent so
   * pre-PLZ-081 callers keep their original contract.
   */
  hasLocation?: true;
}

/**
 * PLZ-081 — default pin-drop coordinates.
 *
 * The boutique location picker (components/MapboxMap.tsx) doesn't hardcode a
 * merchant location — it falls back to MOROCCO_DEFAULT_VIEW (centered on the
 * country, zoom 5). We pick Casablanca (Twin Center) as a realistic default
 * for fixture merchants so downstream tests that read `location_description`
 * get a plausible address context.
 */
const CASABLANCA_LAT = 33.5731;
const CASABLANCA_LNG = -7.5898;

function randomDigits(count: number): string {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

function generatePhone(): string {
  return `+212${FIXTURE_PHONE_PREFIX}${randomDigits(7)}`;
}

function phoneLocalDigits(e164: string): string {
  return e164.replace(/^\+212/, '');
}

function syntheticEmailFromPhone(e164: string): string {
  // Mirrors the convention in app/auth/pin-setup/actions.ts so we can find
  // the auth.user row the UI just created.
  return `${e164.replace('+', '')}@plaza-merchant.internal`;
}

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `seedFreshMerchant: missing required env var ${name}. ` +
        `Load .env.local before running the fixture.`,
    );
  }
  return value;
}

let cachedAdmin: SupabaseClient | null = null;
function adminClient(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;
  cachedAdmin = createClient(
    assertEnv('NEXT_PUBLIC_SUPABASE_URL'),
    assertEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return cachedAdmin;
}

/**
 * Product bug workaround (discovered in PLZ-078):
 *   completePinSetupAction writes phone via .update().eq('user_id') before the
 *   merchant row exists (no-op). submitOnboardingAction inserts without the
 *   phone. Result: merchants.phone is NULL for every UI signup, so phone-keyed
 *   lookups (incl. /auth/login's returning-user check) silently miss.
 *
 *   Until that's fixed (separate ticket), we key off the synthetic auth email
 *   created by pin-setup, which IS deterministic from the phone.
 */
async function listAuthEmails(): Promise<Set<string>> {
  const { data, error } = await adminClient().auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) {
    throw new Error(`seedFreshMerchant: auth user lookup failed — ${error.message}`);
  }
  return new Set(data.users.map((u) => u.email).filter((e): e is string => !!e));
}

async function isPhoneTaken(phone: string): Promise<boolean> {
  const emails = await listAuthEmails();
  return emails.has(syntheticEmailFromPhone(phone));
}

async function readMerchantLocation(
  merchantId: string,
): Promise<{ lat: number | null; lng: number | null }> {
  const { data, error } = await adminClient()
    .from('merchants')
    .select('location_lat, location_lng')
    .eq('id', merchantId)
    .maybeSingle();
  if (error) {
    throw new Error(`seedFreshMerchant: location readback failed — ${error.message}`);
  }
  const row = data as { location_lat: number | null; location_lng: number | null } | null;
  return {
    lat: row?.location_lat ?? null,
    lng: row?.location_lng ?? null,
  };
}

async function resolveMerchantByPhone(
  phone: string,
): Promise<{ id: string; storeSlug: string } | null> {
  const admin = adminClient();
  const syntheticEmail = syntheticEmailFromPhone(phone);

  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    throw new Error(`seedFreshMerchant: auth user lookup failed — ${listErr.message}`);
  }
  const authUser = listData.users.find((u) => u.email === syntheticEmail);
  if (!authUser) return null;

  const { data, error } = await admin
    .from('merchants')
    .select('id, store_slug')
    .eq('user_id', authUser.id)
    .maybeSingle();
  if (error) {
    throw new Error(`seedFreshMerchant: merchant lookup failed — ${error.message}`);
  }
  if (!data) return null;
  return { id: data.id as string, storeSlug: data.store_slug as string };
}

function fail(step: string, testid: string, cause: unknown): never {
  const reason = cause instanceof Error ? cause.message : String(cause);
  throw new Error(
    `seedFreshMerchant failed at step "${step}" (testid="${testid}"): ${reason}`,
  );
}

export async function seedFreshMerchant(page: Page): Promise<FreshMerchantHandle> {
  const t0 = Date.now();
  const timings: Record<string, number> = {};
  const markStep = (name: string, start: number) => {
    timings[name] = Date.now() - start;
  };

  // Pick a fresh phone (retry up to 5× on collision).
  let phone = generatePhone();
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await isPhoneTaken(phone))) break;
    if (attempt === 5) {
      throw new Error(
        'seedFreshMerchant: 5 consecutive phone collisions — the FIXTURE_PHONE_PREFIX range is saturated.',
      );
    }
    phone = generatePhone();
  }
  const pin = '1234';
  const storeName = `Test Boutique ${Date.now()}-${randomDigits(3)}`;

  // /auth/login — phone entry
  const stepLoginStart = Date.now();
  try {
    await page.goto('/auth/login');
    await page.getByTestId('merchant-login-phone-input').fill(phoneLocalDigits(phone));
    await page.getByTestId('merchant-login-continue-btn').click();
    await page.waitForURL(/\/auth\/otp/, { timeout: 15_000 });
  } catch (err) {
    fail('login (phone entry)', 'merchant-login-phone-input / merchant-login-continue-btn', err);
  }
  markStep('login', stepLoginStart);

  // /auth/otp — 6-digit code (stub accepts any)
  const stepOtpStart = Date.now();
  try {
    const code = '123456';
    for (let i = 0; i < 6; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await page.getByTestId(`merchant-otp-digit-${i + 1}-input`).fill(code[i]!);
    }
    await page.waitForURL(/\/auth\/pin-setup/, { timeout: 15_000 });
  } catch (err) {
    fail('otp', 'merchant-otp-digit-{1..6}-input', err);
  }
  markStep('otp', stepOtpStart);

  // /auth/pin-setup — enter PIN, then confirm PIN.
  // Both sub-steps share the same URL and same testids; we key off the inputs
  // being empty to detect the re-render between create and confirm screens.
  const stepPinStart = Date.now();
  try {
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await page.getByTestId(`merchant-pin-setup-digit-${i + 1}-input`).fill(pin[i]!);
    }
    await page.waitForFunction(
      () => {
        const first = document.querySelector<HTMLInputElement>(
          '[data-testid="merchant-pin-setup-digit-1-input"]',
        );
        return first !== null && first.value === '';
      },
      { timeout: 5_000 },
    );
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await page.getByTestId(`merchant-pin-setup-digit-${i + 1}-input`).fill(pin[i]!);
    }
  } catch (err) {
    fail('pin-setup', 'merchant-pin-setup-digit-{1..4}-input', err);
  }
  markStep('pin-setup', stepPinStart);

  // completePinSetupAction redirects /dashboard → middleware to /onboarding
  try {
    await page.waitForURL(/\/onboarding/, { timeout: 15_000 });
  } catch (err) {
    fail(
      'pin-setup → onboarding redirect',
      '(server redirect after completePinSetupAction)',
      err,
    );
  }

  // /onboarding — fill store name, submit. The finish button stays disabled
  // until the debounced slug-availability check (500ms + network) resolves.
  const stepOnboardingStart = Date.now();
  try {
    await page.getByTestId('merchant-onboarding-store-name-input').fill(storeName);
    const finishBtn = page.getByTestId('merchant-onboarding-finish-btn');
    await finishBtn.waitFor({ state: 'visible' });
    await page.waitForFunction(
      () => {
        const btn = document.querySelector<HTMLButtonElement>(
          '[data-testid="merchant-onboarding-finish-btn"]',
        );
        return btn !== null && !btn.disabled;
      },
      { timeout: 10_000 },
    );
    await finishBtn.click();
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  } catch (err) {
    fail(
      'onboarding (store details)',
      'merchant-onboarding-store-name-input / merchant-onboarding-finish-btn',
      err,
    );
  }
  markStep('onboarding', stepOnboardingStart);

  // Resolve merchantId + storeSlug via admin read. Small retry loop guards
  // against the rare race between the server action commit and a follow-up
  // read via Supabase's replica.
  const stepResolveStart = Date.now();
  let resolved: { id: string; storeSlug: string } | null = null;
  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      resolved = await resolveMerchantByPhone(phone);
      if (resolved) break;
      // eslint-disable-next-line no-await-in-loop
      await page.waitForTimeout(500);
    }
  } catch (err) {
    fail('merchant lookup (admin read by phone)', '(supabase admin query)', err);
  }
  if (!resolved) {
    throw new Error(
      `seedFreshMerchant: onboarding completed but no merchant row found for phone ${phone}. ` +
        `The UI may have failed silently.`,
    );
  }
  markStep('merchant-lookup', stepResolveStart);

  // PLZ-081 — drive the /dashboard/boutique location pin-drop so downstream
  // tests can reach the "Publier ma boutique" gate (which requires
  // location_lat to be non-null). We use Playwright's geolocation override
  // and click the map's "Ma position" control — this fires `handleLocate` in
  // components/MapboxMap.tsx, which in turn calls the `onLocationChange`
  // prop that BoutiqueForm uses to populate its local state. We then click
  // the form's "Enregistrer" button and read back the merchant row.
  //
  // If the Mapbox token isn't configured the component renders lat/lng
  // inputs instead — we fall back to filling those directly.
  const stepLocationStart = Date.now();
  let locationApplied = false;
  try {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({
      latitude: CASABLANCA_LAT,
      longitude: CASABLANCA_LNG,
    });

    await page.goto('/dashboard/boutique', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/dashboard\/boutique/, { timeout: 20_000 });

    // The map is client-side only (dynamic import, ssr:false) and first-run
    // dev-server compilation + mapbox-gl bundle fetch pushes this well past
    // the default 5s — give it up to 45s before falling back.
    const locateBtn = page.getByTestId('merchant-boutique-locate-btn');
    const locateAttached = await locateBtn
      .waitFor({ state: 'attached', timeout: 45_000 })
      .then(() => true)
      .catch(() => false);

    if (locateAttached) {
      await locateBtn.scrollIntoViewIfNeeded();
      await locateBtn.click();
      // onLocationChange updates BoutiqueForm's locationLat/locationLng state,
      // which renders the "Position enregistrée" confirmation line. Waiting
      // for that text is the strongest proxy for "state is populated".
      await page.getByText(/Position enregistrée/).waitFor({ timeout: 10_000 });
    } else {
      // Token missing → fallback numeric inputs. These are rendered by
      // MapboxMap.tsx when NEXT_PUBLIC_MAPBOX_TOKEN is absent. No testids
      // there (intentional — Saad only exercises the happy map path), so
      // key off label text via Playwright's role/text locators.
      const latInput = page.getByLabel('Latitude');
      const lngInput = page.getByLabel('Longitude');
      await latInput.fill(String(CASABLANCA_LAT));
      await lngInput.fill(String(CASABLANCA_LNG));
    }

    await page.getByTestId('merchant-boutique-save-btn').click();

    // Poll the DB until the merchant row reflects the new coordinates —
    // surviving both the server-action commit round-trip and Supabase's
    // replica read lag.
    for (let attempt = 0; attempt < 10; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      const loc = await readMerchantLocation(resolved.id);
      if (loc.lat !== null && loc.lng !== null) {
        locationApplied = true;
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await page.waitForTimeout(500);
    }
  } catch (err) {
    fail(
      'location pin-drop (boutique)',
      'merchant-boutique-locate-btn / merchant-boutique-save-btn',
      err,
    );
  }
  if (!locationApplied) {
    throw new Error(
      `seedFreshMerchant: location pin-drop did not persist — merchants.location_lat still NULL for ${resolved.id}.`,
    );
  }
  markStep('location-pin-drop', stepLocationStart);

  const total = Date.now() - t0;
  if (total > 60_000) {
    // eslint-disable-next-line no-console
    console.warn(`[seedFreshMerchant] slow run (${total}ms) — step timings:`, timings);
  }

  return {
    merchantId: resolved.id,
    storeSlug: resolved.storeSlug,
    phone,
    pin,
    hasLocation: true,
  };
}
