import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { B, Inst, Part, type Item, type V3 } from '../primitives'
import { M, waterNormal, waterfallMap } from '../materials'

type P2 = [number, number] // (x, z)

/** Pool outline: main body + sunken lounge pit; the spa notch is excluded (raised separately). */
export const POOL: P2[] = [
  [2, -6.5], [4.5, -6.5], [4.5, -9.5], [8, -9.5], [8, -19], [2, -19], [2, -16.5], [-0.6, -16.5], [-0.6, -12.5], [2, -12.5],
]

const WATER_Y = -0.12
const FLOOR_Y = -1.4

export function shapeOf(pts: P2[]) {
  const s = new THREE.Shape()
  pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)))
  s.closePath()
  return s
}

function polyArea(pts: P2[]) {
  let a = 0
  pts.forEach(([x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length]; a += x * z2 - x2 * z })
  return a / 2
}

function inside(pts: P2[], x: number, z: number) {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c
  }
  return c
}

/** Coping boxes just outside every polygon edge; corner overlap only at convex vertices. */
function copingBoxes(pts: P2[], w: number): { x: [number, number]; z: [number, number] }[] {
  const sign = Math.sign(polyArea(pts))
  const out: { x: [number, number]; z: [number, number] }[] = []
  pts.forEach(([x1, z1], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length]
    const [xp, zp] = pts[(i + pts.length - 1) % pts.length]
    const [xn, zn] = pts[(i + 2) % pts.length]
    const dx = Math.sign(x2 - x1), dz = Math.sign(z2 - z1)
    const crossStart = ((x1 - xp) * (z2 - z1) - (z1 - zp) * (x2 - x1)) * sign > 0
    const crossEnd = ((x2 - x1) * (zn - z2) - (z2 - z1) * (xn - x2)) * sign > 0
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2
    // outward normal
    const nx = dz !== 0 ? 1 : 0, nz = dx !== 0 ? 1 : 0
    let ox = nx, oz = nz
    if (inside(pts, mx + nx * 0.1, mz + nz * 0.1)) { ox = -nx; oz = -nz }
    const ext0 = crossStart ? w : 0, ext1 = crossEnd ? w : 0
    if (dx !== 0) {
      const a = Math.min(x1, x2) - (dx > 0 ? ext0 : ext1), b = Math.max(x1, x2) + (dx > 0 ? ext1 : ext0)
      out.push({ x: [a, b], z: oz > 0 ? [z1, z1 + w] : [z1 - w, z1] })
    } else {
      const a = Math.min(z1, z2) - (dz > 0 ? ext0 : ext1), b = Math.max(z1, z2) + (dz > 0 ? ext1 : ext0)
      out.push({ z: [a, b], x: ox > 0 ? [x1, x1 + w] : [x1 - w, x1] })
    }
  })
  return out
}

function polyWalls(pts: P2[], y0: number, y1: number) {
  const pos: number[] = []
  pts.forEach(([x1, z1], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length]
    pos.push(x1, y0, z1, x2, y0, z2, x2, y1, z2, x1, y0, z1, x2, y1, z2, x1, y1, z1)
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  const uv: number[] = []
  for (let i = 0; i < pos.length / 3; i += 6) uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1)
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv.map((v, k) => (k % 2 ? v * 1.4 : v * 2)), 2))
  g.computeVertexNormals()
  return g
}

const ledgeLounger: Item[] = [
  { p: [4.95, -0.16, -11.9] as V3, s: [0.72, 0.08, 1.0] as V3 },
  { p: [4.95, 0.12, -10.75] as V3, s: [0.72, 0.08, 0.95] as V3, e: [0.95, 0, 0] as V3 },
]

export function Pool() {
  const geo = useMemo(() => {
    const shape = shapeOf(POOL)
    const water = new THREE.ShapeGeometry(shape)
    water.rotateX(-Math.PI / 2)
    water.translate(0, WATER_Y, 0)
    const floor = new THREE.ShapeGeometry(shape)
    floor.rotateX(-Math.PI / 2)
    floor.translate(0, FLOOR_Y, 0)
    return { water, floor, walls: polyWalls(POOL, FLOOR_Y, 0) }
  }, [])
  const coping = useMemo(() => copingBoxes(POOL, 0.38), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    waterNormal.offset.set(t * 0.012, t * 0.017)
    waterfallMap.offset.y = -t * 1.3
  })

  return (
    <group>
      <Part id="pool-basin" status="VISIBLE" note="rear-original.jpg, aerial.png: rectangular pool, turquoise tile, dark stone coping, wraps left and front of terrace">
        <mesh geometry={geo.floor} material={M.tileFloor} receiveShadow />
        <mesh geometry={geo.walls} material={M.tileFloor} receiveShadow />
        <mesh geometry={geo.water} material={M.water} />
        {coping.map((c, i) => <B key={i} x={c.x} y={[-0.12, 0.05]} z={c.z} m="marble" />)}
      </Part>
      <Part id="pool-spa" status="VISIBLE" note="aerial.png: small raised spa section next to the waterfall">
        <B x={[4.4, 8.15]} y={[-0.3, 0.05]} z={[-9.65, -6.4]} m="tileFloor" />
        <B x={[4.4, 4.75]} y={[0, 0.5]} z={[-9.65, -6.4]} m="marble" />
        <B x={[7.8, 8.15]} y={[0, 0.5]} z={[-9.65, -6.4]} m="marble" />
        <B x={[4.75, 7.8]} y={[0, 0.5]} z={[-9.65, -9.3]} m="marble" />
        <B x={[4.75, 7.8]} y={[0, 0.5]} z={[-6.75, -6.4]} m="marble" />
        <mesh position={[6.28, 0.36, -8.03]} rotation={[-Math.PI / 2, 0, 0]} material={M.water}>
          <planeGeometry args={[3.05, 2.55]} />
        </mesh>
      </Part>
      <Part id="pool-lounge-pit" status="VISIBLE" note="rear-original.jpg, aerial.png: sunken lounge pit with built-in tufted seating inset into the pool">
        <B x={[-0.6, -0.1]} y={[-1.0, 0.3]} z={[-16.5, -12.5]} m="beigeStone" />
        <B x={[-0.1, 0.7]} y={[-1.0, -0.35]} z={[-16.3, -12.7]} m="beigeStone" />
        <B x={[-0.1, 2]} y={[-1.0, -0.35]} z={[-16.5, -16.1]} m="beigeStone" />
        <B x={[-0.1, 2]} y={[-1.0, -0.35]} z={[-12.9, -12.5]} m="beigeStone" />
      </Part>
      <Part id="pool-lounger" status="VISIBLE" note="rear-original.jpg: one sun lounger on a shallow pool ledge">
        <B x={[3.6, 6.4]} y={[FLOOR_Y, -0.32]} z={[-13.6, -10.4]} m="beigeStone" />
        <Inst items={ledgeLounger} m="white" />
        <B x={[4.65, 4.69]} y={[-0.32, -0.2]} z={[-12.3, -12.2]} m="black" />
        <B x={[5.2, 5.24]} y={[-0.32, -0.2]} z={[-12.3, -12.2]} m="black" />
      </Part>
      <Part id="waterfall" status="VISIBLE" note="rear-original.jpg, aerial.png: sheet waterfall from a spout at the upper slab edge on the left into the pool">
        <B x={[2.3, 4.0]} y={[2.95, 3.3]} z={[-6.85, -6.4]} m="black" />
        <mesh position={[3.15, 1.45, -6.78]} material={M.waterfall}>
          <planeGeometry args={[1.6, 3.1]} />
        </mesh>
      </Part>
    </group>
  )
}
