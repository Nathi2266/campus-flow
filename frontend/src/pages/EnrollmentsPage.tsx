import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import {
  createEnrollment,
  dropEnrollment,
  listCourses,
  listEnrollments,
  listStudents,
  updateEnrollmentGrade,
} from '@/api/resources'
import { getErrorMessage, isCourseFullError } from '@/api/client'
import { EnrollmentStatusBadge } from '@/components/StatusBadge'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, SelectField, TextField } from '@/components/FormFields'
import { useAuthStore } from '@/features/auth/authStore'
import { DataTableShell } from '@/components/DataTableShell'
import { PaginationControls } from '@/components/PaginationControls'
import type { Enrollment, EnrollmentStatus } from '@/types'

const PAGE_SIZE = 20

const staffSchema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive(),
})

const studentSchema = z.object({
  courseId: z.number().int().positive(),
})

const gradeSchema = z.object({
  grade: z.string().min(1).max(5),
  status: z.union([z.enum(['ACTIVE', 'COMPLETED', 'DROPPED', 'FAILED']), z.literal('')]).optional(),
})

type StaffValues = z.infer<typeof staffSchema>
type StudentValues = z.infer<typeof studentSchema>
type GradeValues = z.infer<typeof gradeSchema>
type StatusFilter = 'ALL' | EnrollmentStatus

