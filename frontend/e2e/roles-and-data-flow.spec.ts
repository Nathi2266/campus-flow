import { expect, test } from '@playwright/test'
import { expectDashboardRole, loginAs, registerStudent, signOut, USERS } from './helpers/auth'

test.describe.configure({ mode: 'serial' })

test.describe('CampusFlow E2E — all roles & data flow', () => {
  test('health: UI loads login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('CampusFlow').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('ADMIN: login seed user and walk primary nav', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password)
    await expectDashboardRole(page, 'ADMIN')
    await expect(page.getByRole('heading', { name: /Campus overview|Administrator/i })).toBeVisible()

    await page.getByTestId('nav-students').click()
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible()

    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    await page.getByTestId('nav-departments').click()
    await expect(page.getByRole('heading', { name: 'Departments' })).toBeVisible()

    await page.getByTestId('nav-users').click()
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()

    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()

    await page.getByTestId('nav-audit').click()
    await expect(page.getByRole('heading', { name: /Audit log/i })).toBeVisible()

    await page.getByTestId('nav-profile').click()
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
    await expect(page.getByText(USERS.admin.email)).toBeVisible()

    await page.getByTestId('nav-settings').click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByLabel('Dark mode')).toBeVisible()

    // Notifications inbox (Cycle 3) — visible for all roles
    await expect(page.getByTestId('nav-notifications')).toBeVisible()

    await signOut(page)
  })

  test('login page has no demo credential fillers', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByTestId('demo-login-panel')).toHaveCount(0)
    await expect(page.getByText(/Demo accounts/i)).toHaveCount(0)
    await expect(page.getByText('Admin123!')).toHaveCount(0)
  })

  test('ADMIN: create department and lecturer user', async ({ page }) => {
    const stamp = Date.now()
    const deptName = `E2E Dept ${stamp}`
    const lecturerEmail = `e2e.lecturer.${stamp}@campus.edu`

    await loginAs(page, USERS.admin.email, USERS.admin.password)

    await page.getByTestId('nav-departments').click()
    await page.getByRole('button', { name: 'Add department' }).click()
    await page.getByLabel('Name').fill(deptName)
    await page.getByLabel('Description').fill('Created by ADMIN E2E')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText(deptName)).toBeVisible({ timeout: 20_000 })

    await page.getByTestId('nav-users').click()
    await page.getByRole('button', { name: 'Add user' }).click()
    const userDialog = page.getByRole('dialog')
    await userDialog.getByLabel('First name').fill('E2E')
    await userDialog.getByLabel('Last name').fill('Lecturer')
    await userDialog.getByLabel('Email').fill(lecturerEmail)
    // Leave password blank → temporary invite password
    await userDialog.getByLabel('Role').selectOption('LECTURER')
    await userDialog.getByLabel('Department').selectOption({ label: deptName })
    await userDialog.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText(/User created/i).first()).toBeVisible({ timeout: 20_000 })

    const tempDialog = page.getByRole('alertdialog')
    await expect(tempDialog).toBeVisible({ timeout: 15_000 })
    await expect(tempDialog.getByText(/Temporary password/i)).toBeVisible()
    await expect(page.getByTestId('user-temp-password')).not.toBeEmpty()
    await tempDialog.getByRole('button', { name: 'Done' }).click()

    await page.getByTestId('user-search').fill(lecturerEmail)
    await expect(page.getByText(lecturerEmail)).toBeVisible({ timeout: 20_000 })
    await page.getByRole('button', { name: `Deactivate ${lecturerEmail}` }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Deactivate' }).click()
    await expect(page.getByText(/User deactivated/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Inactive').first()).toBeVisible()

    await page.getByTestId('nav-audit').click()
    await expect(page.getByRole('heading', { name: /Audit log/i })).toBeVisible()
    await expect(page.getByText(/entr/i).first()).toBeVisible({ timeout: 15_000 })

    await signOut(page)
  })

  test('ADMIN: deactivate then reactivate a course', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password)
    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

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
    await signOut(page)
  })

  test('ADMIN: reports department filter updates statistics', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password)
    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()
    await expect(page.getByText('Total students')).toBeVisible()

    const deptFilter = page.getByLabel(/Department/i)
    await expect(deptFilter).toBeVisible()
    await expect
      .poll(async () => deptFilter.locator('option').count(), { timeout: 20_000 })
      .toBeGreaterThan(1)
    await deptFilter.selectOption({ index: 1 })
    await expect(page.getByText('Total students')).toBeVisible()
    await expect(page.getByText('Total courses')).toBeVisible()

    const downloadPromise = page.waitForEvent('download', { timeout: 20_000 })
    await page.getByTestId('reports-export-csv').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/students-per-course\.csv/i)

    await signOut(page)
  })

  test('ADMIN: settings dark mode persists preference', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password)
    await page.getByTestId('nav-settings').click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

    const darkSwitch = page.locator('#color-mode')
    const switchControl = page.locator('label.chakra-switch').filter({ has: darkSwitch })
    const wasDark = await darkSwitch.isChecked()
    await switchControl.click()
    await expect(page.getByText(/Dark mode on|Light mode on/i).first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(darkSwitch).toBeChecked({ checked: !wasDark })

    const preferred = await page.evaluate(async () => {
      const raw = localStorage.getItem('campusflow-auth')
      const parsed = raw ? JSON.parse(raw) : null
      const token = parsed?.state?.accessToken as string
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      return body.preferredTheme as string
    })
    expect(preferred).toBe(wasDark ? 'light' : 'dark')

    // Restore original preference so later runs stay stable
    await switchControl.click()
    await expect(page.getByText(/Dark mode on|Light mode on/i).first()).toBeVisible({
      timeout: 15_000,
    })
    await signOut(page)
  })

  test('LECTURER: login and role-gated screens', async ({ page }) => {
    await loginAs(page, USERS.lecturer.email, USERS.lecturer.password)
    await expectDashboardRole(page, 'LECTURER')
    await expect(page.getByRole('heading', { name: /Teaching overview|Your courses|Lecturer/i })).toBeVisible()

    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()

    await expect(page.getByTestId('nav-students')).toBeVisible()
    await expect(page.getByTestId('nav-departments')).toHaveCount(0)
    await expect(page.getByTestId('nav-users')).toHaveCount(0)
    await signOut(page)
  })

  test('STUDENT: login and limited nav', async ({ page }) => {
    await loginAs(page, USERS.student.email, USERS.student.password)
    await expectDashboardRole(page, 'STUDENT')
    await expect(page.getByRole('heading', { name: /Hello|Student|Welcome/i })).toBeVisible()

    await expect(page.getByTestId('nav-students')).toHaveCount(0)
    await expect(page.getByTestId('nav-reports')).toHaveCount(0)
    await expect(page.getByTestId('nav-courses')).toBeVisible()

    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    await expect(page.getByTestId('nav-notifications')).toBeVisible()

    await page.getByTestId('nav-profile').click()
    await expect(page.getByText(USERS.student.email)).toBeVisible()
    await signOut(page)
  })

  test('STUDENT: API cannot enumerate peer students (IDOR)', async ({ page }) => {
    await loginAs(page, USERS.student.email, USERS.student.password)

    const result = await page.evaluate(async () => {
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
      const courseRoster = await fetch('/api/v1/enrollments/course/1?page=0&size=10', { headers })
      return {
        listStatus: listRes.status,
        total,
        peerStatus: peerRes.status,
        rosterStatus: courseRoster.status,
      }
    })

    expect(result.listStatus).toBe(200)
    expect(result.total).toBeLessThanOrEqual(1)
    expect(result.peerStatus).toBe(400)
    expect(result.rosterStatus).toBe(400)
    await signOut(page)
  })

  test('PROFILE: student can patch own name', async ({ page }) => {
    await loginAs(page, USERS.student.email, USERS.student.password)
    await page.getByTestId('nav-profile').click()
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

    const first = page.getByLabel('First name')
    await expect(first).toBeVisible()
    const current = await first.inputValue()
    const next = current.endsWith('X') ? current.slice(0, -1) || 'Alice' : `${current}X`
    await first.fill(next)
    await page.getByRole('button', { name: /Save|Update/i }).click()
    await expect(page.getByText(/updated|saved|success/i).first()).toBeVisible({ timeout: 15_000 })
    await first.fill(current)
    await page.getByRole('button', { name: /Save|Update/i }).click()
    await signOut(page)
  })

  test('DATA FLOW: admin seed → create student → create course → enroll', async ({ page }) => {
    const stamp = Date.now()
    const studentEmail = `e2e.student.${stamp}@campus.edu`
    const courseCode = `E2E${String(stamp).slice(-6)}`

    await loginAs(page, USERS.admin.email, USERS.admin.password)
    await expectDashboardRole(page, 'ADMIN')

    await page.getByTestId('nav-students').click()
    await page.getByRole('button', { name: 'Add student' }).click()
    const studentDialog = page.getByRole('dialog')
    await studentDialog.getByLabel('First name').fill('Flow')
    await studentDialog.getByLabel('Last name').fill('Student')
    await studentDialog.getByLabel('Email').fill(studentEmail)
    await studentDialog.locator('#departmentId').selectOption({ index: 1 })
    await studentDialog.getByRole('button', { name: 'Create' }).click()

    // Temporary password shown once (AlertDialog)
    const tempDialog = page.getByRole('alertdialog')
    await expect(tempDialog).toBeVisible({ timeout: 20_000 })
    await expect(tempDialog.getByText(/Temporary password/i)).toBeVisible()
    await tempDialog.getByRole('button', { name: 'Done' }).click()
    await expect(tempDialog).toHaveCount(0)
    await page.getByLabel('Search students').fill(studentEmail)
    await expect(page.getByText(studentEmail)).toBeVisible({ timeout: 25_000 })

    await page.getByTestId('nav-courses').click()
    await page.getByRole('button', { name: 'Add course' }).click()
    const courseDialog = page.getByRole('dialog')
    await courseDialog.getByLabel('Code').fill(courseCode)
    await courseDialog.getByLabel('Name').fill(`E2E Course ${stamp}`)
    await courseDialog.getByLabel('Credits').fill('3')
    await courseDialog.locator('#departmentId').selectOption({ index: 1 })
    await courseDialog.getByLabel('Max capacity').fill('25')
    await courseDialog.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText(/Course created|created/i).first()).toBeVisible({ timeout: 20_000 })

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
      return { studentId, courseId, token }
    }, { studentEmail, courseCode })

    expect(ids.studentId, 'created student id').toBeTruthy()
    expect(ids.courseId, 'created course id').toBeTruthy()

    await page.getByTestId('nav-enrollments').click()
    await page.getByRole('button', { name: 'New enrollment' }).click()
    const enrollDialog = page.getByRole('dialog')
    await enrollDialog.locator('#studentId').selectOption(String(ids.studentId))
    await enrollDialog.locator('#courseId').selectOption(String(ids.courseId))
    await enrollDialog.getByRole('button', { name: 'Enroll', exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)

    // Filter to the new course so the row is on the first page of a growing catalog
    const courseFilter = page.locator('#enrollment-course-filter')
    await expect(courseFilter.locator(`option[value="${ids.courseId}"]`)).toBeAttached({
      timeout: 25_000,
    })
    await courseFilter.selectOption(String(ids.courseId))
    await expect(page.getByRole('row').filter({ hasText: courseCode })).toBeVisible({ timeout: 20_000 })

    const enrolled = await page.evaluate(async ({ studentId, courseId }) => {
      const raw = localStorage.getItem('campusflow-auth')
      const parsed = raw ? JSON.parse(raw) : null
      const token = parsed?.state?.accessToken as string
      const res = await fetch(`/api/v1/enrollments?page=0&size=50&courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      const match = (body.content as Array<{ studentId: number; courseId: number }> | undefined)?.find(
        (e) => e.studentId === studentId && e.courseId === courseId,
      )
      return { status: res.status, found: Boolean(match) }
    }, { studentId: ids.studentId!, courseId: ids.courseId! })
    expect(enrolled.status).toBe(200)
    expect(enrolled.found).toBe(true)

    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()
    await expect(page.getByText('Total students')).toBeVisible()
  })

  test('LECTURER: enter grade on own-course enrollment', async ({ page }) => {
    await loginAs(page, USERS.lecturer.email, USERS.lecturer.password)
    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    // Prefer seeded roster; if empty, create enrollment via API for lecturer's course
    let gradeBtn = page.locator('button[aria-label^="Edit grade"]').first()
    if ((await gradeBtn.count()) === 0) {
      const setup = await page.evaluate(async () => {
        const raw = localStorage.getItem('campusflow-auth')
        const parsed = raw ? JSON.parse(raw) : null
        const token = parsed?.state?.accessToken as string
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        const courses = await fetch('/api/v1/courses?page=0&size=20', { headers }).then((r) => r.json())
        const courseId = courses.content?.[0]?.id as number | undefined
        const students = await fetch('/api/v1/students?page=0&size=5', { headers }).then((r) => r.json())
        const studentId = students.content?.[0]?.id as number | undefined
        if (!courseId || !studentId) return { ok: false as const }
        const enroll = await fetch('/api/v1/enrollments', {
          method: 'POST',
          headers,
          body: JSON.stringify({ studentId, courseId }),
        })
        return { ok: enroll.ok || enroll.status === 400 }
      })
      expect(setup.ok, 'lecturer can access course/student for grading setup').toBeTruthy()
      await page.reload()
      await page.getByTestId('nav-enrollments').click()
      gradeBtn = page.locator('button[aria-label^="Edit grade"]').first()
    }

    await expect(gradeBtn).toBeVisible({ timeout: 20_000 })
    await gradeBtn.click()
    await page.getByRole('textbox', { name: 'Grade' }).fill('A')
    await page.getByRole('button', { name: /Save grade/i }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('cell', { name: 'A', exact: true }).first()).toBeVisible({ timeout: 15_000 })
    await signOut(page)
  })

  test('STUDENT: self-enroll from enrollments page', async ({ page }) => {
    await loginAs(page, USERS.student.email, USERS.student.password)
    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    await page.getByRole('button', { name: /Self-enroll/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const courseSelect = dialog.getByLabel('Course')
    await expect
      .poll(async () => courseSelect.locator('option').count(), { timeout: 20_000 })
      .toBeGreaterThan(1)

    const optionCount = await courseSelect.locator('option').count()
    await courseSelect.selectOption({ index: optionCount - 1 })
    await dialog.getByRole('button', { name: 'Enroll', exact: true }).click()

    // Either enrolled (dialog closes) or business-rule toast while dialog may remain
    await Promise.race([
      expect(dialog).toHaveCount(0, { timeout: 20_000 }),
      expect(page.getByText(/already enrolled|maximum|full|Enrolled successfully/i).first()).toBeVisible({
        timeout: 20_000,
      }),
    ])

    if ((await dialog.count()) > 0) {
      await dialog.getByRole('button', { name: 'Cancel' }).click()
      await expect(dialog).toHaveCount(0)
    }
    await signOut(page)
  })

  test('STUDENT: public register creates STUDENT session', async ({ page }) => {
    const stamp = Date.now()
    await registerStudent(page, {
      email: `e2e.reg.${stamp}@campus.edu`,
      password: 'Password123!',
      firstName: 'Reg',
      lastName: 'Student',
    })
    await expectDashboardRole(page, 'STUDENT')
    await expect(page.getByTestId('nav-students')).toHaveCount(0)
    await signOut(page)
  })
})
