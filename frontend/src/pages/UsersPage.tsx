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
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEdit2, FiPlus } from 'react-icons/fi'
import { createUser, listDepartments, listUsers, updateUser } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, SelectField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'
import { PaginationControls } from '@/components/PaginationControls'
import type { User, UserRole } from '@/types'

const PAGE_SIZE = 20

const emptyToUndefined = (val: unknown) =>
  val === '' || val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))
    ? undefined
    : val

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'LECTURER', 'STUDENT']),
  departmentId: z.preprocess(emptyToUndefined, z.number().int().positive().optional()),
  phoneNumber: z.string().optional(),
})

const editSchema = z.object({
  role: z.enum(['ADMIN', 'LECTURER', 'STUDENT']),
  departmentId: z.preprocess(emptyToUndefined, z.number().int().positive().optional().nullable()),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export function UsersPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const [editing, setEditing] = useState<User | null>(null)
  const [page, setPage] = useState(0)

  const query = useQuery({
    queryKey: ['users', page],
    queryFn: () => listUsers({ page, size: PAGE_SIZE }),
  })

  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
  })

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateValues>,
    defaultValues: { role: 'LECTURER' },
  })

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema) as Resolver<EditValues>,
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'User created', status: 'success' })
      createForm.reset({ role: 'LECTURER' })
      createModal.onClose()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditValues }) =>
      updateUser(id, {
        role: payload.role,
        departmentId: payload.departmentId ?? null,
      }),
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'User updated', status: 'success' })
      editModal.onClose()
      setEditing(null)
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  function openEdit(user: User) {
    setEditing(user)
    editForm.reset({
      role: user.role,
      departmentId: user.departmentId ?? undefined,
    })
    editModal.onOpen()
  }

  const deptName = (id: number | null) => {
    if (id == null) return '—'
    return departments.data?.find((d) => d.id === id)?.name ?? String(id)
  }

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Provision staff accounts and assign roles and departments."
        actions={
          <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
            Add user
          </Button>
        }
      />

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {query.data && !query.data.content.length ? (
        <EmptyState
          title="No users"
          description="Create an administrator or lecturer account."
          action={
            <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
              Add user
            </Button>
          }
        />
      ) : null}
      {query.data && query.data.content.length > 0 ? (
        <DataTableShell
          toolbar={
            <Text fontSize="sm" color="gray.500">
              {query.data.totalElements} user{query.data.totalElements === 1 ? '' : 's'}
            </Text>
          }
          footer={
            <PaginationControls
              page={page}
              totalPages={query.data.totalPages ?? 0}
              totalElements={query.data.totalElements}
              onPageChange={setPage}
              isLoading={query.isFetching}
            />
          }
        >
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              User accounts
            </caption>
            <Thead>
              <Tr>
                <Th scope="col">Name</Th>
                <Th scope="col">Email</Th>
                <Th scope="col">Role</Th>
                <Th scope="col">Department</Th>
                <Th scope="col">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((user) => (
                <Tr key={user.id} _hover={{ bg: 'canvas.50' }}>
                  <Td fontWeight="semibold">
                    {user.firstName} {user.lastName}
                  </Td>
                  <Td color="gray.600">{user.email}</Td>
                  <Td>{user.role}</Td>
                  <Td>{deptName(user.departmentId)}</Td>
                  <Td>
                    <IconButton
                      aria-label={`Edit ${user.firstName} ${user.lastName}`}
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(user)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DataTableShell>
      ) : null}

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as="form"
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <ModalHeader fontFamily="heading">Add user</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField
                name="firstName"
                label="First name"
                register={createForm.register}
                error={createForm.formState.errors.firstName?.message}
                isRequired
              />
              <TextField
                name="lastName"
                label="Last name"
                register={createForm.register}
                error={createForm.formState.errors.lastName?.message}
                isRequired
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                register={createForm.register}
                error={createForm.formState.errors.email?.message}
                isRequired
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                register={createForm.register}
                error={createForm.formState.errors.password?.message}
                isRequired
              />
              <SelectField
                name="role"
                label="Role"
                register={createForm.register}
                error={createForm.formState.errors.role?.message}
                isRequired
              >
                {(['ADMIN', 'LECTURER', 'STUDENT'] as UserRole[]).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </SelectField>
              <SelectField
                name="departmentId"
                label="Department"
                register={createForm.register}
                error={createForm.formState.errors.departmentId?.message}
                valueAsNumber
                placeholder="Optional department"
              >
                <option value="">None</option>
                {(departments.data ?? []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </SelectField>
              <TextField
                name="phoneNumber"
                label="Phone"
                register={createForm.register}
                error={createForm.formState.errors.phoneNumber?.message}
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
          <ModalHeader fontFamily="heading">
            Edit user{editing ? `: ${editing.email}` : ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <SelectField
                name="role"
                label="Role"
                register={editForm.register}
                error={editForm.formState.errors.role?.message}
                isRequired
              >
                {(['ADMIN', 'LECTURER', 'STUDENT'] as UserRole[]).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </SelectField>
              <SelectField
                name="departmentId"
                label="Department"
                register={editForm.register}
                error={editForm.formState.errors.departmentId?.message}
                valueAsNumber
                placeholder="Optional department"
              >
                <option value="">None</option>
                {(departments.data ?? []).map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </SelectField>
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
