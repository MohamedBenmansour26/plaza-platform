import { test, expect } from '@playwright/test';

/**
 * PLZ-007 — Merchant auth E2E tests
 *
 * These tests require a running Next.js dev server (handled by playwright.config.ts webServer).
 * They also require a Supabase project with Auth enabled.
 *
 * Note: Tests use a fixed test email prefix and timestamp to avoid conflicts across runs.
 */

const timestamp = Date.now();
const TEST_EMAIL = `test+${timestamp}@plaza-e2e.dev`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_STORE_NAME = `Test Store ${timestamp}`;

test.describe('Merchant auth', () => {
  test('unauthenticated user is redirected from /dashboard to /auth/login', async ({ page }) => {
    // Ensure no session exists
    await page.context().clearCookies();

    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('merchant can sign up with email and password', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill in the signup form
    await page.getByLabel(/boutique|store/i).fill(TEST_STORE_NAME);
    await page.getByLabel(/e-mail|email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mot de passe|password/i).fill(TEST_PASSWORD);

    // Submit
    await page.getByRole('button', { name: /créer|sign up|create/i }).click();

    // After successful signup: redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('merchant can log in and reaches /dashboard', async ({ page }) => {
    // This test relies on the account created by the signup test above.
    // In a real environment both tests should run in order, or use a pre-seeded account.
    await page.goto('/auth/login');

    await page.getByLabel(/e-mail|email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mot de passe|password/i).fill(TEST_PASSWORD);

    await page.getByRole('button', { name: /connexion|sign in|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
