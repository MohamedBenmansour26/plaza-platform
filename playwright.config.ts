import { defineConfig, devices } from '@playwright/test';

/**
 * Plaza Platform — Playwright E2E configuration
 * Base URL: http://localhost:3000 (Next.js dev server)
 * Test directory: ./tests/e2e
 */
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/e2e',

  /* Fail the build on CI if test.only is accidentally left in source. */
  forbidOnly: isCI,

  /* Retry on CI only. */
  retries: isCI ? 2 : 0,

  /* Use 1 worker on CI for stability, auto (CPU-based) locally. */
  workers: isCI ? 1 : undefined,

  /* Reporter: list for CI readability, html for local debugging. */
  reporter: [['list'], ['html', { open: 'never' }]],

  /* Global timeouts */
  timeout: 60_000,

  use: {
    /* Base URL so tests can use relative paths like page.goto('/') */
    baseURL: 'http://localhost:3000',

    /* Maximum time each action (click, fill, etc.) can take */
    actionTimeout: 30_000,

    /* Collect traces on first retry to aid debugging */
    trace: 'on-first-retry',
  },

  /* Run only Chromium for CI speed. Add more browsers for full regression. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start the Next.js dev server before running tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
