import { Box, Container, Heading, SimpleGrid, Text, VStack, Link as CLink, List, ListItem } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
const roleGuides = [
  {
    title: 'Administrator',
    summary: 'Organisation-wide stewardship of the campus.',
    points: [
      'Manage departments and user accounts',
      'Create and maintain student records',
      'Full course catalogue control',
      'Reports and audit log access',
    ],
  },
  {
    title: 'Lecturer',
    summary: 'Teaching-focused tools for assigned courses.',
    points: [
      'Update courses you teach',
      'Review enrollments and capacity',
      'Enter and update grades',
      'Read student directory as needed for teaching',
    ],
  },
  {
    title: 'Student',
    summary: 'Your academic journey in one place.',
    points: [
      'Browse the active course catalogue',
      'Self-enroll and drop where allowed',
      'View your enrollments and grades',
      'Manage your profile details',
    ],
  },
] as const

export function RolesPage() {
  return (
      <Box py={{ base: 14, md: 20 }} px={{ base: 5, md: 10 }}>
        <Container maxW="6xl">
          <Box maxW="2xl" mb={12}>
            <Text
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.12em"
              color="brand.600"
              mb={3}
            >
              Roles
            </Text>
            <Heading
              as="h1"
              fontFamily="heading"
              fontSize={{ base: '2.5rem', md: '3.25rem' }}
              fontWeight="700"
              letterSpacing="-0.03em"
              lineHeight="1.1"
            >
              The right tools for each person on campus
            </Heading>
            <Text mt={4} color="app-muted" fontSize="lg" lineHeight="tall">
              CampusFlow uses three roles — ADMIN, LECTURER, and STUDENT — so navigation and permissions stay
              focused on real academic work.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mb={16}>
            {roleGuides.map((role) => (
              <Box
                key={role.title}
                bg="app-surface"
                borderWidth="1px"
                borderColor="app-border"
                borderRadius="lg"
                p={{ base: 6, md: 7 }}
                shadow="soft"
              >
                <Text fontFamily="heading" fontWeight="700" fontSize="xl" letterSpacing="-0.02em">
                  {role.title}
                </Text>
                <Text mt={2} color="app-muted" lineHeight="tall" mb={5}>
                  {role.summary}
                </Text>
                <List spacing={2}>
                  {role.points.map((point) => (
                    <ListItem key={point} color="app-text" fontSize="sm" pl={3} borderLeftWidth="2px" borderColor="brand.200">
                      {point}
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </SimpleGrid>

          <VStack align="flex-start" spacing={3}>
            <Text color="app-muted" lineHeight="tall">
              Public registration creates a student account. Staff accounts are provisioned by an administrator.
            </Text>
            <CLink
              as={RouterLink}
              to="/about"
              color="brand.700"
              fontWeight="600"
              display="inline-flex"
              alignItems="center"
              gap={1}
            >
              About CampusFlow <FiArrowRight aria-hidden />
            </CLink>
          </VStack>
        </Container>
      </Box>
  )
}
