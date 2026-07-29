import { Button, HStack, Text } from '@chakra-ui/react'

export interface PaginationControlsProps {
  /** Zero-based page index */
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function PaginationControls({
  page,
  totalPages,
  totalElements,
  onPageChange,
  isLoading,
}: PaginationControlsProps) {
  if (totalElements <= 0) return null

  const safeTotalPages = Math.max(totalPages || 1, 1)
  const currentDisplay = Math.min(page + 1, safeTotalPages)

  return (
    <HStack
      justify="space-between"
      flexWrap="wrap"
      gap={3}
      px={{ base: 4, md: 5 }}
      py={3}
      borderTopWidth="1px"
      borderColor="gray.100"
      bg="canvas.50"
    >
      <Text fontSize="sm" color="gray.500">
        {totalElements} total
      </Text>
      <HStack spacing={3}>
        <Button
          size="sm"
          variant="outline"
          aria-label="Previous page"
          isDisabled={page <= 0 || Boolean(isLoading)}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Text fontSize="sm" color="gray.700" aria-live="polite">
          Page {currentDisplay} of {safeTotalPages}
        </Text>
        <Button
          size="sm"
          variant="outline"
          aria-label="Next page"
          isDisabled={page >= safeTotalPages - 1 || Boolean(isLoading)}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </HStack>
    </HStack>
  )
}
