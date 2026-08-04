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
import { updateNotifyPreference, updateThemePreference } from '@/api/auth'
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
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const toast = useToast()
  const [savingTheme, setSavingTheme] = useState(false)
  const [savingNotify, setSavingNotify] = useState(false)
  const notifyInApp = user?.notifyInApp !== false

  async function handleDarkModeChange(nextDark: boolean) {
    const nextTheme = nextDark ? 'dark' : 'light'
    setColorMode(nextTheme)
    setSavingTheme(true)
    try {
      const next = await updateThemePreference(nextTheme)
      updateUser({
        ...next,
        role: next.role as 'ADMIN' | 'LECTURER' | 'STUDENT',
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
      setSavingTheme(false)
    }
  }

  async function handleNotifyChange(next: boolean) {
    setSavingNotify(true)
    try {
      const updated = await updateNotifyPreference(next)
      updateUser({
        ...updated,
        role: updated.role as 'ADMIN' | 'LECTURER' | 'STUDENT',
      })
      toast({
        title: next ? 'In-app notifications on' : 'In-app notifications off',
        status: 'success',
        duration: 2200,
      })
    } catch (error) {
      toast({
        title: getErrorMessage(error, 'Could not save notification preference'),
        status: 'error',
        duration: 4000,
      })
    } finally {
      setSavingNotify(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Appearance and notification preferences sync to your account."
        eyebrow="Preferences"
      />
      <Surface p={{ base: 6, md: 8 }} maxW="3xl">
        <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={1} letterSpacing="-0.02em" color="app-text">
          Appearance
        </Text>
        <Text fontSize="sm" color="app-muted" mb={6} lineHeight="tall">
          Dark mode applies across CampusFlow and is stored with your user profile.
        </Text>
        <VStack align="stretch" spacing={6} divider={<Divider />} mb={10}>
          <SettingRow
            id="color-mode"
            label="Dark mode"
            help="Switch between light and dark appearance for the whole app."
          >
            <Switch
              id="color-mode"
              isChecked={colorMode === 'dark'}
              onChange={(e) => handleDarkModeChange(e.target.checked)}
              isDisabled={savingTheme}
              colorScheme="brand"
              size="lg"
            />
          </SettingRow>
        </VStack>

        <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={1} letterSpacing="-0.02em" color="app-text">
          Notifications
        </Text>
        <Text fontSize="sm" color="app-muted" mb={6} lineHeight="tall">
          Control whether CampusFlow stores in-app alerts for your account.
        </Text>
        <VStack align="stretch" spacing={6} divider={<Divider />}>
          <SettingRow
            id="notify-in-app"
            label="In-app notifications"
            help="When off, new grade and enrollment alerts are not delivered to your inbox."
          >
            <Switch
              id="notify-in-app"
              isChecked={notifyInApp}
              onChange={(e) => handleNotifyChange(e.target.checked)}
              isDisabled={savingNotify}
              colorScheme="brand"
              size="lg"
              data-testid="settings-notify-in-app"
            />
          </SettingRow>
        </VStack>
      </Surface>
    </>
  )
}
