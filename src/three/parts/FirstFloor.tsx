import { B, Inst, Part, boardsX, boardsZ, vSlatsX, vSlatsZ, type Item, type V3 } from '../primitives'
import { GlassRail, GlassWall, Partitions, Plates, SlatPanel, Wall, F1, U_TOP } from '../facade'
import { Plant } from './Vegetation'

const Y0 = F1
const kitchenCeiling = boardsX(-9, -3.5, 2.9, -4.5, -0.5, 0.09, 0.05, 0.05)
const diningCeiling = boardsX(-3.5, 1, 2.9, -4.5, -0.5, 0.09, 0.05, 0.05)
const hallCeiling = boardsZ(-0.5, 7, 2.9, -3, -2, 0.09, 0.05, 0.05)
const cabLeds: Item[] = [-1.6, -2.7, -3.8].map((z) => ({ p: [-6.2, 2.88, z] as V3, s: [4.4, 0.03, 0.04] as V3 }))
const diningLeds: Item[] = [-1.7, -3.3].map((z) => ({ p: [-1.2, 2.88, z] as V3, s: [3.6, 0.03, 0.04] as V3 }))
const masterSlats = vSlatsZ(-4.35, 0.35, Y0, U_TOP - 0.05, -3.08, 0.07, 0.04, 0.06)
const masterScreen = vSlatsX(-8.9, -6, Y0, U_TOP - 0.05, 0.38, 0.18, 0.08, 0.06)
const bathLeds: Item[] = Array.from({ length: 4 }, (_, i) => ({ p: [-2.5 + i * 1.0, (Y0 + U_TOP) / 2, -4.78] as V3, s: [0.03, U_TOP - Y0 - 0.3, 0.03] as V3 }))
const carportLights: Item[] = [-8.2, -7, -5.8, -4.6].map((x) => ({ p: [x, 2.63, 7.5] as V3, s: [0.12, 0.02, 0.12] as V3 }))
const carportBoards = boardsX(-9.6, -3, 2.64, 7, 8, 0.1, 0.06, 0.03)
const latticeV = vSlatsX(1.2, 4.6, Y0 + 0.1, U_TOP - 0.1, -5.95, 0.24, 0.05, 0.05)
const latticeH: Item[] = Array.from({ length: 11 }, (_, i) => ({ p: [2.9, Y0 + 0.35 + i * 0.26, -5.9] as V3, s: [3.4, 0.05, 0.05] as V3 }))
const pendants: Item[] = [-3.35, -0.65].map((z) => ({ p: [-3.55, 5.1, z] as V3, s: [0.045, 0.45, 0.045] as V3 }))

function Frame() {
  return (
    <Part id="f1-concrete-frame" status="VISIBLE" note="rear-original.jpg, front.png: dark charcoal concrete frame wrapping the upper floor, 2.5 m cantilever">
      <B x={[-9.6, -9]} y={[F1, 6.4]} z={[-7.6, 8]} m="concrete" />
      <B x={[-9.6, -3]} y={[2.65, F1]} z={[6.95, 8]} m="concrete" />
      <B x={[-3, -2.7]} y={[2.65, 6.4]} z={[6.95, 8]} m="concrete" />
      <B x={[0.95, 1.5]} y={[F1, 6.4]} z={[-7.6, -6.9]} m="concrete" />
      <Inst items={carportBoards} m="oak" />
      <Inst items={carportLights} m="led" geo="cyl" cast={false} />
    </Part>
  )
}

