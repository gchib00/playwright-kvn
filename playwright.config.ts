import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
require('dotenv').config();

const config: PlaywrightTestConfig = {
  testMatch: /.*.spec.ts/,
  timeout: 30 * 1000, // maximum time one test can run for
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },
  ],
};

export default config;
