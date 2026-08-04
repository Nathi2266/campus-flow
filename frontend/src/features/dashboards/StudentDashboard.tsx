import {
  Box,
  Button,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import { FiAward, FiBook, FiCheckCircle, FiClipboard, FiLayers } from 'react-icons/fi'
import { getStudent, listCourses, listEnrollments } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { StatTile, SectionTitle } from '@/components/StatTile'
import { Surface, Stagger, StaggerItem } from '@/components/ui'
import { EnrollmentStatusBadge } from '@/components/StatusBadge'
import { SegmentLegend } from '@/components/dashboard/Charts'
import { DashboardQuickLinks, DashboardTwoCol } from '@/components/dashboard/QuickLinks'

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const studentId = user?.studentId ?? null

  const studentRecord = useQuery({
    queryKey: ['students', studentId],
    queryFn: () => getStudent(studentId!),
    enabled: studentId != null,
  })

  const enrollments = useQuery({
    queryKey: ['enrollments', 'student-dash'],
    queryFn: () => listEnrollments({ page: 0, size: 50 }),
  })

  const catalogue = useQuery({
    queryKey: ['courses', 'student-dash-active'],
    queryFn: () => listCourses({ page: 0, size: 4, active: true }),
  })

  if (enrollments.isLoading) return <LoadingState />
  if (enrollments.isError) {
    return (
      <ErrorState
        title="Enrollment list unavailable"
        message={getErrorMessage(enrollments.error)}
        onRetry={() => enrollments.refetch()}
      />
    )
  }

  const mine = enrollments.data?.content ?? []
  const gpa = studentRecord.data?.gpa
  const active = mine.filter((e) => e.status === 'ACTIVE').length
  const completed = mine.filter((e) => e.status === 'COMPLETED').length
  const dropped = mine.filter((e) => e.status === 'DROPPED').length
  const failed = mine.filter((e) => e.status === 'FAILED').length
  const graded = mine.filter((e) => e.grade != null && e.grade !== '').length
  const academicStatus = studentRecord.data?.academicStatus

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title={`Hello, ${user?.firstName ?? 'there'}`}
        description="Your academic snapshot: GPA, enrollments, grades, and courses you can explore."
      />

      <Stagger>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={5} mb={8}>
          <StatTile
            label="GPA"
            value={gpa != null ? Number(gpa).toFixed(2) : '—'}
            help={gpa != null ? 'Stored GPA (display)' : 'Not set yet'}
            icon={<FiAward />}
            accent="green"
          />
          <StatTile label="Active enrollments" value={active} icon={<FiLayers />} />
          <StatTile label="Completed" value={completed} icon={<FiCheckCircle />} accent="blue" />
          <StatTile
            label="Graded courses"
            value={`${graded}/${mine.length || 0}`}
            help={academicStatus ? `Status: ${academicStatus}` : undefined}
            icon={<FiClipboard />}
          />
        </SimpleGrid>
      </Stagger>

      <DashboardTwoCol>
        <Surface p={{ base: 5, md: 6 }}>
          <SectionTitle hint="Across your enrollment history">Enrollment status</SectionTitle>
          {mine.length ? (
            <SegmentLegend
              items={[
                { label: 'Active', value: active, color: 'var(--chakra-colors-green-400)' },
                { label: 'Completed', value: completed, color: 'var(--chakra-colors-blue-400)' },
                { label: 'Dropped', value: dropped, color: 'var(--chakra-colors-orange-400)' },
                { label: 'Failed', value: failed, color: 'var(--chakra-colors-red-400)' },
              ]}
            />
          ) : (
            <Text color="app-muted" fontSize="sm">
              Enroll in a course to see your status mix here.
            </Text>
          )}
        </Surface>

        <Surface p={{ base: 5, md: 6 }}>
          <Flex justify="space-between" align="baseline" mb={2} gap={3}>
            <SectionTitle hint="Active courses you can join">Catalogue teaser</SectionTitle>
            <Text as={RouterLink} to="/courses" fontSize="sm" fontWeight="600" color="brand.700">
              Browse
            </Text>
          </Flex>
          {catalogue.isLoading ? <LoadingState label="Loading catalogue…" /> : null}
          {catalogue.isError ? (
            <Text color="app-muted" fontSize="sm">
              {getErrorMessage(catalogue.error)}
            </Text>
          ) : null}
          {catalogue.data?.content?.length ? (
            <VStack align="stretch" spacing={0}>
              {catalogue.data.content.map((course, index) => (
                <Flex
                  key={course.id}
                  justify="space-between"
                  gap={3}
                  py={3}
                  borderTopWidth={index === 0 ? 0 : '1px'}
                  borderColor="app-border"
                >
                  <Box minW={0}>
                    <Text fontWeight="700" color="brand.700" fontSize="sm">
                      {course.code}
                    </Text>
                    <Text fontSize="sm" noOfLines={1}>
                      {course.name}
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="app-muted" flexShrink={0}>
                    {course.credits} cr
                  </Text>
                </Flex>
              ))}
            </VStack>
          ) : !catalogue.isLoading && !catalogue.isError ? (
            <Text color="app-muted" fontSize="sm">
              No active courses in the catalogue yet.
            </Text>
          ) : null}
        </Surface>
      </DashboardTwoCol>

      {!mine.length ? (
        <EmptyState
          title="No enrollments yet"
          description="Browse the course catalogue, then self-enroll from Enrollments."
          action={
            <HStack>
              <Button as={RouterLink} to="/courses" variant="outline">
                Browse courses
              </Button>
              <Button as={RouterLink} to="/enrollments">
                Go to enrollments
              </Button>
            </HStack>
          }
        />
      ) : (
        <>
          <Flex justify="space-between" align="baseline" mb={2} gap={3}>
            <SectionTitle hint="Your courses and grades">My enrollments</SectionTitle>
            <Text as={RouterLink} to="/enrollments" fontSize="sm" fontWeight="600" color="brand.700">
              Manage
            </Text>
          </Flex>
          <Stagger>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} mb={6}>
              {mine.slice(0, 9).map((item) => (
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
                    <Text mt={4} fontSize="sm" color="app-text">
                      Grade: {item.grade ?? 'Not graded'}
                    </Text>
                    <Text mt={1} fontSize="sm" color="app-muted">
                      Enrolled {new Date(item.enrollmentDate).toLocaleDateString()}
                    </Text>
                  </Surface>
                </StaggerItem>
              ))}
            </SimpleGrid>
          </Stagger>
        </>
      )}

      <DashboardQuickLinks
        links={[
          { to: '/courses', label: 'Course catalogue', icon: <FiBook /> },
          { to: '/enrollments', label: 'My enrollments', icon: <FiClipboard /> },
          { to: '/profile', label: 'Profile', icon: <FiAward /> },
        ]}
      />
    </>
  )
}
