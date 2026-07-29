import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from '@/types'
import { useAuthStore } from '@/features/auth/authStore'
import { refreshSession } from '@/api/auth'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  _skipAuthRefresh?: boolean
}

let refreshPromise: Promise<Awaited<ReturnType<typeof refreshSession>>> | null = null

function clearSessionAndRedirect() {
  useAuthStore.getState().clearSession()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

function isAuthCredentialRequest(url?: string) {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  )
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetriableConfig | undefined

    if (error.response?.status !== 401 || !original) {
      return Promise.reject(error)
    }

    if (original._retry || original._skipAuthRefresh || isAuthCredentialRequest(original.url)) {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }

    const { refreshToken, setSession } = useAuthStore.getState()
    if (!refreshToken) {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession(refreshToken).finally(() => {
          refreshPromise = null
        })
      }
      const auth = await refreshPromise
      setSession({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        user: auth.user,
      })
      original.headers.Authorization = `Bearer ${auth.accessToken}`
      return api(original)
    } catch {
      clearSessionAndRedirect()
      return Promise.reject(error)
    }
  },
)

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
