import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link as CLink,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiLock,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import { useAuthStore } from '@/features/auth/authStore'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { fadeIn, heroVariants, heroVisualVariants, staggerContainer, staggerItem } from '@/theme/motion'

const MotionBox = motion.create(Box)
const MotionFlex = motion.create(Flex)
const MotionVStack = motion.create(VStack)

const howItWorks = [
  {
    step: '01',
    title: 'Provision your campus',
    body: 'Administrators set up departments, staff accounts, and the course catalogue for the organisation.',
  },
  {
    step: '02',
    title: 'Teach and enroll',
    body: 'Lecturers manage assigned courses while students browse the catalogue and enroll where capacity allows.',
  },
  {
    step: '03',
    title: 'Track academic progress',
    body: 'Record grades, review enrollment status, and use reports and audit history when you have access.',
  },
] as const

const roles = [
  {
    title: 'Administrators',
    body: 'Organisation-wide control of departments, users, students, courses, reports, and audit.',
    icon: FiShield,
    to: '/roles',
  },
  {
    title: 'Lecturers',
    body: 'Update your courses, review rosters, and enter grades for teaching assignments.',
    icon: FiBookOpen,
    to: '/roles',
  },
  {
    title: 'Students',
    body: 'Explore active courses, self-enroll or drop, and follow your own grades and status.',
    icon: FiUsers,
    to: '/roles',
  },
] as const

const capabilities = [
  {
    title: 'Student records',
    body: 'Maintain profiles with academic status and department affiliation.',
    icon: FiUsers,
  },
  {
    title: 'Course catalogue',
    body: 'Publish courses with capacity, credits, and lecturer assignment.',
    icon: FiBookOpen,
  },
  {
    title: 'Enrollments & grades',
    body: 'Link students to courses and record grades where permitted.',
    icon: FiClipboard,
  },
  {
    title: 'Reports & audit',
    body: 'Campus statistics and administrative action history for authorised roles.',
    icon: FiShield,
  },
] as const

const exploreCards = [
  {
    title: 'Features',
    body: 'See how catalogue, enrollments, grades, and reporting fit together.',
    to: '/features',
  },
  {
    title: 'Roles',
    body: 'Understand what administrators, lecturers, and students can do.',
    to: '/roles',
  },
  {
    title: 'About',
    body: 'Learn the product purpose and the principles behind CampusFlow.',
    to: '/about',
  },
] as const

function CampusVisual() {
  return (
    <Box
      as="svg"
      viewBox="0 0 960 720"
      w="full"
      h="full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="55%" stopColor="#115E59" />
          <stop offset="100%" stopColor="#042F2E" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CCFBF1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#99F6E4" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#sky)" />
      <circle cx="780" cy="120" r="90" fill="#2DD4BF" opacity="0.18" />
      <circle cx="160" cy="200" r="140" fill="#5EEAD4" opacity="0.1" />
      <rect y="520" width="960" height="200" fill="#042F2E" opacity="0.55" />
      <rect x="220" y="260" width="520" height="280" fill="#0D9488" opacity="0.55" />
      <rect x="220" y="260" width="520" height="280" fill="url(#glass)" />
      <rect x="240" y="290" width="70" height="90" fill="#F0FDFA" opacity="0.2" />
      <rect x="330" y="290" width="70" height="90" fill="#F0FDFA" opacity="0.16" />
      <rect x="420" y="290" width="70" height="90" fill="#F0FDFA" opacity="0.2" />
      <rect x="510" y="290" width="70" height="90" fill="#F0FDFA" opacity="0.16" />
      <rect x="600" y="290" width="70" height="90" fill="#F0FDFA" opacity="0.2" />
      <rect x="240" y="400" width="70" height="90" fill="#F0FDFA" opacity="0.14" />
      <rect x="330" y="400" width="70" height="90" fill="#F0FDFA" opacity="0.18" />
      <rect x="560" y="400" width="110" height="140" fill="#042F2E" opacity="0.35" />
      <rect x="80" y="340" width="140" height="200" fill="#134E4A" opacity="0.85" />
      <rect x="100" y="370" width="40" height="55" fill="#CCFBF1" opacity="0.15" />
      <rect x="160" y="370" width="40" height="55" fill="#CCFBF1" opacity="0.12" />
      <rect x="100" y="450" width="40" height="55" fill="#CCFBF1" opacity="0.12" />
      <rect x="740" y="200" width="100" height="340" fill="#0F766E" opacity="0.9" />
      <rect x="760" y="230" width="28" height="40" fill="#F0FDFA" opacity="0.18" />
      <rect x="800" y="230" width="28" height="40" fill="#F0FDFA" opacity="0.14" />
      <rect x="760" y="300" width="28" height="40" fill="#F0FDFA" opacity="0.14" />
      <rect x="800" y="300" width="28" height="40" fill="#F0FDFA" opacity="0.18" />
      <polygon points="740,200 790,140 840,200" fill="#2DD4BF" opacity="0.45" />
      <path d="M420 540 L480 720 L560 720 L500 540 Z" fill="#0B3A4A" opacity="0.5" />
    </Box>
  )
}

