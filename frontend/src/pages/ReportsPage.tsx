import { SimpleGrid, Text, VStack, Progress, Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { FiAward, FiBook, FiLayers, FiUsers } from 'react-icons/fi'
import { getStatistics } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { StatTile, SectionTitle } from '@/components/StatTile'
import { Stagger, Surface } from '@/components/ui'

export function ReportsPage() {
  const stats = useQuery({ queryKey: ['reports', 'statistics'], queryFn: getStatistics })

  const graduationPct = stats.data ? Number(stats.data.graduationRate) * 100 : 0
  const activeShare =
    stats.data && stats.data.totalCourses > 0
      ? Math.min(100, (stats.data.activeCourses / stats.data.totalCourses) * 100)
      : 0

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Campus analytics overview. Chart endpoints may still be stubs on the API."
      />
      {stats.isLoading ? <LoadingState /> : null}
      {stats.isError ? (
        <ErrorState message={getErrorMessage(stats.error)} onRetry={() => stats.refetch()} />
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

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Surface p={{ base: 6, md: 8 }}>
              <SectionTitle hint="Share of catalogue marked active">Active courses</SectionTitle>
              <Flex justify="space-between" align="baseline" mb={3}>
                <Text fontFamily="heading" fontSize="3xl" fontWeight="700" letterSpacing="-0.03em">
                  {stats.data.activeCourses}
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  of {stats.data.totalCourses} total
                </Text>
              </Flex>
              <Progress value={activeShare} size="md" colorScheme="brand" borderRadius="full" bg="canvas.200" />
            </Surface>

            <Surface p={{ base: 6, md: 8 }}>
              <SectionTitle hint="Organisation graduation metric">Graduation progress</SectionTitle>
              <Flex justify="space-between" align="baseline" mb={3}>
                <Text fontFamily="heading" fontSize="3xl" fontWeight="700" letterSpacing="-0.03em">
                  {graduationPct.toFixed(1)}%
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  reported rate
                </Text>
              </Flex>
              <Progress
                value={Math.min(100, graduationPct)}
                size="md"
                colorScheme="green"
                borderRadius="full"
                bg="canvas.200"
              />
            </Surface>
          </SimpleGrid>
        </>
      ) : null}
      {!stats.isLoading && !stats.isError && !stats.data ? (
        <EmptyState title="No report data" description="Statistics will appear when the API returns data." />
      ) : null}
      <Surface mt={8} p={6}>
        <VStack align="stretch" spacing={1}>
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Additional reports
          </Text>
          <Text fontSize="sm" color="gray.500" lineHeight="tall">
            Endpoints for students-per-course and active/inactive course breakdowns are documented but may return
            empty until backend stubs are completed.
          </Text>
        </VStack>
      </Surface>
    </>
  )
}
