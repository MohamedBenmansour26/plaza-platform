#!/usr/bin/env node
/**
 * PLZ-B2 QA: capture screenshots of /driver/parametres + /driver/support.
 *
 * Strategy: log in as a known test driver via the PIN login UI (the same
 * path a real driver uses), then screenshot the target screens.
 *
 * Usage: node scripts/qa-b2-screenshots.mjs
 * Writes to: design-exports/qa/b2-mehdi-*.png
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const BASE  = process.env.BASE_URL  || 'http://localhost:3457';
const PHONE = process.env.QA_PHONE  || '622118833';   // local-format (no +212)
const PIN   = process.env.QA_PIN    || '1234';

const outDir = path.join(root, 'design-exports/qa');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();

  // 1) Phone
  console.log('login: phone');
  await page.goto(BASE + '/driver/auth/phone', { waitUntil: 'domcontentloaded' });
  const phoneInput = page.getByTestId('driver-auth-phone-input');
  await phoneInput.click();
  await phoneInput.pressSequentially(PHONE, { delay: 10 });
  await page.waitForTimeout(200);
  await page.getByTestId('driver-auth-phone-submit-btn').click();

  // 2) PIN
  await page.waitForURL(/\/driver\/auth\/pin/, { timeout: 15000 });
  console.log('login: pin');
  for (const d of PIN.split('')) {
    await page.getByTestId(`driver-pin-login-keypad-${d}-btn`).click();
  }

  await page.waitForURL(/\/driver\/(livraisons|onboarding)/, { timeout: 15000 });
  console.log('logged in:', page.url());

  // 3) /driver/parametres
  console.log('→ /driver/parametres');
  await page.goto(BASE + '/driver/parametres', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'b2-mehdi-parametres.png'), fullPage: true });

  // 3b) open change-PIN modal
  await page.getByTestId('driver-parametres-change-pin-btn').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'b2-mehdi-parametres-pin-modal.png'), fullPage: true });
  await page.getByTestId('driver-parametres-change-pin-close-btn').click();

  // 4) /driver/support
  console.log('→ /driver/support');
  await page.goto(BASE + '/driver/support', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'b2-mehdi-support.png'), fullPage: true });

  // 5) /driver/profil — verify wired CTAs
  console.log('→ /driver/profil');
  await page.goto(BASE + '/driver/profil', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'b2-mehdi-profil.png'), fullPage: true });

  console.log('Done.');
} finally {
  await browser.close();
}
