import {
  Box,
  Flex,
  HStack,
  IconButton,
  Progress,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FiBook, FiClipboard, FiLayers, FiUsers } from 'react-icons/fi'
import { getStatistics, listCourses, listEnrollments } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { CourseRosterDrawer } from '@/components/CourseRosterDrawer'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { StatTile, SectionTitle } from '@/components/StatTile'
import { Surface, Stagger, StaggerItem } from '@/components/ui'
import { ActiveBadge, CapacityBadge, EnrollmentStatusBadge } from '@/components/StatusBadge'
import { HorizontalBarList, ProgressMeter } from '@/components/dashboard/Charts'
import { DashboardQuickLinks, DashboardTwoCol } from '@/components/dashboard/QuickLinks'
import { capacityLevel } from '@/utils/capacity'
import type { Course } from '@/types'

export function LecturerDashboard() {
  const rosterDrawer = useDisclosure()
  const [rosterCourse, setRosterCourse] = useState<Course | null>(null)

  const courses = useQuery({
    queryKey: ['courses', 'lecturer-dash'],
    queryFn: () => listCourses({ page: 0, size: 20 }),
  })
  const enrollments = useQuery({
    queryKey: ['enrollments', 'lecturer-dash'],
    queryFn: () => listEnrollments({ page: 0, size: 8 }),
  })
  const stats = useQuery({
    queryKey: ['reports', 'statistics', 'lecturer-dash'],
    queryFn: () => getStatistics(),
  })

  if (courses.isLoading) return <LoadingState />
  if (courses.isError) {
    return <ErrorState message={getErrorMessage(courses.error)} onRetry={() => courses.refetch()} />
  }

  const list = courses.data?.content ?? []
  const activeCourses = list.filter((c) => c.active)
  const totalSeats = list.reduce((sum, c) => sum + (c.maxCapacity || 0), 0)
  const totalEnrolled = list.reduce((sum, c) => sum + (c.enrolledCount ?? 0), 0)
  const fillPct = totalSeats > 0 ? Math.min(100, (totalEnrolled / totalSeats) * 100) : 0
  const nearFull = list.filter((c) => capacityLevel(c.enrolledCount, c.maxCapacity) === 'near').length
  const full = list.filter((c) => capacityLevel(c.enrolledCount, c.maxCapacity) === 'full').length

  const capacityBars = [...list]
    .sort((a, b) => (b.enrolledCount ?? 0) / (b.maxCapacity || 1) - (a.enrolledCount ?? 0) / (a.maxCapacity || 1))
    .slice(0, 6)
    .map((c) => ({
      id: c.id,
      label: c.code,
      value: c.enrolledCount ?? 0,
      hint: `/ ${c.maxCapacity}`,
    }))

  return (
    <>
      <PageHeader
        eyebrow="Lecturer"
        title="Teaching overview"
        description="Your assigned courses, enrollment capacity, and recent roster activity."
      />

      <Stagger>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={5} mb={8}>
          <StatTile label="Your courses" value={list.length} help={`${activeCourses.length} active`} icon={<FiBook />} />
          <StatTile
            label="Seats filled"
            value={`${totalEnrolled}/${totalSeats || 0}`}
            help={`${fillPct.toFixed(0)}% capacity`}
            icon={<FiUsers />}
          />
          <StatTile label="Near full" value={nearFull} help={`${full} at capacity`} icon={<FiLayers />} accent="orange" />
          <StatTile
            label="Scoped enrollments"
            value={stats.data?.totalEnrollments ?? enrollments.data?.totalElements ?? '—'}
            help="From your course scope"
            icon={<FiClipboard />}
            accent="blue"
          />
        </SimpleGrid>
      </Stagger>

      {!list.length ? (
        <EmptyState title="No courses assigned" description="Courses assigned to you will appear here." />
      ) : (
        <>
          <DashboardTwoCol>
            <Surface p={{ base: 5, md: 6 }}>
              <SectionTitle hint="Across your teaching load">Capacity snapshot</SectionTitle>
              <VStack align="stretch" spacing={6}>
                <ProgressMeter
                  label="Overall fill"
                  valueLabel={`${fillPct.toFixed(0)}%`}
                  percent={fillPct}
                  colorScheme={fillPct >= 100 ? 'red' : fillPct >= 80 ? 'orange' : 'brand'}
                  hint={`${totalEnrolled} students across ${list.length} courses`}
                />
                <HorizontalBarList
                  items={capacityBars}
                  maxValue={Math.max(...list.map((c) => c.maxCapacity), 1)}
                  emptyLabel="No capacity data"
                />
              </VStack>
            </Surface>

            <Surface p={{ base: 5, md: 6 }}>
              <SectionTitle hint="Latest activity on your courses">Recent enrollments</SectionTitle>
              {enrollments.isLoading ? <LoadingState label="Loading enrollments…" /> : null}
              {enrollments.isError ? (
                <Text color="app-muted" fontSize="sm">
                  {getErrorMessage(enrollments.error)}
                </Text>
              ) : null}
              {enrollments.data?.content?.length ? (
                <VStack align="stretch" spacing={0}>
                  {enrollments.data.content.map((row, index) => (
                    <Flex
                      key={row.id}
                      justify="space-between"
                      align="center"
                      gap={3}
                      py={3}
                      borderTopWidth={index === 0 ? 0 : '1px'}
                      borderColor="app-border"
                    >
                      <Box minW={0}>
                        <Text fontWeight="600" noOfLines={1}>
                          {row.studentName}
                        </Text>
                        <Text fontSize="sm" color="app-muted" noOfLines={1}>
                          {row.courseCode} · {row.courseName}
                        </Text>
                      </Box>
                      <EnrollmentStatusBadge status={row.status} />
                    </Flex>
                  ))}
                </VStack>
              ) : !enrollments.isLoading && !enrollments.isError ? (
                <Text color="app-muted" fontSize="sm">
                  No enrollments on your courses yet.
                </Text>
              ) : null}
            </Surface>
          </DashboardTwoCol>

          <SectionTitle hint="Open a roster to review students and grades">Your courses</SectionTitle>
          <Stagger>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} mb={6}>
              {list.map((course) => {
                const enrolled = course.enrolledCount ?? 0
                const pct = course.maxCapacity ? Math.min(100, (enrolled / course.maxCapacity) * 100) : 0
                const level = capacityLevel(enrolled, course.maxCapacity)
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
                        <HStack>
                          <ActiveBadge active={course.active} />
                          <IconButton
                            aria-label={`View roster for ${course.code}`}
                            icon={<FiUsers />}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRosterCourse(course)
                              rosterDrawer.onOpen()
                            }}
                          />
                        </HStack>
                      </Flex>
                      <HStack mb={2} spacing={2} flexWrap="wrap">
                        <Text fontSize="sm" color="app-muted">
                          {course.credits} credits · {enrolled}/{course.maxCapacity} enrolled
                        </Text>
                        <CapacityBadge enrolled={enrolled} max={course.maxCapacity} />
                      </HStack>
                      {level === 'near' ? (
                        <Text fontSize="xs" color="orange.400" fontWeight="600" mb={2}>
                          Near full
                        </Text>
                      ) : null}
                      <Progress
                        value={pct}
                        size="sm"
                        colorScheme={pct >= 100 ? 'red' : pct >= 80 ? 'orange' : 'brand'}
                        borderRadius="full"
                        bg="progress-track"
                        aria-label={`${course.code} capacity ${pct.toFixed(0)} percent`}
                      />
                    </Surface>
                  </StaggerItem>
                )
              })}
            </SimpleGrid>
          </Stagger>
        </>
      )}

      <DashboardQuickLinks
        links={[
          { to: '/courses', label: 'Courses', icon: <FiBook /> },
          { to: '/enrollments', label: 'Enrollments', icon: <FiClipboard /> },
          { to: '/students', label: 'Students', icon: <FiUsers /> },
          { to: '/reports', label: 'Reports', icon: <FiLayers /> },
        ]}
      />

      <CourseRosterDrawer
        course={rosterCourse}
        isOpen={rosterDrawer.isOpen}
        onClose={() => {
          rosterDrawer.onClose()
          setRosterCourse(null)
        }}
      />
    </>
  )
}