export function LandingPage() {
  const authenticated = useAuthStore((s) => s.isAuthenticated())

  if (authenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <MarketingLayout transparentHero>
      {/* Hero — only place with the two auth buttons */}
      <Box as="section" position="relative" minH={{ base: '100svh', md: '100vh' }} color="white">
        <MotionBox
          position="absolute"
          inset={0}
          variants={heroVisualVariants}
          initial="initial"
          animate="animate"
        >
          <CampusVisual />
        </MotionBox>
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-r, blackAlpha.800 0%, blackAlpha.700 42%, blackAlpha.400 100%)"
        />

        <MotionFlex
          position="relative"
          zIndex={1}
          minH={{ base: '100svh', md: '100vh' }}
          align="center"
          px={{ base: 5, md: 10, lg: 14 }}
          pt={{ base: 24, md: 28 }}
          pb={{ base: 16, md: 20 }}
          variants={heroVariants}
          initial="initial"
          animate="animate"
        >
          <VStack align="flex-start" spacing={6} maxW="2xl">
            <Text
              as="h1"
              fontFamily="heading"
              fontSize={{ base: '3.25rem', md: '4.5rem', lg: '5rem' }}
              fontWeight="700"
              letterSpacing="-0.04em"
              lineHeight="0.95"
            >
              CampusFlow
            </Text>
            <Text
              as="p"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="600"
              letterSpacing="-0.02em"
              lineHeight="1.25"
              maxW="xl"
            >
              Student management for modern campuses
            </Text>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.800" maxW="lg" lineHeight="tall">
              One calm workspace for administrators, lecturers, and students to run courses, enrollments,
              and academic records — with role-scoped access.
            </Text>
            <HStack spacing={4} pt={2} flexWrap="wrap">
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                bg="brand.500"
                color="white"
                _hover={{ bg: 'brand.400' }}
                px={8}
                data-testid="landing-cta-signin"
              >
                Sign in
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                variant="outline"
                borderColor="whiteAlpha.700"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                px={8}
                data-testid="landing-cta-register"
              >
                Create account
              </Button>
            </HStack>
          </VStack>
        </MotionFlex>
      </Box>

      {/* How it works */}
      <Box as="section" py={{ base: 16, md: 24 }} px={{ base: 5, md: 10 }} bg="app-surface">
        <Container maxW="6xl">
          <MotionVStack
            align="stretch"
            spacing={12}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            <Box maxW="2xl">
              <Heading
                as="h2"
                fontFamily="heading"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="700"
                letterSpacing="-0.03em"
              >
                How CampusFlow works
              </Heading>
              <Text mt={3} color="app-muted" fontSize="lg" lineHeight="tall">
                A clear path from campus setup to day-to-day teaching and student progress.
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {howItWorks.map((item) => (
                <MotionBox key={item.step} variants={staggerItem}>
                  <Text
                    fontFamily="heading"
                    fontWeight="700"
                    fontSize="sm"
                    color="brand.600"
                    letterSpacing="0.08em"
                    mb={3}
                  >
                    {item.step}
                  </Text>
                  <Text fontFamily="heading" fontWeight="700" fontSize="xl" letterSpacing="-0.02em" mb={2}>
                    {item.title}
                  </Text>
                  <Text color="app-muted" lineHeight="tall">
                    {item.body}
                  </Text>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionVStack>
        </Container>
      </Box>

      {/* Roles */}
      <Box as="section" py={{ base: 16, md: 24 }} px={{ base: 5, md: 10 }} bg="app-bg">
        <Container maxW="6xl">
          <MotionVStack
            align="stretch"
            spacing={10}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            <Box maxW="2xl">
              <Heading
                as="h2"
                fontFamily="heading"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="700"
                letterSpacing="-0.03em"
              >
                Built for every campus role
              </Heading>
              <Text mt={3} color="app-muted" fontSize="lg" lineHeight="tall">
                Access is scoped to what each role needs — from organisation-wide administration to a
                student’s own enrollments.
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <MotionBox key={role.title} variants={staggerItem}>
                    <VStack align="flex-start" spacing={4} h="full">
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="md"
                        bg="brand-soft-bg"
                        color="brand-soft-fg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xl"
                        aria-hidden
                      >
                        <Icon />
                      </Box>
                      <Text fontFamily="heading" fontWeight="700" fontSize="xl" letterSpacing="-0.02em">
                        {role.title}
                      </Text>
                      <Text color="app-muted" lineHeight="tall" flex="1">
                        {role.body}
                      </Text>
                      <CLink
                        as={RouterLink}
                        to={role.to}
                        color="brand.700"
                        fontWeight="600"
                        fontSize="sm"
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                        _hover={{ color: 'brand.600' }}
                      >
                        Explore roles <FiArrowRight aria-hidden />
                      </CLink>
                    </VStack>
                  </MotionBox>
                )
              })}
            </SimpleGrid>
          </MotionVStack>
        </Container>
      </Box>

      {/* Capabilities */}
      <Box as="section" py={{ base: 16, md: 24 }} px={{ base: 5, md: 10 }} bg="app-surface">
        <Container maxW="6xl">
          <MotionVStack
            align="stretch"
            spacing={10}
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            <Box maxW="2xl">
              <Heading
                as="h2"
                fontFamily="heading"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="700"
                letterSpacing="-0.03em"
              >
                What CampusFlow covers
              </Heading>
              <Text mt={3} color="app-muted" fontSize="lg" lineHeight="tall">
                Core student-management workflows for departments, courses, and academic progress.
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 10 }}>
              {capabilities.map((item) => {
                const Icon = item.icon
                return (
                  <HStack key={item.title} align="flex-start" spacing={4}>
                    <Box mt={1} color="brand.600" fontSize="xl" flexShrink={0} aria-hidden>
                      <Icon />
                    </Box>
                    <Box>
                      <Text fontWeight="700" fontSize="lg" letterSpacing="-0.01em" mb={1}>
                        {item.title}
                      </Text>
                      <Text color="app-muted" lineHeight="tall">
                        {item.body}
                      </Text>
                    </Box>
                  </HStack>
                )
              })}
            </SimpleGrid>
            <CLink
              as={RouterLink}
              to="/features"
              color="brand.700"
              fontWeight="600"
              display="inline-flex"
              alignItems="center"
              gap={1}
              w="fit-content"
            >
              See all features <FiArrowRight aria-hidden />
            </CLink>
          </MotionVStack>
        </Container>
      </Box>

      {/* Trust */}
      <Box as="section" py={{ base: 16, md: 20 }} px={{ base: 5, md: 10 }} bg="app-bg">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box>
              <Heading
                as="h2"
                fontFamily="heading"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="700"
                letterSpacing="-0.03em"
              >
                Designed for clarity and control
              </Heading>
              <Text mt={4} color="app-muted" fontSize="lg" lineHeight="tall">
                CampusFlow keeps academic workflows organised without noise — teal academic branding,
                Poppins typography, and role-aware navigation once you sign in.
              </Text>
            </Box>
            <VStack align="stretch" spacing={5}>
              <HStack align="flex-start" spacing={3}>
                <Box color="brand.600" mt={1} aria-hidden>
                  <FiLock />
                </Box>
                <Box>
                  <Text fontWeight="600">Role-scoped access</Text>
                  <Text color="app-muted" fontSize="sm" lineHeight="tall">
                    Administrators, lecturers, and students each see the tools that match their
                    responsibilities.
                  </Text>
                </Box>
              </HStack>
              <HStack align="flex-start" spacing={3}>
                <Box color="brand.600" mt={1} aria-hidden>
                  <FiCheckCircle />
                </Box>
                <Box>
                  <Text fontWeight="600">Audit-ready administration</Text>
                  <Text color="app-muted" fontSize="sm" lineHeight="tall">
                    Key administrative actions can be reviewed when you have audit access.
                  </Text>
                </Box>
              </HStack>
              <HStack align="flex-start" spacing={3}>
                <Box color="brand.600" mt={1} aria-hidden>
                  <FiShield />
                </Box>
                <Box>
                  <Text fontWeight="600">Honest product surface</Text>
                  <Text color="app-muted" fontSize="sm" lineHeight="tall">
                    Public pages describe shipped capabilities — no invented campus metrics for guests.
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Explore teasers — text links, no auth buttons */}
      <Box as="section" py={{ base: 16, md: 24 }} px={{ base: 5, md: 10 }} bg="app-surface">
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="heading"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="700"
            letterSpacing="-0.03em"
            mb={3}
          >
            Explore CampusFlow
          </Heading>
          <Text color="app-muted" fontSize="lg" lineHeight="tall" maxW="2xl" mb={10}>
            Learn more before you sign in. These pages are open to everyone.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {exploreCards.map((card) => (
              <Box key={card.to}>
                <Text fontFamily="heading" fontWeight="700" fontSize="xl" letterSpacing="-0.02em" mb={2}>
                  {card.title}
                </Text>
                <Text color="app-muted" lineHeight="tall" mb={4}>
                  {card.body}
                </Text>
                <CLink
                  as={RouterLink}
                  to={card.to}
                  color="brand.700"
                  fontWeight="600"
                  fontSize="sm"
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                >
                  Continue <FiArrowRight aria-hidden />
                </CLink>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </MarketingLayout>
  )
}
