import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface BarDatum {
  id: string | number
  label: string
  value: number
  hint?: string
}

/** Accessible horizontal bar list for dashboard KPIs (no chart library). */
export function HorizontalBarList({
  items,
  maxValue,
  emptyLabel = 'No data yet',
  colorScheme = 'brand',
}: {
  items: BarDatum[]
  maxValue?: number
  emptyLabel?: string
  colorScheme?: string
}) {
  if (!items.length) {
    return (
      <Text color="app-muted" fontSize="sm">
        {emptyLabel}
      </Text>
    )
  }

  const peak = Math.max(maxValue ?? 0, ...items.map((i) => i.value), 1)

  return (
    <VStack align="stretch" spacing={3} role="list" aria-label="Bar chart">
      {items.map((item) => {
        const pct = Math.min(100, (item.value / peak) * 100)
        return (
          <Box key={item.id} role="listitem">
            <Flex justify="space-between" gap={3} mb={1.5} align="baseline">
              <Text fontSize="sm" fontWeight="600" noOfLines={1} color="app-text">
                {item.label}
              </Text>
              <HStack spacing={2} flexShrink={0}>
                {item.hint ? (
                  <Text fontSize="xs" color="app-muted">
                    {item.hint}
                  </Text>
                ) : null}
                <Text fontSize="sm" fontWeight="700" color="brand.600" fontFamily="heading">
                  {item.value}
                </Text>
              </HStack>
            </Flex>
            <Box h="8px" bg="progress-track" borderRadius="full" overflow="hidden">
              <Box
                h="full"
                w={`${pct}%`}
                bg={`${colorScheme}.500`}
                borderRadius="full"
                transition="width 0.35s ease"
                aria-hidden
              />
            </Box>
          </Box>
        )
      })}
    </VStack>
  )
}

/** Large progress meter with label. */
export function ProgressMeter({
  label,
  valueLabel,
  percent,
  colorScheme = 'brand',
  hint,
}: {
  label: string
  valueLabel: string
  percent: number
  colorScheme?: string
  hint?: string
}) {
  const safe = Math.min(100, Math.max(0, percent))
  return (
    <Box>
      <Flex justify="space-between" align="baseline" mb={2} gap={3}>
        <Text fontSize="sm" fontWeight="600" color="app-muted">
          {label}
        </Text>
        <Text fontFamily="heading" fontSize="2xl" fontWeight="700" letterSpacing="-0.03em" color="app-text">
          {valueLabel}
        </Text>
      </Flex>
      <Box
        h="10px"
        bg="progress-track"
        borderRadius="full"
        overflow="hidden"
        role="meter"
        aria-label={label}
        aria-valuenow={Math.round(safe)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <Box h="full" w={`${safe}%`} bg={`${colorScheme}.500`} borderRadius="full" transition="width 0.35s ease" />
      </Box>
      {hint ? (
        <Text mt={2} fontSize="xs" color="app-muted">
          {hint}
        </Text>
      ) : null}
    </Box>
  )
}

export function SegmentLegend({
  items,
}: {
  items: { label: string; value: number; color: string }[]
}) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1
  return (
    <VStack align="stretch" spacing={3}>
      <Flex h="12px" borderRadius="full" overflow="hidden" bg="progress-track" aria-hidden>
        {items.map((item) =>
          item.value > 0 ? (
            <Box key={item.label} h="full" w={`${(item.value / total) * 100}%`} bg={item.color} />
          ) : null,
        )}
      </Flex>
      <SimpleLegend items={items} />
    </VStack>
  )
}

function SimpleLegend({ items }: { items: { label: string; value: number; color: string }[] }) {
  return (
    <SimpleWrap>
      {items.map((item) => (
        <HStack key={item.label} spacing={2}>
          <Box w="10px" h="10px" borderRadius="sm" bg={item.color} aria-hidden />
          <Text fontSize="sm" color="app-muted">
            {item.label}:{' '}
            <Text as="span" fontWeight="700" color="app-text">
              {item.value}
            </Text>
          </Text>
        </HStack>
      ))}
    </SimpleWrap>
  )
}

function SimpleWrap({ children }: { children: ReactNode }) {
  return (
    <Flex flexWrap="wrap" gap={4}>
      {children}
    </Flex>
  )
}
