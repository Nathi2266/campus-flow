export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT'

export type AcademicStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED'

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'FAILED'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  departmentId: number | null
  phoneNumber: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: string
  user: User
}

export interface PagedResponse<T> {
  content: T[]
  page?: number
  size?: number
  totalElements: number
  totalPages?: number
}

export interface Student {
  id: number
  userId: number
  studentNumber: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  departmentId: number
  departmentName: string | null
  enrollmentDate: string
  academicStatus: AcademicStatus
  gpa: number | null
  graduationDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  code: string
  name: string
  description: string | null
  credits: number
  departmentId: number
  departmentName: string | null
  lecturerId: number | null
  lecturerName: string | null
  maxCapacity: number
  enrolledCount: number | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseCode: string
  courseName: string
  enrollmentDate: string
  status: EnrollmentStatus
  grade: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Statistics {
  totalStudents: number
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  totalDepartments: number
  graduationRate: number
}

export interface ApiErrorBody {
  status?: number
  error?: string
  message?: string
  path?: string
  timestamp?: string
  errorCode?: string
}
