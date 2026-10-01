import { B, Inst, Part, type Item, type V3 } from '../primitives'
import { Plant } from './Vegetation'

/** Dark pergola beams hanging under the 2.5 m cantilever. */
const beams: Item[] = Array.from({ length: 17 }, (_, i) => ({ p: [-8.7 + i * 0.58, 2.38, -5.75] as V3, s: [0.14, 0.22, 2.5] as V3 }))
const downlights: Item[] = Array.from({ length: 8 }, (_, i) => ({ p: [-8.4 + i * 1.25, 2.5, -5.0] as V3, s: [0.1, 0.02, 0.1] as V3 }))
const rattanSeat: Item[] = [[-6.3, -6.1], [-4.0, -7.6]].map(([x, z]) => ({ p: [x, 0.28, z] as V3, s: [0.55, 0.5, 0.55] as V3 }))
const chairBack: Item[] = [[-6.3, -6.5], [-4.0, -8.0]].map(([x, z]) => ({ p: [x, 0.7, z] as V3, s: [0.62, 0.55, 0.22] as V3 }))
const chairCushion: Item[] = [[-6.3, -6.1], [-4.0, -7.6]].map(([x, z]) => ({ p: [x, 0.55, z] as V3, s: [0.48, 0.1, 0.48] as V3 }))
const chairPillows: Item[] = [[-6.3, -6.5], [-4.0, -8.0]].map(([x, z]) => ({ p: [x, 0.85, z] as V3, s: [0.42, 0.28, 0.1] as V3 }))

export function Terrace() {
  return (
    <group name="terrace">
      <Part id="terrace-pergola" status="VISIBLE" note="rear-original.jpg: dark pergola beams and recessed downlights under the cantilever">
        <Inst items={beams} m="black" />
        <Inst items={downlights} m="led" geo="cyl" cast={false} />
      </Part>
      <Part id="terrace-furniture" status="VISIBLE" note="rear-original.jpg, aerial.png: 2 round rattan armchairs, low sofa, light stone coffee table, potted plants">
        <Inst items={rattanSeat} m="rattan" geo="cyl" />
        <Inst items={chairBack} m="rattan" geo="sphere" />
        <Inst items={chairCushion} m="fabricDark" geo="cyl" />
        <Inst items={chairPillows} m="fabricDark" />
        <B x={[-9.2, -8.2]} y={[0.05, 0.4]} z={[-8.6, -5.4]} m="fabric" />
        <B x={[-9.25, -8.9]} y={[0.4, 0.8]} z={[-8.6, -5.4]} m="fabric" />
        <B x={[-7.5, -6.0]} y={[0.3, 0.36]} z={[-8.1, -7.1]} m="stone" />
        <B x={[-7.4, -7.3]} y={[0, 0.3]} z={[-8.0, -7.2]} m="black" />
        <Plant at={[-8.7, -4.9]} y={0} n={16} len={1.7} seed={91} pot={0.6} tall={0.5} />
        <Plant at={[-8.7, -10]} y={0} n={16} len={1.9} seed={92} pot={0.6} tall={0.5} light />
      </Part>
    </group>
  )
}
