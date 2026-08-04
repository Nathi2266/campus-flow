import {
  Box,
  Circle,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Surface, StaggerItem } from '@/components/ui'

export function StatTile({
  label,
  value,
  help,
  icon,
  accent = 'brand',
}: {
  label: string
  value: string | number
  help?: string
  icon?: ReactNode
  accent?: string
}) {
  return (
    <StaggerItem>
      <Surface p={{ base: 5, md: 6 }} h="full" interactive>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={3}>
          <Stat>
            <StatLabel color="app-muted" fontSize="sm" fontWeight="500">
              {label}
            </StatLabel>
            <StatNumber
              mt={1}
              fontFamily="heading"
              fontSize="2.25rem"
              fontWeight="700"
              letterSpacing="-0.03em"
              color="app-text"
            >
              {value}
            </StatNumber>
            {help ? (
              <StatHelpText mb={0} color="app-muted">
                {help}
              </StatHelpText>
            ) : null}
          </Stat>
          {icon ? (
            <Circle
              size="42px"
              bg={`${accent}.50`}
              color={`${accent}.600`}
              _dark={{ bg: 'whiteAlpha.100', color: `${accent}.300` }}
              fontSize="lg"
            >
              {icon}
            </Circle>
          ) : null}
        </Box>
      </Surface>
    </StaggerItem>
  )
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <Box mb={4}>
      <Text fontFamily="heading" fontSize="xl" fontWeight="600" letterSpacing="-0.02em" color="app-text">
        {children}
      </Text>
      {hint ? (
        <Text mt={1} color="app-muted" fontSize="sm">
          {hint}
        </Text>
      ) : null}
    </Box>
  )
}
