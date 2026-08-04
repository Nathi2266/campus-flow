import axios from 'axios'
import { api } from '@/api/client'
import type { AuthResponse, User } from '@/types'

/** Plain client so refresh never hits the 401 interceptor (avoids loops). */
const refreshClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'STUDENT'
  departmentId?: number | null
}

export interface ProfileUpdatePayload {
  firstName: string
  lastName: string
  phoneNumber?: string | null
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const { data } = await refreshClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    await api.post('/auth/logout', { refreshToken })
  } catch {
    // Always clear local session even if revoke fails
  }
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')
  return data
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<User> {
  const { data } = await api.patch<User>('/auth/me', payload)
  return data
}

export async function updateThemePreference(preferredTheme: 'light' | 'dark'): Promise<User> {
  const { data } = await api.patch<User>('/auth/me/theme', { preferredTheme })
  return data
}

export async function updateNotifyPreference(notifyInApp: boolean): Promise<User> {
  const { data } = await api.patch<User>('/auth/me/notifications', { notifyInApp })
  return data
}
