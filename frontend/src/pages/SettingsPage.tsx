import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Switch,
  Text,
  VStack,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { PageHeader } from '@/components/feedback'
import { Surface } from '@/components/ui'
import { updateThemePreference } from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/features/auth/authStore'

function SettingRow({
  id,
  label,
  help,
  children,
}: {
  id: string
  label: string
  help: string
  children: ReactNode
}) {
  return (
    <FormControl display="flex" alignItems="center" justifyContent="space-between" gap={6}>
      <Box flex="1" minW={0}>
        <FormLabel htmlFor={id} mb={0} fontWeight="semibold" fontSize="md" color="app-text">
          {label}
        </FormLabel>
        <FormHelperText mt={1} mb={0} lineHeight="tall" color="app-muted">
          {help}
        </FormHelperText>
      </Box>
      {children}
    </FormControl>
  )
}

export function SettingsPage() {
  const { colorMode, setColorMode } = useColorMode()
  const updateUser = useAuthStore((s) => s.updateUser)
  const toast = useToast()
  const [saving, setSaving] = useState(false)

  async function handleDarkModeChange(nextDark: boolean) {
    const nextTheme = nextDark ? 'dark' : 'light'
    setColorMode(nextTheme)
    setSaving(true)
    try {
      const user = await updateThemePreference(nextTheme)
      updateUser({
        ...user,
        role: user.role as 'ADMIN' | 'LECTURER' | 'STUDENT',
      })
      toast({
        title: nextTheme === 'dark' ? 'Dark mode on' : 'Light mode on',
        description: 'Your preference is saved to your account.',
        status: 'success',
        duration: 2200,
      })
    } catch (error) {
      setColorMode(nextDark ? 'light' : 'dark')
      toast({
        title: getErrorMessage(error, 'Could not save theme preference'),
        status: 'error',
        duration: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Appearance preferences sync to your account and apply on your next login."
        eyebrow="Preferences"
      />
      <Surface p={{ base: 6, md: 8 }} maxW="3xl">
        <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={1} letterSpacing="-0.02em" color="app-text">
          Appearance
        </Text>
        <Text fontSize="sm" color="app-muted" mb={6} lineHeight="tall">
          Dark mode applies across CampusFlow and is stored with your user profile.
        </Text>
        <VStack align="stretch" spacing={6} divider={<Divider />}>
          <SettingRow
            id="color-mode"
            label="Dark mode"
            help="Switch between light and dark appearance for the whole app."
          >
            <Switch
              id="color-mode"
              isChecked={colorMode === 'dark'}
              onChange={(e) => handleDarkModeChange(e.target.checked)}
              isDisabled={saving}
              colorScheme="brand"
              size="lg"
            />
          </SettingRow>
        </VStack>
        <Text fontSize="sm" color="app-muted" lineHeight="tall" mt={8}>
          Notification delivery preferences will appear here when the notifications API is available.
          Theme is saved as <Text as="span" fontWeight="semibold">preferred_theme</Text> on your account.
        </Text>
      </Surface>
    </>
  )
}
