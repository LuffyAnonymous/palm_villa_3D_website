import { B, Cyl, Inst, Part, vSlatsZ, leafClump, type Item, type V3 } from '../primitives'
import { GlassWall, Partitions, Plates, SlatPanel, Wall, G_TOP } from '../facade'
import { Plant } from './Vegetation'

// ───────────── repeated geometry (module-level so arrays are stable) ─────────────
const stoolX = Array.from({ length: 8 }, (_, i) => -7.95 + i * 0.5)
const stoolSeat: Item[] = stoolX.map((x) => ({ p: [x, 0.68, -3.55] as V3, s: [0.2, 0.05, 0.2] as V3 }))
const stoolBack: Item[] = stoolX.map((x) => ({ p: [x, 0.95, -3.76] as V3, s: [0.38, 0.22, 0.04] as V3 }))
const stoolLegs: Item[] = stoolX.flatMap((x) =>
  [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([dx, dz]) => ({ p: [x + dx, 0.34, -3.55 + dz] as V3, s: [0.025, 0.68, 0.025] as V3 })),
)
const chairs: Item[] = [-2.3, -1.5, -0.7].flatMap((x) => [-3.45, -1.55].map((z) => ({ p: [x, 0.45, z] as V3, s: [0.46, 0.06, 0.46] as V3 })))
const chairBacks: Item[] = [-2.3, -1.5, -0.7].flatMap((x) => [-3.7, -1.3].map((z) => ({ p: [x, 0.78, z] as V3, s: [0.44, 0.4, 0.05] as V3 })))
const chairLegs: Item[] = [-2.3, -1.5, -0.7].flatMap((x) => [-3.45, -1.55].flatMap((z) =>
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([dx, dz]) => ({ p: [x + dx, 0.22, z + dz] as V3, s: [0.03, 0.44, 0.03] as V3 })),
))
const stairTreads: Item[] = Array.from({ length: 18 }, (_, i) => ({ p: [-0.9, (i + 1) * 0.1778 - 0.03, 5.5 - i * 0.247 - 0.12] as V3, s: [1.2, 0.06, 0.26] as V3 }))
const STAIR_ANGLE = Math.atan2(3.2, 4.2)
const stairStringer: Item[] = [{ p: [-0.9, 1.45, 3.4] as V3, s: [0.1, 0.32, Math.hypot(3.2, 4.2) + 0.2] as V3, e: [STAIR_ANGLE, 0, 0] as V3 }]
// living feature wall slats with niche gaps
const fwSlats: Item[] = [
  ...vSlatsZ(2.3, 2.75, 0, 6.15, 1.12, 0.1, 0.06, 0.1),
  ...vSlatsZ(3.35, 5.25, 0, 6.15, 1.12, 0.1, 0.06, 0.1),
  ...vSlatsZ(5.85, 6.3, 0, 6.15, 1.12, 0.1, 0.06, 0.1),
  ...vSlatsZ(2.75, 3.35, 2.5, 6.15, 1.12, 0.1, 0.06, 0.1),
  ...vSlatsZ(5.25, 5.85, 2.5, 6.15, 1.12, 0.1, 0.06, 0.1),
  ...vSlatsZ(2.75, 3.35, 0, 0.8, 1.12, 0.1, 0.06, 0.1),
  ...vSlatsZ(5.25, 5.85, 0, 0.8, 1.12, 0.1, 0.06, 0.1),
]
const nicheShelves: Item[] = [[2.75, 3.35], [5.25, 5.85]].flatMap(([a, b]) =>
  [0.9, 1.4, 1.9, 2.4].map((y) => ({ p: [1.3, y, (a + b) / 2] as V3, s: [0.35, 0.03, b - a] as V3 })),
)
const sectionalCushions: Item[] = [2.6, 3.6, 4.6, 5.6].map((z) => ({ p: [6.3, 0.75, z] as V3, s: [0.22, 0.4, 0.55] as V3, e: [0, 0, 0.15] as V3 }))
const bigLeaf = leafClump(7.3, 0.35, 6.3, 16, 1.7, 77)
const cabinetPulls: Item[] = [-4.4, -4.9].map((x) => ({ p: [x, 0.62, -1.19] as V3, s: [0.35, 0.02, 0.02] as V3 }))

