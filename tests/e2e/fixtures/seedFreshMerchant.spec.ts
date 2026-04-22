import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { test, expect, type Page } from '@playwright/test';
import { seedFreshMerchant } from './seedFreshMerchant';

loadEnvConfig(process.cwd());

/**
 * PLZ-078 — Proof-of-life spec for seedFreshMerchant.
 *
 * Asserts:
 *   1. The handle returned by the fixture is fully populated.
 *   2. The public storefront route resolves (HTTP 200). Note: fresh
 *      merchants have is_online=false → the page renders "Boutique
 *      introuvable", which is expected until a publish step is added.
 *   3. The merchant can re-authenticate with phone + PIN and reach
 *      /dashboard.
 *
 * Product bug note (see seedFreshMerchant.ts):
 *   merchants.phone is never persisted for UI signups, so the returning-user
 *   check in /auth/login routes fresh merchants to OTP (not pin-login). The
 *   re-auth branch below handles either route so the spec survives once
 *   that's fixed.
 */

async function fillPin(page: Page, prefix: string, pin: string) {
  for (let i = 0; i < 4; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await page.getByTestId(`${prefix}-digit-${i + 1}-input`).fill(pin[i]!);
  }
}

test.describe('seedFreshMerchant fixture', () => {
  test('seeds a merchant via UI and the handle is usable', async ({ page }) => {
    test.setTimeout(120_000);

    const handle = await seedFreshMerchant(page);

    expect(handle.merchantId).toMatch(/^[0-9a-f-]{36}$/);
    expect(handle.storeSlug.length).toBeGreaterThan(0);
    expect(handle.phone).toMatch(/^\+2126\d{8}$/);
    expect(handle.pin).toBe('1234');

    // PLZ-081 — fixture drives the boutique location pin-drop; assert the
    // contract field is present AND the merchant row actually has coordinates.
    expect(handle.hasLocation).toBe(true);
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: merchantRow } = await admin
      .from('merchants')
      .select('location_lat, location_lng')
      .eq('id', handle.merchantId)
      .maybeSingle();
    const typed = merchantRow as { location_lat: number | null; location_lng: number | null } | null;
    expect(typed?.location_lat).not.toBeNull();
    expect(typed?.location_lng).not.toBeNull();

    const storefrontResponse = await page.goto(`/store/${handle.storeSlug}`);
    expect(storefrontResponse?.status()).toBe(200);

    await page.context().clearCookies();
    await page.goto('/auth/login');
    await page
      .getByTestId('merchant-login-phone-input')
      .fill(handle.phone.replace(/^\+212/, ''));
    await page.getByTestId('merchant-login-continue-btn').click();

    // Accept either returning-user route: pin-login (once phone-persist bug
    // is fixed) or otp (current behaviour).
    await page.waitForURL(/\/auth\/(pin-login|otp)/, { timeout: 15_000 });

    if (page.url().includes('/auth/pin-login')) {
      await fillPin(page, 'merchant-pin-login', handle.pin);
    } else {
      for (let i = 0; i < 6; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await page.getByTestId(`merchant-otp-digit-${i + 1}-input`).fill('1');
      }
      await page.waitForURL(/\/auth\/pin-setup/, { timeout: 15_000 });
      await fillPin(page, 'merchant-pin-setup', handle.pin);
      await page.waitForFunction(
        () => {
          const first = document.querySelector<HTMLInputElement>(
            '[data-testid="merchant-pin-setup-digit-1-input"]',
          );
          return first !== null && first.value === '';
        },
        { timeout: 5_000 },
      );
      await fillPin(page, 'merchant-pin-setup', handle.pin);
    }

    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
