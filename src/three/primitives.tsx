import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { useFrame } from '@react-three/fiber'
import { M, glass, glassLite, type MatKey } from './materials'
import type { Status, V3 } from '../data/villa'
import { useQuality } from '../state/quality'

export type { V3 }
export type R2 = [number, number]
/** position, scale, optional Euler [rx, ry, rz] (YXZ order, yaw outermost) */
export interface Item { p: V3; s: V3; e?: V3 }
export type MatProp = MatKey | THREE.Material | 'glass'

export function useMat() {
  const q = useQuality((s) => s.quality)
  return (m: MatProp): THREE.Material => (m === 'glass' ? (q === 'low' ? glassLite : glass) : typeof m === 'string' ? M[m] : m)
}

/** Every element of the model is registered so VISIBLE / INFERRED can be exported. */
export const registry = new Map<string, { status: Status; note: string }>()

export function Part({ id, status, note = '', children }: { id: string; status: Status; note?: string; children?: ReactNode }) {
  registry.set(id, { status, note })
  return <group name={id} userData={{ status, note }}>{children}</group>
}

// Box geometry with bevelled edges and world-scale (metre) UVs, shared between meshes.
const boxCache = new Map<string, THREE.BufferGeometry>()
export function boxGeo(w: number, h: number, d: number) {
  const k = `${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}`
  let g = boxCache.get(k)
  if (g) return g
  const minDim = Math.min(w, h, d)
  // real edges are never razor sharp: 2-4 cm round-overs on walls, slabs, furniture; hairline parts stay square
  const r = minDim < 0.07 ? 0 : Math.min(minDim >= 0.5 ? 0.04 : 0.025, minDim * 0.35)
  g = r > 0 ? new RoundedBoxGeometry(w, h, d, minDim >= 0.3 ? 2 : 1, r) : new THREE.BoxGeometry(w, h, d)
  const pos = g.attributes.position as THREE.BufferAttribute
  const nor = g.attributes.normal as THREE.BufferAttribute
  const uv = g.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i))
    const x = pos.getX(i) + w / 2, y = pos.getY(i) + h / 2, z = pos.getZ(i) + d / 2
    if (ax >= ay && ax >= az) uv.setXY(i, z, y)
    else if (ay >= az) uv.setXY(i, x, z)
    else uv.setXY(i, x, y)
  }
  boxCache.set(k, g)
  return g
}

interface BProps {
  x: R2; y: R2; z: R2; m: MatProp
  cast?: boolean; receive?: boolean; name?: string
  onPointerOver?: (e: any) => void; onPointerOut?: (e: any) => void; onClick?: (e: any) => void
}

/** Axis-aligned box from min/max ranges, in metres. Only chunky boxes cast shadows unless overridden. */
export function B({ x, y, z, m, cast, receive = true, name, ...ev }: BProps) {
  const mat = useMat()
  const w = Math.abs(x[1] - x[0]), h = Math.abs(y[1] - y[0]), d = Math.abs(z[1] - z[0])
  return (
    <mesh
      name={name}
      position={[(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2]}
      geometry={boxGeo(w, h, d)}
      material={mat(m)}
      castShadow={cast ?? w * h * d > 0.3}
      receiveShadow={receive}
      {...ev}
    />
  )
}

const UNIT = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 10, 8),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 14),
}

/** Instanced repeated geometry (slats, pavers, stools, beams, leaves). Memoise `items` in the caller. */
export function Inst({ items, m, geo = 'box', cast = true, receive = true, name }: {
  items: Item[]; m: MatProp; geo?: keyof typeof UNIT; cast?: boolean; receive?: boolean; name?: string
}) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const mat = useMat()
  useLayoutEffect(() => {
    const o = new THREE.Object3D()
    o.rotation.order = 'YXZ'
    const im = ref.current
    items.forEach((it, i) => {
      o.position.set(...it.p)
      o.scale.set(...it.s)
      o.rotation.set(...(it.e ?? [0, 0, 0]))
      o.updateMatrix()
      im.setMatrixAt(i, o.matrix)
    })
    im.instanceMatrix.needsUpdate = true
    im.computeBoundingSphere()
  }, [items])
  if (!items.length) return null
  return <instancedMesh key={items.length} ref={ref} name={name} args={[UNIT[geo], mat(m), items.length]} castShadow={cast} receiveShadow={receive} />
}

/** Cylinder: radius top/bottom, from y0 to y1 at (cx, cz). */
export function Cyl({ at, y, r, rb, m, seg = 20, cast = true }: { at: [number, number]; y: R2; r: number; rb?: number; m: MatProp; seg?: number; cast?: boolean }) {
  const mat = useMat()
  const h = y[1] - y[0]
  return (
    <mesh position={[at[0], (y[0] + y[1]) / 2, at[1]]} material={mat(m)} castShadow={cast} receiveShadow>
      <cylinderGeometry args={[r, rb ?? r, h, seg]} />
    </mesh>
  )
}

