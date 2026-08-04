import { expect, test } from '@playwright/test'
import { loginAs, registerStudent, signOut, USERS } from './helpers/auth'

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
    await expect(page.getByText('ADMIN', { exact: true })).toBeVisible()
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

    await signOut(page)
  })

  test('LECTURER: login and role-gated screens', async ({ page }) => {
    await loginAs(page, USERS.lecturer.email, USERS.lecturer.password)
    await expect(page.getByText('LECTURER', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Your courses|Lecturer/i })).toBeVisible()

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
    await expect(page.getByText('STUDENT', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Hello|Student|Welcome/i })).toBeVisible()

    await expect(page.getByTestId('nav-students')).toHaveCount(0)
    await expect(page.getByTestId('nav-reports')).toHaveCount(0)
    await expect(page.getByTestId('nav-courses')).toBeVisible()

    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    await page.getByTestId('nav-notifications').click()
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()

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
    await expect(page.getByText('ADMIN', { exact: true })).toBeVisible()

    await page.getByTestId('nav-students').click()
    await page.getByRole('button', { name: 'Add student' }).click()
    await page.getByLabel('First name').fill('Flow')
    await page.getByLabel('Last name').fill('Student')
    await page.getByLabel('Email').fill(studentEmail)
    await page.getByLabel('Department').selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Create' }).click()

    // Temporary password shown once (AlertDialog)
    const tempDialog = page.getByRole('alertdialog')
    await expect(tempDialog).toBeVisible({ timeout: 20_000 })
    await expect(tempDialog.getByText(/Temporary password/i)).toBeVisible()
    await tempDialog.getByRole('button', { name: 'Done' }).click()
    await expect(tempDialog).toHaveCount(0)
    await expect(page.getByText(studentEmail)).toBeVisible({ timeout: 20_000 })

    await page.getByTestId('nav-courses').click()
    await page.getByRole('button', { name: 'Add course' }).click()
    await page.getByLabel('Code').fill(courseCode)
    await page.getByLabel('Name').fill(`E2E Course ${stamp}`)
    await page.getByLabel('Credits').fill('3')
    await page.getByLabel('Department').selectOption({ index: 1 })
    await page.getByLabel('Max capacity').fill('25')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText(courseCode)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('dialog')).toHaveCount(0)

    const ids = await page.evaluate(async ({ studentEmail: se, courseCode: cc }) => {
      const raw = localStorage.getItem('campusflow-auth')
      const parsed = raw ? JSON.parse(raw) : null
      const token = parsed?.state?.accessToken as string
      const headers = { Authorization: `Bearer ${token}` }

      const students = await fetch('/api/v1/students?page=0&size=100', { headers }).then((r) => r.json())
      const courses = await fetch('/api/v1/courses?page=0&size=100', { headers }).then((r) => r.json())
      const student = (students.content as Array<{ id: number; email: string }>).find((s) => s.email === se)
      const course = (courses.content as Array<{ id: number; code: string }>).find((c) => c.code === cc)
      return { studentId: student?.id, courseId: course?.id, token }
    }, { studentEmail, courseCode })

    expect(ids.studentId, 'created student id').toBeTruthy()
    expect(ids.courseId, 'created course id').toBeTruthy()

    await page.getByTestId('nav-enrollments').click()
    await page.getByRole('button', { name: 'New enrollment' }).click()
    await page.getByLabel('Student').selectOption(String(ids.studentId))
    await page.getByLabel('Course').selectOption(String(ids.courseId))
    await page.getByRole('button', { name: 'Enroll', exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('row').filter({ hasText: courseCode })).toBeVisible({ timeout: 20_000 })

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
    await expect(page.getByText('STUDENT', { exact: true })).toBeVisible()
    await expect(page.getByTestId('nav-students')).toHaveCount(0)
    await signOut(page)
  })
})
