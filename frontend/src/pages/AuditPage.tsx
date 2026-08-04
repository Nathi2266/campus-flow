import {
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listAuditLogs } from '@/api/resources'
import { getErrorMessage } from '@/api/client'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/feedback'
import { DataTableShell } from '@/components/DataTableShell'
import { PaginationControls } from '@/components/PaginationControls'

const PAGE_SIZE = 20

function formatDetails(details: Record<string, unknown> | null) {
  if (!details || Object.keys(details).length === 0) return '—'
  try {
    return JSON.stringify(details)
  } catch {
    return '—'
  }
}

export function AuditPage() {
  const [page, setPage] = useState(0)
  const query = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => listAuditLogs({ page, size: PAGE_SIZE }),
  })

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit log"
        description="Read-only history of administrative and security-relevant actions."
      />

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState message={getErrorMessage(query.error)} onRetry={() => query.refetch()} />
      ) : null}
      {query.data && !query.data.content.length ? (
        <EmptyState title="No audit entries" description="Actions will appear here as they are recorded." />
      ) : null}
      {query.data && query.data.content.length > 0 ? (
        <DataTableShell
          toolbar={
            <Text fontSize="sm" color="app-muted">
              {query.data.totalElements} entr{query.data.totalElements === 1 ? 'y' : 'ies'}
            </Text>
          }
          footer={
            <PaginationControls
              page={page}
              totalPages={query.data.totalPages ?? 0}
              totalElements={query.data.totalElements}
              onPageChange={setPage}
              isLoading={query.isFetching}
            />
          }
        >
          <Table variant="simple">
            <caption style={{ captionSide: 'top', padding: '0.75rem 1rem', textAlign: 'left' }}>
              Audit log entries
            </caption>
            <Thead>
              <Tr>
                <Th scope="col">When</Th>
                <Th scope="col">User</Th>
                <Th scope="col">Action</Th>
                <Th scope="col">Entity</Th>
                <Th scope="col">Details</Th>
                <Th scope="col">IP</Th>
              </Tr>
            </Thead>
            <Tbody>
              {query.data.content.map((row) => (
                <Tr key={row.id} _hover={{ bg: 'canvas.50' }}>
                  <Td whiteSpace="nowrap" fontSize="sm">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                  </Td>
                  <Td>{row.userEmail ?? (row.userId != null ? `User #${row.userId}` : '—')}</Td>
                  <Td fontWeight="semibold">{row.action}</Td>
                  <Td>
                    {row.entityType ?? '—'}
                    {row.entityId != null ? ` #${row.entityId}` : ''}
                  </Td>
                  <Td maxW="280px" fontSize="sm" color="app-muted" title={formatDetails(row.details)}>
                    <Text noOfLines={2}>{formatDetails(row.details)}</Text>
                  </Td>
                  <Td fontFamily="mono" fontSize="sm">
                    {row.ipAddress ?? '—'}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </DataTableShell>
      ) : null}
    </>
  )
}
