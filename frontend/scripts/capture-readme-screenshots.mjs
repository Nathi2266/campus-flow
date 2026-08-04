/**
 * Capture README gallery screenshots (marketing + role UIs).
 * Requires UI on :5173 and API reachable via Vite proxy.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../docs/screenshots')
const BASE = process.env.README_SHOT_BASE || 'http://localhost:5173'
const VIEWPORT = { width: 1440, height: 900 }

const USERS = {
  admin: { email: 'admin@campusflow.edu', password: 'Admin123!' },
  lecturer: { email: 'lecturer1@campusflow.edu', password: 'Admin123!' },
  student: { email: 'student1@campusflow.edu', password: 'Admin123!' },
}

async function shot(page, name) {
  const file = path.join(OUT, name)
  await page.waitForTimeout(800)
  await page.screenshot({ path: file, fullPage: false })
  console.log('wrote', name)
}

async function login(page, { email, password }) {
  await page.goto(`${BASE}/login`)
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto(`${BASE}/login`)
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(password)
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes('/api/v1/auth/login') && res.request().method() === 'POST',
    { timeout: 45_000 },
  )
  await page.getByTestId('login-submit').click()
  const res = await loginResponse
  if (!res.ok()) throw new Error(`login failed HTTP ${res.status()} for ${email}`)
  await page.waitForURL(/\/dashboard/, { timeout: 45_000 })
  await page.waitForTimeout(1200)
  // Dismiss sign-in toast so screenshots stay clean
  await page.getByText('Signed in').click({ timeout: 2000 }).catch(() => {})
  await page.waitForTimeout(400)
}

async function gotoApp(page, route) {
  await page.goto(`${BASE}${route}`)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(1000)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: VIEWPORT })

  // Marketing
  await page.goto(`${BASE}/`)
  await page.waitForTimeout(2500)
  await shot(page, '01-landing.png')

  await gotoApp(page, '/login')
  await shot(page, '02-login.png')

  await gotoApp(page, '/features')
  await shot(page, '03-features.png')

  await gotoApp(page, '/roles')
  await shot(page, '04-roles.png')

  // ADMIN
  await login(page, USERS.admin)
  await shot(page, '05-admin-dashboard.png')

  await gotoApp(page, '/departments')
  await shot(page, '06-admin-departments.png')

  await gotoApp(page, '/users')
  await shot(page, '07-admin-users.png')

  await gotoApp(page, '/students')
  await shot(page, '08-admin-students.png')

  await gotoApp(page, '/courses')
  await shot(page, '09-admin-courses.png')

  await gotoApp(page, '/enrollments')
  await shot(page, '10-admin-enrollments.png')

  await gotoApp(page, '/reports')
  await shot(page, '11-admin-reports.png')

  await gotoApp(page, '/audit')
  await shot(page, '12-admin-audit.png')

  await gotoApp(page, '/notifications')
  await shot(page, '13-admin-notifications.png')

  // LECTURER
  await login(page, USERS.lecturer)
  await shot(page, '14-lecturer-dashboard.png')

  await gotoApp(page, '/courses')
  await shot(page, '15-lecturer-courses.png')

  // Open first roster if available
  const rosterBtn = page.getByRole('button', { name: /roster|grades|view/i }).first()
  if (await rosterBtn.isVisible().catch(() => false)) {
    await rosterBtn.click()
    await page.waitForTimeout(1200)
    await shot(page, '16-lecturer-roster.png')
    await page.keyboard.press('Escape').catch(() => {})
  }

  await gotoApp(page, '/reports')
  await shot(page, '17-lecturer-reports.png')

  // STUDENT
  await login(page, USERS.student)
  await shot(page, '18-student-dashboard.png')

  await gotoApp(page, '/courses')
  await shot(page, '19-student-catalogue.png')

  await gotoApp(page, '/enrollments')
  await shot(page, '20-student-enrollments.png')

  await gotoApp(page, '/profile')
  await shot(page, '21-student-profile.png')

  await browser.close()
  console.log('done →', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
