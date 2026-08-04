export type CapacityLevel = 'full' | 'near' | 'open'

/** Returns fill ratio clamped to [0, 1]. */
export function fillRatio(enrolled: number | null | undefined, max: number): number {
  if (!max || max <= 0) return 0
  return Math.min(1, Math.max(0, (enrolled ?? 0) / max))
}

export function capacityLevel(
  enrolled: number | null | undefined,
  max: number,
): CapacityLevel {
  const ratio = fillRatio(enrolled, max)
  if (ratio >= 1) return 'full'
  if (ratio >= 0.8) return 'near'
  return 'open'
}

export function capacityLabel(level: CapacityLevel): string {
  if (level === 'full') return 'Full'
  if (level === 'near') return 'Near full'
  return 'Open'
}
