import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { AnimatedSurface } from '@/components/AnimatedSurface'

export function NotFoundPage() {
  return (
    <VStack minH="70vh" justify="center" spacing={6} textAlign="center" px={4}>
      <AnimatedSurface p={{ base: 10, md: 14 }} maxW="lg" w="full">
        <Text
          fontFamily="heading"
          fontSize="6xl"
          fontWeight="700"
          color="brand.600"
          letterSpacing="-0.04em"
          lineHeight="1"
        >
          404
        </Text>
        <Heading mt={4} size="lg" fontFamily="heading" fontWeight="700">
          Page not found
        </Heading>
        <Text mt={3} color="gray.500" lineHeight="tall">
          This page does not exist in CampusFlow.
        </Text>
        <Button as={RouterLink} to="/" mt={8} size="lg">
          Back to dashboard
        </Button>
      </AnimatedSurface>
    </VStack>
  )
}