/** Ground-floor envelope. Facade materials from rear-original.jpg, front.png. */
function Facade() {
  const y0 = 0, y1 = G_TOP
  return (
    <group name="ground-facade">
      <Part id="g-rear-glazing" status="VISIBLE" note="rear-original.jpg: floor-to-ceiling sliding glass, thin black frames">
        <GlassWall a="x" c={-4.5} s0={-8.75} s1={1} y0={y0} y1={y1} out={-1} panel={1.75} />
        <GlassWall a="x" c={-5.5} s0={1.25} s1={8} y0={y0} y1={y1} out={-1} panel={1.75} />
      </Part>
      <Part id="g-side-walls" status="INFERRED" note="side and return walls not visible in the images">
        <Wall a="z" c={-9} s0={-4.5} s1={1.5} y0={y0} y1={y1} out={-1} />
        <Wall a="z" c={-9} s0={1.5} s1={7} y0={y0} y1={y1} out={-1} m="concrete" />
        <Wall a="z" c={1} s0={-5.5} s1={-4.5} y0={y0} y1={y1} out={-1} />
        <Wall a="z" c={8} s0={-5.5} s1={7} y0={y0} y1={y1} out={1} />
      </Part>
      <Part id="g-garage-door" status="VISIBLE" note="front.png: vertical oak slat garage door, carport">
        <SlatPanel a="x" c={7} s0={-8.4} s1={-3.4} y0={y0} y1={2.6} out={1} pitch={0.16} w={0.1} />
        <Wall a="x" c={7} s0={-9} s1={-8.4} y0={y0} y1={y1} out={1} />
        <Wall a="x" c={7} s0={-3.4} s1={-3} y0={y0} y1={y1} out={1} />
        <Wall a="x" c={7} s0={-8.4} s1={-3.4} y0={2.6} y1={y1} out={1} />
      </Part>
      <Part id="g-entrance" status="VISIBLE" note="front.png: recessed entrance, oak pivot door with black pull, narrow glass sidelight">
        <Wall a="x" c={7} s0={-3} s1={-1.9} y0={y0} y1={y1} out={1} />
        <B x={[-1.9, -1.75]} y={[y0, G_TOP]} z={[6.5, 7]} m="render" />
        <B x={[-1.9, -0.7]} y={[y0, 2.85]} z={[6.5, 6.6]} m="oak" />
        <B x={[-0.86, -0.82]} y={[0.8, 2.3]} z={[6.6, 6.68]} m="black" />
        <GlassWall a="x" c={6.55} s0={-0.7} s1={-0.2} y0={y0} y1={2.85} out={1} panel={1} inset={0} />
        <B x={[-1.9, -0.2]} y={[2.85, G_TOP]} z={[6.5, 7]} m="render" />
        <Wall a="x" c={7} s0={-0.2} s1={1} y0={y0} y1={y1} out={1} m="concrete" />
        <B x={[-0.2, -0.05]} y={[y0, 2.85]} z={[6.5, 7]} m="concrete" />
      </Part>
      <Part id="g-front-glazing" status="VISIBLE" note="front.png: double-height glazing right, tall vertical oak fins, sheer curtains">
        <GlassWall a="x" c={7} s0={1.25} s1={5.2} y0={y0} y1={y1} out={1} panel={1.3} />
        <SlatPanel a="x" c={7} s0={5.2} s1={7.6} y0={y0} y1={y1} out={1} pitch={0.14} w={0.07} d={0.14} />
        <Wall a="x" c={7} s0={7.6} s1={8} y0={y0} y1={y1} out={1} />
        <B x={[1.5, 5]} y={[0.1, 2.9]} z={[6.6, 6.62]} m="curtain" cast={false} />
      </Part>
    </group>
  )
}