// ── Item generators ──────────────────────────────────────────────────────────

/** Vertical slats spread along x at a fixed z. */
export function vSlatsX(x0: number, x1: number, y0: number, y1: number, z: number, pitch: number, w: number, d: number): Item[] {
  const n = Math.max(1, Math.floor((x1 - x0) / pitch))
  const off = (x1 - x0 - (n - 1) * pitch) / 2
  return Array.from({ length: n }, (_, i) => ({ p: [x0 + off + i * pitch, (y0 + y1) / 2, z] as V3, s: [w, y1 - y0, d] as V3 }))
}
/** Vertical slats spread along z at a fixed x. */
export function vSlatsZ(z0: number, z1: number, y0: number, y1: number, x: number, pitch: number, w: number, d: number): Item[] {
  const n = Math.max(1, Math.floor((z1 - z0) / pitch))
  const off = (z1 - z0 - (n - 1) * pitch) / 2
  return Array.from({ length: n }, (_, i) => ({ p: [x, (y0 + y1) / 2, z0 + off + i * pitch] as V3, s: [d, y1 - y0, w] as V3 }))
}
/** Horizontal boards running along x, spread across z at height y. */
export function boardsX(x0: number, x1: number, y: number, z0: number, z1: number, pitch: number, w: number, h: number): Item[] {
  const n = Math.max(1, Math.floor((z1 - z0) / pitch))
  const off = (z1 - z0 - (n - 1) * pitch) / 2
  return Array.from({ length: n }, (_, i) => ({ p: [(x0 + x1) / 2, y, z0 + off + i * pitch] as V3, s: [x1 - x0, h, w] as V3 }))
}
/** Horizontal boards running along z, spread across x at height y. */
export function boardsZ(z0: number, z1: number, y: number, x0: number, x1: number, pitch: number, w: number, h: number): Item[] {
  const n = Math.max(1, Math.floor((x1 - x0) / pitch))
  const off = (x1 - x0 - (n - 1) * pitch) / 2
  return Array.from({ length: n }, (_, i) => ({ p: [x0 + off + i * pitch, y, (z0 + z1) / 2] as V3, s: [w, h, z1 - z0] as V3 }))
}

/** tiny deterministic RNG so geometry is stable between renders / exports */
export function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

/** Leaf clump for tropical plants (instanced ellipsoids). */
export function leafClump(cx: number, cy: number, cz: number, n: number, len: number, seed: number): Item[] {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => {
    const yaw = (i / n) * Math.PI * 2 + r() * 0.6
    const tilt = 0.25 + r() * 0.9
    const L = len * (0.6 + r() * 0.6)
    const dir: V3 = [Math.sin(yaw) * Math.sin(tilt), Math.cos(tilt), Math.cos(yaw) * Math.sin(tilt)]
    return { p: [cx + dir[0] * L * 0.5, cy + dir[1] * L * 0.5, cz + dir[2] * L * 0.5] as V3, s: [L * 0.2, L * 0.5, 0.025] as V3, e: [tilt, yaw, 0] as V3 }
  })
}

/**
 * Fades (and finally hides) its children while `outside(cameraPosition)` is true.
 * Used for the plot boundary walls so orbit / top cameras can see over them.
 * Materials are cloned per group so shared materials are never touched.
 */
export function FadeGroup({ outside, children }: { outside: (cam: THREE.Vector3) => boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  const mats = useRef<THREE.Material[]>([])
  const alpha = useRef(1)
  useLayoutEffect(() => {
    const seen = new Map<THREE.Material, THREE.Material>()
    ref.current.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh && !Array.isArray(m.material)) {
        let c = seen.get(m.material)
        if (!c) { c = m.material.clone(); seen.set(m.material, c) }
        m.material = c
      }
    })
    mats.current = [...seen.values()]
  }, [])
  useFrame(({ camera }, dt) => {
    const target = outside(camera.position) ? 0 : 1
    alpha.current += (target - alpha.current) * Math.min(1, dt * 7)
    const a = alpha.current
    ref.current.visible = a > 0.02
    mats.current.forEach((m) => {
      const t = a < 0.99
      if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true }
      m.opacity = a
    })
  })
  return <group ref={ref} userData={{ noBake: true }}>{children}</group>
}


// ── Draw-call baking ─────────────────────────────────────────────────────────

const KEEP_ATTRS = new Set(['position', 'normal', 'uv'])
const statusOf = (o: THREE.Object3D | null): string => {
  for (; o; o = o.parent) if (o.userData.status) return o.userData.status as string
  return 'VISIBLE'
}

/** splitStatus: keep VISIBLE / INFERRED parts in separate meshes (used for the GLB export; costs extra draw calls). */
export const bakeOptions = { splitStatus: false }

