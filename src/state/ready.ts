import { create } from 'zustand'

/** true once the first 3D canvas has rendered a frame (drives the loading screen). */
export const useSceneReady = create<{ ready: boolean; setReady: () => void }>((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
}))
