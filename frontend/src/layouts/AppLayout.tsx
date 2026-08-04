import {
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Link as CLink,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Link as RouterLink, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiBarChart2,
  FiBook,
  FiBell,
  FiClipboard,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiShield,
  FiUser,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi'
import { useAuthStore } from '@/features/auth/authStore'
import { logout as apiLogout } from '@/api/auth'
import type { UserRole } from '@/types'
import { BrandLogo } from '@/components/BrandLogo'
import { PageTransition } from '@/components/PageTransition'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
  { to: '/students', label: 'Students', icon: <FiUsers />, roles: ['ADMIN', 'LECTURER'] },
  { to: '/courses', label: 'Courses', icon: <FiBook /> },
  { to: '/enrollments', label: 'Enrollments', icon: <FiClipboard /> },
  { to: '/departments', label: 'Departments', icon: <FiGrid />, roles: ['ADMIN'] },
  { to: '/users', label: 'Users', icon: <FiUserCheck />, roles: ['ADMIN'] },
  { to: '/reports', label: 'Reports', icon: <FiBarChart2 />, roles: ['ADMIN', 'LECTURER'] },
  { to: '/audit', label: 'Audit', icon: <FiShield />, roles: ['ADMIN'] },
  { to: '/notifications', label: 'Notifications', icon: <FiBell /> },
  { to: '/profile', label: 'Profile', icon: <FiUser /> },
  { to: '/settings', label: 'Settings', icon: <FiSettings /> },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore((s) => s.user?.role)
  const items = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)))

  return (
    <VStack align="stretch" spacing={1} as="nav" aria-label="Main">
      {items.map((item) => (
        <CLink
          key={item.to}
          as={NavLink}
          to={item.to}
          end={item.to === '/dashboard'}
          onClick={onNavigate}
          display="flex"
          alignItems="center"
          gap={3}
          px={3.5}
          py={2.5}
          borderRadius="md"
          fontWeight="bold"
          fontSize="sm"
          color="app-muted"
          position="relative"
          role="group"
          transition="background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease"
          data-testid={`nav-${item.label.toLowerCase()}`}
          _hover={{
            bg: 'nav-hover-bg',
            color: 'brand.600',
            textDecoration: 'none',
            transform: 'translateX(3px)',
          }}
          sx={{
            '&.active': {
              bg: 'nav-active-bg',
              color: 'var(--chakra-colors-brand-600)',
              fontWeight: 'bold',
              boxShadow: 'inset 3px 0 0 var(--chakra-colors-brand-500)',
            },
          }}
        >
          <Box
            aria-hidden
            fontSize="lg"
            transition="transform 0.18s ease"
            _groupHover={{ transform: 'scale(1.08)' }}
          >
            {item.icon}
          </Box>
          {item.label}
        </CLink>
      ))}
    </VStack>
  )
}

function BrandMark() {
  return (
    <VStack
      as={RouterLink}
      to="/dashboard"
      spacing={2}
      align="center"
      textAlign="center"
      px={2}
      _hover={{ textDecoration: 'none' }}
    >
      <BrandLogo boxSize="48px" surface="light" alt="" aria-hidden />
      <Box>
        <Text
          fontFamily="heading"
          fontSize="lg"
          fontWeight="700"
          color="app-text"
          letterSpacing="-0.02em"
          lineHeight="1.2"
        >
          CampusFlow
        </Text>
        <Text fontSize="xs" color="app-muted" fontWeight="medium" lineHeight="1.3" mt={0.5}>
          Student Management
        </Text>
      </Box>
    </VStack>
  )
}

export function AppLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  async function handleLogout() {
    if (refreshToken) {
      await apiLogout(refreshToken)
    }
    clearSession()
    navigate('/', { replace: true })
  }

  const sidebar = (
    <Flex direction="column" h="full" py={6} px={3} gap={7}>
      <BrandMark />
      <Box flex="1" overflowY="auto" px={0.5}>
        <NavList onNavigate={onClose} />
      </Box>
      <Button
        leftIcon={<FiLogOut />}
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        px={3.5}
        py={2.5}
        h="auto"
        borderRadius="md"
        fontWeight="bold"
        fontSize="sm"
        color="app-muted"
        data-testid="sign-out"
        onClick={handleLogout}
        _hover={{ bg: 'nav-hover-bg', color: 'brand.600' }}
      >
        Log out
      </Button>
    </Flex>
  )

  return (
    <Flex minH="100vh" position="relative" bg="app-bg">
      <Box
        position="fixed"
        inset={0}
        pointerEvents="none"
        zIndex={0}
        opacity={0.55}
        backgroundImage="radial-gradient(ellipse 80% 50% at 100% -10%, rgba(13,148,136,0.12), transparent 50%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(15,118,110,0.08), transparent 45%)"
      />

      <CLink
        href="#main-content"
        position="absolute"
        left="-9999px"
        _focus={{ left: 4, top: 4, zIndex: 1000, bg: 'app-surface', px: 3, py: 2, borderRadius: 'md', shadow: 'md' }}
      >
        Skip to content
      </CLink>

      <Box
        as="aside"
        display={{ base: 'none', md: 'block' }}
        w="288px"
        bg="app-surface"
        borderRightWidth="1px"
        borderColor="app-border"
        position="sticky"
        top={0}
        h="100vh"
        shadow="sm"
        zIndex={1}
      >
        {sidebar}
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent maxW="288px" bg="app-surface">
          <DrawerHeader borderBottomWidth="1px" borderColor="app-border">
            <Flex justify="space-between" align="center" gap={3}>
              <Flex align="center" gap={2} minW={0}>
                <BrandLogo boxSize="28px" surface="light" alt="" aria-hidden />
                <Text fontFamily="heading" fontWeight="700" color="brand.600" noOfLines={1}>
                  CampusFlow
                </Text>
              </Flex>
              <CloseButton onClick={onClose} />
            </Flex>
          </DrawerHeader>
          <DrawerBody p={0}>{sidebar}</DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex direction="column" flex="1" minW={0} position="relative" zIndex={1}>
        <Flex
          as="header"
          display={{ base: 'flex', md: 'none' }}
          align="center"
          justify="space-between"
          px={4}
          py={3}
          bg="app-surface"
          borderBottomWidth="1px"
          borderColor="app-border"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <IconButton aria-label="Open menu" icon={<FiMenu />} variant="ghost" onClick={onOpen} />
          <Flex align="center" gap={2}>
            <BrandLogo boxSize="28px" surface="light" alt="" aria-hidden />
            <Text fontFamily="heading" fontWeight="700" color="brand.600">
              CampusFlow
            </Text>
          </Flex>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </Flex>

        <Box
          as="main"
          id="main-content"
          flex="1"
          p={{ base: 5, md: 8, xl: 10 }}
          maxW="1600px"
          w="full"
          mx="auto"
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Box>
      </Flex>
    </Flex>
  )
}
