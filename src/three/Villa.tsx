import { forwardRef } from 'react'
import type * as THREE from 'three'
import { useViewer } from '../state/viewer'
import { Bake } from './primitives'
import { GroundFloor } from './parts/GroundFloor'
import { FirstFloor } from './parts/FirstFloor'
import { Roof } from './parts/Roof'
import { Site } from './parts/Site'
import { Terrace } from './parts/Terrace'
import { Pool } from './parts/Pool'

/**
 * The whole villa. Each floor is its own group so it can be shown, hidden or cut away:
 *   floor-0-ground, floor-1-first, floor-2-roof (+ site, terrace, pool outdoors).
 */
export const Villa = forwardRef<THREE.Group>(function Villa(_, ref) {
  const cut = useViewer((s) => s.cut)
  return (
    <group ref={ref} name="villa">
      {/* always-visible parts are baked together; each cut-away floor is its own bake so it can still be hidden */}
      <Bake name="base"><Site /><Terrace /><Pool /><GroundFloor /></Bake>
      <group name="floor-1-wrapper" visible={cut >= 1}><Bake name="first-floor"><FirstFloor /></Bake></group>
      <group name="floor-2-wrapper" visible={cut >= 2}><Bake name="roof"><Roof /></Bake></group>
    </group>
  )
})
