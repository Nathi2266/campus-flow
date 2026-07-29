import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FiBell, FiBook, FiClipboard, FiInfo } from 'react-icons/fi'
import { EmptyState, PageHeader } from '@/components/feedback'
import { Surface, Stagger, StaggerItem } from '@/components/ui'

const categories = [
  { label: 'All', icon: FiBell, hint: 'Every campus alert' },
  { label: 'Courses', icon: FiBook, hint: 'Catalogue & capacity' },
  { label: 'Enrollments', icon: FiClipboard, hint: 'Status changes' },
  { label: 'System', icon: FiInfo, hint: 'Maintenance & policy' },
] as const

export function NotificationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Campus alerts and reminders will appear here when the notifications API is available."
      />

      <Alert status="info" variant="subtle" borderRadius="md" mb={6} role="status">
        <AlertIcon />
        <AlertDescription>Notifications API coming soon</AlertDescription>
      </Alert>

      <Stagger>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={8}>
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <StaggerItem key={cat.label}>
                <Surface p={5} interactive aria-disabled>
                  <HStack spacing={3} mb={2}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="md"
                      bg="brand.50"
                      color="brand.700"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="lg"
                      aria-hidden
                    >
                      <Icon />
                    </Box>
                    <Text fontWeight="600" letterSpacing="-0.01em">
                      {cat.label}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {cat.hint}
                  </Text>
                </Surface>
              </StaggerItem>
            )
          })}
        </SimpleGrid>
      </Stagger>

      <EmptyState
        title="No notifications yet"
        description="The CampusFlow API does not expose a notifications resource yet. Category filters above are ready for integration."
      />

      <Surface mt={6} p={5}>
        <VStack align="stretch" spacing={1}>
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            Integration note
          </Text>
          <Text fontSize="sm" color="gray.500" lineHeight="tall">
            When notifications land, wire unread counts to the nav badge and respect role scoping from the API
            contract.
          </Text>
        </VStack>
      </Surface>
    </>
  )
}
