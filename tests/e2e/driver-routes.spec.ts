import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

test('unauthenticated /driver/livraisons redirects to driver auth', async ({ page }) => {
  await page.goto(`${BASE}/driver/livraisons`);
  // Should redirect away from livraisons since no session
  await expect(page).not.toHaveURL(/\/driver\/livraisons/);
});

test('/driver/auth/phone is publicly accessible', async ({ page }) => {
  const response = await page.goto(`${BASE}/driver/auth/phone`);
  expect(response?.status()).toBe(200);
});
