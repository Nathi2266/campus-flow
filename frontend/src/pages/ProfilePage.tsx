import {
  Avatar,
  Badge,
  Box,
  Button,
  HStack,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getMe, updateProfile } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { FormStack, TextField } from '@/components/FormFields'
import { ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { Surface } from '@/components/ui'
import { useAuthStore } from '@/features/auth/authStore'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phoneNumber: z.string().max(20).optional(),
})

type FormValues = z.infer<typeof schema>

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Box
      p={4}
      borderRadius="md"
      bg="canvas.50"
      borderWidth="1px"
      borderColor="blackAlpha.50"
      minH="88px"
    >
      <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em" color="gray.500">
        {label}
      </Text>
      <Text mt={2} fontWeight="600" fontSize="lg" letterSpacing="-0.01em" wordBreak="break-word">
        {value}
      </Text>
    </Box>
  )
}

export function ProfilePage() {
  const toast = useToast()
  const storeUser = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  })

  useEffect(() => {
    const user = meQuery.data
    if (!user) return
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? '',
    })
    updateUser(user)
  }, [meQuery.data, reset, updateUser])

  const saveMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      updateUser(user)
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber ?? '',
      })
      toast({ title: 'Profile updated', status: 'success' })
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const user = meQuery.data ?? storeUser

  return (
    <>
      <PageHeader title="Profile" description="View and update your CampusFlow account details." eyebrow="Account" />
      {meQuery.isLoading ? <LoadingState /> : null}
      {meQuery.isError ? (
        <ErrorState message={getErrorMessage(meQuery.error)} onRetry={() => meQuery.refetch()} />
      ) : null}
      {user && !meQuery.isLoading ? (
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6} alignItems="start">
          <Surface p={{ base: 6, md: 8 }} gridColumn={{ lg: 'span 4' }}>
            <VStack spacing={5} align="center" textAlign="center" py={4}>
              <Avatar
                size="2xl"
                name={`${user.firstName} ${user.lastName}`}
                bg="brand.500"
                color="white"
              />
              <Box>
                <Text fontFamily="heading" fontSize="2xl" fontWeight="700" letterSpacing="-0.02em">
                  {user.firstName} {user.lastName}
                </Text>
                <HStack justify="center" mt={2}>
                  <Badge colorScheme="teal" px={3} py={1} borderRadius="md" fontWeight="600">
                    {user.role}
                  </Badge>
                </HStack>
              </Box>
            </VStack>
          </Surface>

          <VStack spacing={6} align="stretch" gridColumn={{ lg: 'span 8' }}>
            <Surface p={{ base: 6, md: 8 }}>
              <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={5} letterSpacing="-0.02em">
                Account details
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <ProfileField label="Email" value={user.email ?? '—'} />
                <ProfileField
                  label="Department ID"
                  value={user.departmentId != null ? String(user.departmentId) : '—'}
                />
                <ProfileField label="Phone" value={user.phoneNumber ?? '—'} />
                <ProfileField label="User ID" value={user.id != null ? String(user.id) : '—'} />
                {user.studentId != null ? (
                  <ProfileField label="Student ID" value={String(user.studentId)} />
                ) : null}
              </SimpleGrid>
            </Surface>

            <Surface p={{ base: 6, md: 8 }} as="form" onSubmit={handleSubmit((values) => saveMutation.mutate({
              firstName: values.firstName,
              lastName: values.lastName,
              phoneNumber: values.phoneNumber || null,
            }))}>
              <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={5} letterSpacing="-0.02em">
                Edit profile
              </Text>
              <FormStack>
                <TextField
                  name="firstName"
                  label="First name"
                  register={register}
                  error={errors.firstName?.message}
                  isRequired
                />
                <TextField
                  name="lastName"
                  label="Last name"
                  register={register}
                  error={errors.lastName?.message}
                  isRequired
                />
                <TextField
                  name="phoneNumber"
                  label="Phone number"
                  register={register}
                  error={errors.phoneNumber?.message}
                />
                <Button
                  type="submit"
                  alignSelf="flex-start"
                  isLoading={isSubmitting || saveMutation.isPending}
                  isDisabled={!isDirty}
                >
                  Save changes
                </Button>
              </FormStack>
            </Surface>
          </VStack>
        </SimpleGrid>
      ) : null}
    </>
  )
}
