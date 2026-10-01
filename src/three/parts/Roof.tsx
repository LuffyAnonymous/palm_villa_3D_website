import { B, Inst, Part, boardsX, boardsZ, type Item, type V3 } from '../primitives'
import { ROOF_Y, U_TOP } from '../facade'

const FR_BOT = 5.55
const FR_TOP = ROOF_Y + 0.25
const soffitY = U_TOP - 0.015

const soffitFront = boardsX(-9, 9.1, soffitY, 7, 7.5, 0.1, 0.06, 0.03)
const soffitRearA = boardsX(-9, 1.6, soffitY, -7.1, -4.5, 0.1, 0.06, 0.03)
const soffitRearB = boardsX(1.6, 9.1, soffitY, -6.1, -5.5, 0.1, 0.06, 0.03)
const soffitEast = boardsZ(-5.5, 7, soffitY, 8, 9.1, 0.1, 0.06, 0.03)
const ledLines: Item[] = [
  { p: [0.25, soffitY - 0.02, 7.42] as V3, s: [17.4, 0.03, 0.05] as V3 },
  { p: [-3.7, soffitY - 0.02, -7.02] as V3, s: [10.6, 0.03, 0.05] as V3 },
  { p: [5.35, soffitY - 0.02, -6.02] as V3, s: [7.4, 0.03, 0.05] as V3 },
  { p: [9.02, soffitY - 0.02, 0.5] as V3, s: [0.05, 0.03, 12.9] as V3 },
]

/** Roof slab, deep fascia with oak soffit + recessed LED, two rooftop boxes. */
export function Roof() {
  return (
    <group name="floor-2-roof">
      <Part id="roof-slab" status="VISIBLE" note="all images: flat roof, deep overhangs; cantilever on rear-right">
        <B x={[-9.6, 1.6]} y={[U_TOP, ROOF_Y]} z={[-7.6, 8]} m="renderGrey" />
        <B x={[1.6, 9.6]} y={[U_TOP, ROOF_Y]} z={[-6.6, 8]} m="renderGrey" />
      </Part>
      <Part id="roof-fascia" status="VISIBLE" note="front.png, rear-original.jpg: dark charcoal concrete fascia frame">
        <B x={[-9.6, 9.6]} y={[FR_BOT, FR_TOP]} z={[7.5, 8]} m="concrete" />
        <B x={[-9.6, 1.6]} y={[FR_BOT, FR_TOP]} z={[-7.6, -7.1]} m="concrete" />
        <B x={[1.6, 9.6]} y={[FR_BOT, FR_TOP]} z={[-6.6, -6.1]} m="concrete" />
        <B x={[1.6, 2.1]} y={[FR_BOT, FR_TOP]} z={[-7.6, -6.6]} m="concrete" />
        <B x={[9.1, 9.6]} y={[FR_BOT, FR_TOP]} z={[-6.6, 8]} m="concrete" />
        <B x={[-9.6, -9.1]} y={[FR_BOT, FR_TOP]} z={[-7.6, 8]} m="concrete" />
      </Part>
      <Part id="roof-soffit-led" status="VISIBLE" note="all images: warm oak slat soffit with continuous recessed linear LED strip">
        <Inst items={soffitFront} m="oak" />
        <Inst items={soffitRearA} m="oak" />
        <Inst items={soffitRearB} m="oak" />
        <Inst items={soffitEast} m="oak" />
        <Inst items={ledLines} m="led" cast={false} />
      </Part>
      <Part id="roof-boxes" status="VISIBLE" note="front.png, aerial.png: two light-grey stair/technical boxes set back from the edge">
        <B x={[-4.5, -1.5]} y={[ROOF_Y, ROOF_Y + 2.7]} z={[-2.5, 1]} m="renderGrey" />
        <B x={[-4.6, -1.4]} y={[ROOF_Y + 2.7, ROOF_Y + 2.85]} z={[-2.6, 1.1]} m="concreteLight" />
        <B x={[3, 6]} y={[ROOF_Y, ROOF_Y + 2.3]} z={[-3.5, -0.5]} m="renderGrey" />
        <B x={[2.9, 6.1]} y={[ROOF_Y + 2.3, ROOF_Y + 2.45]} z={[-3.6, -0.4]} m="concreteLight" />
      </Part>
    </group>
  )
}
