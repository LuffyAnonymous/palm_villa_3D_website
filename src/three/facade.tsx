import { useMemo } from 'react'
import { rooms, type Room } from '../data/villa'
import { B, Inst, vSlatsX, vSlatsZ, type Item, type MatProp, type R2, type V3 } from './primitives'

export const F1 = 3.2
export const ROOF_Y = 6.4
export const SLAB = 0.25
export const G_TOP = F1 - SLAB // 2.95 – underside of first-floor slab
export const U_TOP = ROOF_Y - SLAB // 6.15 – underside of roof slab
const WT = 0.25

type Axis = 'x' | 'z'
export interface Seg { a: Axis; c: number; s0: number; s1: number; y0: number; y1: number; out: 1 | -1 }

/** Map (along-axis range, across-axis range, y range) to world x/y/z ranges. */
const rangeBox = (a: Axis, s: R2, c: R2, y: R2) => (a === 'x' ? { x: s, y, z: c } : { x: c, y, z: s })

/** Solid exterior wall; outer face sits on `c`, thickness grows inward. */
export function Wall({ a, c, s0, s1, y0, y1, out, m = 'render', t = WT }: Seg & { m?: MatProp; t?: number }) {
  const c0: R2 = out > 0 ? [c - t, c] : [c, c + t]
  return <B {...rangeBox(a, [s0, s1], c0, [y0, y1])} m={m} />
}

/** Full-height glazing: thin black frame, mullions every ~`panel` m, transmissive pane. */
export function GlassWall({ a, c, s0, s1, y0, y1, out, panel = 1.7, inset = 0.12, frame = 'black' }: Seg & { panel?: number; inset?: number; frame?: MatProp }) {
  const cc = c - out * inset
  const n = Math.max(1, Math.round((s1 - s0) / panel))
  const posts = useMemo<Item[]>(
    () => Array.from({ length: n + 1 }, (_, i) => {
      const s = s0 + ((s1 - s0) * i) / n
      const p: V3 = a === 'x' ? [s, (y0 + y1) / 2, cc] : [cc, (y0 + y1) / 2, s]
      const sc: V3 = a === 'x' ? [0.06, y1 - y0, 0.12] : [0.12, y1 - y0, 0.06]
      return { p, s: sc }
    }),
    [a, cc, s0, s1, y0, y1, n],
  )
  const h = 0.07
  return (
    <group>
      <B {...rangeBox(a, [s0, s1], [cc - 0.012, cc + 0.012], [y0 + h, y1 - h])} m="glass" cast={false} />
      <B {...rangeBox(a, [s0, s1], [cc - 0.06, cc + 0.06], [y0, y0 + h])} m={frame} />
      <B {...rangeBox(a, [s0, s1], [cc - 0.06, cc + 0.06], [y1 - h, y1])} m={frame} />
      <Inst items={posts} m={frame} />
    </group>
  )
}

/** Oak vertical slat panel over a dark backing. */
export function SlatPanel({ a, c, s0, s1, y0, y1, out, pitch = 0.13, w = 0.06, d = 0.09, backing = 'black' as MatProp, gap = 0.12 }: Seg & { pitch?: number; w?: number; d?: number; backing?: MatProp; gap?: number }) {
  const cc = c - out * (d / 2 + 0.01)
  const items = useMemo(() => (a === 'x' ? vSlatsX(s0, s1, y0, y1, cc, pitch, w, d) : vSlatsZ(s0, s1, y0, y1, cc, pitch, w, d)), [a, cc, s0, s1, y0, y1, pitch, w, d])
  const bc: R2 = out > 0 ? [c - gap - 0.05, c - gap] : [c + gap, c + gap + 0.05]
  return (
    <group>
      <B {...rangeBox(a, [s0, s1], bc, [y0, y1])} m={backing} />
      <Inst items={items} m="oak" cast={false} />
    </group>
  )
}

/** Frameless glass balustrade with steel standoffs. */
export function GlassRail({ a, c, s0, s1, y, h = 1.05 }: { a: Axis; c: number; s0: number; s1: number; y: number; h?: number }) {
  const n = Math.max(1, Math.round((s1 - s0) / 1.2))
  const posts = useMemo<Item[]>(
    () => Array.from({ length: n + 1 }, (_, i) => {
      const s = s0 + ((s1 - s0) * i) / n
      return { p: (a === 'x' ? [s, y + 0.06, c] : [c, y + 0.06, s]) as V3, s: [0.05, 0.12, 0.05] as V3 }
    }),
    [a, c, s0, s1, y, n],
  )
  return (
    <group>
      <B {...rangeBox(a, [s0, s1], [c - 0.01, c + 0.01], [y + 0.1, y + h])} m="glass" cast={false} />
      <B {...rangeBox(a, [s0, s1], [c - 0.025, c + 0.025], [y + h, y + h + 0.03])} m="steel" />
      <Inst items={posts} m="black" />
    </group>
  )
}

