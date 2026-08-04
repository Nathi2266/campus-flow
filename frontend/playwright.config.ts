import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173'
const headed = process.env.E2E_HEADED === '1' || process.env.E2E_HEADED === 'true'
const slowMo = Number(process.env.E2E_SLOW_MO || (headed ? '450' : '0')) || 0

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: headed ? 240_000 : 120_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./e2e/reporters/council-reporter.ts'],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    headless: headed ? false : true,
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Always record so the full walkthrough can be preserved to e2e-artifacts/
    video: 'on',
  },
  outputDir: 'test-results',
})
