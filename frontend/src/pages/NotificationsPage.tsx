import {
  Badge,
  Box,
  Button,
  HStack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { Surface } from '@/components/ui'

export function NotificationsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => listNotifications({ page: 0, size: 50 }),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markOne = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: async () => {
      await invalidate()
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'All notifications marked read', status: 'success', duration: 2000 })
    },
    onError: (error) => toast({ title: getErrorMessage(error), status: 'error' }),
  })

  const items = query.data?.content ?? []
  const unread = items.filter((n) => n.unread).length

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Campus alerts for enrollments, grades, and capacity."
        actions={
          unread > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll.mutate()}
              isLoading={markAll.isPending}
              data-testid="notifications-mark-all-read"
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? <LoadingState label="Loading notifications…" /> : null}
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="When grades are posted or enrollments change, updates appear here."
        />
      ) : null}

      <VStack align="stretch" spacing={3} mt={2}>
        {items.map((item) => (
          <Surface
            key={item.id}
            p={4}
            opacity={item.unread ? 1 : 0.85}
            borderLeftWidth="3px"
            borderLeftColor={item.unread ? 'brand.500' : 'transparent'}
            data-testid={`notification-${item.id}`}
          >
            <HStack justify="space-between" align="flex-start" spacing={4}>
              <Box flex="1" minW={0}>
                <HStack spacing={2} mb={1} flexWrap="wrap">
                  <Text fontWeight="semibold" color="app-text">
                    {item.title}
                  </Text>
                  {item.unread ? (
                    <Badge colorScheme="brand" data-testid="notification-unread">
                      Unread
                    </Badge>
                  ) : null}
                  <Badge variant="subtle">{item.type}</Badge>
                </HStack>
                {item.body ? (
                  <Text fontSize="sm" color="app-muted" lineHeight="tall">
                    {item.body}
                  </Text>
                ) : null}
                <Text fontSize="xs" color="app-muted" mt={2}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </Box>
              {item.unread ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markOne.mutate(item.id)}
                  isLoading={markOne.isPending}
                  data-testid={`notification-mark-read-${item.id}`}
                >
                  Mark read
                </Button>
              ) : null}
            </HStack>
          </Surface>
        ))}
      </VStack>
    </>
  )
}
