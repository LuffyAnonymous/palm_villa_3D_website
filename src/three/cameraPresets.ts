import type { CamView } from '../state/viewer'
import { FLOOR_Y, type Room, roomView } from '../data/villa'

/** Exterior presets. "Left"/"Right" are from the viewpoint of someone facing the FRONT facade. */
export const PRESETS = {
  front: { id: 'front', eye: [1, 5.5, 36], target: [0, 3, 0] },
  rear: { id: 'rear', eye: [-3, 7.5, -40], target: [0, 2.8, -6] },
  left: { id: 'left', eye: [-40, 7.5, -4], target: [0, 3, -4] },
  right: { id: 'right', eye: [40, 7.5, -4], target: [0, 3, -4] },
  top: { id: 'top', eye: [0, 56, -3.95], target: [0, 0, -4] },
  orbit: { id: 'orbit', eye: [27, 11, -31], target: [0, 2.5, -4], orbit: true },
} satisfies Record<string, CamView>

export type PresetId = keyof typeof PRESETS

/** Dollhouse (high 3/4 top) view for each cut level, framed on the plot centre. */
export function dollhouseView(cut: 0 | 1 | 2): CamView {
  const y = FLOOR_Y[cut]
  return { id: `dollhouse-${cut}`, eye: [4, y + 27, 21], target: [0, y, -3] }
}

export const TERRACE_VIEW: CamView = { id: 'terrace', eye: [-1, 15, -36], target: [1.5, 0, -11] }

export function interiorView(r: Room): CamView {
  const v = roomView(r)
  return { id: `inside-${r.id}`, eye: v.eye, target: v.target, interior: true }
}
