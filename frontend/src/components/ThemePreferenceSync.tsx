import { useColorMode } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/features/auth/authStore'

/**
 * Applies the authenticated user's preferred theme across the app.
 * Chakra persists color mode locally; we re-sync from the server on login.
 */
export function ThemePreferenceSync() {
  const preferredTheme = useAuthStore((s) => s.user?.preferredTheme)
  const { colorMode, setColorMode } = useColorMode()
  const lastApplied = useRef<string | null>(null)

  useEffect(() => {
    if (!preferredTheme) return
    if (preferredTheme !== 'light' && preferredTheme !== 'dark') return
    if (lastApplied.current === preferredTheme && colorMode === preferredTheme) return
    lastApplied.current = preferredTheme
    if (colorMode !== preferredTheme) {
      setColorMode(preferredTheme)
    }
  }, [preferredTheme, colorMode, setColorMode])

  return null
}
