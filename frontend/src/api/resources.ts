import { api } from '@/api/client'
import type {
  ActiveCourseReport,
  AuditLog,
  Course,
  Department,
  Enrollment,
  EnrollmentStatus,
  GraduationProgress,
  NotificationItem,
  PagedResponse,
  Statistics,
  Student,
  StudentsPerCourse,
  User,
  UserRole,
} from '@/types'

export async function listStudents(params?: Record<string, string | number | undefined>) {
  const { data } = await api.get<PagedResponse<Student>>('/students', { params })
  return data
}

export async function searchStudents(
  search: string,
  params?: Record<string, string | number | undefined>,
) {
  const { data } = await api.get<PagedResponse<Student>>('/students/search', {
    params: { search, ...params },
  })
  return data
}

export async function getStudent(id: number) {
  const { data } = await api.get<Student>(`/students/${id}`)
  return data
}

export async function createStudent(payload: {
  email: string
  firstName: string
  lastName: string
  departmentId: number
  phoneNumber?: string
}) {
  const { data } = await api.post<Student>('/students', payload)
  return data
}

export async function updateStudent(
  id: number,
  payload: {
    firstName: string
    lastName: string
    phoneNumber?: string
    academicStatus?: string
  },
) {
  const { data } = await api.put<Student>(`/students/${id}`, payload)
  return data
}

export async function deleteStudent(id: number) {
  await api.delete(`/students/${id}`)
}

export async function listCourses(params?: Record<string, string | number | boolean | undefined>) {
  const { data } = await api.get<PagedResponse<Course>>('/courses', { params })
  return data
}

export async function createCourse(payload: {
  code: string
  name: string
  description?: string
  credits: number
  departmentId: number
  lecturerId?: number
  maxCapacity: number
}) {
  const { data } = await api.post<Course>('/courses', payload)
  return data
}

export async function updateCourse(
  id: number,
  payload: {
    name: string
    description?: string
    credits?: number
    lecturerId?: number
    maxCapacity?: number
  },
) {
  const { data } = await api.put<Course>(`/courses/${id}`, payload)
  return data
}

export async function deleteCourse(id: number) {
  await api.delete(`/courses/${id}`)
}

export async function activateCourse(id: number) {
  const { data } = await api.post<Course>(`/courses/${id}/activate`)
  return data
}

export async function deactivateCourse(id: number) {
  const { data } = await api.post<Course>(`/courses/${id}/deactivate`)
  return data
}

export async function listEnrollments(params?: Record<string, string | number | undefined>) {
  const { data } = await api.get<PagedResponse<Enrollment>>('/enrollments', { params })
  return data
}

export async function createEnrollment(payload: { studentId?: number; courseId: number }) {
  const { data } = await api.post<Enrollment>('/enrollments', payload)
  return data
}

export async function updateEnrollmentGrade(
  id: number,
  payload: { grade: string; status?: EnrollmentStatus },
) {
  const { data } = await api.patch<Enrollment>(`/enrollments/${id}/grade`, payload)
  return data
}

export async function bulkUpdateEnrollmentGrades(
  grades: { enrollmentId: number; grade: string; status?: EnrollmentStatus }[],
) {
  const { data } = await api.patch<{
    updated: Enrollment[]
    errors: { enrollmentId: number; code: string; message: string }[]
    successCount: number
  }>('/enrollments/grades/bulk', { grades })
  return data
}

export async function dropEnrollment(id: number) {
  await api.delete(`/enrollments/${id}`)
}

export async function listCourseEnrollments(
  courseId: number,
  params?: Record<string, string | number | undefined>,
) {
  const { data } = await api.get<PagedResponse<Enrollment>>(`/enrollments/course/${courseId}`, {
    params,
  })
  return data
}

export async function listStudentCourses(
  studentId: number,
  params?: { activeOnly?: boolean },
) {
  const { data } = await api.get<PagedResponse<Enrollment>>(`/students/${studentId}/courses`, {
    params,
  })
  return data
}

