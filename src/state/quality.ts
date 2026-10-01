import { create } from 'zustand'

export type Quality = 'high' | 'low'
export type QualityMode = 'auto' | Quality

const KEY = 'villa-quality'

/** Cheap, synchronous GPU/device heuristic. Runtime FPS monitoring (PerformanceMonitor) refines it later. */
function detect(): Quality {
  try {
    const url = new URLSearchParams(location.search).get('quality')
    if (url === 'low' || url === 'high') return url
    const saved = localStorage.getItem(KEY)
    if (saved === 'low' || saved === 'high') return saved
  } catch { /* storage blocked */ }
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') as WebGL2RenderingContext | null
    if (!gl) return 'low'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (/swiftshader|llvmpipe|software|microsoft basic|mali-(4|t|g[1-5])|adreno \(?[2-5]\d\d|powervr|videocore|intel.*(hd graphics [2-5]\d{2,3}|gma)/i.test(name)) return 'low'
  } catch { return 'low' }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse && ((nav.deviceMemory ?? 8) <= 3 || (navigator.hardwareConcurrency ?? 8) <= 4)) return 'low'
  if ((navigator.hardwareConcurrency ?? 8) <= 2) return 'low'
  return 'high'
}

function initialMode(): QualityMode {
  try {
    const url = new URLSearchParams(location.search).get('quality')
    if (url === 'low' || url === 'high') return url
    const saved = localStorage.getItem(KEY)
    if (saved === 'low' || saved === 'high') return saved
  } catch { /* ignore */ }
  return 'auto'
}

interface QualityState {
  quality: Quality
  mode: QualityMode
  /** user choice (sticks across visits) */
  set: (q: Quality) => void
  /** called by the FPS monitor; ignored when the user picked a level */
  autoDowngrade: () => void
}

export const useQuality = create<QualityState>((set, get) => ({
  quality: detect(),
  mode: initialMode(),
  set: (quality) => {
    try { localStorage.setItem(KEY, quality) } catch { /* ignore */ }
    set({ quality, mode: quality })
  },
  autoDowngrade: () => {
    if (get().mode === 'auto' && get().quality === 'high') set({ quality: 'low' })
  },
}))
