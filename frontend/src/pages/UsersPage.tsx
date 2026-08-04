import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
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
import { useEffect, useRef, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEdit2, FiPlus, FiSlash, FiCheckCircle } from 'react-icons/fi'
import {
  activateUser,
  createUser,
  deactivateUser,
  listDepartments,
  listUsers,
  searchUsers,
  updateUser,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, SelectField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'
import { PaginationControls } from '@/components/PaginationControls'
import { useAuthStore } from '@/features/auth/authStore'
import type { User, UserRole } from '@/types'

const PAGE_SIZE = 20

const emptyToUndefined = (val: unknown) =>
  val === '' || val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))
    ? undefined
    : val

const createSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 8, 'Password must be at least 8 characters'),
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
  const currentUserId = useAuthStore((s) => s.user?.id)
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const tempPasswordModal = useDisclosure()
  const deactivateDialog = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState<User | null>(null)
  const [pendingDeactivate, setPendingDeactivate] = useState<User | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(t)
  }, [search])

  const roleParam = roleFilter || undefined

  const query = useQuery({
    queryKey: ['users', page, debouncedSearch, roleParam ?? null],
    queryFn: () =>
      debouncedSearch
        ? searchUsers(debouncedSearch, { page, size: PAGE_SIZE, role: roleParam })
        : listUsers({ page, size: PAGE_SIZE, role: roleParam }),
  })

  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
  })

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateValues>,
    defaultValues: { role: 'LECTURER', password: '' },
  })

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema) as Resolver<EditValues>,
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['users'] })
  }

  const createMutation = useMutation({
    mutationFn: (values: CreateValues) =>
      createUser({
        ...values,
        password: values.password?.trim() || undefined,
      }),
    onSuccess: async (user) => {
      await invalidate()
      createForm.reset({ role: 'LECTURER', password: '' })
      createModal.onClose()
      if (user.temporaryPassword) {
        setTempPassword(user.temporaryPassword)
        tempPasswordModal.onOpen()
      }
      toast({ title: 'User created', status: 'success' })
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

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'User deactivated', status: 'success' })
      deactivateDialog.onClose()
      setPendingDeactivate(null)
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const activateMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'User activated', status: 'success' })
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
        description="Provision staff accounts, search directory, and activate or deactivate logins."
        actions={
          <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
            Add user
          </Button>
        }
      />

      <DataTableShell
        toolbar={
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Text fontSize="sm" color="app-muted">
              {query.data?.totalElements ?? 0} user
              {(query.data?.totalElements ?? 0) === 1 ? '' : 's'}
            </Text>
            <HStack flexWrap="wrap" gap={3}>
              <FormControl maxW="160px">
                <FormLabel htmlFor="user-role-filter" mb={1} fontSize="sm">
                  Role
                </FormLabel>
                <Select
                  id="user-role-filter"
                  size="sm"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <option value="">All roles</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="LECTURER">LECTURER</option>
                  <option value="STUDENT">STUDENT</option>
                </Select>
              </FormControl>
              <FormControl maxW="260px">
                <FormLabel htmlFor="user-search" mb={1} fontSize="sm">
                  Search
                </FormLabel>
                <Input
                  id="user-search"
                  size="sm"
                  placeholder="Name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="user-search"
                />
              </FormControl>
            </HStack>
          </HStack>
        }
        footer={
          query.data ? (
            <PaginationControls
              page={page}
              totalPages={query.data.totalPages ?? 0}
              totalElements={query.data.totalElements}
              onPageChange={setPage}
              isLoading={query.isFetching}
            />
          ) : null
        }
      >
        {query.isLoading ? <LoadingState /> : null}
        {query.isError ? (
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
        ) : null}
        {query.data && !query.data.content.length ? (
          <EmptyState
            title={debouncedSearch ? 'No matching users' : 'No users'}
            description={
              debouncedSearch
                ? 'Try a different search or role filter.'
                : 'Create an administrator or lecturer account.'
            }
            action={
              !debouncedSearch ? (
                <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
                  Add user
                </Button>
              ) : undefined
            }
          />
        ) : null}
        {query.data && query.data.content.length > 0 ? (
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              User accounts
            </caption>
            <Thead>
              <Tr>
                <Th scope="col">Name</Th>
                <Th scope="col">Email</Th>
                <Th scope="col">Role</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Department</Th>
                <Th scope="col">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((user) => {
                const active = user.active !== false
                const isSelf = user.id === currentUserId
                return (
                  <Tr key={user.id}>
                    <Td fontWeight="semibold" color="app-text">
                      {user.firstName} {user.lastName}
                    </Td>
                    <Td color="app-muted">{user.email}</Td>
                    <Td>{user.role}</Td>
                    <Td>
                      <Badge colorScheme={active ? 'green' : 'gray'}>{active ? 'Active' : 'Inactive'}</Badge>
                    </Td>
                    <Td>{deptName(user.departmentId)}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label={`Edit ${user.firstName} ${user.lastName}`}
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(user)}
                        />
                        {active ? (
                          <IconButton
                            aria-label={`Deactivate ${user.email}`}
                            icon={<FiSlash />}
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            isDisabled={isSelf}
                            onClick={() => {
                              setPendingDeactivate(user)
                              deactivateDialog.onOpen()
                            }}
                          />
                        ) : (
                          <IconButton
                            aria-label={`Activate ${user.email}`}
                            icon={<FiCheckCircle />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            isLoading={activateMutation.isPending}
                            onClick={() => activateMutation.mutate(user.id)}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        ) : null}
      </DataTableShell>

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
                label="Password (optional)"
                type="password"
                register={createForm.register}
                error={createForm.formState.errors.password?.message}
              />
              <Text fontSize="sm" color="app-muted">
                Leave blank to generate a one-time temporary password for invite.
              </Text>
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

      <AlertDialog
        isOpen={tempPasswordModal.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          tempPasswordModal.onClose()
          setTempPassword(null)
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontFamily="heading">Temporary password</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3} color="app-muted">
                Share this password once. It will not be shown again.
              </Text>
              <Text
                fontFamily="mono"
                fontSize="lg"
                fontWeight="bold"
                p={3}
                bg="app-surface-muted"
                borderRadius="md"
                data-testid="user-temp-password"
              >
                {tempPassword}
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  tempPasswordModal.onClose()
                  setTempPassword(null)
                }}
              >
                Done
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={deactivateDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          deactivateDialog.onClose()
          setPendingDeactivate(null)
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontFamily="heading">Deactivate user?</AlertDialogHeader>
            <AlertDialogBody>
              {pendingDeactivate
                ? `${pendingDeactivate.email} will no longer be able to sign in.`
                : 'This user will no longer be able to sign in.'}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                variant="ghost"
                onClick={() => {
                  deactivateDialog.onClose()
                  setPendingDeactivate(null)
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="orange"
                ml={3}
                isLoading={deactivateMutation.isPending}
                onClick={() => pendingDeactivate && deactivateMutation.mutate(pendingDeactivate.id)}
              >
                Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
