import {
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
import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiEdit2, FiPlus, FiPower, FiTrash2, FiUsers } from 'react-icons/fi'
import {
  activateCourse,
  createCourse,
  deactivateCourse,
  deleteCourse,
  listCourses,
  listDepartments,
  listUsers,
  updateCourse,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { ActiveBadge, CapacityBadge } from '@/components/StatusBadge'
import { CourseRosterDrawer } from '@/components/CourseRosterDrawer'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { FormStack, SelectField, TextAreaField, TextField } from '@/components/FormFields'
import { DataTableShell } from '@/components/DataTableShell'
import { PaginationControls } from '@/components/PaginationControls'
import { useAuthStore } from '@/features/auth/authStore'
import type { Course } from '@/types'

const PAGE_SIZE = 20

const emptyToUndefined = (val: unknown) =>
  val === '' || val === null || val === undefined || (typeof val === 'number' && Number.isNaN(val))
    ? undefined
    : val

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  credits: z.number().int().positive(),
  departmentId: z.number().int().positive(),
  lecturerId: z.preprocess(emptyToUndefined, z.number().int().positive().optional()),
  maxCapacity: z.number().int().positive(),
})

const editSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  credits: z.number().int().positive(),
  lecturerId: z.preprocess(emptyToUndefined, z.number().int().positive().optional()),
  maxCapacity: z.number().int().positive(),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>
type ActiveFilter = 'all' | 'active' | 'inactive'

