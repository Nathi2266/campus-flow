import { expect, type Page } from '@playwright/test'

/** Seeded users — password Admin123! after V3 migration. */
export const USERS = {
  admin: { email: 'admin@campusflow.edu', password: 'Admin123!', role: 'ADMIN' },
  lecturer: { email: 'lecturer1@campusflow.edu', password: 'Admin123!', role: 'LECTURER' },
  student: { email: 'student1@campusflow.edu', password: 'Admin123!', role: 'STUDENT' },
} as const

export async function clearSession(page: Page) {
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

export async function loginAs(page: Page, email: string, password: string) {
  await clearSession(page)
  await page.goto('/login')
  await expect(page.getByTestId('login-email')).toBeVisible()
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/($|\?)/, { timeout: 20_000 })
  await expect(page.getByRole('heading').first()).toBeVisible()
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
  await expect(page).toHaveURL(/\/($|\?)/, { timeout: 20_000 })
}

export async function signOut(page: Page) {
  const desktop = page.getByTestId('sign-out')
  if (await desktop.isVisible().catch(() => false)) {
    await desktop.click()
  } else {
    await page.getByRole('button', { name: 'Sign out' }).click()
  }
  await expect(page).toHaveURL(/\/login/)
}
