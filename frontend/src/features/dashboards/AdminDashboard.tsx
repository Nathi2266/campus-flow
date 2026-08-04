import {
  Avatar,
  Box,
  Flex,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  FiBook,
  FiCheckCircle,
  FiClipboard,
  FiGrid,
  FiLayers,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import {
  getGraduationProgress,
  getInactiveCourses,
  getStatistics,
  getStudentsPerCourse,
  listAuditLogs,
  listStudents,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { StatTile, SectionTitle } from '@/components/StatTile'
import { Surface, Stagger } from '@/components/ui'
import { AcademicStatusBadge } from '@/components/StatusBadge'
import { HorizontalBarList, ProgressMeter } from '@/components/dashboard/Charts'
import { DashboardQuickLinks, DashboardTwoCol } from '@/components/dashboard/QuickLinks'
import type { AcademicStatus } from '@/types'

export function AdminDashboard() {
  const stats = useQuery({ queryKey: ['reports', 'statistics'], queryFn: () => getStatistics() })
  const perCourse = useQuery({
    queryKey: ['reports', 'students-per-course', 'dash'],
    queryFn: () => getStudentsPerCourse(),
  })
  const graduation = useQuery({
    queryKey: ['reports', 'graduation-progress', 'dash'],
    queryFn: () => getGraduationProgress(),
  })
  const inactive = useQuery({
    queryKey: ['reports', 'inactive-courses', 'dash'],
    queryFn: () => getInactiveCourses(),
  })
  const students = useQuery({
    queryKey: ['students', 'dash'],
    queryFn: () => listStudents({ page: 0, size: 6 }),
  })
  const audit = useQuery({
    queryKey: ['audit-logs', 'dash'],
    queryFn: () => listAuditLogs({ page: 0, size: 6 }),
  })

  if (stats.isLoading) return <LoadingState />
  if (stats.isError) {
    return <ErrorState message={getErrorMessage(stats.error)} onRetry={() => stats.refetch()} />
  }

  const s = stats.data!
  const graduationPct = Number(s.graduationRate) * 100
  const activeShare =
    s.totalCourses > 0 ? Math.min(100, (s.activeCourses / s.totalCourses) * 100) : 0
  const inactiveCount = inactive.data?.length ?? 0
  const topCourses = [...(perCourse.data ?? [])]
    .sort((a, b) => b.enrolledStudents - a.enrolledStudents)
    .slice(0, 6)
  const grad = graduation.data
  const avgGpa = grad?.averageGpa != null ? Number(grad.averageGpa).toFixed(2) : '—'

  return (
    <>
      <PageHeader
        eyebrow="Administrator"
        title="Campus overview"
        description="Organisation-wide health: students, courses, enrollment pressure, and recent activity."
      />

      <Stagger>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing={5} mb={8}>
          <StatTile label="Students" value={s.totalStudents} icon={<FiUsers />} />
          <StatTile label="Courses" value={s.totalCourses} help={`${s.activeCourses} active`} icon={<FiBook />} />
          <StatTile label="Inactive courses" value={inactive.isLoading ? '…' : inactiveCount} icon={<FiBook />} accent="orange" />
          <StatTile label="Enrollments" value={s.totalEnrollments} icon={<FiLayers />} />
          <StatTile label="Departments" value={s.totalDepartments} icon={<FiGrid />} accent="blue" />
          <StatTile
            label="Graduation rate"
            value={`${graduationPct.toFixed(0)}%`}
            help={grad ? `${grad.graduatedStudents} graduated` : undefined}
            icon={<FiCheckCircle />}
            accent="green"
          />
        </SimpleGrid>
      </Stagger>

      <DashboardTwoCol>
        <Surface p={{ base: 5, md: 6 }}>
          <SectionTitle hint="Catalogue activation">Course activity</SectionTitle>
          <VStack align="stretch" spacing={6}>
            <ProgressMeter
              label="Active courses"
              valueLabel={`${s.activeCourses}/${s.totalCourses}`}
              percent={activeShare}
              hint={`${activeShare.toFixed(0)}% of the catalogue is active`}
            />
            <ProgressMeter
              label="Graduation rate"
              valueLabel={`${graduationPct.toFixed(1)}%`}
              percent={graduationPct}
              colorScheme="green"
              hint={
                grad
                  ? `${grad.graduatedStudents} graduated · ${grad.expectedGraduates} expected · avg GPA ${avgGpa}`
                  : 'From organisation statistics'
              }
            />
          </VStack>
        </Surface>

        <Surface p={{ base: 5, md: 6 }}>
          <SectionTitle hint="Highest enrollment pressure">Top courses by students</SectionTitle>
          {perCourse.isLoading ? <LoadingState label="Loading course pressure…" /> : null}
          {perCourse.isError ? (
            <Text color="app-muted" fontSize="sm">
              {getErrorMessage(perCourse.error)}
            </Text>
          ) : (
            <HorizontalBarList
              items={topCourses.map((c) => ({
                id: c.courseId,
                label: `${c.courseCode} · ${c.courseName}`,
                value: c.enrolledStudents,
              }))}
              emptyLabel="No enrollment data yet. Create courses and enrollments to see pressure here."
            />
          )}
        </Surface>
      </DashboardTwoCol>

      <DashboardTwoCol>
        <Surface p={{ base: 5, md: 6 }}>
          <Flex justify="space-between" align="baseline" mb={2} gap={3}>
            <SectionTitle hint="Latest directory records">Recent students</SectionTitle>
            <Text as={RouterLink} to="/students" fontSize="sm" fontWeight="600" color="brand.700">
              View all
            </Text>
          </Flex>
          {students.isLoading ? <LoadingState label="Loading students…" /> : null}
          {students.isError ? (
            <Text color="app-muted" fontSize="sm">
              {getErrorMessage(students.error)}
            </Text>
          ) : null}
          {students.data?.content?.length ? (
            <VStack align="stretch" spacing={0}>
              {students.data.content.map((student, index) => (
                <Flex
                  key={student.id}
                  justify="space-between"
                  align="center"
                  gap={4}
                  py={3}
                  borderTopWidth={index === 0 ? 0 : '1px'}
                  borderColor="app-border"
                >
                  <Flex align="center" gap={3} minW={0}>
                    <Avatar size="sm" name={`${student.firstName} ${student.lastName}`} bg="brand.500" />
                    <Box minW={0}>
                      <Text fontWeight="semibold" noOfLines={1}>
                        {student.firstName} {student.lastName}
                      </Text>
                      <Text fontSize="sm" color="app-muted" noOfLines={1}>
                        {student.email}
                      </Text>
                    </Box>
                  </Flex>
                  <VStack align="flex-end" spacing={1} flexShrink={0}>
                    <Text color="app-muted" fontSize="xs" fontFamily="mono">
                      {student.studentNumber}
                    </Text>
                    <AcademicStatusBadge status={student.academicStatus as AcademicStatus} />
                  </VStack>
                </Flex>
              ))}
            </VStack>
          ) : !students.isLoading && !students.isError ? (
            <Text color="app-muted" fontSize="sm">
              No students yet. Create students from Student Management.
            </Text>
          ) : null}
        </Surface>

        <Surface p={{ base: 5, md: 6 }}>
          <Flex justify="space-between" align="baseline" mb={2} gap={3}>
            <SectionTitle hint="Administrative actions">Recent audit</SectionTitle>
            <Text as={RouterLink} to="/audit" fontSize="sm" fontWeight="600" color="brand.700">
              Audit log
            </Text>
          </Flex>
          {audit.isLoading ? <LoadingState label="Loading audit…" /> : null}
          {audit.isError ? (
            <Text color="app-muted" fontSize="sm">
              {getErrorMessage(audit.error)}
            </Text>
          ) : null}
          {audit.data?.content?.length ? (
            <VStack align="stretch" spacing={0}>
              {audit.data.content.map((row, index) => (
                <Box
                  key={row.id}
                  py={3}
                  borderTopWidth={index === 0 ? 0 : '1px'}
                  borderColor="app-border"
                >
                  <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                    {row.action}
                  </Text>
                  <Text fontSize="xs" color="app-muted" mt={0.5}>
                    {row.userEmail ?? 'System'}
                    {row.entityType ? ` · ${row.entityType}` : ''}
                    {row.entityId != null ? ` #${row.entityId}` : ''}
                  </Text>
                  <Text fontSize="xs" color="app-muted" mt={0.5}>
                    {new Date(row.createdAt).toLocaleString()}
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : !audit.isLoading && !audit.isError ? (
            <Text color="app-muted" fontSize="sm">
              No audit events yet.
            </Text>
          ) : null}
        </Surface>
      </DashboardTwoCol>

      <DashboardQuickLinks
        links={[
          { to: '/students', label: 'Students', icon: <FiUsers /> },
          { to: '/courses', label: 'Courses', icon: <FiBook /> },
          { to: '/enrollments', label: 'Enrollments', icon: <FiClipboard /> },
          { to: '/departments', label: 'Departments', icon: <FiGrid /> },
          { to: '/reports', label: 'Reports', icon: <FiLayers /> },
          { to: '/audit', label: 'Audit', icon: <FiShield /> },
        ]}
      />
    </>
  )
}