function Envelope() {
  const y0 = Y0, y1 = U_TOP
  return (
    <group name="first-facade">
      <Part id="f1-master-rear" status="VISIBLE" note="rear-original.jpg, master-bedroom.png: floor-to-ceiling glazing to balcony, oak slat screen at the side">
        <GlassWall a="x" c={-4.5} s0={-7.6} s1={-3.1} y0={y0} y1={y1} out={-1} panel={1.5} />
        <SlatPanel a="x" c={-4.5} s0={-9} s1={-7.6} y0={y0} y1={y1} out={-1} pitch={0.14} w={0.07} d={0.1} />
        <Wall a="x" c={-4.5} s0={-3.1} s1={-3} y0={y0} y1={y1} out={-1} />
        <B x={[-7.5, -3.3]} y={[y0 + 0.1, y1 - 0.15]} z={[-4.38, -4.36]} m="curtain" cast={false} />
      </Part>
      <Part id="f1-master-rail" status="VISIBLE" note="rear-original.jpg: frameless glass balcony railing on the cantilever slab">
        <GlassRail a="x" c={-6.95} s0={-9} s1={0.95} y={F1 + 0.04} />
        <GlassRail a="z" c={0.95} s0={-6.95} s1={-5.5} y={F1 + 0.04} />
      </Part>
      <Part id="f1-bath-cladding" status="VISIBLE" note="aerial.png: grey vertical cladding panels with LED joints between the two rear volumes">
        <Wall a="x" c={-4.5} s0={-3} s1={1} y0={y0} y1={y1} out={-1} m="concreteLight" />
        <Inst items={bathLeds} m="led" cast={false} />
      </Part>
      <Part id="f1-bedroom3-rear" status="VISIBLE" note="rear-original.jpg: wooden lattice screen, recessed planter">
        <GlassWall a="x" c={-5.5} s0={1.2} s1={4.6} y0={y0} y1={y1} out={-1} panel={1.7} />
        <Inst items={latticeV} m="oak" />
        <Inst items={latticeH} m="oak" />
        <Wall a="x" c={-5.5} s0={4.6} s1={5} y0={y0} y1={y1} out={-1} />
        <B x={[1.3, 4.7]} y={[F1, F1 + 0.35]} z={[-6.4, -5.6]} m="concrete" />
        <Plant at={[1.9, -6.0]} y={F1 + 0.3} n={8} len={0.9} seed={31} light />
        <Plant at={[4.1, -6.0]} y={F1 + 0.3} n={8} len={0.9} seed={32} />
      </Part>
      <Part id="f1-void-clerestory" status="VISIBLE" note="living-room.png: clerestory glazing above the sliding doors">
        <GlassWall a="x" c={-5.5} s0={5} s1={8} y0={y0} y1={y1} out={-1} panel={1.5} />
        <B x={[1.25, 8]} y={[G_BAR0, F1]} z={[-5.6, -5.4]} m="black" />
      </Part>
      <Part id="f1-front-upper" status="VISIBLE" note="front.png: beige render + oak slat screen upper left, glass strip above entrance, double-height glazing right">
        <Wall a="x" c={7} s0={-9} s1={-5.6} y0={y0} y1={y1} out={1} />
        <GlassWall a="x" c={7} s0={-5.4} s1={-3.2} y0={y0 + 0.4} y1={y1 - 0.5} out={1} panel={1.1} />
        <SlatPanel a="x" c={7} s0={-5.6} s1={-3.0} y0={y0} y1={y1} out={1} pitch={0.15} w={0.07} d={0.12} />
        <GlassWall a="x" c={7} s0={-3} s1={1} y0={y0} y1={y1} out={1} panel={1.3} />
        <GlassWall a="x" c={7} s0={1.25} s1={5.2} y0={y0} y1={y1} out={1} panel={1.3} />
        <SlatPanel a="x" c={7} s0={5.2} s1={7.6} y0={y0} y1={y1} out={1} pitch={0.14} w={0.07} d={0.14} />
        <Wall a="x" c={7} s0={7.6} s1={8} y0={y0} y1={y1} out={1} />
        <B x={[-3, 5.2]} y={[2.95, F1]} z={[6.9, 7.05]} m="black" />
        <B x={[1.5, 5]} y={[y0 + 0.1, y1 - 0.2]} z={[6.6, 6.62]} m="curtain" cast={false} />
      </Part>
      <Part id="f1-side-walls" status="INFERRED" note="side/rear returns not visible in the images">
        <Wall a="z" c={-9} s0={-4.5} s1={7} y0={y0} y1={y1} out={-1} />
        <Wall a="z" c={1} s0={-5.5} s1={-4.5} y0={y0} y1={y1} out={-1} />
        <Wall a="z" c={8} s0={-5.5} s1={7} y0={y0} y1={y1} out={1} />
        <Wall a="z" c={5} s0={-5.5} s1={0} y0={y0} y1={y1} out={1} />
        <B x={[1, 1.1]} y={[y0, y1]} z={[1.2, 2.3]} m="wall" />
        <B x={[1, 1.1]} y={[y0, y1]} z={[6.3, 7]} m="wall" />
      </Part>
      <Part id="f1-rails" status="INFERRED" note="glass balustrades on the stair void and bridge">
        <GlassRail a="x" c={1.2} s0={-3} s1={1} y={F1} />
        <GlassRail a="x" c={1.2} s0={1} s1={5} y={F1} />
        <GlassRail a="z" c={5} s0={0} s1={1.2} y={F1} />
        <GlassRail a="z" c={-2} s0={1.2} s1={7} y={F1} />
      </Part>
    </group>
  )
}
const G_BAR0 = 2.95

function Ceilings() {
  return (
    <Part id="g-ceilings" status="VISIBLE" note="kitchen.png: oak slat ceiling with linear LEDs (kitchen, dining); hall inferred">
      <Inst items={kitchenCeiling} m="oak" />
      <Inst items={diningCeiling} m="oak" />
      <Inst items={hallCeiling} m="oak" />
      <Inst items={cabLeds} m="led" cast={false} />
      <Inst items={diningLeds} m="led" cast={false} />
    </Part>
  )
}

