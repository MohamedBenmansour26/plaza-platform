import { test, expect } from '@playwright/test';

test('unauthenticated /driver/livraisons redirects to driver auth', async ({ page }) => {
  await page.goto('http://localhost:3000/driver/livraisons');
  // Should redirect away from livraisons since no session
  await expect(page).not.toHaveURL(/\/driver\/livraisons/);
});

test('/driver/auth/phone is publicly accessible', async ({ page }) => {
  const response = await page.goto('http://localhost:3000/driver/auth/phone');
  expect(response?.status()).toBe(200);
});
