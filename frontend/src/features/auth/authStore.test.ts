import { describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/authStore'

describe('authStore', () => {
  it('stores and clears a session', () => {
    useAuthStore.getState().clearSession()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)

    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: {
        id: 1,
        email: 'admin@campus.edu',
        firstName: 'Ada',
        lastName: 'Admin',
        role: 'ADMIN',
        departmentId: 1,
        phoneNumber: null,
      },
    })

    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
    expect(useAuthStore.getState().hasRole('ADMIN')).toBe(true)
    expect(useAuthStore.getState().hasRole('STUDENT')).toBe(false)

    useAuthStore.getState().updateUser({
      id: 1,
      email: 'admin@campus.edu',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: 'ADMIN',
      departmentId: 1,
      phoneNumber: '555-0100',
      studentId: null,
    })
    expect(useAuthStore.getState().user?.lastName).toBe('Lovelace')
    expect(useAuthStore.getState().accessToken).toBe('access')

    useAuthStore.getState().clearSession()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
