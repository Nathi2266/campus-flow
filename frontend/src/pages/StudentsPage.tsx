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
import { createStudent, deleteStudent, listStudents } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { AcademicStatusBadge } from '@/components/StatusBadge'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, NumberField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.number().int().positive(),
  phoneNumber: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function StudentsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const query = useQuery({
    queryKey: ['students'],
    queryFn: () => listStudents({ page: 0, size: 50 }),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
      toast({ title: 'Student created', status: 'success' })
      reset()
      onClose()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
      toast({ title: 'Student removed', status: 'success' })
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Students"
        description="Create and manage student records across departments."
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen} size="md">
            Add student
          </Button>
        }
      />

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {query.data && !query.data.content.length ? (
        <EmptyState
          title="No students"
          description="Add the first student to get started."
          action={
            <Button leftIcon={<FiPlus />} onClick={onOpen}>
              Add student
            </Button>
          }
        />
      ) : null}
      {query.data && query.data.content.length > 0 ? (
        <DataTableShell
          toolbar={
            <Text fontSize="sm" color="gray.500">
              {query.data.totalElements} student{query.data.totalElements === 1 ? '' : 's'}
            </Text>
          }
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student #</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Department</Th>
                <Th aria-label="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((student) => (
                <Tr key={student.id} _hover={{ bg: 'canvas.50' }}>
                  <Td fontFamily="mono" fontSize="sm">
                    {student.studentNumber}
                  </Td>
                  <Td fontWeight="semibold">
                    {student.firstName} {student.lastName}
                  </Td>
                  <Td color="gray.600">{student.email}</Td>
                  <Td>
                    <AcademicStatusBadge status={student.academicStatus} />
                  </Td>
                  <Td>{student.departmentName ?? student.departmentId}</Td>
                  <Td>
                    <IconButton
                      aria-label={`Delete ${student.firstName} ${student.lastName}`}
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => deleteMutation.mutate(student.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DataTableShell>
      ) : null}

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent as="form" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <ModalHeader fontFamily="heading">Add student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField name="firstName" label="First name" register={register} error={errors.firstName?.message} isRequired />
              <TextField name="lastName" label="Last name" register={register} error={errors.lastName?.message} isRequired />
              <TextField name="email" label="Email" type="email" register={register} error={errors.email?.message} isRequired />
              <NumberField name="departmentId" label="Department ID" control={control} error={errors.departmentId?.message} isRequired min={1} />
              <TextField name="phoneNumber" label="Phone" register={register} error={errors.phoneNumber?.message} />
            </FormStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting || createMutation.isPending}>
                Create
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