function Master() {
  return (
    <Part id="master-fitout" status="VISIBLE" note="master-bedroom.png: oak slat headboard wall with hidden LED, floating oak bedside tables, black pendants, beige stone floor">
      <Inst items={masterSlats} m="oak" />
      <B x={[-3.1, -3]} y={[Y0, U_TOP]} z={[-4.4, 0.4]} m="oakDark" />
      <B x={[-3.3, -3.1]} y={[Y0, Y0 + 1.5]} z={[-3.2, -0.8]} m="oak" />
      <B x={[-3.2, -3.1]} y={[Y0 + 1.52, Y0 + 1.57]} z={[-4.2, 0.2]} m="led" cast={false} />
      <B x={[-5.45, -3.3]} y={[Y0, Y0 + 0.3]} z={[-3.0, -1.0]} m="fabric" />
      <B x={[-5.4, -3.3]} y={[Y0 + 0.3, Y0 + 0.62]} z={[-2.95, -1.05]} m="bedding" />
      <B x={[-4.3, -3.4]} y={[Y0 + 0.62, Y0 + 0.78]} z={[-2.9, -2.5]} m="cream" />
      <B x={[-4.3, -3.4]} y={[Y0 + 0.62, Y0 + 0.78]} z={[-1.5, -1.1]} m="cream" />
      <B x={[-5.4, -4.4]} y={[Y0 + 0.62, Y0 + 0.68]} z={[-2.95, -1.05]} m="fabric" />
      <B x={[-3.7, -3.1]} y={[Y0 + 0.45, Y0 + 0.6]} z={[-3.6, -3.1]} m="oak" />
      <B x={[-3.7, -3.1]} y={[Y0 + 0.45, Y0 + 0.6]} z={[-0.9, -0.4]} m="oak" />
      <Inst items={pendants} m="black" />
      <Inst items={masterScreen} m="oak" />
      <B x={[-8.5, -3.6]} y={[U_TOP - 0.02, U_TOP]} z={[-3.7, -3.66]} m="led" cast={false} />
      <B x={[-8.5, -3.6]} y={[U_TOP - 0.02, U_TOP]} z={[-0.5, -0.46]} m="led" cast={false} />
    </Part>
  )
}

function OtherRooms() {
  return (
    <Part id="f1-inferred-fitout" status="INFERRED" note="master bath, wardrobe, bedrooms 2 and 3, bathrooms: simple placeholder furniture">
      {/* master bath */}
      <B x={[-2.7, -1.1]} y={[Y0, Y0 + 0.55]} z={[-4.2, -3.4]} m="white" />
      <B x={[-2.8, -0.4]} y={[Y0 + 0.8, Y0 + 0.9]} z={[-1.3, -0.65]} m="beigeStone" />
      <B x={[-2.8, -0.4]} y={[Y0, Y0 + 0.8]} z={[-1.3, -0.65]} m="oak" />
      {/* wardrobe */}
      <B x={[-8.9, -8.4]} y={[Y0, Y0 + 2.4]} z={[0.7, 3.3]} m="oak" />
      <B x={[-8.9, -5.7]} y={[Y0, Y0 + 2.4]} z={[3.2, 3.4]} m="oak" />
      {/* bedroom 2 */}
      <B x={[-8.95, -6.8]} y={[Y0, Y0 + 0.35]} z={[4.6, 6.4]} m="fabric" />
      <B x={[-8.95, -6.8]} y={[Y0 + 0.35, Y0 + 0.62]} z={[4.65, 6.35]} m="bedding" />
      <B x={[-8.95, -8.8]} y={[Y0, Y0 + 1.4]} z={[4.4, 6.6]} m="oak" />
      {/* bath 2 */}
      <B x={[-5.3, -3.7]} y={[Y0, Y0 + 0.5]} z={[0.7, 1.3]} m="white" />
      {/* bedroom 3 */}
      <B x={[2.9, 5]} y={[Y0, Y0 + 0.35]} z={[-4.9, -3.1]} m="fabric" />
      <B x={[2.9, 5]} y={[Y0 + 0.35, Y0 + 0.62]} z={[-4.85, -3.15]} m="bedding" />
      <B x={[4.85, 5]} y={[Y0, Y0 + 1.4]} z={[-5.2, -2.8]} m="oak" />
      {/* bath 3 */}
      <B x={[4.0, 4.9]} y={[Y0, Y0 + 0.5]} z={[-1.9, -1.2]} m="white" />
    </Part>
  )
}

export function FirstFloor() {
  return (
    <group name="floor-1-first">
      <Plates floor={1} />
      <Partitions floor={1} />
      <Frame />
      <Envelope />
      <Ceilings />
      <Master />
      <OtherRooms />
    </group>
  )
}
