import {
  Box,
  Container,
  Flex,
  HStack,
  Link as CLink,
  Text,
  VStack,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  CloseButton,
} from '@chakra-ui/react'
import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'
import { BrandLogo } from '@/components/BrandLogo'
import { PageTransition } from '@/components/PageTransition'

const exploreLinks = [
  { to: '/features', label: 'Features' },
  { to: '/roles', label: 'Roles' },
  { to: '/about', label: 'About' },
] as const

function ExploreLinks({
  onNavigate,
  color = 'app-muted',
  activeColor = 'brand.600',
}: {
  onNavigate?: () => void
  color?: string
  activeColor?: string
}) {
  return (
    <>
      {exploreLinks.map((link) => (
        <CLink
          key={link.to}
          as={NavLink}
          to={link.to}
          onClick={onNavigate}
          fontWeight="500"
          fontSize="sm"
          color={color}
          transition="color 0.18s ease, transform 0.18s ease"
          _hover={{ color: activeColor, textDecoration: 'none', transform: 'translateY(-1px)' }}
          sx={{
            '&.active': { color: activeColor, fontWeight: '600' },
          }}
        >
          {link.label}
        </CLink>
      ))}
    </>
  )
}

export function MarketingLayout() {
  const location = useLocation()
  const transparentHero = location.pathname === '/'
  const { isOpen, onOpen, onClose } = useDisclosure()
  const headerFg = transparentHero ? 'white' : 'app-text'
  const linkColor = transparentHero ? 'whiteAlpha.800' : 'app-muted'
  const linkActive = transparentHero ? 'white' : 'brand.600'

  return (
    <Box bg="app-bg" minH="100vh" display="flex" flexDirection="column">
      <Box
        as="header"
        position={transparentHero ? 'absolute' : 'sticky'}
        top={0}
        left={0}
        right={0}
        zIndex={20}
        bg={transparentHero ? 'transparent' : 'app-surface'}
        borderBottomWidth={transparentHero ? 0 : '1px'}
        borderColor="app-border"
        backdropFilter={transparentHero ? undefined : 'blur(8px)'}
      >
        <Flex
          align="center"
          justify="space-between"
          px={{ base: 5, md: 10, lg: 14 }}
          py={4}
          maxW="7xl"
          mx="auto"
          w="full"
        >
          <HStack
            as={RouterLink}
            to="/"
            spacing={3}
            color={headerFg}
            transition="opacity 0.18s ease, transform 0.18s ease"
            _hover={{ textDecoration: 'none', opacity: 0.92, transform: 'translateY(-1px)' }}
          >
            <BrandLogo
              boxSize="40px"
              surface={transparentHero ? 'dark' : 'light'}
              alt=""
              aria-hidden
            />
            <Text fontFamily="heading" fontWeight="700" fontSize="lg" letterSpacing="-0.02em">
              CampusFlow
            </Text>
          </HStack>

          <HStack as="nav" aria-label="Explore" spacing={6} display={{ base: 'none', md: 'flex' }}>
            <ExploreLinks color={linkColor} activeColor={linkActive} />
          </HStack>

          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            color={headerFg}
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onOpen}
            transition="transform 0.18s ease, background 0.18s ease"
            _hover={{
              bg: transparentHero ? 'whiteAlpha.200' : 'blackAlpha.50',
              transform: 'scale(1.05)',
            }}
          />
        </Flex>
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Flex justify="space-between" align="center">
              <Text fontFamily="heading" fontWeight="700" color="brand.600">
                Explore
              </Text>
              <CloseButton onClick={onClose} />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <VStack as="nav" aria-label="Explore" align="stretch" spacing={4} pt={4}>
              <CLink as={RouterLink} to="/" onClick={onClose} fontWeight="600" color="app-text">
                Home
              </CLink>
              <ExploreLinks onNavigate={onClose} />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box as="main" flex="1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Box>

      <Box as="footer" py={10} px={5} bg="brand.900" color="whiteAlpha.700" mt="auto">
        <Container maxW="6xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap={6}
          >
            <Box>
              <Flex align="center" gap={2} mb={1}>
                <BrandLogo boxSize="28px" alt="" aria-hidden />
                <Text fontWeight="700" color="white" fontFamily="heading" letterSpacing="-0.02em">
                  CampusFlow
                </Text>
              </Flex>
              <Text mt={1} fontSize="sm" maxW="sm" lineHeight="tall">
                Student management for modern campuses.
              </Text>
            </Box>
            <HStack as="nav" aria-label="Footer" spacing={5} flexWrap="wrap" fontSize="sm">
              <CLink
                as={RouterLink}
                to="/"
                color="whiteAlpha.800"
                transition="color 0.18s ease, transform 0.18s ease"
                _hover={{ color: 'white', transform: 'translateY(-1px)' }}
              >
                Home
              </CLink>
              <ExploreLinks color="whiteAlpha.800" activeColor="white" />
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}
