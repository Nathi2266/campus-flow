import { api } from '@/api/client'
import type { Course, Enrollment, PagedResponse, Statistics, Student } from '@/types'

export async function listStudents(params?: Record<string, string | number | undefined>) {
  const { data } = await api.get<PagedResponse<Student>>('/students', { params })
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

export async function createEnrollment(payload: { studentId: number; courseId: number }) {
  const { data } = await api.post<Enrollment>('/enrollments', payload)
  return data
}

export async function dropEnrollment(id: number) {
  await api.delete(`/enrollments/${id}`)
}

export async function getStatistics() {
  const { data } = await api.get<Statistics>('/reports/statistics')
  return data
}