function Kitchen() {
  return (
    <Part id="kitchen-fitout" status="VISIBLE" note="kitchen.png: stone waterfall island, 8 stools, oak tower cabinets, white handleless uppers, steel hood">
      {/* island: dark body, stone top with waterfall ends */}
      <B x={[-8.1, -4.3]} y={[0, 0.88]} z={[-2.95, -2.2]} m="black" />
      <B x={[-8.2, -4.2]} y={[0.88, 0.98]} z={[-3.15, -2.1]} m="beigeStone" />
      <B x={[-8.2, -8.08]} y={[0, 0.88]} z={[-3.15, -2.1]} m="beigeStone" />
      <B x={[-4.32, -4.2]} y={[0, 0.88]} z={[-3.15, -2.1]} m="beigeStone" />
      <B x={[-6.9, -6.1]} y={[0.98, 1.0]} z={[-2.85, -2.45]} m="black" />
      <Inst items={stoolSeat} m="fabricDark" geo="cyl" />
      <Inst items={stoolBack} m="fabricDark" />
      <Inst items={stoolLegs} m="black" />
      {/* cylindrical stainless hood */}
      <Cyl at={[-6.5, -2.65]} y={[1.8, G_TOP]} r={0.24} m="steel" />
      <Cyl at={[-6.5, -2.65]} y={[1.7, 1.8]} r={0.3} rb={0.24} m="steel" />
      {/* back-wall cabinet run (z = -0.5) */}
      <B x={[-5.2, -3.65]} y={[0, 0.9]} z={[-1.16, -0.56]} m="white" />
      <B x={[-5.2, -3.65]} y={[0.9, 0.95]} z={[-1.2, -0.56]} m="beigeStone" />
      <B x={[-5.2, -3.65]} y={[1.55, 2.75]} z={[-0.94, -0.56]} m="white" />
      <B x={[-6.7, -5.2]} y={[0, 2.75]} z={[-1.2, -0.56]} m="oak" />
      <B x={[-7.7, -6.7]} y={[0, 1.95]} z={[-1.15, -0.56]} m="steel" />
      <B x={[-7.7, -6.7]} y={[1.95, 2.75]} z={[-1.2, -0.56]} m="oak" />
      <B x={[-9, -7.7]} y={[0, 0.9]} z={[-1.16, -0.56]} m="white" />
      <B x={[-9, -7.7]} y={[0.9, 0.95]} z={[-1.2, -0.56]} m="beigeStone" />
      <B x={[-9, -7.7]} y={[1.55, 2.75]} z={[-0.94, -0.56]} m="white" />
      <B x={[-8.9, -7.8]} y={[1.1, 1.4]} z={[-0.56, -0.54]} m="black" />
      <B x={[-5.1, -3.75]} y={[1.1, 1.4]} z={[-0.56, -0.54]} m="black" />
      <Inst items={cabinetPulls} m="steel" />
      <Cyl at={[-8.3, -0.9]} y={[0.95, 1.2]} r={0.01} m="steel" />
      <Plant at={[-3.9, -0.9]} y={0.95} n={6} len={0.35} seed={4} light />
    </Part>
  )
}

function Dining() {
  return (
    <Part id="dining-fitout" status="VISIBLE" note="kitchen.png, living-room.png: long oak dining table with chairs">
      <B x={[-2.9, -0.1]} y={[0.72, 0.78]} z={[-2.95, -2.05]} m="oakDark" />
      <B x={[-2.6, -2.5]} y={[0, 0.72]} z={[-2.8, -2.2]} m="oakDark" />
      <B x={[-0.5, -0.4]} y={[0, 0.72]} z={[-2.8, -2.2]} m="oakDark" />
      <Inst items={chairs} m="oakDark" />
      <Inst items={chairBacks} m="fabricDark" />
      <Inst items={chairLegs} m="oakDark" />
      <B x={[-2.4, -0.6]} y={[1.9, 1.95]} z={[-2.53, -2.47]} m="black" />
      <B x={[-2.4, -0.6]} y={[1.88, 1.9]} z={[-2.55, -2.45]} m="led" cast={false} />
    </Part>
  )
}

