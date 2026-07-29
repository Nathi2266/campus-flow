import { Box, TableContainer } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Surface } from '@/components/ui'

export function DataTableShell({
  children,
  toolbar,
  footer,
}: {
  children: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
}) {
  return (
    <Surface overflow="hidden">
      {toolbar ? (
        <Box px={{ base: 4, md: 5 }} py={3.5} borderBottomWidth="1px" borderColor="gray.100" bg="canvas.50">
          {toolbar}
        </Box>
      ) : null}
      <TableContainer>
        <Box sx={{ table: { minW: 'full' } }}>{children}</Box>
      </TableContainer>
      {footer}
    </Surface>
  )
}