export async function listDepartments() {
  const { data } = await api.get<Department[]>('/departments')
  return data
}

export async function createDepartment(payload: { name: string; description?: string }) {
  const { data } = await api.post<Department>('/departments', payload)
  return data
}

export async function updateDepartment(
  id: number,
  payload: { name: string; description?: string },
) {
  const { data } = await api.put<Department>(`/departments/${id}`, payload)
  return data
}

export async function deleteDepartment(id: number) {
  await api.delete(`/departments/${id}`)
}

export async function listUsers(params?: {
  page?: number
  size?: number
  role?: UserRole | string
}) {
  const { data } = await api.get<PagedResponse<User>>('/users', { params })
  return data
}

export async function searchUsers(
  search: string,
  params?: { page?: number; size?: number; role?: UserRole | string },
) {
  const { data } = await api.get<PagedResponse<User>>('/users/search', {
    params: { search, ...params },
  })
  return data
}

export async function createUser(payload: {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: UserRole | string
  departmentId?: number | null
  phoneNumber?: string
}) {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function updateUser(
  id: number,
  payload: { role?: UserRole | string; departmentId?: number | null },
) {
  const { data } = await api.patch<User>(`/users/${id}`, payload)
  return data
}

export async function deactivateUser(id: number) {
  const { data } = await api.post<User>(`/users/${id}/deactivate`)
  return data
}

export async function activateUser(id: number) {
  const { data } = await api.post<User>(`/users/${id}/activate`)
  return data
}

export async function exportStudentsPerCourseCsv(departmentId?: number) {
  const { data } = await api.get<Blob>('/reports/students-per-course/export', {
    params: departmentId != null ? { departmentId } : undefined,
    responseType: 'blob',
  })
  return data
}

export async function exportActiveCoursesCsv(departmentId?: number) {
  const { data } = await api.get<Blob>('/reports/active-courses/export', {
    params: departmentId != null ? { departmentId } : undefined,
    responseType: 'blob',
  })
  return data
}

export async function exportGraduationProgressCsv(departmentId?: number) {
  const { data } = await api.get<Blob>('/reports/graduation-progress/export', {
    params: departmentId != null ? { departmentId } : undefined,
    responseType: 'blob',
  })
  return data
}

export async function listNotifications(params?: { page?: number; size?: number }) {
  const { data } = await api.get<PagedResponse<NotificationItem>>('/notifications', { params })
  return data
}

export async function getUnreadNotificationCount() {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count')
  return data
}

export async function markNotificationRead(id: number) {
  const { data } = await api.patch<NotificationItem>(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  await api.post('/notifications/read-all')
}

export async function listAuditLogs(params?: { page?: number; size?: number }) {
  const { data } = await api.get<PagedResponse<AuditLog>>('/audit-logs', { params })
  return data
}

export async function getStatistics(departmentId?: number) {
  const { data } = await api.get<Statistics>('/reports/statistics', {
    params: departmentId != null ? { departmentId } : undefined,
  })
  return data
}

export async function getStudentsPerCourse(departmentId?: number) {
  const { data } = await api.get<StudentsPerCourse[]>('/reports/students-per-course', {
    params: departmentId != null ? { departmentId } : undefined,
  })
  return data
}

export async function getActiveCourses(departmentId?: number) {
  const { data } = await api.get<ActiveCourseReport[]>('/reports/active-courses', {
    params: departmentId != null ? { departmentId } : undefined,
  })
  return data
}

export async function getInactiveCourses(departmentId?: number) {
  const { data } = await api.get<Course[]>('/reports/inactive-courses', {
    params: departmentId != null ? { departmentId } : undefined,
  })
  return data
}

export async function getGraduationProgress(params?: { departmentId?: number; year?: number }) {
  const { data } = await api.get<GraduationProgress>('/reports/graduation-progress', { params })
  return data
}
