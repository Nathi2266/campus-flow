import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
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
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import {
  dropEnrollment,
  listCourseEnrollments,
  updateEnrollmentGrade,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { CapacityBadge, EnrollmentStatusBadge } from '@/components/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback'
import { FormStack, SelectField, TextField } from '@/components/FormFields'
import { fillRatio } from '@/utils/capacity'
import type { Course, Enrollment, EnrollmentStatus } from '@/types'

const gradeSchema = z.object({
  grade: z.string().min(1).max(5),
  status: z.union([z.enum(['ACTIVE', 'COMPLETED', 'DROPPED', 'FAILED']), z.literal('')]).optional(),
})

type GradeValues = z.infer<typeof gradeSchema>

export function CourseRosterDrawer({
  course,
  isOpen,
  onClose,
}: {
  course: Course | null
  isOpen: boolean
  onClose: () => void
}) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const gradeModal = useDisclosure()
  const [grading, setGrading] = useState<Enrollment | null>(null)

  const roster = useQuery({
    queryKey: ['enrollments', 'course', course?.id],
    queryFn: () => listCourseEnrollments(course!.id, { page: 0, size: 100 }),
    enabled: isOpen && course != null,
  })

  const gradeForm = useForm<GradeValues>({
    resolver: zodResolver(gradeSchema),
  })

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
    ])
  }

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

  const enrolled = course?.enrolledCount ?? 0
  const max = course?.maxCapacity ?? 0
  const pct = fillRatio(enrolled, max) * 100

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontFamily="heading">
            {course ? `Roster: ${course.code}` : 'Course roster'}
          </DrawerHeader>
          <DrawerBody>
            {course ? (
              <Box mb={6}>
                <Text fontFamily="heading" fontSize="xl" fontWeight="600" letterSpacing="-0.02em">
                  {course.name}
                </Text>
                <Flex mt={3} align="center" gap={3} flexWrap="wrap">
                  <Text fontSize="sm" color="app-muted" fontWeight="medium">
                    {enrolled}/{max} enrolled
                  </Text>
                  <CapacityBadge enrolled={enrolled} max={max} />
                </Flex>
                <Progress
                  mt={3}
                  value={pct}
                  size="sm"
                  colorScheme={pct >= 100 ? 'red' : pct >= 80 ? 'orange' : 'brand'}
                  borderRadius="full"
                  bg="progress-track"
                  aria-label={`${course.code} capacity ${pct.toFixed(0)} percent`}
                />
              </Box>
            ) : null}

            {roster.isLoading ? <LoadingState label="Loading roster…" /> : null}
            {roster.isError ? (
              <ErrorState
                message={getErrorMessage(roster.error)}
                onRetry={() => roster.refetch()}
              />
            ) : null}
            {roster.data && !roster.data.content.length ? (
              <EmptyState title="No enrollments" description="No students are enrolled in this course yet." />
            ) : null}
            {roster.data && roster.data.content.length > 0 ? (
              <Table variant="simple" size="sm">
                <caption style={{ captionSide: 'top', paddingBottom: '0.75rem', textAlign: 'left' }}>
                  Course enrollments
                </caption>
                <Thead>
                  <Tr>
                    <Th scope="col">Student</Th>
                    <Th scope="col">Status</Th>
                    <Th scope="col">Grade</Th>
                    <Th scope="col">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {roster.data.content.map((row) => (
                    <Tr key={row.id}>
                      <Td fontWeight="semibold">{row.studentName}</Td>
                      <Td>
                        <EnrollmentStatusBadge status={row.status} />
                      </Td>
                      <Td>{row.grade ?? '—'}</Td>
                      <Td>
                        <HStack>
                          <IconButton
                            aria-label={`Edit grade for ${row.studentName}`}
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openGrade(row)}
                          />
                          <IconButton
                            aria-label={`Drop ${row.studentName} from course`}
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>

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
            Enter grade{grading ? `: ${grading.studentName}` : ''}
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