// ───────────── Floor plates ─────────────
export function Plates({ floor }: { floor: 0 | 1 }) {
  const top = floor === 0 ? 0 : F1
  const th = floor === 0 ? 0.2 : SLAB
  const list = rooms.filter((r) => r.floor === floor && (floor === 1 || !r.outdoor) && r.zone !== 'terrace')
  return (
    <group name={`plates-${floor}`}>
      {list.map((r) => {
        const [x0, x1, z0, z1] = r.rect
        if (r.outdoor) {
          // cantilever slab: dark concrete beam + stone paving
          return (
            <group key={r.id}>
              <B x={[x0 - 0.6, x1 + 0.3]} y={[F1 - 0.7, F1]} z={[z0 - 0.5, z1]} m="concrete" />
              <B x={[x0 + 0.1, x1 - 0.1]} y={[F1, F1 + 0.04]} z={[z0 - 0.1, z1]} m="beigeStone" />
            </group>
          )
        }
        return <B key={r.id} x={[x0, x1]} y={[top - th, top]} z={[z0, z1]} m={r.floorMat === 'concrete' ? 'concreteLight' : (r.floorMat as MatProp)} />
      })}
    </group>
  )
}

// ───────────── Interior partitions (auto-derived from room rects) ─────────────
const OPEN = new Set(['kitchen|dining', 'dining|living', 'landing|corridor', 'landing|gallery', 'master|landing', 'corridor|corridor2'])
const NODOOR = new Set(['hall|living', 'masterbath|bath3', 'masterbath|corridor2', 'masterbath|bedroom3', 'masterbath|landing'])

interface P { a: Axis; c: number; lo: number; hi: number; door: boolean }

function derivePartitions(floor: number): P[] {
  const rs = rooms.filter((r) => r.floor === floor && !r.outdoor)
  const out: P[] = []
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
    const A = rs[i], B_ = rs[j]
    if (OPEN.has(`${A.id}|${B_.id}`) || OPEN.has(`${B_.id}|${A.id}`)) continue
    const [ax0, ax1, az0, az1] = A.rect, [bx0, bx1, bz0, bz1] = B_.rect
    const zlo = Math.max(az0, bz0), zhi = Math.min(az1, bz1)
    const xlo = Math.max(ax0, bx0), xhi = Math.min(ax1, bx1)
    const door = !(NODOOR.has(`${A.id}|${B_.id}`) || NODOOR.has(`${B_.id}|${A.id}`))
    if ((ax1 === bx0 || bx1 === ax0) && zhi - zlo > 0.01) out.push({ a: 'z', c: ax1 === bx0 ? ax1 : ax0, lo: zlo, hi: zhi, door })
    if ((az1 === bz0 || bz1 === az0) && xhi - xlo > 0.01) out.push({ a: 'x', c: az1 === bz0 ? az1 : az0, lo: xlo, hi: xhi, door })
  }
  return out
}

export function Partitions({ floor }: { floor: 0 | 1 }) {
  const y0 = floor === 0 ? 0 : F1
  const y1 = floor === 0 ? G_TOP : U_TOP
  const parts = useMemo(() => derivePartitions(floor), [floor])
  const T = 0.12
  return (
    <group name={`partitions-${floor}`}>
      {parts.map((p, i) => {
        const L = p.hi - p.lo
        const c: R2 = [p.c - T / 2, p.c + T / 2]
        if (L < 1.6 || !p.door) return <B key={i} {...rangeBox(p.a, [p.lo, p.hi], c, [y0, y1])} m="wall" />
        const mid = (p.lo + p.hi) / 2
        const g0 = mid - 0.5, g1 = mid + 0.5
        return (
          <group key={i}>
            <B {...rangeBox(p.a, [p.lo, g0], c, [y0, y1])} m="wall" />
            <B {...rangeBox(p.a, [g1, p.hi], c, [y0, y1])} m="wall" />
            <B {...rangeBox(p.a, [g0, g1], c, [y0 + 2.2, y1])} m="wall" />
          </group>
        )
      })}
    </group>
  )
}

export const roomsOnFloor = (f: number): Room[] => rooms.filter((r) => r.floor === f)
