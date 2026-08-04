import { Box, Container, Text, VStack } from '@chakra-ui/react'
import { Outlet, Navigate, Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/authStore'
import { authPanelVariants, fadeIn } from '@/theme/motion'

const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)

export function AuthLayout() {
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  if (authenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Box minH="100vh" position="relative" overflow="hidden" display="flex" alignItems="center" px={4} py={{ base: 10, md: 14 }}>
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(160deg, brand.900 0%, brand.700 42%, #0B3A4A 100%)"
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.4}
        backgroundImage="radial-gradient(circle at 20% 20%, rgba(45,212,191,.38), transparent 42%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.14), transparent 35%), radial-gradient(circle at 70% 80%, rgba(13,148,136,.32), transparent 40%)"
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.09}
        backgroundImage="linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)"
        backgroundSize="48px 48px"
      />

      <Container maxW="lg" position="relative" zIndex={1}>
        <MotionVStack
          spacing={3}
          mb={10}
          textAlign="center"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Box
            as={RouterLink}
            to="/"
            w="56px"
            h="56px"
            borderRadius="xl"
            bg="whiteAlpha.200"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            backdropFilter="blur(8px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontFamily="heading"
            fontWeight="700"
            fontSize="lg"
            mb={2}
            _hover={{ bg: 'whiteAlpha.300', textDecoration: 'none' }}
            aria-label="CampusFlow home"
          >
            CF
          </Box>
          <Text
            as={RouterLink}
            to="/"
            fontFamily="heading"
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="700"
            color="white"
            letterSpacing="-0.03em"
            _hover={{ textDecoration: 'none', color: 'whiteAlpha.900' }}
          >
            CampusFlow
          </Text>
          <Text color="whiteAlpha.800" maxW="md" lineHeight="tall" fontSize="md" fontWeight="medium">
            Student management for modern campuses
          </Text>
        </MotionVStack>

        <MotionBox
          bg="white"
          borderRadius="xl"
          p={{ base: 7, md: 10 }}
          shadow="auth"
          variants={authPanelVariants}
          initial="initial"
          animate="animate"
        >
          <Outlet />
        </MotionBox>
      </Container>
    </Box>
  )
}