export function EnrollmentsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const isStudent = useAuthStore((s) => s.hasRole('STUDENT'))
  const canManage = useAuthStore((s) => s.hasRole('ADMIN', 'LECTURER'))
  const canGrade = useAuthStore((s) => s.hasRole('ADMIN', 'LECTURER'))
  const enrollModal = useDisclosure()
  const gradeModal = useDisclosure()
  const [grading, setGrading] = useState<Enrollment | null>(null)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [courseFilter, setCourseFilter] = useState('')

  const query = useQuery({
    queryKey: [
      'enrollments',
      {
        page,
        status: statusFilter,
        courseId: canManage ? courseFilter || null : null,
      },
    ],
    queryFn: () =>
      listEnrollments({
        page,
        size: PAGE_SIZE,
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
        ...(canManage && courseFilter ? { courseId: Number(courseFilter) } : {}),
      }),
  })

  const students = useQuery({
    queryKey: ['students', 'enroll-picker'],
    queryFn: () => listStudents({ page: 0, size: 100 }),
    enabled: canManage && enrollModal.isOpen,
  })

  const courses = useQuery({
    queryKey: ['courses', 'enroll-picker', isStudent],
    // Larger page so new E2E/admin courses still appear in filters/pickers
    queryFn: () => listCourses({ page: 0, size: 200, ...(isStudent ? { active: true } : {}) }),
    enabled: enrollModal.isOpen || canManage,
  })

  const staffForm = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
  })

  const studentForm = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
  })

  const gradeForm = useForm<GradeValues>({
    resolver: zodResolver(gradeSchema),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    await queryClient.invalidateQueries({ queryKey: ['courses'] })
  }

  const createMutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: async () => {
      await invalidate()
      toast({ title: isStudent ? 'Enrolled successfully' : 'Enrollment created', status: 'success' })
      staffForm.reset()
      studentForm.reset()
      enrollModal.onClose()
    },
    onError: (error) => {
      if (isCourseFullError(error)) {
        toast({
          title: 'Course is full',
          description: 'This course has reached maximum capacity. Choose another course or wait for a drop.',
          status: 'error',
          duration: 6000,
          isClosable: true,
        })
        return
      }
      toast({ title: getErrorMessage(error), status: 'error' })
    },
  })

  const gradeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { grade: string; status?: EnrollmentStatus } }) =>
      updateEnrollmentGrade(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Grade saved', status: 'success' })
      gradeModal.onClose()
      setGrading(null)
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  function openGrade(row: Enrollment) {
    setGrading(row)
    gradeForm.reset({
      grade: row.grade ?? '',
      status: row.status,
    })
    gradeModal.onOpen()
  }

  return (
    <>
      <PageHeader
        eyebrow="Academic"
        title="Enrollments"
        description={
          isStudent
            ? 'Self-enroll in active courses, drop enrollments, and view your grades.'
            : 'Link students to courses, drop enrollments, and enter grades.'
        }
        actions={
          <Button leftIcon={<FiPlus />} onClick={enrollModal.onOpen}>
            {isStudent ? 'Self-enroll' : 'New enrollment'}
          </Button>
        }
      />

      <DataTableShell
        toolbar={
          <HStack justify="flex-end" flexWrap="wrap" gap={3} w="full">
            <FormControl maxW="180px">
              <FormLabel htmlFor="enrollment-status-filter" mb={1} fontSize="sm">
                Status
              </FormLabel>
              <Select
                id="enrollment-status-filter"
                size="sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter)
                  setPage(0)
                }}
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DROPPED">DROPPED</option>
                <option value="FAILED">FAILED</option>
              </Select>
            </FormControl>
            {canManage ? (
              <FormControl maxW="260px">
                <FormLabel htmlFor="enrollment-course-filter" mb={1} fontSize="sm">
                  Course
                </FormLabel>
                <Select
                  id="enrollment-course-filter"
                  size="sm"
                  value={courseFilter}
                  onChange={(e) => {
                    setCourseFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <option value="">All courses</option>
                  {(courses.data?.content ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </HStack>
        }
        footer={
          query.data && query.data.content.length > 0 ? (
            <PaginationControls
              page={page}
              totalPages={query.data.totalPages ?? 0}
              totalElements={query.data.totalElements}
              onPageChange={setPage}
              isLoading={query.isFetching}
            />
          ) : undefined
        }
      >
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? (
          <ErrorState
            title="Could not load enrollments"
            message={getErrorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : null}
        {query.data && !query.data.content?.length ? (
          <EmptyState
            title={statusFilter !== 'ALL' || courseFilter ? 'No matching enrollments' : 'No enrollments'}
            description={
              statusFilter !== 'ALL' || courseFilter
                ? 'Try clearing status or course filters.'
                : isStudent
                  ? 'Browse the course catalogue and self-enroll to get started.'
                  : 'Create an enrollment to see it here.'
            }
            action={
              statusFilter === 'ALL' && !courseFilter ? (
                <Button leftIcon={<FiPlus />} onClick={enrollModal.onOpen}>
                  {isStudent ? 'Self-enroll' : 'New enrollment'}
                </Button>
              ) : undefined
            }
          />
        ) : null}
        {query.data?.content?.length ? (
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              Enrollment records
            </caption>
            <Thead>
              <Tr>
                {!isStudent ? <Th scope="col">Student</Th> : null}
                <Th scope="col">Course</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Grade</Th>
                <Th scope="col">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((row) => (
                <Tr key={row.id}>
                  {!isStudent ? <Td fontWeight="semibold">{row.studentName}</Td> : null}
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
                  <Td>
                    <HStack>
                      {canGrade ? (
                        <IconButton
                          aria-label={`Edit grade for ${row.courseCode}`}
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openGrade(row)}
                        />
                      ) : null}
                      <IconButton
                        aria-label={`Drop enrollment in ${row.courseCode}`}
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={async () => {
                          try {
                            await dropEnrollment(row.id)
                            await invalidate()
                            toast({ title: 'Enrollment dropped', status: 'success' })
                          } catch (error) {
                            toast({ title: getErrorMessage(error), status: 'error' })
                          }
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : null}
      </DataTableShell>

      <Modal isOpen={enrollModal.isOpen} onClose={enrollModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        {isStudent ? (
          <ModalContent
            as="form"
            onSubmit={studentForm.handleSubmit((values) => createMutation.mutate({ courseId: values.courseId }))}
          >
            <ModalHeader fontFamily="heading">Self-enroll</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormStack>
                <SelectField
                  name="courseId"
                  label="Course"
                  register={studentForm.register}
                  error={studentForm.formState.errors.courseId?.message}
                  isRequired
                  valueAsNumber
                  placeholder="Select a course"
                >
                  {(courses.data?.content ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.name}
                    </option>
                  ))}
                </SelectField>
              </FormStack>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={enrollModal.onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Enroll
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        ) : (
          <ModalContent
            as="form"
            onSubmit={staffForm.handleSubmit((values) => createMutation.mutate(values))}
          >
            <ModalHeader fontFamily="heading">New enrollment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormStack>
                <SelectField
                  name="studentId"
                  label="Student"
                  register={staffForm.register}
                  error={staffForm.formState.errors.studentId?.message}
                  isRequired
                  valueAsNumber
                  placeholder="Select student"
                >
                  {(students.data?.content ?? []).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentNumber})
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  name="courseId"
                  label="Course"
                  register={staffForm.register}
                  error={staffForm.formState.errors.courseId?.message}
                  isRequired
                  valueAsNumber
                  placeholder="Select course"
                >
                  {(courses.data?.content ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.name}
                    </option>
                  ))}
                </SelectField>
              </FormStack>
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" onClick={enrollModal.onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Enroll
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>

      <Modal
        isOpen={gradeModal.isOpen}
        onClose={() => {
          gradeModal.onClose()
          setGrading(null)
        }}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as="form"
          onSubmit={gradeForm.handleSubmit((values) => {
            if (!grading) return
            gradeMutation.mutate({
              id: grading.id,
              payload: {
                grade: values.grade,
                status: values.status ? (values.status as EnrollmentStatus) : undefined,
              },
            })
          })}
        >
          <ModalHeader fontFamily="heading">
            Enter grade{grading ? `: ${grading.courseCode}` : ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField
                name="grade"
                label="Grade"
                register={gradeForm.register}
                error={gradeForm.formState.errors.grade?.message}
                isRequired
                maxLength={5}
                placeholder="e.g. A, B+, 75"
              />
              <SelectField
                name="status"
                label="Status (optional)"
                register={gradeForm.register}
                error={gradeForm.formState.errors.status?.message}
              >
                <option value="">Keep current</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="DROPPED">DROPPED</option>
              </SelectField>
            </FormStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                variant="ghost"
                onClick={() => {
                  gradeModal.onClose()
                  setGrading(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={gradeMutation.isPending}>
                Save grade
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