function Living() {
  return (
    <Part id="living-fitout" status="VISIBLE" note="living-room.png: oak slat feature wall, linear fireplace, backlit niches, sectional, travertine table, pendant">
      {/* feature wall: full double height */}
      <B x={[1, 1.1]} y={[0, 6.15]} z={[2.3, 6.3]} m="oakDark" />
      <Inst items={fwSlats} m="oak" />
      <B x={[1.1, 1.4]} y={[0.45, 1.0]} z={[3.35, 5.25]} m="black" />
      <B x={[1.38, 1.4]} y={[0.5, 0.62]} z={[3.45, 5.15]} m="fire" cast={false} />
      <B x={[1.0, 1.12]} y={[0.8, 2.5]} z={[2.75, 3.35]} m="glow" cast={false} />
      <B x={[1.0, 1.12]} y={[0.8, 2.5]} z={[5.25, 5.85]} m="glow" cast={false} />
      <Inst items={nicheShelves} m="oak" />
      <B x={[1.1, 1.3]} y={[5.7, 5.74]} z={[2.3, 6.3]} m="led" cast={false} />
      {/* seating */}
      <B x={[2.3, 6.6]} y={[0, 0.02]} z={[1.9, 6.5]} m="cream" receive />
      <B x={[5.1, 6.7]} y={[0.04, 0.45]} z={[2.0, 6.6]} m="fabric" />
      <B x={[6.4, 6.8]} y={[0.04, 0.9]} z={[2.0, 6.6]} m="fabric" />
      <B x={[5.1, 6.7]} y={[0.04, 0.6]} z={[1.9, 2.4]} m="fabric" />
      <Inst items={sectionalCushions} m="fabricDark" />
      <B x={[2.6, 5.0]} y={[0.04, 0.45]} z={[0.9, 1.7]} m="fabric" />
      <B x={[2.6, 5.0]} y={[0.04, 0.85]} z={[0.75, 1.0]} m="fabric" />
      <B x={[3.1, 4.3]} y={[0.04, 0.4]} z={[3.7, 4.9]} m="travertine" />
      {/* sculptural pendant */}
      <Inst items={[{ p: [3.7, 4.7, 4.3] as V3, s: [0.95, 0.07, 0.65] as V3, e: [0.1, 0.4, 0.15] as V3 }]} m="cream" geo="sphere" />
      <B x={[3.69, 3.71]} y={[4.7, 6.15]} z={[4.29, 4.31]} m="black" />
      <Inst items={bigLeaf} m="leaf" geo="sphere" />
      <Cyl at={[7.3, 6.3]} y={[0, 0.4]} r={0.3} m="pot" />
    </Part>
  )
}

function Hall() {
  return (
    <Part id="hall-stairs" status="INFERRED" note="entrance hall and stair are not shown in the images">
      <Inst items={stairTreads} m="oak" />
      <Inst items={stairStringer} m="black" />
      <B x={[-1.5, -1.45]} y={[0.3, 1.2]} z={[1.4, 5.5]} m="glass" cast={false} />
      <B x={[-2.9, -2.6]} y={[0, 0.45]} z={[5.5, 6.5]} m="oak" />
    </Part>
  )
}

function Service() {
  return (
    <group>
      <Part id="utility-fitout" status="INFERRED" note="laundry / utility room">
        <B x={[-8.8, -8.2]} y={[0, 0.85]} z={[-0.3, 0.3]} m="white" />
        <B x={[-8.8, -8.2]} y={[0, 0.85]} z={[0.5, 1.1]} m="white" />
        <B x={[-8.9, -6.2]} y={[1.5, 2.6]} z={[-0.4, 0.0]} m="oak" />
      </Part>
      <Part id="wc-fitout" status="INFERRED" note="guest WC">
        <B x={[-5.8, -5.3]} y={[0, 0.4]} z={[0.4, 1.1]} m="white" />
        <B x={[-4.2, -3.2]} y={[0.8, 0.9]} z={[-0.4, 0.1]} m="beigeStone" />
      </Part>
      <Part id="garage-fitout" status="INFERRED" note="storage wall in the garage">
        <B x={[-8.9, -8.4]} y={[0, 2.0]} z={[2, 6.5]} m="concrete" />
      </Part>
    </group>
  )
}

export function GroundFloor() {
  return (
    <group name="floor-0-ground">
      <Plates floor={0} />
      <Partitions floor={0} />
      <Facade />
      <Kitchen />
      <Dining />
      <Living />
      <Hall />
      <Service />
      <Part id="entry-plants" status="VISIBLE" note="front.png: tropical plants at entrance">
        <Plant at={[0.4, 7.9]} y={0} n={10} len={0.9} seed={21} light />
      </Part>
    </group>
  )
}
