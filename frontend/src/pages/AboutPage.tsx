import { Box, Container, Heading, Text, VStack, Link as CLink, SimpleGrid } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { MarketingLayout } from '@/layouts/MarketingLayout'

export function AboutPage() {
  return (
    <MarketingLayout>
      <Box py={{ base: 14, md: 20 }} px={{ base: 5, md: 10 }}>
        <Container maxW="3xl">
          <Text
            fontSize="xs"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.12em"
            color="brand.600"
            mb={3}
          >
            About
          </Text>
          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: '2.5rem', md: '3.25rem' }}
            fontWeight="700"
            letterSpacing="-0.03em"
            lineHeight="1.1"
            mb={6}
          >
            CampusFlow is a student management system for modern campuses
          </Heading>
          <VStack align="stretch" spacing={5} color="app-muted" fontSize="lg" lineHeight="tall" mb={12}>
            <Text>
              It helps administrators run the organisation, lecturers teach and grade, and students manage
              their own enrollments — with a calm teal interface and Poppins typography designed for everyday
              academic work.
            </Text>
            <Text>
              Department is the soft tenancy boundary. Admins work organisation-wide; lecturers stay scoped to
              assigned courses; students see their own records.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={8} mb={12}>
            <Box>
              <Text fontFamily="heading" fontWeight="700" fontSize="lg" mb={2} color="app-text">
                Purpose
              </Text>
              <Text color="app-muted" lineHeight="tall">
                One system for student records, courses, enrollments, grades, reporting, and audit — without
                timesheet or unrelated legacy workflows.
              </Text>
            </Box>
            <Box>
              <Text fontFamily="heading" fontWeight="700" fontSize="lg" mb={2} color="app-text">
                Experience
              </Text>
              <Text color="app-muted" lineHeight="tall">
                Brand-first marketing pages for guests; a focused app shell after sign-in with role-aware
                navigation and accessible controls.
              </Text>
            </Box>
          </SimpleGrid>

          <Box bg="app-bg" p={{ base: 6, md: 8 }} borderRadius="lg">
            <Text fontFamily="heading" fontWeight="700" fontSize="lg" mb={2}>
              Ready to go deeper?
            </Text>
            <Text color="app-muted" lineHeight="tall" mb={4}>
              Browse features, or return home when you are ready to use CampusFlow.
            </Text>
            <CLink
              as={RouterLink}
              to="/features"
              color="brand.700"
              fontWeight="600"
              display="inline-flex"
              alignItems="center"
              gap={1}
              mr={6}
            >
              Features <FiArrowRight aria-hidden />
            </CLink>
            <CLink as={RouterLink} to="/" color="brand.700" fontWeight="600" display="inline-flex" alignItems="center" gap={1}>
              Home <FiArrowRight aria-hidden />
            </CLink>
          </Box>
        </Container>
      </Box>
    </MarketingLayout>
  )
}
