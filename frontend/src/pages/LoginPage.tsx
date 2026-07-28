import {
  Alert,
  AlertIcon,
  Button,
  Link,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { login } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'
import { FormStack, TextField } from '@/components/FormFields'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const toast = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setSubmitError(null)
    try {
      const data = await login(values)
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          ...data.user,
          role: data.user.role as 'ADMIN' | 'LECTURER' | 'STUDENT',
        },
      })
      toast({ title: 'Signed in', status: 'success', duration: 2500 })
      navigate(from, { replace: true })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Login failed'))
    }
  }

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em" color="brand.600">
          Welcome back
        </Text>
        <Text as="h2" fontFamily="heading" fontSize="2.2rem" fontWeight="700" letterSpacing="-0.03em">
          Sign in
        </Text>
        <Text color="gray.500">Use your CampusFlow account to continue.</Text>
      </Stack>
      {submitError ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {submitError}
        </Alert>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormStack>
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            register={register}
            error={errors.email?.message}
            isRequired
            data-testid="login-email"
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            register={register}
            error={errors.password?.message}
            isRequired
            data-testid="login-password"
          />
          <Button type="submit" isLoading={isSubmitting} width="full" size="lg" mt={2} data-testid="login-submit">
            Sign in
          </Button>
        </FormStack>
      </form>
      <Text fontSize="sm" color="gray.600" textAlign="center">
        Need an account?{' '}
        <Link as={RouterLink} to="/register" color="brand.600" fontWeight="semibold">
          Register
        </Link>
      </Text>
    </Stack>
  )
}
