# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roles-and-data-flow.spec.ts >> CampusFlow E2E — all roles & data flow >> ADMIN: login seed user and walk primary nav
- Location: e2e\roles-and-data-flow.spec.ts:13:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/($|\?)/
Received string:  "http://localhost:5173/login"
Timeout: 20000ms

Call log:
  - Expect "toHaveURL" with timeout 20000ms
    42 × locator resolved to <html lang="en" data-theme="light">…</html>
       - unexpected value "http://localhost:5173/login"

```

```yaml
- text: CF
- heading "CampusFlow" [level=1]
- paragraph: Student management for modern campuses
- paragraph: Welcome back
- heading "Sign in" [level=2]
- paragraph: Use your CampusFlow account to continue.
- alert:
  - img
  - text: Request failed with status code 403
- group:
  - text: Email
  - textbox "Email": admin@campusflow.edu
- group:
  - text: Password
  - textbox "Password": Admin123!
- button "Sign in"
- paragraph:
  - text: Need an account?
  - link "Register":
    - /url: /register
```

# Test source

```ts
  1  | import { expect, type Page } from '@playwright/test'
  2  | 
  3  | export const USERS = {
  4  |   admin: { email: 'admin@campusflow.edu', password: 'Admin123!', role: 'ADMIN' },
  5  |   lecturer: { email: 'lecturer1@campusflow.edu', password: 'Admin123!', role: 'LECTURER' },
  6  |   student: { email: 'student1@campusflow.edu', password: 'Admin123!', role: 'STUDENT' },
  7  | } as const
  8  | 
  9  | export async function clearSession(page: Page) {
  10 |   await page.goto('/login')
  11 |   await page.evaluate(() => {
  12 |     localStorage.clear()
  13 |     sessionStorage.clear()
  14 |   })
  15 | }
  16 | 
  17 | export async function loginAs(page: Page, email: string, password: string) {
  18 |   await clearSession(page)
  19 |   await page.goto('/login')
  20 |   await expect(page.getByTestId('login-email')).toBeVisible()
  21 |   await page.getByTestId('login-email').fill(email)
  22 |   await page.getByTestId('login-password').fill(password)
  23 |   await page.getByTestId('login-submit').click()
> 24 |   await expect(page).toHaveURL(/\/($|\?)/, { timeout: 20_000 })
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  25 |   await expect(page.getByRole('heading').first()).toBeVisible()
  26 | }
  27 | 
  28 | export async function registerUser(
  29 |   page: Page,
  30 |   data: {
  31 |     email: string
  32 |     password: string
  33 |     firstName: string
  34 |     lastName: string
  35 |     role: 'ADMIN' | 'LECTURER' | 'STUDENT'
  36 |     departmentId?: string
  37 |   },
  38 | ) {
  39 |   await clearSession(page)
  40 |   await page.goto('/register')
  41 |   await page.getByLabel('First name').fill(data.firstName)
  42 |   await page.getByLabel('Last name').fill(data.lastName)
  43 |   await page.getByLabel('Email').fill(data.email)
  44 |   await page.getByLabel('Password').fill(data.password)
  45 |   await page.getByLabel('Role').selectOption(data.role)
  46 |   if (data.role !== 'STUDENT' && data.departmentId) {
  47 |     await page.getByLabel('Department ID').fill(data.departmentId)
  48 |   }
  49 |   await page.getByRole('button', { name: 'Register' }).click()
  50 |   await expect(page).toHaveURL(/\/($|\?)/, { timeout: 20_000 })
  51 | }
  52 | 
  53 | export async function signOut(page: Page) {
  54 |   const desktop = page.getByTestId('sign-out')
  55 |   if (await desktop.isVisible().catch(() => false)) {
  56 |     await desktop.click()
  57 |   } else {
  58 |     await page.getByRole('button', { name: 'Sign out' }).click()
  59 |   }
  60 |   await expect(page).toHaveURL(/\/login/)
  61 | }
  62 | 
```