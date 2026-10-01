import { useMemo } from 'react'
import { B, Cyl, Inst, leafClump, rng, type Item, type V3 } from '../primitives'
import { Part } from '../primitives'
import { M } from '../materials'

/** Tropical plant in a pot / planter bed (instanced leaves). */
export function Plant({ at, y = 0, n = 14, len = 1.1, seed = 1, pot = 0, tall = 0.15, light = false }: {
  at: [number, number]; y?: number; n?: number; len?: number; seed?: number; pot?: number; tall?: number; light?: boolean
}) {
  const items = useMemo(() => leafClump(at[0], y + pot + tall, at[1], n, len, seed), [at, y, n, len, seed, pot, tall])
  return (
    <group>
      {pot > 0 && <Cyl at={at} y={[y, y + pot]} r={0.28} rb={0.2} m="pot" />}
      <Inst items={items} m={light ? 'leafLight' : 'leaf'} geo="sphere" />
    </group>
  )
}

/** Palm: tapered trunk + radiating drooping fronds (instanced). */
export function Palm({ at, h = 6, seed = 1, lean = 0.05, y = 0 }: { at: [number, number]; h?: number; seed?: number; lean?: number; y?: number }) {
  const { fronds, top, rot } = useMemo(() => {
    const r = rng(seed * 97)
    const dir = r() * Math.PI * 2
    const top: V3 = [at[0] + Math.sin(dir) * lean * h, y + h, at[1] + Math.cos(dir) * lean * h]
    const fronds: Item[] = []
    const N = 20
    for (let i = 0; i < N; i++) {
      const yaw = (i / N) * Math.PI * 2 + r() * 0.3
      const droop = 0.3 + (i % 3) * 0.4 + r() * 0.2
      const L = 2.8 + r() * 0.9
      const d: V3 = [Math.sin(yaw) * Math.cos(droop), -Math.sin(droop), Math.cos(yaw) * Math.cos(droop)]
      fronds.push({ p: [top[0] + d[0] * L * 0.5, top[1] + d[1] * L * 0.5 + 0.15, top[2] + d[2] * L * 0.5], s: [0.38, 0.03, L], e: [droop, yaw, 0] })
    }
    return { fronds, top, rot: { x: Math.atan2(top[2] - at[1], h), z: -Math.atan2(top[0] - at[0], h) } }
  }, [at, h, seed, lean, y])
  return (
    <group>
      <mesh position={[(at[0] + top[0]) / 2, y + h / 2, (at[1] + top[2]) / 2]} rotation={[rot.x, 0, rot.z]} material={M.trunk} castShadow>
        <cylinderGeometry args={[0.15, 0.24, h, 10]} />
      </mesh>
      <Inst items={fronds} m="leaf" />
      <Inst items={useMemo(() => [{ p: [top[0], top[1] + 0.05, top[2]] as V3, s: [0.35, 0.3, 0.35] as V3 }], [top])} m="trunk" geo="sphere" />
    </group>
  )
}

/** Clipped boundary hedge as one long box with a leafy texture feel. */
export function Hedge({ x, z, h = 2.2 }: { x: [number, number]; z: [number, number]; h?: number }) {
  return <B x={x} y={[0, h]} z={z} m="hedge" />
}

/** Wrapper used by the site for registry + export naming. */
export function Vegetation() {
  const palms: { at: [number, number]; h: number; lean: number }[] = [
    { at: [-11, 6.5], h: 7, lean: 0.06 }, { at: [11, 5], h: 6.5, lean: -0.05 },
    { at: [10.8, -6], h: 7.2, lean: 0.04 }, { at: [10.6, -14], h: 6, lean: -0.04 },
    { at: [-10.8, -21], h: 6.8, lean: 0.05 }, { at: [8.5, -22.2], h: 5.6, lean: 0.07 },
    { at: [-11.2, -1], h: 5.4, lean: 0.03 }, { at: [10.5, 9], h: 5.2, lean: -0.05 },
  ]
  return (
    <Part id="palms" status="VISIBLE" note="rear-original.jpg, front.png, aerial.png: tall palms">
      {palms.map((p, i) => <Palm key={i} at={p.at} h={p.h} lean={p.lean} seed={i + 1} />)}
    </Part>
  )
}
