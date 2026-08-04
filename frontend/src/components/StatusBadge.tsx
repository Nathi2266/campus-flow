import { Badge } from '@chakra-ui/react'
import { capacityLabel, capacityLevel } from '@/utils/capacity'
import type { AcademicStatus, EnrollmentStatus } from '@/types'

const academicColor: Record<AcademicStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
  GRADUATED: 'blue',
  SUSPENDED: 'red',
}

const enrollmentColor: Record<EnrollmentStatus, string> = {
  ACTIVE: 'green',
  COMPLETED: 'blue',
  DROPPED: 'orange',
  FAILED: 'red',
}

export function AcademicStatusBadge({ status }: { status: AcademicStatus }) {
  return (
    <Badge colorScheme={academicColor[status]} variant="subtle">
      {status}
    </Badge>
  )
}

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <Badge colorScheme={enrollmentColor[status]} variant="subtle">
      {status}
    </Badge>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge colorScheme={active ? 'green' : 'gray'} variant="subtle">
      {active ? 'Active' : 'Inactive'}
    </Badge>
  )
}

const capacityColor = {
  full: 'red',
  near: 'orange',
  open: 'green',
} as const

export function CapacityBadge({
  enrolled,
  max,
}: {
  enrolled: number | null | undefined
  max: number
}) {
  const level = capacityLevel(enrolled, max)
  return (
    <Badge colorScheme={capacityColor[level]} variant="subtle">
      {capacityLabel(level)}
    </Badge>
  )
}
