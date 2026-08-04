import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { listStudentCourses } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EnrollmentStatusBadge } from '@/components/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback'
import type { Student } from '@/types'

export function StudentAcademicDrawer({
  student,
  isOpen,
  onClose,
}: {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}) {
  const courses = useQuery({
    queryKey: ['students', student?.id, 'courses', { activeOnly: false }],
    queryFn: () => listStudentCourses(student!.id, { activeOnly: false }),
    enabled: isOpen && student != null,
  })

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader fontFamily="heading">
          {student
            ? `Academic record: ${student.firstName} ${student.lastName}`
            : 'Academic record'}
        </DrawerHeader>
        <DrawerBody>
          {student ? (
            <Box mb={6}>
              <Text fontSize="sm" color="app-muted" fontFamily="mono">
                {student.studentNumber}
              </Text>
              <Text mt={2} fontSize="lg" fontWeight="600">
                GPA:{' '}
                {student.gpa != null ? Number(student.gpa).toFixed(2) : '—'}
              </Text>
              <Text fontSize="xs" color="app-muted" mt={1}>
                Stored GPA (display only)
              </Text>
            </Box>
          ) : null}

          {courses.isLoading ? <LoadingState label="Loading courses…" /> : null}
          {courses.isError ? (
            <ErrorState
              message={getErrorMessage(courses.error)}
              onRetry={() => courses.refetch()}
            />
          ) : null}
          {courses.data && !courses.data.content.length ? (
            <EmptyState
              title="No course history"
              description="This student has no enrollment records yet."
            />
          ) : null}
          {courses.data && courses.data.content.length > 0 ? (
            <Table variant="simple" size="sm">
              <caption style={{ captionSide: 'top', paddingBottom: '0.75rem', textAlign: 'left' }}>
                Student courses
              </caption>
              <Thead>
                <Tr>
                  <Th scope="col">Course</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Grade</Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.data.content.map((row) => (
                  <Tr key={row.id}>
                    <Td>
                      <Text as="span" fontWeight="bold" color="brand.700">
                        {row.courseCode}
                      </Text>
                      <Text as="span" color="app-muted">
                        {' '}
                        — {row.courseName}
                      </Text>
                    </Td>
                    <Td>
                      <EnrollmentStatusBadge status={row.status} />
                    </Td>
                    <Td>{row.grade ?? '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : null}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
