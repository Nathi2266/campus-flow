import {
  Alert,
  AlertIcon,
  Button,
  Link,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { register as registerUser } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'
import { FormStack, NumberField, SelectField, TextField } from '@/components/FormFields'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  role: z.enum(['ADMIN', 'LECTURER', 'STUDENT']),
  departmentId: z.number().optional(),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const toast = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
    },
  })

  const role = watch('role')

  async function onSubmit(values: FormValues) {
    setSubmitError(null)
    try {
      const data = await registerUser({
        ...values,
        departmentId: role === 'STUDENT' ? undefined : values.departmentId,
      })
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          ...data.user,
          role: data.user.role as 'ADMIN' | 'LECTURER' | 'STUDENT',
        },
      })
      toast({ title: 'Account created', status: 'success', duration: 2500 })
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Registration failed'))
    }
  }

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em" color="brand.600">
          Get started
        </Text>
        <Text as="h2" fontFamily="heading" fontSize="2.2rem" fontWeight="700" letterSpacing="-0.03em">
          Create account
        </Text>
        <Text color="gray.500">Register as a student, lecturer, or administrator.</Text>
      </Stack>
      {submitError ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {submitError}
        </Alert>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormStack>
          <TextField name="firstName" label="First name" register={register} error={errors.firstName?.message} isRequired />
          <TextField name="lastName" label="Last name" register={register} error={errors.lastName?.message} isRequired />
          <TextField name="email" label="Email" type="email" register={register} error={errors.email?.message} isRequired />
          <TextField
            name="password"
            label="Password"
            type="password"
            register={register}
            error={errors.password?.message}
            isRequired
          />
          <SelectField name="role" label="Role" register={register} error={errors.role?.message} isRequired>
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ADMIN">Administrator</option>
          </SelectField>
          {role !== 'STUDENT' ? (
            <NumberField
              name="departmentId"
              label="Department ID"
              control={control}
              error={errors.departmentId?.message}
              min={1}
            />
          ) : null}
          <Button type="submit" isLoading={isSubmitting} width="full" size="lg" mt={2}>
            Register
          </Button>
        </FormStack>
      </form>
      <Text fontSize="sm" color="gray.600" textAlign="center">
        Already registered?{' '}
        <Link as={RouterLink} to="/login" color="brand.600" fontWeight="semibold">
          Sign in
        </Link>
      </Text>
    </Stack>
  )
}
