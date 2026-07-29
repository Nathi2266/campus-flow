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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, TextAreaField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'
import type { Department } from '@/types'

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function DepartmentsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const [editing, setEditing] = useState<Department | null>(null)

  const query = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
  })

  const createForm = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['departments'] })
  }

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Department created', status: 'success' })
      createForm.reset()
      createModal.onClose()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormValues }) => updateDepartment(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Department updated', status: 'success' })
      editModal.onClose()
      setEditing(null)
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Department deleted', status: 'success' })
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  function openEdit(dept: Department) {
    setEditing(dept)
    editForm.reset({
      name: dept.name,
      description: dept.description ?? '',
    })
    editModal.onOpen()
  }

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Departments"
        description="Manage academic departments used by users, students, and courses."
        actions={
          <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
            Add department
          </Button>
        }
      />

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {query.data && !query.data.length ? (
        <EmptyState
          title="No departments"
          description="Create a department to organise students and courses."
          action={
            <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
              Add department
            </Button>
          }
        />
      ) : null}
      {query.data && query.data.length > 0 ? (
        <DataTableShell
          toolbar={
            <Text fontSize="sm" color="gray.500">
              {query.data.length} department{query.data.length === 1 ? '' : 's'}
            </Text>
          }
        >
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              Departments
            </caption>
            <Thead>
              <Tr>
                <Th scope="col">Name</Th>
                <Th scope="col">Description</Th>
                <Th scope="col">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data.map((dept) => (
                <Tr key={dept.id} _hover={{ bg: 'canvas.50' }}>
                  <Td fontWeight="semibold">{dept.name}</Td>
                  <Td color="gray.600">{dept.description || '—'}</Td>
                  <Td>
                    <HStack>
                      <IconButton
                        aria-label={`Edit ${dept.name}`}
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(dept)}
                      />
                      <IconButton
                        aria-label={`Delete ${dept.name}`}
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => deleteMutation.mutate(dept.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DataTableShell>
      ) : null}

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as="form"
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <ModalHeader fontFamily="heading">Add department</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField
                name="name"
                label="Name"
                register={createForm.register}
                error={createForm.formState.errors.name?.message}
                isRequired
              />
              <TextAreaField
                name="description"
                label="Description"
                register={createForm.register}
                error={createForm.formState.errors.description?.message}
              />
            </FormStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={createModal.onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                Create
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={editModal.isOpen}
        onClose={() => {
          editModal.onClose()
          setEditing(null)
        }}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as="form"
          onSubmit={editForm.handleSubmit((values) => {
            if (!editing) return
            updateMutation.mutate({ id: editing.id, payload: values })
          })}
        >
          <ModalHeader fontFamily="heading">Edit department</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField
                name="name"
                label="Name"
                register={editForm.register}
                error={editForm.formState.errors.name?.message}
                isRequired
              />
              <TextAreaField
                name="description"
                label="Description"
                register={editForm.register}
                error={editForm.formState.errors.description?.message}
              />
            </FormStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button
                variant="ghost"
                onClick={() => {
                  editModal.onClose()
                  setEditing(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
