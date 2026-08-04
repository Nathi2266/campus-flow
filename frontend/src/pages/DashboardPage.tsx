import { useAuthStore } from '@/features/auth/authStore'
import { AdminDashboard } from '@/features/dashboards/AdminDashboard'
import { LecturerDashboard } from '@/features/dashboards/LecturerDashboard'
import { StudentDashboard } from '@/features/dashboards/StudentDashboard'

export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  if (role === 'ADMIN') return <AdminDashboard />
  if (role === 'LECTURER') return <LecturerDashboard />
  return <StudentDashboard />
}