/**
 * Collapses a subtree's draw calls:
 *  - static opaque meshes  -> ONE merged mesh per material
 *  - InstancedMesh sources -> ONE InstancedMesh per (material, shape): all slats of one material become a single draw call
 * Source objects stay in the scene graph (hidden, flagged `bakedSource`) so React keeps owning them;
 * the returned function undoes the bake (re-render, StrictMode, export).
 * Skipped: transparent materials (need sorting), `userData.noBake` subtrees.
 */
export function bake(root: THREE.Object3D): () => void {
  root.updateWorldMatrix(true, true)
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const m4 = new THREE.Matrix4()
  const split = bakeOptions.splitStatus
  const buckets = new Map<string, { geoms: THREE.BufferGeometry[]; mat: THREE.Material; status: string; cast: boolean }>()
  const ibuckets = new Map<string, { geo: THREE.BufferGeometry; mats: THREE.Matrix4[]; mat: THREE.Material; status: string; cast: boolean }>()
  const sources: THREE.Mesh[] = []

  const walk = (o: THREE.Object3D) => {
    if (o.userData.noBake) return
    const m = o as THREE.Mesh
    if (m.isMesh && m.visible && !Array.isArray(m.material)) {
      const mat = m.material as THREE.Material & { transmission?: number }
      if (!mat.transparent || mat.transmission) {
        const status = split ? statusOf(m) : 'ALL'
        if ((m as THREE.InstancedMesh).isInstancedMesh) {
          const im = m as THREE.InstancedMesh
          // casting and non-casting instances stay in separate batches, otherwise fine slats would all inherit shadows
          const key = `${mat.uuid}|${im.geometry.uuid}|${status}|${im.castShadow ? 1 : 0}`
          let b = ibuckets.get(key)
          if (!b) ibuckets.set(key, (b = { geo: im.geometry, mats: [], mat, status, cast: im.castShadow }))
          for (let i = 0; i < im.count; i++) {
            const t = new THREE.Matrix4()
            im.getMatrixAt(i, t)
            b.mats.push(t.premultiply(m4.multiplyMatrices(inv, im.matrixWorld)))
          }
        } else {
          const g = m.geometry.clone().applyMatrix4(m4.multiplyMatrices(inv, m.matrixWorld))
          for (const k of Object.keys(g.attributes)) if (!KEEP_ATTRS.has(k)) g.deleteAttribute(k)
          if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
          if (!g.attributes.normal) g.computeVertexNormals()
          const key = `${mat.uuid}|${status}`
          let b = buckets.get(key)
          if (!b) buckets.set(key, (b = { geoms: [], mat, status, cast: false }))
          b.cast ||= m.castShadow
          b.geoms.push(g)
        }
        sources.push(m)
      }
    }
    o.children.forEach(walk)
  }
  root.children.forEach(walk)

  const made: THREE.Mesh[] = []
  const tag = (mesh: THREE.Mesh, b: { mat: THREE.Material; status: string; cast: boolean }, kind: string) => {
    mesh.name = `${root.name || 'baked'}/${b.mat.name || 'mat'}${kind}${split ? `/${b.status}` : ''}`
    mesh.castShadow = b.cast
    mesh.receiveShadow = true
    mesh.userData = { baked: true, status: split ? b.status : undefined }
    root.add(mesh)
    made.push(mesh)
  }
  buckets.forEach((b) => {
    const allIndexed = b.geoms.every((g) => g.index)
    const list = allIndexed ? b.geoms : b.geoms.map((g) => (g.index ? g.toNonIndexed() : g))
    const merged = mergeGeometries(list, false)
    b.geoms.forEach((g) => g.dispose())
    if (merged) tag(new THREE.Mesh(merged, b.mat), b, '')
  })
  ibuckets.forEach((b) => {
    const im = new THREE.InstancedMesh(b.geo, b.mat, b.mats.length)
    b.mats.forEach((t, i) => im.setMatrixAt(i, t))
    im.instanceMatrix.needsUpdate = true
    im.computeBoundingSphere()
    tag(im, b, '/instanced')
  })
  sources.forEach((s) => { s.visible = false; s.userData.bakedSource = true })

  return () => {
    made.forEach((m) => { root.remove(m); if (!(m as THREE.InstancedMesh).isInstancedMesh) m.geometry.dispose(); (m as THREE.InstancedMesh).dispose?.() })
    sources.forEach((s) => { s.visible = true; delete s.userData.bakedSource })
  }
}

/** Wrap a subtree: after mount its meshes are merged / batched (see `bake`). Re-bakes on quality change or "villa-rebake". */
export function Bake({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  const quality = useQuality((s) => s.quality)
  useLayoutEffect(() => {
    let undo = bake(ref.current)
    const again = () => { undo(); undo = bake(ref.current) }
    window.addEventListener('villa-rebake', again)
    return () => { window.removeEventListener('villa-rebake', again); undo() }
  }, [quality])
  return <group ref={ref} name={name}>{children}</group>
}
