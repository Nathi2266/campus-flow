import { Button, SimpleGrid, Wrap, WrapItem } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'
import { Surface } from '@/components/ui'
import { SectionTitle } from '@/components/StatTile'

export interface QuickLink {
  to: string
  label: string
  icon?: ReactElement
}

export function DashboardQuickLinks({ links, title = 'Quick actions' }: { links: QuickLink[]; title?: string }) {
  return (
    <Surface p={{ base: 5, md: 6 }} h="full">
      <SectionTitle hint="Jump to common tasks">{title}</SectionTitle>
      <Wrap spacing={3}>
        {links.map((link) => (
          <WrapItem key={link.to}>
            <Button as={RouterLink} to={link.to} leftIcon={link.icon} variant="outline" size="sm">
              {link.label}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </Surface>
  )
}

export function DashboardTwoCol({ children }: { children: ReactNode }) {
  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6} alignItems="stretch">
      {children}
    </SimpleGrid>
  )
}
