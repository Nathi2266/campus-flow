import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Circle,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { FiAlertCircle, FiInbox } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { fadeIn } from '@/theme/motion'
import { Surface } from '@/components/ui'
import { RotatingLogo } from '@/components/RotatingLogo'

const MotionBox = motion.create(Box)

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <MotionBox variants={fadeIn} initial="initial" animate="animate">
      <VStack py={20} spacing={4} role="status" aria-busy="true" aria-live="polite">
        <RotatingLogo boxSize="64px" />
        <Text color="app-muted" fontWeight="medium">
          {label}
        </Text>
      </VStack>
    </MotionBox>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Surface p={{ base: 8, md: 12 }} textAlign="center">
      <VStack spacing={4}>
        <Circle size="56px" bg="brand-soft-bg" color="brand-soft-fg" fontSize="xl">
          <FiInbox aria-hidden />
        </Circle>
        <Text fontFamily="heading" fontWeight="semibold" fontSize="xl" color="app-text">
          {title}
        </Text>
        {description ? (
          <Text color="app-muted" maxW="md" lineHeight="tall">
            {description}
          </Text>
        ) : null}
        {action}
      </VStack>
    </Surface>
  )
}

export function ErrorState({
  title = 'Unable to load',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="flex-start"
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="red.100"
      bg="red.50"
      _dark={{ bg: 'rgba(254, 178, 178, 0.12)', borderColor: 'red.300' }}
    >
      <AlertIcon as={FiAlertCircle} boxSize={5} />
      <AlertTitle mt={3} fontFamily="heading" fontSize="lg" color="app-text">
        {title}
      </AlertTitle>
      {message ? (
        <AlertDescription mt={1} color="app-text">
          {message}
        </AlertDescription>
      ) : null}
      {onRetry ? (
        <Button mt={4} size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Alert>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <Box
      mb={8}
      display="flex"
      flexDir={{ base: 'column', md: 'row' }}
      gap={4}
      alignItems={{ md: 'flex-end' }}
      justifyContent="space-between"
    >
      <Box maxW="3xl">
        {eyebrow ? (
          <Text
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.12em"
            color="brand.600"
            mb={2}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text
          as="h1"
          fontFamily="heading"
          fontSize={{ base: '2.25rem', md: '2.6rem' }}
          fontWeight="700"
          letterSpacing="-0.03em"
          lineHeight="1.15"
          color="app-text"
        >
          {title}
        </Text>
        {description ? (
          <Text mt={2} color="app-muted" fontSize="md" lineHeight="tall" maxW="42rem">
            {description}
          </Text>
        ) : null}
      </Box>
      {actions}
    </Box>
  )
}
