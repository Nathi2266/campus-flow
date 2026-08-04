import { Box, Container, Heading, HStack, SimpleGrid, Text, VStack, Link as CLink } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiArrowRight, FiBookOpen, FiClipboard, FiShield, FiUsers } from 'react-icons/fi'
const features = [
  {
    title: 'Departments & users',
    body: 'Administrators organise the campus into departments and provision staff accounts with the right roles.',
    icon: FiShield,
  },
  {
    title: 'Student directory',
    body: 'Create and maintain student records, academic status, and department affiliation for teaching staff who need them.',
    icon: FiUsers,
  },
  {
    title: 'Course catalogue',
    body: 'Publish courses with codes, credits, capacity, and lecturer assignment. Activate or deactivate as the term evolves.',
    icon: FiBookOpen,
  },
  {
    title: 'Enrollments',
    body: 'Link students to courses. Students can self-enroll and drop where policy allows; staff manage exceptions.',
    icon: FiClipboard,
  },
  {
    title: 'Grades',
    body: 'Lecturers enter grades for their assignments. Students see their own results on enrollments and the dashboard.',
    icon: FiBookOpen,
  },
  {
    title: 'Reports & audit',
    body: 'Leadership reviews campus statistics. Administrators inspect audit history for key administrative actions.',
    icon: FiShield,
  },
] as const

export function FeaturesPage() {
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
              Features
            </Text>
            <Heading
              as="h1"
              fontFamily="heading"
              fontSize={{ base: '2.5rem', md: '3.25rem' }}
              fontWeight="700"
              letterSpacing="-0.03em"
              lineHeight="1.1"
            >
              Everything you need to run campus academics
            </Heading>
            <Text mt={4} color="app-muted" fontSize="lg" lineHeight="tall">
              CampusFlow focuses on the student-management loop: people, courses, enrollments, grades, and
              oversight — without clutter.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 10 }} mb={16}>
            {features.map((item) => {
              const Icon = item.icon
              return (
                <HStack
                  key={item.title}
                  role="group"
                  align="flex-start"
                  spacing={4}
                  p={4}
                  borderRadius="lg"
                  transition="transform 0.2s ease, background 0.2s ease"
                  _hover={{ transform: 'translateY(-3px)', bg: 'app-surface-muted' }}
                >
                    <Box
                      w="44px"
                      h="44px"
                      borderRadius="md"
                      bg="brand-soft-bg"
                      color="brand-soft-fg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                      aria-hidden
                      transition="transform 0.2s ease"
                      _groupHover={{ transform: 'scale(1.08)' }}
                    >
                    <Icon />
                  </Box>
                  <Box>
                    <Text fontFamily="heading" fontWeight="700" fontSize="xl" letterSpacing="-0.02em" mb={2}>
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

          <VStack align="flex-start" spacing={3} bg="app-bg" p={{ base: 6, md: 8 }} borderRadius="lg">
            <Text fontFamily="heading" fontWeight="700" fontSize="lg">
              Next: see how roles differ
            </Text>
            <Text color="app-muted" lineHeight="tall">
              Capabilities appear differently for administrators, lecturers, and students.
            </Text>
            <CLink
              as={RouterLink}
              to="/roles"
              color="brand.700"
              fontWeight="600"
              display="inline-flex"
              alignItems="center"
              gap={1}
            >
              Explore roles <FiArrowRight aria-hidden />
            </CLink>
          </VStack>
        </Container>
      </Box>
  )
}
