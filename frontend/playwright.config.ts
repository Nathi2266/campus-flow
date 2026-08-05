import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173'
const headed = process.env.E2E_HEADED === '1' || process.env.E2E_HEADED === 'true'
const live = process.env.E2E_LIVE === '1' || process.env.E2E_LIVE === 'true'
const slowMo = Number(process.env.E2E_SLOW_MO || (live ? '500' : headed ? '450' : '0')) || 0
/** Prefer installed Google Chrome for live demos (`E2E_CHANNEL=chrome`). */
const channel = process.env.E2E_CHANNEL === 'chrome' ? 'chrome' : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // One worker = one browser journey (never open parallel browsers/tabs for suite pieces)
  workers: 1,
  timeout: live ? 45 * 60_000 : headed ? 240_000 : 120_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./e2e/reporters/council-reporter.ts'],
  ],
  use: {
    ...devices['Desktop Chrome'],
    channel,
    baseURL,
    headless: headed || live ? false : true,
    // Live demos use a large fixed viewport (null viewport conflicts with deviceScaleFactor)
    ...(live ? { viewport: { width: 1440, height: 900 } } : {}),
    launchOptions: {
      ...(slowMo > 0 ? { slowMo } : {}),
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Always record so the full walkthrough can be preserved to e2e-artifacts/
    video: 'on',
  },
  outputDir: 'test-results',
})
