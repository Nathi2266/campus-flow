import { Alert, AlertDescription, AlertIcon } from '@chakra-ui/react'
import { EmptyState, PageHeader } from '@/components/feedback'

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
        <AlertDescription>Notifications API is not available yet.</AlertDescription>
      </Alert>

      <EmptyState
        title="No notifications"
        description="There is nothing to show until CampusFlow exposes a notifications resource."
      />
    </>
  )
}
