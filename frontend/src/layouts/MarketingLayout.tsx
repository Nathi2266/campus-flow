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
import type { ReactNode } from 'react'
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'

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
          _hover={{ color: activeColor, textDecoration: 'none' }}
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

export function MarketingLayout({
  children,
  transparentHero,
}: {
  children?: ReactNode
  /** When true, header sits over a dark hero (landing). */
  transparentHero?: boolean
}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const headerFg = transparentHero ? 'white' : 'app-text'
  const linkColor = transparentHero ? 'whiteAlpha.800' : 'app-muted'
  const linkActive = transparentHero ? 'white' : 'brand.600'

  const content = children ?? <Outlet />

  return (
    <Box bg="app-bg" minH="100vh" display="flex" flexDirection="column">
      <Box
        as="header"
        position={transparentHero ? 'absolute' : 'sticky'}
        top={0}
        left={0}
        right={0}
        zIndex={20}
        bg={transparentHero ? 'transparent' : 'white'}
        borderBottomWidth={transparentHero ? 0 : '1px'}
        borderColor="blackAlpha.100"
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
          <HStack as={RouterLink} to="/" spacing={3} _hover={{ textDecoration: 'none' }} color={headerFg}>
            <Box
              w="40px"
              h="40px"
              borderRadius="lg"
              bg={transparentHero ? 'whiteAlpha.200' : 'brand.500'}
              borderWidth={transparentHero ? '1px' : 0}
              borderColor="whiteAlpha.300"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontFamily="heading"
              fontWeight="700"
              fontSize="sm"
            >
              CF
            </Box>
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
            _hover={{ bg: transparentHero ? 'whiteAlpha.200' : 'blackAlpha.50' }}
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
        {content}
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
              <Text fontWeight="700" color="white" fontFamily="heading" letterSpacing="-0.02em">
                CampusFlow
              </Text>
              <Text mt={1} fontSize="sm" maxW="sm" lineHeight="tall">
                Student management for modern campuses.
              </Text>
            </Box>
            <HStack as="nav" aria-label="Footer" spacing={5} flexWrap="wrap" fontSize="sm">
              <CLink as={RouterLink} to="/" color="whiteAlpha.800" _hover={{ color: 'white' }}>
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
