import { HalfFloatType } from 'three'
import { EffectComposer, N8AO, Bloom, SMAA, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useViewer } from '../state/viewer'

/**
 * High-quality post chain: N8AO ambient occlusion -> bloom (LED strips, pool light, waterfall)
 * -> ACES Filmic tone mapping -> SMAA. Only mounted on the High tier.
 */
export function Effects() {
  const night = useViewer((s) => s.night)
  // 4x MSAA on the scene buffer resolves hairline slat gaps that SMAA alone shimmers on; SMAA then cleans the rest
  return (
    <EffectComposer multisampling={4} frameBufferType={HalfFloatType}>
      <N8AO aoRadius={1.3} distanceFalloff={0.9} intensity={2.4} quality="low" halfRes />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={night ? 0.85 : 0.2} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  )
}
