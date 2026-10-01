import { useMemo } from 'react'
import * as THREE from 'three'
import { B, FadeGroup, Inst, Part, vSlatsZ, type Item, type V3 } from '../primitives'
import { M } from '../materials'
import { Plant, Hedge, Vegetation } from './Vegetation'
import { POOL, shapeOf } from './Pool'

const WALL_H = 2.5
const HEDGE_H = 2.7
const PLOT = { x: [-12, 12] as [number, number], z: [-24, 9.5] as [number, number] }

const steppers: Item[] = ([
  [-4.5, -19.2, 0.05], [-1.5, -20.4, -0.04], [1.8, -19.6, 0.03], [4.6, -21.2, -0.06], [-5.4, -22.3, 0.02],
  [-2.2, -22.4, 0.04], [0.8, -22.5, -0.03], [3.6, -23.0, 0.05], [8.8, -13, 1.57], [9.3, -16.8, 1.52], [6.3, -20.2, 0.06],
] as [number, number, number][]).map(([x, z, r]) => ({ p: [x, -0.01, z] as V3, s: [2.6, 0.08, 1.3] as V3, e: [0, r, 0] as V3 }))
const deckBoards = Array.from({ length: 22 }, (_, i) => ({ p: [-7.25, 0.02, -22.1 + i * 0.145] as V3, s: [3.5, 0.04, 0.12] as V3 }))
const uplights: Item[] = ([
  [-11.2, -1.2], [-11.2, -20.5], [10.6, -5.5], [10.4, -13.6], [8.8, -21.8], [-8.9, 6.5], [-3.5, 8.6], [4.8, 8.3], [-9.2, -14.7], [-9.2, -9.7],
  [-9.2, -5.7], [1.5, -18.7], [8.3, -3.4], [-10.5, 7.2],
] as [number, number][]).map(([x, z]) => ({ p: [x, 0.05, z] as V3, s: [0.08, 0.1, 0.08] as V3 }))
const gateLouvres = (x0: number, x1: number): Item[] =>
  Array.from({ length: 16 }, (_, i) => ({ p: [(x0 + x1) / 2, 0.15 + i * 0.125, 9.5] as V3, s: [x1 - x0 - 0.1, 0.05, 0.1] as V3, e: [0.5, 0, 0] as V3 }))
const gateL = gateLouvres(-9.9, -9.0)
const gateR = gateLouvres(8.3, 9.5)
const slatWallA = vSlatsZ(-17.5, -14.6, 0, 3.4, -9.24, 0.12, 0.06, 0.1)
const slatWallB = vSlatsZ(-8, -4.5, 0, 3.4, -9.24, 0.12, 0.06, 0.1)

function Lawn() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    const e = 0.1 // overlap
    s.moveTo(PLOT.x[0] - e, -PLOT.z[0] + e); s.lineTo(PLOT.x[1] + e, -PLOT.z[0] + e); s.lineTo(PLOT.x[1] + e, -PLOT.z[1]); s.lineTo(PLOT.x[0] - e, -PLOT.z[1]); s.closePath()
    s.holes.push(shapeOf([...POOL].reverse()))
    const g = new THREE.ShapeGeometry(s)
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.05, 0)
    return g
  }, [])
  return <mesh geometry={geo} material={M.grass} receiveShadow />
}

