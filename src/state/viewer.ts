import { createContext, createElement, useContext, useRef, type ReactNode } from 'react'
import { createStore, useStore, type StoreApi } from 'zustand'
import type { V3 } from '../data/villa'

export interface CamView {
  id: string
  eye: V3
  target: V3
  /** eye-level first-person view */
  interior?: boolean
  /** slow auto-orbit after the move */
  orbit?: boolean
}

export interface ViewerState {
  night: boolean
  /** highest floor shown: 0 ground, 1 first, 2 roof (everything) */
  cut: 0 | 1 | 2
  hoverZone: string | null
  hoverRoom: string | null
  selectedRoom: string | null
  activeZone: string
  view: CamView
  /** bumps every request so identical views re-trigger */
  viewNonce: number
  setNight: (n: boolean) => void
  setCut: (c: 0 | 1 | 2) => void
  setHoverZone: (z: string | null) => void
  setHoverRoom: (z: string | null) => void
  setSelectedRoom: (z: string | null) => void
  setActiveZone: (z: string) => void
  goView: (v: CamView) => void
}

export const HERO_VIEW: CamView = { id: 'orbit', eye: [27, 11, -31], target: [0, 2.5, -4], orbit: true }

export function createViewerStore(init: Partial<ViewerState> = {}) {
  return createStore<ViewerState>()((set) => ({
    night: true,
    cut: 2,
    hoverZone: null,
    hoverRoom: null,
    selectedRoom: null,
    activeZone: 'full',
    view: HERO_VIEW,
    viewNonce: 0,
    setNight: (night) => set({ night }),
    setCut: (cut) => set({ cut }),
    setHoverZone: (hoverZone) => set({ hoverZone }),
    setHoverRoom: (hoverRoom) => set({ hoverRoom }),
    setSelectedRoom: (selectedRoom) => set({ selectedRoom }),
    setActiveZone: (activeZone) => set({ activeZone }),
    goView: (view) => set((s) => ({ view, viewNonce: s.viewNonce + 1 })),
    ...init,
  }))
}

const Ctx = createContext<StoreApi<ViewerState> | null>(null)

/** Gives every component below (DOM and, via R3F's bridge, the Canvas) its own viewer state. */
export function ViewerProvider({ store, children }: { store?: StoreApi<ViewerState>; children: ReactNode }) {
  const ref = useRef<StoreApi<ViewerState>>(store ?? null!)
  if (!ref.current) ref.current = createViewerStore()
  return createElement(Ctx.Provider, { value: ref.current }, children)
}

export function useViewerApi() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useViewer outside ViewerProvider')
  return s
}

export function useViewer<T>(selector: (s: ViewerState) => T): T {
  return useStore(useViewerApi(), selector)
}
