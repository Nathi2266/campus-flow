import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Code,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEdit2, FiEye, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import {
  createStudent,
  deleteStudent,
  listDepartments,
  listStudents,
  searchStudents,
  updateStudent,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { AcademicStatusBadge } from '@/components/StatusBadge'
import { StudentAcademicDrawer } from '@/components/StudentAcademicDrawer'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, SelectField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'
import { PaginationControls } from '@/components/PaginationControls'
import { useAuthStore } from '@/features/auth/authStore'
import type { AcademicStatus, Student } from '@/types'

const PAGE_SIZE = 20

const createSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  departmentId: z.number().int().positive(),
  phoneNumber: z.string().optional(),
})

const editSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  academicStatus: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export function StudentsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const recordDrawer = useDisclosure()
  const tempPasswordModal = useDisclosure()
  const tempPasswordFocusRef = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState<Student | null>(null)
  const [viewing, setViewing] = useState<Student | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
    enabled: isAdmin,
  })

  const deptParam = isAdmin && departmentId ? { departmentId: Number(departmentId) } : {}

  const query = useQuery({
    queryKey: ['students', debouncedSearch, page, isAdmin ? departmentId || null : null],
    queryFn: () =>
      debouncedSearch
        ? searchStudents(debouncedSearch, { page, size: PAGE_SIZE, ...deptParam })
        : listStudents({ page, size: PAGE_SIZE, ...deptParam }),
  })

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
  })

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async (student) => {
      await invalidate()
      createForm.reset()
      createModal.onClose()
      if (student.temporaryPassword) {
        setTempPassword(student.temporaryPassword)
        tempPasswordModal.onOpen()
        toast({ title: 'Student created', status: 'success' })
      } else {
        toast({ title: 'Student created', status: 'success' })
      }
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditValues }) => updateStudent(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Student updated', status: 'success' })
      editModal.onClose()
      setEditing(null)
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Student removed', status: 'success' })
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  function openEdit(student: Student) {
    setEditing(student)
    editForm.reset({
      firstName: student.firstName,
      lastName: student.lastName,
      phoneNumber: student.phoneNumber ?? '',
      academicStatus: student.academicStatus,
    })
    editModal.onOpen()
  }

  function openRecord(student: Student) {
    setViewing(student)
    recordDrawer.onOpen()
  }

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Students"
        description={
          isAdmin
            ? 'Create and manage student records across departments.'
            : 'Browse student records (read-only).'
        }
        actions={
          isAdmin ? (
            <Button leftIcon={<FiPlus />} onClick={createModal.onOpen} size="md">
              Add student
            </Button>
          ) : undefined
        }
      />

      <DataTableShell
        toolbar={
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Text fontSize="sm" color="app-muted">
              {query.data?.totalElements ?? 0} student
              {(query.data?.totalElements ?? 0) === 1 ? '' : 's'}
            </Text>
            <HStack flexWrap="wrap" gap={3}>
              {isAdmin ? (
                <FormControl maxW="220px">
                  <FormLabel htmlFor="student-department-filter" mb={1} fontSize="sm">
                    Department
                  </FormLabel>
                  <Select
                    id="student-department-filter"
                    size="sm"
                    value={departmentId}
                    onChange={(e) => {
                      setDepartmentId(e.target.value)
                      setPage(0)
                    }}
                  >
                    <option value="">All departments</option>
                    {(departments.data ?? []).map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              <InputGroup maxW="320px" alignSelf="flex-end">
                <InputLeftElement pointerEvents="none">
                  <FiSearch aria-hidden />
                </InputLeftElement>
                <Input
                  aria-label="Search students"
                  placeholder="Search by name or number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </HStack>
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
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
        ) : null}
        {query.data && !query.data.content.length ? (
          <EmptyState
            title="No students"
            description={
              debouncedSearch
                ? 'No students match your search.'
                : isAdmin
                  ? 'Add the first student to get started.'
                  : 'No student records are available.'
            }
            action={
              isAdmin && !debouncedSearch ? (
                <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
                  Add student
                </Button>
              ) : undefined
            }
          />
        ) : null}
        {query.data && query.data.content.length > 0 ? (
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              Student directory
            </caption>
            <Thead>
              <Tr>
                <Th scope="col">Student #</Th>
                <Th scope="col">Name</Th>
                <Th scope="col">Email</Th>
                <Th scope="col">Status</Th>
                <Th scope="col">Department</Th>
                <Th scope="col">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((student) => (
                <Tr key={student.id}>
                  <Td fontFamily="mono" fontSize="sm">
                    {student.studentNumber}
                  </Td>
                  <Td fontWeight="semibold">
                    {student.firstName} {student.lastName}
                  </Td>
                  <Td color="app-muted">{student.email}</Td>
                  <Td>
                    <AcademicStatusBadge status={student.academicStatus} />
                  </Td>
                  <Td>{student.departmentName ?? student.departmentId}</Td>
                  <Td>
                    <HStack>
                      <IconButton
                        aria-label={`View record for ${student.firstName} ${student.lastName}`}
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openRecord(student)}
                      />
                      {isAdmin ? (
                        <>
                          <IconButton
                            aria-label={`Edit ${student.firstName} ${student.lastName}`}
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(student)}
                          />
                          <IconButton
                            aria-label={`Delete ${student.firstName} ${student.lastName}`}
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => deleteMutation.mutate(student.id)}
                          />
                        </>
                      ) : null}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : null}
      </DataTableShell>

      <StudentAcademicDrawer
        student={viewing}
        isOpen={recordDrawer.isOpen}
        onClose={() => {
          recordDrawer.onClose()
          setViewing(null)
        }}
      />

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as="form"
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <ModalHeader fontFamily="heading">Add student</ModalHeader>
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
              <SelectField
                name="departmentId"
                label="Department"
                register={createForm.register}
                error={createForm.formState.errors.departmentId?.message}
                isRequired
                valueAsNumber
                placeholder="Select department"
              >
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
        size="lg"
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
          <ModalHeader fontFamily="heading">Edit student</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField
                name="firstName"
                label="First name"
                register={editForm.register}
                error={editForm.formState.errors.firstName?.message}
                isRequired
              />
              <TextField
                name="lastName"
                label="Last name"
                register={editForm.register}
                error={editForm.formState.errors.lastName?.message}
                isRequired
              />
              <TextField
                name="phoneNumber"
                label="Phone"
                register={editForm.register}
                error={editForm.formState.errors.phoneNumber?.message}
              />
              <SelectField
                name="academicStatus"
                label="Academic status"
                register={editForm.register}
                error={editForm.formState.errors.academicStatus?.message}
                isRequired
              >
                {(['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'] as AcademicStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {status}
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
        leastDestructiveRef={tempPasswordFocusRef}
        onClose={() => {
          tempPasswordModal.onClose()
          setTempPassword(null)
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontFamily="heading" fontSize="lg">
              Temporary password
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>
                Copy this password now. It will not be shown again.
              </Text>
              <Code
                display="block"
                p={3}
                borderRadius="md"
                fontSize="md"
                userSelect="all"
                whiteSpace="pre-wrap"
                wordBreak="break-all"
              >
                {tempPassword}
              </Code>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={tempPasswordFocusRef}
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
    </>
  )
}
