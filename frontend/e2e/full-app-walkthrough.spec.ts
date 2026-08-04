/**
 * Single continuous Playwright test — produces ONE long video of the full app walkthrough.
 * After the run, `npm run test:e2e:walkthrough` copies video → e2e-artifacts/campusflow-full-app-walkthrough.webm
 */
import { expect, test } from '@playwright/test'
import { expectDashboardRole, loginAs, registerStudent, signOut, USERS } from './helpers/auth'

test.describe.configure({ mode: 'serial' })

test('CampusFlow full app walkthrough — all roles & features', async ({ page }) => {
  test.setTimeout(20 * 60_000)
  const stamp = Date.now()

  // ── 1. Login UI ──────────────────────────────────────────────
  await page.goto('/login')
  await expect(page.getByText('CampusFlow').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible()
  await expect(page.getByTestId('login-submit')).toBeVisible()
  await expect(page.getByTestId('demo-login-panel')).toHaveCount(0)

  // ── 2. ADMIN nav + settings ──────────────────────────────────
  await loginAs(page, USERS.admin.email, USERS.admin.password)
  await expectDashboardRole(page, 'ADMIN')
  await expect(page.getByRole('heading', { name: /Campus overview|Administrator/i })).toBeVisible()

  for (const [nav, heading] of [
    ['nav-students', 'Students'],
    ['nav-courses', 'Courses'],
    ['nav-enrollments', 'Enrollments'],
    ['nav-departments', 'Departments'],
    ['nav-users', 'Users'],
    ['nav-reports', 'Reports'],
  ] as const) {
    await page.getByTestId(nav).click()
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }

  await page.getByTestId('nav-audit').click()
  await expect(page.getByRole('heading', { name: /Audit log/i })).toBeVisible()

  await page.getByTestId('nav-profile').click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await expect(page.getByText(USERS.admin.email)).toBeVisible()

  await page.getByTestId('nav-settings').click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByLabel('Dark mode')).toBeVisible()
  await expect(page.getByTestId('nav-notifications')).toBeVisible()

  // ── 3. ADMIN department + lecturer user (temp password) ──────
  const deptName = `Walk Dept ${stamp}`
  const lecturerEmail = `walk.lecturer.${stamp}@campus.edu`

  await page.getByTestId('nav-departments').click()
  await page.getByRole('button', { name: 'Add department' }).click()
  await page.getByLabel('Name').fill(deptName)
  await page.getByLabel('Description').fill('Walkthrough department')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText(deptName)).toBeVisible({ timeout: 20_000 })

  await page.getByTestId('nav-users').click()
  await page.getByRole('button', { name: 'Add user' }).click()
  const userDialog = page.getByRole('dialog')
  await userDialog.getByLabel('First name').fill('Walk')
  await userDialog.getByLabel('Last name').fill('Lecturer')
  await userDialog.getByLabel('Email').fill(lecturerEmail)
  await userDialog.getByLabel('Role').selectOption('LECTURER')
  await userDialog.getByLabel('Department').selectOption({ label: deptName })
  await userDialog.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByText(/User created/i).first()).toBeVisible({ timeout: 20_000 })
  const userTemp = page.getByRole('alertdialog')
  await expect(userTemp).toBeVisible({ timeout: 15_000 })
  await userTemp.getByRole('button', { name: 'Done' }).click()

  // ── 4. ADMIN course activate/deactivate ──────────────────────
  await page.getByTestId('nav-courses').click()
  const deactivate = page.getByRole('button', { name: 'Deactivate course' }).first()
  await expect(deactivate).toBeVisible({ timeout: 20_000 })
  await deactivate.click()
  await expect(page.getByRole('button', { name: 'Activate course' }).first()).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Activate course' }).first().click()
  await expect(page.getByRole('button', { name: 'Deactivate course' }).first()).toBeVisible({
    timeout: 15_000,
  })

  // ── 5. ADMIN reports + CSV ───────────────────────────────────
  await page.getByTestId('nav-reports').click()
  await expect(page.getByText('Total students')).toBeVisible()
  const deptFilter = page.getByLabel(/Department/i)
  await expect(deptFilter).toBeVisible()
  await expect
    .poll(async () => deptFilter.locator('option').count(), { timeout: 20_000 })
    .toBeGreaterThan(1)
  await deptFilter.selectOption({ index: 1 })
  const downloadPromise = page.waitForEvent('download', { timeout: 20_000 })
  await page.getByTestId('reports-export-csv').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/students-per-course\.csv/i)

  await signOut(page)

  // ── 6. LECTURER role gate + grade ────────────────────────────
  await loginAs(page, USERS.lecturer.email, USERS.lecturer.password)
  await expectDashboardRole(page, 'LECTURER')
  await expect(page.getByRole('heading', { name: /Teaching overview|Your courses|Lecturer/i })).toBeVisible()
  await expect(page.getByTestId('nav-departments')).toHaveCount(0)
  await expect(page.getByTestId('nav-users')).toHaveCount(0)

  await page.getByTestId('nav-enrollments').click()
  let gradeBtn = page.locator('button[aria-label^="Edit grade"]').first()
  if ((await gradeBtn.count()) === 0) {
    await page.evaluate(async () => {
      const raw = localStorage.getItem('campusflow-auth')
      const parsed = raw ? JSON.parse(raw) : null
      const token = parsed?.state?.accessToken as string
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      const courses = await fetch('/api/v1/courses?page=0&size=20', { headers }).then((r) => r.json())
      const students = await fetch('/api/v1/students?page=0&size=5', { headers }).then((r) => r.json())
      const courseId = courses.content?.[0]?.id
      const studentId = students.content?.[0]?.id
      if (courseId && studentId) {
        await fetch('/api/v1/enrollments', {
          method: 'POST',
          headers,
          body: JSON.stringify({ studentId, courseId }),
        })
      }
    })
    await page.reload()
    await page.getByTestId('nav-enrollments').click()
    gradeBtn = page.locator('button[aria-label^="Edit grade"]').first()
  }
  await expect(gradeBtn).toBeVisible({ timeout: 20_000 })
  await gradeBtn.click()
  await page.getByRole('textbox', { name: 'Grade' }).fill('A')
  await page.getByRole('button', { name: /Save grade/i }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await signOut(page)

  // ── 7. STUDENT nav + IDOR + profile + self-enroll ────────────
  await loginAs(page, USERS.student.email, USERS.student.password)
  await expectDashboardRole(page, 'STUDENT')
  await expect(page.getByTestId('nav-students')).toHaveCount(0)
  await expect(page.getByTestId('nav-reports')).toHaveCount(0)

  const idor = await page.evaluate(async () => {
    const raw = localStorage.getItem('campusflow-auth')
    const parsed = raw ? JSON.parse(raw) : null
    const token = parsed?.state?.accessToken as string
    const headers = { Authorization: `Bearer ${token}` }
    const listRes = await fetch('/api/v1/students?page=0&size=50', { headers })
    const listBody = await listRes.json()
    const total = Number(listBody.totalElements ?? listBody.content?.length ?? 0)
    const ownId = listBody.content?.[0]?.id as number | undefined
    const peerId = ownId === 1 ? 2 : 1
    const peerRes = await fetch(`/api/v1/students/${peerId}`, { headers })
    const rosterRes = await fetch('/api/v1/enrollments/course/1?page=0&size=10', { headers })
    return { total, peerStatus: peerRes.status, rosterStatus: rosterRes.status }
  })
  expect(idor.total).toBeLessThanOrEqual(1)
  expect(idor.peerStatus).toBe(400)
  expect(idor.rosterStatus).toBe(400)

  await page.getByTestId('nav-profile').click()
  const first = page.getByLabel('First name')
  await expect(first).toBeVisible()
  const current = await first.inputValue()
  const next = current.endsWith('W') ? current.slice(0, -1) || 'Alice' : `${current}W`
  await first.fill(next)
  await page.getByRole('button', { name: /Save|Update/i }).click()
  await expect(page.getByText(/updated|saved|success/i).first()).toBeVisible({ timeout: 15_000 })
  await first.fill(current)
  await page.getByRole('button', { name: /Save|Update/i }).click()

  await page.getByTestId('nav-enrollments').click()
  await page.getByRole('button', { name: /Self-enroll/i }).click()
  const enrollDialog = page.getByRole('dialog')
  await expect(enrollDialog).toBeVisible()
  const courseSelect = enrollDialog.getByLabel('Course')
  await expect
    .poll(async () => courseSelect.locator('option').count(), { timeout: 20_000 })
    .toBeGreaterThan(1)
  const optionCount = await courseSelect.locator('option').count()
  await courseSelect.selectOption({ index: optionCount - 1 })
  await enrollDialog.getByRole('button', { name: 'Enroll', exact: true }).click()
  await Promise.race([
    expect(enrollDialog).toHaveCount(0, { timeout: 20_000 }),
    expect(page.getByText(/already enrolled|maximum|full|Enrolled successfully/i).first()).toBeVisible({
      timeout: 20_000,
    }),
  ])
  if ((await enrollDialog.count()) > 0) {
    await enrollDialog.getByRole('button', { name: 'Cancel' }).click()
  }
  await signOut(page)

  // ── 8. ADMIN data flow: student → course → enroll ────────────
  const studentEmail = `walk.student.${stamp}@campus.edu`
  const courseCode = `WLK${String(stamp).slice(-6)}`

  await loginAs(page, USERS.admin.email, USERS.admin.password)
  await page.getByTestId('nav-students').click()
  await page.getByRole('button', { name: 'Add student' }).click()
  const studentDialog = page.getByRole('dialog')
  await studentDialog.getByLabel('First name').fill('Walk')
  await studentDialog.getByLabel('Last name').fill('Student')
  await studentDialog.getByLabel('Email').fill(studentEmail)
  await studentDialog.locator('#departmentId').selectOption({ index: 1 })
  await studentDialog.getByRole('button', { name: 'Create' }).click()
  const studentTemp = page.getByRole('alertdialog')
  await expect(studentTemp).toBeVisible({ timeout: 20_000 })
  await studentTemp.getByRole('button', { name: 'Done' }).click()
  // List is paginated — search so the new row is visible
  await page.getByLabel('Search students').fill(studentEmail)
  await expect(page.getByText(studentEmail)).toBeVisible({ timeout: 25_000 })

  await page.getByTestId('nav-courses').click()
  await page.getByRole('button', { name: 'Add course' }).click()
  const courseDialog = page.getByRole('dialog')
  await courseDialog.getByLabel('Code').fill(courseCode)
  await courseDialog.getByLabel('Name').fill(`Walk Course ${stamp}`)
  await courseDialog.getByLabel('Credits').fill('3')
  await courseDialog.locator('#departmentId').selectOption({ index: 1 })
  await courseDialog.getByLabel('Max capacity').fill('25')
  await courseDialog.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText(/Course created|created/i).first()).toBeVisible({ timeout: 20_000 })

  // Catalogue is paginated — resolve IDs via API (scan pages) rather than first-page UI
  const ids = await page.evaluate(async ({ studentEmail: se, courseCode: cc }) => {
    const raw = localStorage.getItem('campusflow-auth')
    const parsed = raw ? JSON.parse(raw) : null
    const token = parsed?.state?.accessToken as string
    const headers = { Authorization: `Bearer ${token}` }

    async function findInPages<T extends { id: number }>(
      path: string,
      match: (row: T) => boolean,
    ): Promise<number | undefined> {
      for (let page = 0; page < 10; page++) {
        const body = await fetch(`${path}?page=${page}&size=50`, { headers }).then((r) => r.json())
        const hit = (body.content as T[] | undefined)?.find(match)
        if (hit) return hit.id
        if (body.last || !body.content?.length) break
      }
      return undefined
    }

    const studentId = await findInPages<{ id: number; email: string }>(
      '/api/v1/students',
      (s) => s.email === se,
    )
    const courseId = await findInPages<{ id: number; code: string }>(
      '/api/v1/courses',
      (c) => c.code === cc,
    )
    return { studentId, courseId }
  }, { studentEmail, courseCode })

  expect(ids.studentId, 'created student id').toBeTruthy()
  expect(ids.courseId, 'created course id').toBeTruthy()

  await page.getByTestId('nav-enrollments').click()
  await page.getByRole('button', { name: 'New enrollment' }).click()
  const newEnroll = page.getByRole('dialog')
  await newEnroll.locator('#studentId').selectOption(String(ids.studentId))
  await newEnroll.locator('#courseId').selectOption(String(ids.courseId))
  await newEnroll.getByRole('button', { name: 'Enroll', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const courseFilter = page.locator('#enrollment-course-filter')
  await expect(courseFilter.locator(`option[value="${ids.courseId}"]`)).toBeAttached({
    timeout: 25_000,
  })
  await courseFilter.selectOption(String(ids.courseId))
  await expect(page.getByRole('row').filter({ hasText: courseCode })).toBeVisible({ timeout: 20_000 })
  await signOut(page)

  // ── 9. Public register ───────────────────────────────────────
  await registerStudent(page, {
    email: `walk.reg.${stamp}@campus.edu`,
    password: 'Password123!',
    firstName: 'Walk',
    lastName: 'Reg',
  })
  await expectDashboardRole(page, 'STUDENT')
  await expect(page.getByTestId('nav-students')).toHaveCount(0)
  await signOut(page)

  // Landing / login visible at end of journey
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible()
})
