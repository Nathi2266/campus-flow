import {
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { createEnrollment, dropEnrollment, listEnrollments } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EnrollmentStatusBadge } from '@/components/StatusBadge'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, NumberField } from '@/components/FormFields'
import { useAuthStore } from '@/features/auth/authStore'
import { DataTableShell } from '@/components/DataTableShell'

const schema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive(),
})

type FormValues = z.infer<typeof schema>

export function EnrollmentsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const canManage = useAuthStore((s) => s.hasRole('ADMIN', 'LECTURER'))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const query = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => listEnrollments({ page: 0, size: 50 }),
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      toast({ title: 'Enrollment created', status: 'success' })
      reset()
      onClose()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  return (
    <>
      <PageHeader
        eyebrow="Academic"
        title="Enrollments"
        description="Link students to courses and track status."
        actions={
          canManage ? (
            <Button leftIcon={<FiPlus />} onClick={onOpen}>
              New enrollment
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          title="Could not load enrollments"
          message={getErrorMessage(query.error, 'List endpoint may be stubbed on the API.')}
          onRetry={() => query.refetch()}
        />
      ) : null}
      {query.data && !query.data.content?.length ? (
        <EmptyState title="No enrollments" description="Create an enrollment to see it here." />
      ) : null}
      {query.data?.content?.length ? (
        <DataTableShell>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Course</Th>
                <Th>Status</Th>
                <Th>Grade</Th>
                {canManage ? <Th aria-label="Actions" /> : null}
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((row) => (
                <Tr key={row.id} _hover={{ bg: 'canvas.50' }}>
                  <Td fontWeight="semibold">{row.studentName}</Td>
                  <Td>
                    <Text as="span" fontWeight="bold" color="brand.700">
                      {row.courseCode}
                    </Text>
                    <Text as="span" color="gray.500">
                      {' '}
                      — {row.courseName}
                    </Text>
                  </Td>
                  <Td>
                    <EnrollmentStatusBadge status={row.status} />
                  </Td>
                  <Td>{row.grade ?? '—'}</Td>
                  {canManage ? (
                    <Td>
                      <IconButton
                        aria-label="Drop enrollment"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={async () => {
                          try {
                            await dropEnrollment(row.id)
                            await queryClient.invalidateQueries({ queryKey: ['enrollments'] })
                            toast({ title: 'Enrollment dropped', status: 'success' })
                          } catch (error) {
                            toast({ title: getErrorMessage(error), status: 'error' })
                          }
                        }}
                      />
                    </Td>
                  ) : null}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DataTableShell>
      ) : null}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent as="form" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <ModalHeader fontFamily="heading">New enrollment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <NumberField name="studentId" label="Student ID" control={control} error={errors.studentId?.message} isRequired min={1} />
              <NumberField name="courseId" label="Course ID" control={control} error={errors.courseId?.message} isRequired min={1} />
            </FormStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting || createMutation.isPending}>
                Enroll
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
