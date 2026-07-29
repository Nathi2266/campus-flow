import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/feedback'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const StudentsPage = lazy(() =>
  import('@/pages/StudentsPage').then((m) => ({ default: m.StudentsPage })),
)
const CoursesPage = lazy(() =>
  import('@/pages/CoursesPage').then((m) => ({ default: m.CoursesPage })),
)
const EnrollmentsPage = lazy(() =>
  import('@/pages/EnrollmentsPage').then((m) => ({ default: m.EnrollmentsPage })),
)
const ReportsPage = lazy(() =>
  import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
const DepartmentsPage = lazy(() =>
  import('@/pages/DepartmentsPage').then((m) => ({ default: m.DepartmentsPage })),
)
const UsersPage = lazy(() => import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })))
const AuditPage = lazy(() => import('@/pages/AuditPage').then((m) => ({ default: m.AuditPage })))
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <Lazy>
                  <LoginPage />
                </Lazy>
              }
            />
            <Route
              path="/register"
              element={
                <Lazy>
                  <RegisterPage />
                </Lazy>
              }
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                index
                element={
                  <Lazy>
                    <DashboardPage />
                  </Lazy>
                }
              />
              <Route
                path="courses"
                element={
                  <Lazy>
                    <CoursesPage />
                  </Lazy>
                }
              />
              <Route
                path="enrollments"
                element={
                  <Lazy>
                    <EnrollmentsPage />
                  </Lazy>
                }
              />
              <Route element={<ProtectedRoute roles={['ADMIN', 'LECTURER']} />}>
                <Route
                  path="students"
                  element={
                    <Lazy>
                      <StudentsPage />
                    </Lazy>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <Lazy>
                      <ReportsPage />
                    </Lazy>
                  }
                />
              </Route>
              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route
                  path="departments"
                  element={
                    <Lazy>
                      <DepartmentsPage />
                    </Lazy>
                  }
                />
                <Route
                  path="users"
                  element={
                    <Lazy>
                      <UsersPage />
                    </Lazy>
                  }
                />
                <Route
                  path="audit"
                  element={
                    <Lazy>
                      <AuditPage />
                    </Lazy>
                  }
                />
              </Route>
              <Route
                path="notifications"
                element={
                  <Lazy>
                    <NotificationsPage />
                  </Lazy>
                }
              />
              <Route
                path="profile"
                element={
                  <Lazy>
                    <ProfilePage />
                  </Lazy>
                }
              />
              <Route
                path="settings"
                element={
                  <Lazy>
                    <SettingsPage />
                  </Lazy>
                }
              />
            </Route>
          </Route>

          <Route
            path="/404"
            element={
              <Lazy>
                <NotFoundPage />
              </Lazy>
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
