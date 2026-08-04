import { Button, Heading, HStack, Text, VStack } from '@chakra-ui/react'
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
        <HStack mt={8} justify="center" spacing={3} flexWrap="wrap">
          <Button as={RouterLink} to="/" size="lg" variant="outline">
            Home
          </Button>
          <Button as={RouterLink} to="/login" size="lg">
            Sign in
          </Button>
        </HStack>
      </AnimatedSurface>
    </VStack>
  )
}