export function Site() {
  return (
    <group name="site">
      <Part id="site-lawn" status="VISIBLE" note="rear-original.jpg, aerial.png: lawn">
        <B x={[-2500, -12]} y={[-0.4, -0.05]} z={[-2500, 2500]} m="grass" />
        <B x={[12, 2500]} y={[-0.4, -0.05]} z={[-2500, 2500]} m="grass" />
        <B x={[-12, 12]} y={[-0.4, -0.05]} z={[-2500, -24]} m="grass" />
        <Lawn />
        <Inst items={steppers} m="stepper" name="stepping-stones" />
      </Part>
      <Part id="site-terrace-paving" status="VISIBLE" note="rear-original.jpg, aerial.png: light stone terrace paving with pit cut-out">
        <B x={[-9, 1]} y={[-0.2, 0]} z={[-12.5, -4.5]} m="stone" />
        <B x={[1, 2]} y={[-0.2, 0]} z={[-12.5, -5.5]} m="stone" />
        <B x={[-9, -0.6]} y={[-0.2, 0]} z={[-16.5, -12.5]} m="stone" />
        <B x={[-9, 2]} y={[-0.2, 0]} z={[-17.5, -16.5]} m="stone" />
        <B x={[2, 9]} y={[-0.2, 0]} z={[-6.5, -5.5]} m="stone" />
      </Part>
      <Part id="site-deck" status="VISIBLE" note="aerial.png: small timber deck in the right corner">
        <B x={[-9, -5.5]} y={[-0.12, 0]} z={[-22.2, -18.9]} m="oakDark" />
        <Inst items={deckBoards} m="oak" cast={false} />
      </Part>
      <Part id="site-slat-wall" status="VISIBLE" note="rear-original.jpg: tall dark wall of vertical slats with a black marble panel on the right boundary">
        <B x={[-9.7, -9.35]} y={[0, 3.4]} z={[-17.5, -4.5]} m="concrete" />
        <B x={[-9.36, -9.3]} y={[0, 3.4]} z={[-14.6, -8]} m="marble" />
        <Inst items={slatWallA} m="black" />
        <Inst items={slatWallB} m="black" />
      </Part>
      <Part id="site-front-street" status="VISIBLE" note="front.png: light grey brick-paver driveway and entrance steps, kerb, road">
        <B x={[-9, -2.2]} y={[-0.2, 0]} z={[7, 9.5]} m="paver" />
        <B x={[-2.2, -0.1]} y={[-0.2, 0.02]} z={[7, 9.5]} m="stone" />
        <B x={[-2500, 2500]} y={[-0.2, -0.02]} z={[9.5, 12]} m="paver" />
        <B x={[-2500, 2500]} y={[-0.4, -0.01]} z={[12.2, 30]} m="asphalt" />
        <B x={[-2500, 2500]} y={[-0.4, -0.05]} z={[30, 2500]} m="grass" />
        <B x={[-2500, 2500]} y={[-0.25, 0.05]} z={[12, 12.2]} m="concreteLight" />
      </Part>
      <Part id="site-boundary" status="VISIBLE" note="front.png: low dark charcoal boundary walls, black louvred pedestrian gates both sides, raised planters; side/rear walls inferred">
        <B x={[-12, -9.9]} y={[0, 2.1]} z={[9.2, 9.5]} m="concrete" />
        <B x={[-9.9, -9]} y={[0, 2.1]} z={[9.3, 9.45]} m="black" />
        <Inst items={gateL} m="black" />
        <B x={[7, 12]} y={[0, 2.1]} z={[9.2, 9.5]} m="concrete" />
        <B x={[8.3, 9.5]} y={[0, 2.1]} z={[9.3, 9.45]} m="black" />
        <Inst items={gateR} m="black" />
        <B x={[0.8, 7]} y={[0, 0.75]} z={[8.4, 9.5]} m="concrete" />
        <B x={[0.9, 6.9]} y={[0.75, 0.78]} z={[8.5, 9.4]} m="soil" />
      </Part>
      <Part id="site-perimeter-walls" status="INFERRED" note="2.5 m side and rear perimeter walls and hedges (not visible in the images); fade out when the camera is outside them">
        <FadeGroup outside={(c) => c.x < -12.4}>
          <B x={[-12.2, -11.9]} y={[0, WALL_H]} z={[-24, 9.5]} m="concrete" />
          <Hedge x={[-11.9, -11.2]} z={[-24, -18]} h={HEDGE_H} />
        </FadeGroup>
        <FadeGroup outside={(c) => c.x > 12.5}>
          <B x={[12, 12.3]} y={[0, WALL_H]} z={[-24, 9.5]} m="renderGrey" />
          <Hedge x={[11.2, 12]} z={[-24, 4]} h={HEDGE_H} />
        </FadeGroup>
        <FadeGroup outside={(c) => c.z < -24.5}>
          <B x={[-12, 12.3]} y={[0, WALL_H]} z={[-24.3, -24]} m="renderGrey" />
          <Hedge x={[-12, 12]} z={[-24, -23.2]} h={HEDGE_H} />
        </FadeGroup>
      </Part>
      <Part id="site-planters" status="VISIBLE" note="front.png: tropical planting and uplights along the street edge">
        {[1.6, 2.9, 4.1, 5.3, 6.4].map((x, i) => <Plant key={i} at={[x, 8.95]} y={0.78} n={12} len={1.2 + (i % 2) * 0.3} seed={50 + i} light={i % 2 === 0} />)}
        {[-11.4, -10.6, -9.4].map((x, i) => <Plant key={i} at={[x, 8.6]} y={0} n={12} len={1.3} seed={60 + i} light={i === 1} />)}
        {[9.6, 10.6, 11.4].map((x, i) => <Plant key={i} at={[x, 8.6]} y={0} n={12} len={1.3} seed={70 + i} />)}
        <Plant at={[-3.0, 8.2]} y={0} n={9} len={0.8} seed={80} light />
        <Inst items={uplights} m="uplight" geo="cyl" cast={false} name="garden-uplights" />
      </Part>
      <Vegetation />
    </group>
  )
}
