import { test, expect } from '@playwright/test';

/**
 * Scaffold E2E tests — Plaza Platform
 *
 * These tests verify that the Next.js app boots correctly and that the
 * default language is French. They run against http://localhost:3000
 * as configured in playwright.config.ts.
 *
 * Wire-up note: These tests will be skipped (gracefully) until the
 * Next.js scaffold from PLZ-003 is merged. Once merged they must pass
 * in CI before any PR can be approved.
 */

test.describe('Scaffold — app bootstrap', () => {
  test('homepage loads', async ({ page, request }) => {
    // Verify the server returns HTTP 200 for the root route.
    const response = await request.get('/');
    expect(response.status()).toBe(200);

    // Navigate and confirm the page has a non-empty <title>.
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('app is in French by default', async ({ page }) => {
    await page.goto('/');

    // The <html> element must declare French as the document language.
    // next-intl sets this via the root layout when locale is "fr".
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('fr');

    // At least one element on the page should contain French copy.
    // The exact selector will be tightened once the PLZ-003 scaffold lands
    // and real French strings are rendered via messages/fr.json.
    // For now we assert that the body is not empty and contains text.
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);
  });
});
