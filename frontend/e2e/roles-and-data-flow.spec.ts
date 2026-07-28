import { expect, test } from '@playwright/test'
import { loginAs, registerUser, signOut, USERS } from './helpers/auth'

test.describe.configure({ mode: 'serial' })

test.describe('CampusFlow E2E — all roles & data flow', () => {
  test('health: UI loads login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'CampusFlow' })).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('ADMIN: login seed user and walk primary nav', async ({ page }) => {
    await loginAs(page, USERS.admin.email, USERS.admin.password)
    await expect(page.getByText('ADMIN')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Campus overview|Administrator/i })).toBeVisible()

    await page.getByTestId('nav-students').click()
    await expect(page.getByRole('heading', { name: 'Students' })).toBeVisible()

    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()

    await page.getByTestId('nav-profile').click()
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
    await expect(page.getByText(USERS.admin.email)).toBeVisible()

    await signOut(page)
  })

  test('LECTURER: login and role-gated screens', async ({ page }) => {
    await loginAs(page, USERS.lecturer.email, USERS.lecturer.password)
    await expect(page.getByText('LECTURER')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Your courses|Lecturer/i })).toBeVisible()

    await page.getByTestId('nav-courses').click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()

    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()

    await expect(page.getByTestId('nav-students')).toBeVisible()
    await signOut(page)
  })

  test('STUDENT: login and limited nav', async ({ page }) => {
    await loginAs(page, USERS.student.email, USERS.student.password)
    await expect(page.getByText('STUDENT')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Hello|Student|Welcome/i })).toBeVisible()

    await expect(page.getByTestId('nav-students')).toHaveCount(0)
    await expect(page.getByTestId('nav-courses')).toHaveCount(0)
    await expect(page.getByTestId('nav-reports')).toHaveCount(0)

    await page.getByTestId('nav-enrollments').click()
    await expect(page.getByRole('heading', { name: 'Enrollments' })).toBeVisible()

    await page.getByTestId('nav-notifications').click()
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()

    await page.getByTestId('nav-profile').click()
    await expect(page.getByText(USERS.student.email)).toBeVisible()
    await signOut(page)
  })

  test('DATA FLOW: register admin → create student → create course → enroll', async ({ page }) => {
    const stamp = Date.now()
    const adminEmail = `e2e.admin.${stamp}@campus.edu`
    const studentEmail = `e2e.student.${stamp}@campus.edu`
    const courseCode = `E2E${String(stamp).slice(-6)}`

    await registerUser(page, {
      email: adminEmail,
      password: 'Password123!',
      firstName: 'Flow',
      lastName: 'Admin',
      role: 'ADMIN',
      departmentId: '1',
    })
    await expect(page.getByText('ADMIN')).toBeVisible()

    // Create student
    await page.getByTestId('nav-students').click()
    await page.getByRole('button', { name: 'Add student' }).click()
    await page.getByLabel('First name').fill('Flow')
    await page.getByLabel('Last name').fill('Student')
    await page.getByLabel('Email').fill(studentEmail)
    await page.getByLabel('Department ID').fill('1')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText(studentEmail)).toBeVisible({ timeout: 20_000 })

    // Create course
    await page.getByTestId('nav-courses').click()
    await page.getByRole('button', { name: 'Add course' }).click()
    await page.getByLabel('Code').fill(courseCode)
    await page.getByLabel('Name').fill(`E2E Course ${stamp}`)
    await page.getByLabel('Credits').fill('3')
    await page.getByLabel('Department ID').fill('1')
    await page.getByLabel('Max capacity').fill('25')
    await page.getByRole('button', { name: 'Create' }).click()
    await expect(page.getByText(courseCode)).toBeVisible({ timeout: 20_000 })

    // Resolve IDs via API using token from localStorage
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

    // Enroll via UI
    await page.getByTestId('nav-enrollments').click()
    await page.getByRole('button', { name: 'New enrollment' }).click()
    await page.getByLabel('Student ID').fill(String(ids.studentId))
    await page.getByLabel('Course ID').fill(String(ids.courseId))
    await page.getByRole('button', { name: 'Enroll' }).click()
    await expect(page.getByText(courseCode)).toBeVisible({ timeout: 20_000 })

    // Reports still load after mutations
    await page.getByTestId('nav-reports').click()
    await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible()
    await expect(page.getByText('Total students')).toBeVisible()
  })
})
