import { expect, type Page } from '@playwright/test'

/** Seeded users — password Admin123! after V3 migration. */
export const USERS = {
  admin: { email: 'admin@campusflow.edu', password: 'Admin123!', role: 'ADMIN' },
  lecturer: { email: 'lecturer1@campusflow.edu', password: 'Admin123!', role: 'LECTURER' },
  student: { email: 'student1@campusflow.edu', password: 'Admin123!', role: 'STUDENT' },
} as const

const live = process.env.E2E_LIVE === '1' || process.env.E2E_LIVE === 'true'
const humanPauseMs = Number(process.env.E2E_HUMAN_PAUSE_MS || (live ? '900' : '0')) || 0
const typeDelayMs = Number(process.env.E2E_TYPE_DELAY_MS || (live ? '40' : '0')) || 0

/** Pause so a watching operator can follow the journey (live demos). */
export async function humanPause(page: Page, ms = humanPauseMs) {
  if (ms > 0) await page.waitForTimeout(ms)
}

async function fillLikeUser(page: Page, testId: string, value: string) {
  const field = page.getByTestId(testId)
  await field.click()
  await field.fill('')
  if (typeDelayMs > 0) {
    await field.pressSequentially(value, { delay: typeDelayMs })
  } else {
    await field.fill(value)
  }
}

export async function clearSession(page: Page) {
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/** Dashboard eyebrow labels (not API role enums). */
export const ROLE_EYEBROW = {
  ADMIN: 'Administrator',
  LECTURER: 'Lecturer',
  STUDENT: 'Student',
} as const

/** Click a sidebar nav item and wait for the screen heading — one tab, real navigation. */
export async function openNav(
  page: Page,
  testId: string,
  heading: string | RegExp,
) {
  await page.getByTestId(testId).click()
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  await humanPause(page)
}

export async function loginAs(page: Page, email: string, password: string) {
  await clearSession(page)
  await page.goto('/login')
  await expect(page.getByTestId('login-email')).toBeVisible()
  await humanPause(page, Math.min(humanPauseMs, 600) || 0)
  await fillLikeUser(page, 'login-email', email)
  await fillLikeUser(page, 'login-password', password)
  await humanPause(page, Math.min(humanPauseMs, 500) || 0)
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes('/api/v1/auth/login') && res.request().method() === 'POST',
    { timeout: 45_000 },
  )
  await page.getByTestId('login-submit').click()
  const res = await loginResponse
  expect(res.ok(), `login failed HTTP ${res.status()} for ${email}`).toBeTruthy()
  await expect(page).toHaveURL(/\/dashboard($|\?)/, { timeout: 45_000 })
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15_000 })
  await humanPause(page)
}

export async function expectDashboardRole(
  page: Page,
  role: keyof typeof ROLE_EYEBROW,
) {
  await expect(page.getByText(ROLE_EYEBROW[role], { exact: true })).toBeVisible()
}

/** Public registration creates STUDENT only. */
export async function registerStudent(
  page: Page,
  data: {
    email: string
    password: string
    firstName: string
    lastName: string
  },
) {
  await clearSession(page)
  await page.goto('/register')
  await page.getByLabel('First name').fill(data.firstName)
  await page.getByLabel('Last name').fill(data.lastName)
  await page.getByLabel('Email').fill(data.email)
  await page.getByLabel('Password').fill(data.password)
  await page.getByRole('button', { name: /Register as student/i }).click()
  await expect(page).toHaveURL(/\/dashboard($|\?)/, { timeout: 45_000 })
}

export async function signOut(page: Page) {
  await humanPause(page)
  const desktop = page.getByTestId('sign-out')
  if (await desktop.isVisible().catch(() => false)) {
    await desktop.click()
  } else {
    await page.getByRole('button', { name: 'Log out' }).click()
  }
  await expect(page).toHaveURL(/\/login/)
  await humanPause(page)
}
