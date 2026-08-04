import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Progress,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { FiAward, FiBook, FiDownload, FiLayers, FiUsers } from 'react-icons/fi'
import {
  exportActiveCoursesCsv,
  exportGraduationProgressCsv,
  exportStudentsPerCourseCsv,
  getActiveCourses,
  getGraduationProgress,
  getInactiveCourses,
  getStatistics,
  getStudentsPerCourse,
  listDepartments,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { StatTile, SectionTitle } from '@/components/StatTile'
import { Stagger, Surface } from '@/components/ui'
import { DataTableShell } from '@/components/DataTableShell'
import { useAuthStore } from '@/features/auth/authStore'

export function ReportsPage() {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const isLecturer = useAuthStore((s) => s.hasRole('LECTURER'))
  const toast = useToast()
  const [departmentId, setDepartmentId] = useState('')
  const [exporting, setExporting] = useState<string | null>(null)
  const deptId = isAdmin && departmentId ? Number(departmentId) : undefined
  const deptKey = deptId ?? null

  async function downloadCsv(
    key: string,
    filename: string,
    fetcher: () => Promise<Blob>,
  ) {
    setExporting(key)
    try {
      const blob = await fetcher()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
      toast({ title: 'CSV downloaded', status: 'success', duration: 2200 })
    } catch (error) {
      toast({ title: getErrorMessage(error, 'Export failed'), status: 'error' })
    } finally {
      setExporting(null)
    }
  }

  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
    enabled: isAdmin,
  })

  const stats = useQuery({
    queryKey: ['reports', 'statistics', deptKey],
    queryFn: () => getStatistics(deptId),
  })
  const perCourse = useQuery({
    queryKey: ['reports', 'students-per-course', deptKey],
    queryFn: () => getStudentsPerCourse(deptId),
  })
  const activeCourses = useQuery({
    queryKey: ['reports', 'active-courses', deptKey],
    queryFn: () => getActiveCourses(deptId),
  })
  const inactiveCourses = useQuery({
    queryKey: ['reports', 'inactive-courses', deptKey],
    queryFn: () => getInactiveCourses(deptId),
  })
  const graduation = useQuery({
    queryKey: ['reports', 'graduation-progress', deptKey],
    queryFn: () => getGraduationProgress(deptId != null ? { departmentId: deptId } : undefined),
  })

  const graduationPct = stats.data ? Number(stats.data.graduationRate) * 100 : 0
  const activeShare =
    stats.data && stats.data.totalCourses > 0
      ? Math.min(100, (stats.data.activeCourses / stats.data.totalCourses) * 100)
      : 0
  const graduationReportPct = graduation.data
    ? Number(graduation.data.graduationRate) * 100
    : graduationPct

  const anyLoading =
    stats.isLoading ||
    perCourse.isLoading ||
    activeCourses.isLoading ||
    inactiveCourses.isLoading ||
    graduation.isLoading

  const primaryError =
    stats.error || perCourse.error || activeCourses.error || inactiveCourses.error || graduation.error

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description={
          isLecturer
            ? 'Metrics scoped to your courses.'
            : 'Campus analytics: statistics, enrollment pressure, and graduation progress.'
        }
        actions={
          <HStack spacing={3} flexWrap="wrap">
            {isAdmin ? (
              <FormControl maxW="240px">
                <FormLabel htmlFor="reports-department-filter" mb={1} fontSize="sm">
                  Department
                </FormLabel>
                <Select
                  id="reports-department-filter"
                  size="sm"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">All departments</option>
                  {(departments.data ?? []).map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            <Button
              leftIcon={<FiDownload />}
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv('spc', 'students-per-course.csv', () =>
                  exportStudentsPerCourseCsv(deptId),
                )
              }
              isLoading={exporting === 'spc'}
              data-testid="reports-export-csv"
            >
              Students / course
            </Button>
            <Button
              leftIcon={<FiDownload />}
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv('active', 'active-courses.csv', () => exportActiveCoursesCsv(deptId))
              }
              isLoading={exporting === 'active'}
              data-testid="reports-export-active-csv"
            >
              Active courses
            </Button>
            <Button
              leftIcon={<FiDownload />}
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv('grad', 'graduation-progress.csv', () =>
                  exportGraduationProgressCsv(deptId),
                )
              }
              isLoading={exporting === 'grad'}
              data-testid="reports-export-graduation-csv"
            >
              Graduation
            </Button>
          </HStack>
        }
      />
      {isLecturer ? (
        <Text fontSize="sm" color="app-muted" mb={6}>
          Showing metrics for your courses
        </Text>
      ) : null}
      {anyLoading && !stats.data ? <LoadingState /> : null}
      {stats.isError && !stats.data ? (
        <ErrorState message={getErrorMessage(primaryError)} onRetry={() => stats.refetch()} />
      ) : null}
      {stats.data ? (
        <>
          <Stagger>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} mb={8}>
              <StatTile label="Total students" value={stats.data.totalStudents} icon={<FiUsers />} />
              <StatTile
                label="Total courses"
                value={stats.data.totalCourses}
                help={`${stats.data.activeCourses} active`}
                icon={<FiBook />}
              />
              <StatTile label="Enrollments" value={stats.data.totalEnrollments} icon={<FiLayers />} />
              <StatTile label="Departments" value={stats.data.totalDepartments} icon={<FiLayers />} accent="blue" />
              <StatTile
                label="Graduation rate"
                value={`${graduationPct.toFixed(1)}%`}
                icon={<FiAward />}
                accent="green"
              />
            </SimpleGrid>
          </Stagger>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
            <Surface p={{ base: 6, md: 8 }}>
              <SectionTitle hint="Share of catalogue marked active">Active courses</SectionTitle>
              <Flex justify="space-between" align="baseline" mb={3}>
                <Text fontFamily="heading" fontSize="3xl" fontWeight="700" letterSpacing="-0.03em">
                  {stats.data.activeCourses}
                </Text>
                <Text fontSize="sm" color="app-muted" fontWeight="medium">
                  of {stats.data.totalCourses} total
                </Text>
              </Flex>
              <Progress
                value={activeShare}
                size="md"
                colorScheme="brand"
                borderRadius="full"
                bg="progress-track"
                aria-label={`Active courses ${activeShare.toFixed(0)} percent`}
              />
            </Surface>

            <Surface p={{ base: 6, md: 8 }}>
              <SectionTitle hint="Organisation graduation metric">Graduation progress</SectionTitle>
              <Flex justify="space-between" align="baseline" mb={3}>
                <Text fontFamily="heading" fontSize="3xl" fontWeight="700" letterSpacing="-0.03em">
                  {graduationReportPct.toFixed(1)}%
                </Text>
                <Text fontSize="sm" color="app-muted" fontWeight="medium">
                  {graduation.data
                    ? `${graduation.data.graduatedStudents} of ${graduation.data.totalStudents} students`
                    : 'reported rate'}
                </Text>
              </Flex>
              <Progress
                value={Math.min(100, graduationReportPct)}
                size="md"
                colorScheme="green"
                borderRadius="full"
                bg="progress-track"
                aria-label={`Graduation rate ${graduationReportPct.toFixed(1)} percent`}
              />
              {graduation.data?.averageGpa != null ? (
                <Text mt={3} fontSize="sm" color="app-muted">
                  Average GPA: {Number(graduation.data.averageGpa).toFixed(2)} · Expected graduates:{' '}
                  {graduation.data.expectedGraduates}
                </Text>
              ) : null}
            </Surface>
          </SimpleGrid>
        </>
      ) : null}

      <VStack align="stretch" spacing={8}>
        <DataTableShell
          toolbar={
            <Text fontSize="sm" fontWeight="600" color="app-text">
              Students per course
            </Text>
          }
        >
          {perCourse.isLoading ? <LoadingState label="Loading students per course…" /> : null}
          {perCourse.isError ? (
            <ErrorState message={getErrorMessage(perCourse.error)} onRetry={() => perCourse.refetch()} />
          ) : null}
          {perCourse.data && !perCourse.data.length ? (
            <EmptyState title="No enrollment data" description="Students-per-course will appear when enrollments exist." />
          ) : null}
          {perCourse.data && perCourse.data.length > 0 ? (
            <Table variant="simple">
              <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
                Enrolled students by course
              </caption>
              <Thead>
                <Tr>
                  <Th scope="col">Code</Th>
                  <Th scope="col">Course</Th>
                  <Th scope="col" isNumeric>
                    Enrolled
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {perCourse.data.map((row) => (
                  <Tr key={row.courseId}>
                    <Td fontWeight="bold" color="brand.700">
                      {row.courseCode}
                    </Td>
                    <Td>{row.courseName}</Td>
                    <Td isNumeric>{row.enrolledStudents}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : null}
        </DataTableShell>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <DataTableShell
            toolbar={
              <Text fontSize="sm" fontWeight="600" color="app-text">
                Active courses
              </Text>
            }
          >
            {activeCourses.isLoading ? <LoadingState label="Loading active courses…" /> : null}
            {activeCourses.data && activeCourses.data.length > 0 ? (
              <Table variant="simple">
                <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
                  Active courses with capacity
                </caption>
                <Thead>
                  <Tr>
                    <Th scope="col">Code</Th>
                    <Th scope="col">Name</Th>
                    <Th scope="col" isNumeric>
                      Enrolled
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {activeCourses.data.map((row) => (
                    <Tr key={row.courseId}>
                      <Td fontWeight="bold" color="brand.700">
                        {row.courseCode}
                      </Td>
                      <Td>{row.courseName}</Td>
                      <Td isNumeric>
                        {row.enrolledCount}/{row.maxCapacity}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : !activeCourses.isLoading ? (
              <EmptyState title="No active courses" />
            ) : null}
          </DataTableShell>

          <DataTableShell
            toolbar={
              <Text fontSize="sm" fontWeight="600" color="app-text">
                Inactive courses
              </Text>
            }
          >
            {inactiveCourses.isLoading ? <LoadingState label="Loading inactive courses…" /> : null}
            {inactiveCourses.data && inactiveCourses.data.length > 0 ? (
              <Table variant="simple">
                <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
                  Inactive courses
                </caption>
                <Thead>
                  <Tr>
                    <Th scope="col">Code</Th>
                    <Th scope="col">Name</Th>
                    <Th scope="col">Credits</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inactiveCourses.data.map((row) => (
                    <Tr key={row.id}>
                      <Td fontWeight="bold" color="brand.700">
                        {row.code}
                      </Td>
                      <Td>{row.name}</Td>
                      <Td>{row.credits}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : !inactiveCourses.isLoading ? (
              <EmptyState title="No inactive courses" />
            ) : null}
          </DataTableShell>
        </SimpleGrid>
      </VStack>
    </>
  )
}
