import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  SimpleGrid,
  Switch,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { PageHeader } from '@/components/feedback'
import { Surface } from '@/components/ui'

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
        <FormLabel htmlFor={id} mb={0} fontWeight="semibold" fontSize="md">
          {label}
        </FormLabel>
        <FormHelperText mt={1} mb={0} lineHeight="tall">
          {help}
        </FormHelperText>
      </Box>
      {children}
    </FormControl>
  )
}

export function SettingsPage() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <>
      <PageHeader
        title="Settings"
        description="Application preferences for this device. Server-synced settings will appear here when the API exposes them."
        eyebrow="Preferences"
      />
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6} alignItems="start">
        <Surface p={{ base: 6, md: 8 }}>
          <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={1} letterSpacing="-0.02em">
            Appearance
          </Text>
          <Text fontSize="sm" color="gray.500" mb={6} lineHeight="tall">
            Control how CampusFlow looks on this browser.
          </Text>
          <VStack align="stretch" spacing={6} divider={<Divider borderColor="gray.100" />}>
            <SettingRow
              id="color-mode"
              label="Dark mode"
              help="Switch between light and dark appearance."
            >
              <Switch
                id="color-mode"
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
                colorScheme="brand"
                size="lg"
              />
            </SettingRow>
            <SettingRow
              id="compact-tables"
              label="Comfortable tables"
              help="Extra row padding in directory tables (local preference placeholder)."
            >
              <Switch id="compact-tables" defaultChecked colorScheme="brand" size="lg" isDisabled />
            </SettingRow>
          </VStack>
        </Surface>

        <Surface p={{ base: 6, md: 8 }}>
          <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={1} letterSpacing="-0.02em">
            Notifications
          </Text>
          <Text fontSize="sm" color="gray.500" mb={6} lineHeight="tall">
            Delivery channels require a notifications API; toggles are ready for integration.
          </Text>
          <VStack align="stretch" spacing={6} divider={<Divider borderColor="gray.100" />}>
            <SettingRow
              id="email-alerts"
              label="Email alerts"
              help="Course and enrollment updates by email."
            >
              <Switch id="email-alerts" colorScheme="brand" size="lg" isDisabled />
            </SettingRow>
            <SettingRow
              id="in-app-alerts"
              label="In-app alerts"
              help="Show badges in the notifications inbox."
            >
              <Switch id="in-app-alerts" defaultChecked colorScheme="brand" size="lg" isDisabled />
            </SettingRow>
          </VStack>
        </Surface>

        <Surface p={{ base: 6, md: 8 }} gridColumn={{ xl: '1 / -1' }}>
          <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={2} letterSpacing="-0.02em">
            About this session
          </Text>
          <Text fontSize="sm" color="gray.500" lineHeight="tall" maxW="3xl">
            Preferences marked as placeholders are stored or mocked in the browser only. Typography uses
            Poppins system-wide per the CampusFlow design system. Accessibility: motion respects{' '}
            <Text as="span" fontWeight="semibold" color="gray.600">
              prefers-reduced-motion
            </Text>
            .
          </Text>
        </Surface>
      </SimpleGrid>
    </>
  )
}
