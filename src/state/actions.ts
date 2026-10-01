import { useMemo } from 'react'
import { useViewerApi } from './viewer'
import { roomById, zones, type Room } from '../data/villa'
import { PRESETS, dollhouseView, TERRACE_VIEW, interiorView } from '../three/cameraPresets'

/** Configurator behaviours shared by the cards, the room panel and the 3D scene. */
export function useActions() {
  const api = useViewerApi()
  return useMemo(() => {
    const s = () => api.getState()
    const zoneView = (id: string) => {
      const z = zones.find((z) => z.id === id)!
      s().setCut(z.cut)
      s().goView(id === 'terrace' ? TERRACE_VIEW : id === 'full' ? PRESETS.orbit : dollhouseView(z.cut))
    }
    return {
      selectZone(id: string) {
        s().setSelectedRoom(null)
        s().setActiveZone(id)
        zoneView(id)
      },
      selectRoom(id: string | null) {
        s().setSelectedRoom(id)
      },
      viewInside(r: Room) {
        s().setCut(2)
        s().goView(interiorView(r))
      },
      /** back from room detail (and from interior view) to the active zone overview */
      back() {
        const wasInterior = s().view.interior
        s().setSelectedRoom(null)
        if (wasInterior) zoneView(s().activeZone)
      },
      exitInterior() {
        if (s().view.interior) zoneView(s().activeZone)
      },
      preset(id: keyof typeof PRESETS) {
        s().goView(PRESETS[id])
      },
      roomById,
    }
  }, [api])
}
