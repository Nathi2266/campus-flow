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
import { FiPlus, FiPower, FiTrash2 } from 'react-icons/fi'
import {
  activateCourse,
  createCourse,
  deactivateCourse,
  deleteCourse,
  listCourses,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { ActiveBadge } from '@/components/StatusBadge'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, NumberField, TextAreaField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'

const schema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  credits: z.number().int().positive(),
  departmentId: z.number().int().positive(),
  lecturerId: z.number().int().positive().optional(),
  maxCapacity: z.number().int().positive(),
})

type FormValues = z.infer<typeof schema>

export function CoursesPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const query = useQuery({
    queryKey: ['courses'],
    queryFn: () => listCourses({ page: 0, size: 50 }),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { maxCapacity: 30, credits: 3 },
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['courses'] })
  }

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Course created', status: 'success' })
      reset({ maxCapacity: 30, credits: 3 })
      onClose()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Courses"
        description="Manage course catalogue, capacity, and activation."
        actions={
          <Button leftIcon={<FiPlus />} onClick={onOpen}>
            Add course
          </Button>
        }
      />

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {query.data && !query.data.content.length ? (
        <EmptyState title="No courses" description="Create a course to begin enrollments." />
      ) : null}
      {query.data && query.data.content.length > 0 ? (
        <DataTableShell
          toolbar={
            <Text fontSize="sm" color="gray.500">
              {query.data.totalElements} course{query.data.totalElements === 1 ? '' : 's'}
            </Text>
          }
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Credits</Th>
                <Th>Capacity</Th>
                <Th>Status</Th>
                <Th aria-label="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((course) => (
                <Tr key={course.id} _hover={{ bg: 'canvas.50' }}>
                  <Td fontWeight="bold" color="brand.700">
                    {course.code}
                  </Td>
                  <Td fontWeight="medium">{course.name}</Td>
                  <Td>{course.credits}</Td>
                  <Td>
                    {course.enrolledCount ?? 0}/{course.maxCapacity}
                  </Td>
                  <Td>
                    <ActiveBadge active={course.active} />
                  </Td>
                  <Td>
                    <HStack>
                      <IconButton
                        aria-label={course.active ? 'Deactivate course' : 'Activate course'}
                        icon={<FiPower />}
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            if (course.active) await deactivateCourse(course.id)
                            else await activateCourse(course.id)
                            await invalidate()
                          } catch (error) {
                            toast({ title: getErrorMessage(error), status: 'error' })
                          }
                        }}
                      />
                      <IconButton
                        aria-label={`Delete ${course.code}`}
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={async () => {
                          try {
                            await deleteCourse(course.id)
                            await invalidate()
                            toast({ title: 'Course deleted', status: 'success' })
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
        </DataTableShell>
      ) : null}

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent as="form" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <ModalHeader fontFamily="heading">Add course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField name="code" label="Code" register={register} error={errors.code?.message} isRequired />
              <TextField name="name" label="Name" register={register} error={errors.name?.message} isRequired />
              <TextAreaField name="description" label="Description" register={register} error={errors.description?.message} />
              <NumberField name="credits" label="Credits" control={control} error={errors.credits?.message} isRequired min={1} />
              <NumberField name="departmentId" label="Department ID" control={control} error={errors.departmentId?.message} isRequired min={1} />
              <NumberField name="lecturerId" label="Lecturer user ID" control={control} error={errors.lecturerId?.message} min={1} />
              <NumberField name="maxCapacity" label="Max capacity" control={control} error={errors.maxCapacity?.message} isRequired min={1} />
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
