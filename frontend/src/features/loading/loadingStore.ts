import { create } from 'zustand'

interface LoadingState {
  /** Active reason keys → true while that reason is busy */
  reasons: Record<string, boolean>
  begin: (reason: string) => void
  end: (reason: string) => void
  isBusy: () => boolean
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  reasons: {},
  begin: (reason) =>
    set((state) => ({
      reasons: { ...state.reasons, [reason]: true },
    })),
  end: (reason) =>
    set((state) => {
      const next = { ...state.reasons }
      delete next[reason]
      return { reasons: next }
    }),
  isBusy: () => Object.keys(get().reasons).length > 0,
}))

export function selectIsBusy(state: LoadingState) {
  return Object.keys(state.reasons).length > 0
}
