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
  studentId?: number | null
  /** Persisted UI theme: light or dark */
  preferredTheme?: 'light' | 'dark' | string | null
  /** Soft account status — inactive users cannot sign in */
  active?: boolean | null
  /** When false, in-app notifications are not delivered */
  notifyInApp?: boolean | null
  /** One-time password returned only on create when server-generated */
  temporaryPassword?: string | null
}

export interface NotificationItem {
  id: number
  type: string
  title: string
  body: string | null
  entityType: string | null
  entityId: number | null
  readAt: string | null
  createdAt: string
  unread: boolean
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
  /** Present once on create when the API generated a password (ADMIN only). */
  temporaryPassword?: string | null
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

export interface Department {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export interface AuditLog {
  id: number
  userId: number | null
  userEmail: string | null
  action: string
  entityType: string | null
  entityId: number | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface StudentsPerCourse {
  courseId: number
  courseCode: string
  courseName: string
  enrolledStudents: number
}

export interface ActiveCourseReport {
  courseId: number
  courseCode: string
  courseName: string
  enrolledCount: number
  maxCapacity: number
}

export interface GraduationProgress {
  totalStudents: number
  graduatedStudents: number
  expectedGraduates: number
  graduationRate: number
  averageGpa: number | null
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
