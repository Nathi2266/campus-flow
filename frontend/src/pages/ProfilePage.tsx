import { Avatar, Box, SimpleGrid, Text, VStack, Badge, HStack } from '@chakra-ui/react'
import { useAuthStore } from '@/features/auth/authStore'
import { PageHeader } from '@/components/feedback'
import { Surface } from '@/components/ui'

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Box
      p={4}
      borderRadius="md"
      bg="canvas.50"
      borderWidth="1px"
      borderColor="blackAlpha.50"
      minH="88px"
    >
      <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="0.08em" color="gray.500">
        {label}
      </Text>
      <Text mt={2} fontWeight="600" fontSize="lg" letterSpacing="-0.01em" wordBreak="break-word">
        {value}
      </Text>
    </Box>
  )
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <PageHeader title="Profile" description="Your CampusFlow account details." eyebrow="Account" />
      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={6} alignItems="start">
        <Surface p={{ base: 6, md: 8 }} gridColumn={{ lg: 'span 4' }}>
          <VStack spacing={5} align="center" textAlign="center" py={4}>
            <Avatar
              size="2xl"
              name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
              bg="brand.500"
              color="white"
            />
            <Box>
              <Text fontFamily="heading" fontSize="2xl" fontWeight="700" letterSpacing="-0.02em">
                {user?.firstName} {user?.lastName}
              </Text>
              <HStack justify="center" mt={2}>
                <Badge colorScheme="teal" px={3} py={1} borderRadius="md" fontWeight="600">
                  {user?.role}
                </Badge>
              </HStack>
            </Box>
            <Text fontSize="sm" color="gray.500" lineHeight="tall" maxW="xs">
              Profile editing requires a working GET/PATCH /auth/me endpoint (currently stubbed on the API).
            </Text>
          </VStack>
        </Surface>

        <Surface p={{ base: 6, md: 8 }} gridColumn={{ lg: 'span 8' }}>
          <Text fontFamily="heading" fontWeight="600" fontSize="lg" mb={5} letterSpacing="-0.02em">
            Account details
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <ProfileField label="Email" value={user?.email ?? '—'} />
            <ProfileField
              label="Department ID"
              value={user?.departmentId != null ? String(user.departmentId) : '—'}
            />
            <ProfileField label="Phone" value={user?.phoneNumber ?? '—'} />
            <ProfileField label="User ID" value={user?.id != null ? String(user.id) : '—'} />
          </SimpleGrid>
        </Surface>
      </SimpleGrid>
    </>
  )
}
