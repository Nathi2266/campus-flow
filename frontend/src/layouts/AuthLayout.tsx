import { Box, Container, Text, VStack } from '@chakra-ui/react'
import { Outlet, Navigate, Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/authStore'
import { authPanelVariants, fadeIn } from '@/theme/motion'
import { BrandLogo } from '@/components/BrandLogo'
import { PageTransition } from '@/components/PageTransition'

const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)

export function AuthLayout() {
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  if (authenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Box
      minH="100vh"
      position="relative"
      overflowY="auto"
      overflowX="hidden"
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      px={4}
      py={{ base: 8, md: 12 }}
    >
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        bgGradient="linear(160deg, brand.900 0%, brand.700 42%, #0B3A4A 100%)"
      />
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        opacity={0.4}
        backgroundImage="radial-gradient(circle at 20% 20%, rgba(45,212,191,.38), transparent 42%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.14), transparent 35%), radial-gradient(circle at 70% 80%, rgba(13,148,136,.32), transparent 40%)"
      />
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        opacity={0.09}
        backgroundImage="linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)"
        backgroundSize="48px 48px"
      />

      <Container maxW="lg" position="relative" zIndex={1} w="full" pb={10}>
        <MotionVStack
          spacing={2}
          mb={6}
          textAlign="center"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Box
            as={RouterLink}
            to="/"
            display="inline-flex"
            mb={1}
            transition="opacity 0.18s ease, transform 0.18s ease"
            _hover={{ opacity: 0.92, textDecoration: 'none', transform: 'scale(1.04)' }}
            aria-label="CampusFlow home"
          >
            <BrandLogo boxSize="56px" />
          </Box>
          <Text
            as={RouterLink}
            to="/"
            fontFamily="heading"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="700"
            color="white"
            letterSpacing="-0.03em"
            _hover={{ textDecoration: 'none', color: 'whiteAlpha.900' }}
          >
            CampusFlow
          </Text>
          <Text color="whiteAlpha.800" maxW="md" lineHeight="tall" fontSize="sm" fontWeight="medium">
            Student management for modern campuses
          </Text>
        </MotionVStack>

        <MotionBox
          bg="app-surface"
          color="app-text"
          borderRadius="xl"
          p={{ base: 6, md: 8 }}
          shadow="auth"
          variants={authPanelVariants}
          initial="initial"
          animate="animate"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </MotionBox>
      </Container>
    </Box>
  )
}
