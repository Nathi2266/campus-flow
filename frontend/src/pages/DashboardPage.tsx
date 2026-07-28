import {
  Avatar,
  Box,
  Flex,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { FiBook, FiCheckCircle, FiLayers, FiUsers } from 'react-icons/fi'
import { getStatistics, listCourses, listEnrollments, listStudents } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { StatTile, SectionTitle } from '@/components/StatTile'
import { Surface, Stagger, StaggerItem } from '@/components/ui'
import { ActiveBadge, EnrollmentStatusBadge } from '@/components/StatusBadge'

function AdminDashboard() {
  const stats = useQuery({ queryKey: ['reports', 'statistics'], queryFn: getStatistics })
  const students = useQuery({
    queryKey: ['students', 'dash'],
    queryFn: () => listStudents({ page: 0, size: 5 }),
  })

  if (stats.isLoading) return <LoadingState />
  if (stats.isError) {
    return <ErrorState message={getErrorMessage(stats.error)} onRetry={() => stats.refetch()} />
  }

  const s = stats.data!

  return (
    <>
      <PageHeader
        eyebrow="Administrator"
        title="Campus overview"
        description="Organisation-wide student and course health at a glance."
      />
      <Stagger>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 5 }} spacing={5} mb={8}>
          <StatTile label="Students" value={s.totalStudents} icon={<FiUsers />} />
          <StatTile label="Courses" value={s.totalCourses} help={`${s.activeCourses} active`} icon={<FiBook />} />
          <StatTile label="Enrollments" value={s.totalEnrollments} icon={<FiLayers />} />
          <StatTile label="Departments" value={s.totalDepartments} icon={<FiCheckCircle />} accent="blue" />
          <StatTile
            label="Graduation rate"
            value={`${(Number(s.graduationRate) * 100).toFixed(0)}%`}
            icon={<FiCheckCircle />}
            accent="green"
          />
        </SimpleGrid>
      </Stagger>
      <Surface p={{ base: 6, md: 8 }}>
        <SectionTitle hint="Latest records from student management">Recent students</SectionTitle>
        {students.isLoading ? <LoadingState label="Loading students…" /> : null}
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
                borderColor="gray.100"
              >
                <HStackLike student={student} />
                <Text color="gray.500" fontSize="sm" fontFamily="mono">
                  {student.studentNumber}
                </Text>
              </Flex>
            ))}
          </VStack>
        ) : !students.isLoading ? (
          <Text color="gray.500">No students yet. Create students from Student Management.</Text>
        ) : null}
      </Surface>
    </>
  )
}

function HStackLike({
  student,
}: {
  student: { firstName: string; lastName: string; email: string; academicStatus: string }
}) {
  return (
    <Flex align="center" gap={3} minW={0}>
      <Avatar size="sm" name={`${student.firstName} ${student.lastName}`} bg="brand.500" />
      <Box minW={0}>
        <Text fontWeight="semibold" noOfLines={1}>
          {student.firstName} {student.lastName}
        </Text>
        <Text fontSize="sm" color="gray.500" noOfLines={1}>
          {student.email}
        </Text>
      </Box>
    </Flex>
  )
}

function LecturerDashboard() {
  const courses = useQuery({
    queryKey: ['courses', 'lecturer-dash'],
    queryFn: () => listCourses({ page: 0, size: 10, active: true }),
  })

  if (courses.isLoading) return <LoadingState />
  if (courses.isError) {
    return <ErrorState message={getErrorMessage(courses.error)} onRetry={() => courses.refetch()} />
  }

  const list = courses.data?.content ?? []

  return (
    <>
      <PageHeader
        eyebrow="Lecturer"
        title="Your courses"
        description="Active courses and enrollment capacity."
      />
      {!list.length ? (
        <EmptyState title="No active courses" description="Courses assigned to you will appear here." />
      ) : (
        <Stagger>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {list.map((course) => {
              const enrolled = course.enrolledCount ?? 0
              const pct = course.maxCapacity ? Math.min(100, (enrolled / course.maxCapacity) * 100) : 0
              return (
                <StaggerItem key={course.id}>
                  <Surface p={{ base: 5, md: 6 }} interactive h="full">
                    <Flex justify="space-between" align="flex-start" gap={3} mb={3}>
                      <Box>
                        <Text fontSize="sm" fontWeight="700" color="brand.600" letterSpacing="0.04em">
                          {course.code}
                        </Text>
                        <Text fontFamily="heading" fontSize="xl" fontWeight="600" mt={1} letterSpacing="-0.02em">
                          {course.name}
                        </Text>
                      </Box>
                      <ActiveBadge active={course.active} />
                    </Flex>
                    <Text fontSize="sm" color="gray.500" mb={4}>
                      {course.credits} credits · {enrolled}/{course.maxCapacity} enrolled
                    </Text>
                    <Progress value={pct} size="sm" colorScheme="brand" borderRadius="full" bg="canvas.200" />
                  </Surface>
                </StaggerItem>
              )
            })}
          </SimpleGrid>
        </Stagger>
      )}
    </>
  )
}

function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const enrollments = useQuery({
    queryKey: ['enrollments', 'student-dash'],
    queryFn: () => listEnrollments({ page: 0, size: 20 }),
  })

  if (enrollments.isLoading) return <LoadingState />
  if (enrollments.isError) {
    return (
      <ErrorState
        title="Enrollment list unavailable"
        message={getErrorMessage(enrollments.error, 'The enrollments list endpoint may still be a stub.')}
        onRetry={() => enrollments.refetch()}
      />
    )
  }

  const mine = enrollments.data?.content ?? []

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title={`Hello, ${user?.firstName ?? 'there'}`}
        description="Your current course enrollments."
      />
      {!mine.length ? (
        <EmptyState title="No enrollments" description="Ask an administrator to enroll you in courses." />
      ) : (
        <Stagger>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {mine.slice(0, 8).map((item) => (
              <StaggerItem key={item.id}>
                <Surface p={{ base: 5, md: 6 }} interactive h="full">
                  <Flex justify="space-between" align="flex-start" gap={3}>
                    <Box>
                      <Text fontWeight="700" color="brand.700">
                        {item.courseCode}
                      </Text>
                      <Text fontFamily="heading" fontSize="lg" mt={1} fontWeight="600" letterSpacing="-0.02em">
                        {item.courseName}
                      </Text>
                    </Box>
                    <EnrollmentStatusBadge status={item.status} />
                  </Flex>
                  {item.grade ? (
                    <Text mt={4} fontSize="sm" color="gray.500">
                      Grade: {item.grade}
                    </Text>
                  ) : null}
                </Surface>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </Stagger>
      )}
    </>
  )
}

export function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  if (role === 'ADMIN') return <AdminDashboard />
  if (role === 'LECTURER') return <LecturerDashboard />
  return <StudentDashboard />
}
