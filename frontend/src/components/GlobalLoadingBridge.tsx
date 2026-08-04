import { useEffect, useRef } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useLoadingStore } from '@/features/loading/loadingStore'

const NAV_REASON = 'route'
const MUTATION_REASON = 'mutation'
const SUSPENSE_REASON = 'suspense'
const NAV_MIN_MS = 280
const MUTATION_SHOW_DELAY_MS = 160

/**
 * Drives the global logo loader for route changes and debounced mutations.
 * Suspense fallbacks call begin/end('suspense') separately.
 */
export function GlobalLoadingBridge() {
  const location = useLocation()
  const begin = useLoadingStore((s) => s.begin)
  const end = useLoadingStore((s) => s.end)
  const mutating = useIsMutating()
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mutationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPath = useRef(`${location.pathname}${location.search}`)

  useEffect(() => {
    const key = `${location.pathname}${location.search}`
    if (prevPath.current === key) return
    prevPath.current = key

    begin(NAV_REASON)
    if (navTimer.current) clearTimeout(navTimer.current)
    navTimer.current = setTimeout(() => {
      end(NAV_REASON)
      navTimer.current = null
    }, NAV_MIN_MS)

    return () => {
      if (navTimer.current) {
        clearTimeout(navTimer.current)
        navTimer.current = null
      }
      end(NAV_REASON)
    }
  }, [location.pathname, location.search, begin, end])

  useEffect(() => {
    if (mutating > 0) {
      if (mutationTimer.current) clearTimeout(mutationTimer.current)
      mutationTimer.current = setTimeout(() => {
        begin(MUTATION_REASON)
        mutationTimer.current = null
      }, MUTATION_SHOW_DELAY_MS)
    } else {
      if (mutationTimer.current) {
        clearTimeout(mutationTimer.current)
        mutationTimer.current = null
      }
      end(MUTATION_REASON)
    }

    return () => {
      if (mutationTimer.current) {
        clearTimeout(mutationTimer.current)
        mutationTimer.current = null
      }
      end(MUTATION_REASON)
    }
  }, [mutating, begin, end])

  return null
}

/** Mount inside Suspense fallback to keep the global overlay up while chunks load. */
export function SuspenseLoadingSignal() {
  const begin = useLoadingStore((s) => s.begin)
  const end = useLoadingStore((s) => s.end)

  useEffect(() => {
    begin(SUSPENSE_REASON)
    return () => end(SUSPENSE_REASON)
  }, [begin, end])

  return null
}