export function CoursesPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'))
  const isLecturer = useAuthStore((s) => s.hasRole('LECTURER'))
  const isStudent = useAuthStore((s) => s.hasRole('STUDENT'))
  const canViewRoster = isAdmin || isLecturer
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const rosterDrawer = useDisclosure()
  const [editing, setEditing] = useState<Course | null>(null)
  const [rosterCourse, setRosterCourse] = useState<Course | null>(null)
  const [page, setPage] = useState(0)
  const [departmentId, setDepartmentId] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const activeParam =
    isStudent ? true : activeFilter === 'all' ? undefined : activeFilter === 'active'

  const query = useQuery({
    queryKey: [
      'courses',
      {
        page,
        student: isStudent,
        departmentId: isAdmin ? departmentId || null : null,
        active: isStudent ? true : activeFilter,
        search: debouncedSearch || null,
      },
    ],
    queryFn: () =>
      listCourses({
        page,
        size: PAGE_SIZE,
        ...(isStudent ? { active: true } : {}),
        ...(isAdmin && departmentId ? { departmentId: Number(departmentId) } : {}),
        ...(isAdmin && activeParam !== undefined ? { active: activeParam } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
  })

  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments,
    enabled: isAdmin,
  })

  const lecturers = useQuery({
    queryKey: ['users', 'LECTURER'],
    queryFn: () => listUsers({ page: 0, size: 100, role: 'LECTURER' }),
    enabled: isAdmin,
  })

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema) as Resolver<CreateValues>,
    defaultValues: { maxCapacity: 30, credits: 3 },
  })

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema) as Resolver<EditValues>,
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['courses'] })
  }

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Course created', status: 'success' })
      createForm.reset({ maxCapacity: 30, credits: 3 })
      createModal.onClose()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditValues }) => updateCourse(id, payload),
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Course updated', status: 'success' })
      editModal.onClose()
      setEditing(null)
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  function canEditCourse(course: Course) {
    if (isAdmin) return true
    if (isLecturer && user?.id != null && course.lecturerId === user.id) return true
    return false
  }

  function openEdit(course: Course) {
    setEditing(course)
    editForm.reset({
      name: course.name,
      description: course.description ?? '',
      credits: course.credits,
      lecturerId: course.lecturerId ?? undefined,
      maxCapacity: course.maxCapacity,
    })
    editModal.onOpen()
  }

  function openRoster(course: Course) {
    setRosterCourse(course)
    rosterDrawer.onOpen()
  }

  const description = isStudent
    ? 'Browse the active course catalogue.'
    : isLecturer
      ? 'View your courses, open rosters, and update metadata on courses assigned to you.'
      : 'Manage course catalogue, capacity, activation, and rosters.'

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Courses"
        description={description}
        actions={
          isAdmin ? (
            <Button leftIcon={<FiPlus />} onClick={createModal.onOpen}>
              Add course
            </Button>
          ) : undefined
        }
      />

      <DataTableShell
        toolbar={
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <HStack flexWrap="wrap" gap={3} flex="1">
              <FormControl maxW="260px">
                <FormLabel htmlFor="course-search" mb={1} fontSize="sm">
                  Search
                </FormLabel>
                <Input
                  id="course-search"
                  size="sm"
                  placeholder="Code or name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="course-search"
                />
              </FormControl>
              <Text fontSize="sm" color="app-muted" alignSelf="flex-end" pb={1}>
                {query.data?.totalElements ?? 0} course
                {(query.data?.totalElements ?? 0) === 1 ? '' : 's'}
              </Text>
            </HStack>
            {isAdmin ? (
              <HStack flexWrap="wrap" gap={3}>
                <FormControl maxW="220px">
                  <FormLabel htmlFor="course-department-filter" mb={1} fontSize="sm">
                    Department
                  </FormLabel>
                  <Select
                    id="course-department-filter"
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
                <FormControl maxW="180px">
                  <FormLabel htmlFor="course-active-filter" mb={1} fontSize="sm">
                    Status
                  </FormLabel>
                  <Select
                    id="course-active-filter"
                    size="sm"
                    value={activeFilter}
                    onChange={(e) => {
                      setActiveFilter(e.target.value as ActiveFilter)
                      setPage(0)
                    }}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormControl>
              </HStack>
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
          <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
        ) : null}
        {query.data && !query.data.content.length ? (
          <EmptyState
            title="No courses"
            description={
              isStudent
                ? 'No active courses are available yet.'
                : departmentId || activeFilter !== 'all'
                  ? 'No courses match the selected filters.'
                  : 'Create a course to begin enrollments.'
            }
          />
        ) : null}
        {query.data && query.data.content.length > 0 ? (
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              Course catalogue
            </caption>
            <Thead>
              <Tr>
                <Th scope="col">Code</Th>
                <Th scope="col">Name</Th>
                <Th scope="col">Credits</Th>
                <Th scope="col">Capacity</Th>
                <Th scope="col">Department</Th>
                <Th scope="col">Status</Th>
                {!isStudent ? <Th scope="col">Actions</Th> : null}
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((course) => (
                <Tr key={course.id}>
                  <Td fontWeight="bold" color="brand.700">
                    {course.code}
                  </Td>
                  <Td fontWeight="medium">{course.name}</Td>
                  <Td>{course.credits}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Text as="span">
                        {course.enrolledCount ?? 0}/{course.maxCapacity}
                      </Text>
                      <CapacityBadge enrolled={course.enrolledCount} max={course.maxCapacity} />
                    </HStack>
                  </Td>
                  <Td>{course.departmentName ?? course.departmentId}</Td>
                  <Td>
                    <ActiveBadge active={course.active} />
                  </Td>
                  {!isStudent ? (
                    <Td>
                      <HStack>
                        {canViewRoster ? (
                          <IconButton
                            aria-label={`View roster for ${course.code}`}
                            icon={<FiUsers />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openRoster(course)}
                          />
                        ) : null}
                        {canEditCourse(course) ? (
                          <IconButton
                            aria-label={`Edit ${course.code}`}
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(course)}
                          />
                        ) : null}
                        {isAdmin ? (
                          <>
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
                          </>
                        ) : null}
                      </HStack>
                    </Td>
                  ) : null}
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : null}
      </DataTableShell>

      <CourseRosterDrawer
        course={rosterCourse}
        isOpen={rosterDrawer.isOpen}
        onClose={() => {
          rosterDrawer.onClose()
          setRosterCourse(null)
        }}
      />

      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as="form"
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <ModalHeader fontFamily="heading">Add course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormStack>
              <TextField
                name="code"
                label="Code"
                register={createForm.register}
                error={createForm.formState.errors.code?.message}
                isRequired
              />
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
              <TextField
                name="credits"
                label="Credits"
                type="number"
                register={createForm.register}
                error={createForm.formState.errors.credits?.message}
                isRequired
                min={1}
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
              <SelectField
                name="lecturerId"
                label="Lecturer"
                register={createForm.register}
                error={createForm.formState.errors.lecturerId?.message}
                valueAsNumber
                placeholder="Optional lecturer"
              >
                <option value="">None</option>
                {(lecturers.data?.content ?? []).map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
                  </option>
                ))}
              </SelectField>
              <TextField
                name="maxCapacity"
                label="Max capacity"
                type="number"
                register={createForm.register}
                error={createForm.formState.errors.maxCapacity?.message}
                isRequired
                min={1}
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
          <ModalHeader fontFamily="heading">Edit course{editing ? `: ${editing.code}` : ''}</ModalHeader>
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
              <TextField
                name="credits"
                label="Credits"
                type="number"
                register={editForm.register}
                error={editForm.formState.errors.credits?.message}
                isRequired
                min={1}
              />
              {isAdmin ? (
                <SelectField
                  name="lecturerId"
                  label="Lecturer"
                  register={editForm.register}
                  error={editForm.formState.errors.lecturerId?.message}
                  valueAsNumber
                  placeholder="Optional lecturer"
                >
                  <option value="">None</option>
                  {(lecturers.data?.content ?? []).map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
                    </option>
                  ))}
                </SelectField>
              ) : null}
              <TextField
                name="maxCapacity"
                label="Max capacity"
                type="number"
                register={editForm.register}
                error={editForm.formState.errors.maxCapacity?.message}
                isRequired
                min={1}
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
