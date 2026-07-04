import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: {
    timeout: 60_000,
  },
  fullyParallel: false, // UI flow depends on shared search state -> run serially
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://www.booking.com',
    channel: 'chrome',
    headless: false,
    launchOptions: {
      slowMo: 1000, // затримка 500мс між КОЖНОЮ дією Playwright
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 60_000,
    navigationTimeout: 60_000,
    // Booking.com shows a cookie/consent banner and locale popups on first visit -
    // we handle those explicitly in the test/page objects rather than relying on storageState.
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },

    },
  ],
});
