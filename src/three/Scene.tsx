import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { HERO_VIEW } from '../state/viewer'
import { useQuality } from '../state/quality'
import { Villa } from './Villa'
import { Atmosphere } from './Atmosphere'
import { CameraRig } from './CameraRig'
import { Exporter } from './Exporter'
import { Interaction } from './Interaction'
import { Effects } from './Effects'

/** Per-frame renderer stats (draw calls incl. shadow + post passes), readable as window.__villaStats. */
function Stats() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => { gl.info.autoReset = false; (window as unknown as { __villaScene: unknown }).__villaScene = scene }, [gl, scene])
  // runs before everything else each frame: publish the previous frame's totals, then reset the counters.
  // (a positive useFrame priority would take over R3F's render loop, so we stay negative)
  useFrame(() => {
    ;(window as unknown as { __villaStats: unknown }).__villaStats = {
      calls: gl.info.render.calls, triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries, textures: gl.info.memory.textures,
    }
    gl.info.reset()
  }, -1000)
  return null
}

/** Drops to Low if the frame rate stays poor (only in auto mode; ignores the first seconds = shader compile). */
function Monitor() {
  const down = useQuality((s) => s.autoDowngrade)
  const t0 = useRef(performance.now())
  const declines = useRef(0)
  // two separate sustained declines after the warm-up (shader compile / texture decode) before we give up on High
  return <PerformanceMonitor onDecline={() => { if (performance.now() - t0.current > 6000 && ++declines.current >= 2) down() }} />
}

/**
 * `active=false` stops the render loop completely (frameloop "never"), so an off-screen
 * canvas costs no GPU time. Callers drive it from an IntersectionObserver.
 * The canvas is re-created when the quality tier changes (tone-mapping / AA / shaders differ).
 */
export default function Scene({ interactive = false, active = true }: { interactive?: boolean; active?: boolean }) {
  const quality = useQuality((s) => s.quality)
  const villa = useRef<THREE.Group>(null)
  const high = quality === 'high'
  return (
    <Canvas
      key={quality}
      frameloop={active ? 'always' : 'never'}
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, high ? 2 : 1]}
      camera={{ fov: 38, near: 0.3, far: 4000, position: HERO_VIEW.eye }}
      gl={{
        antialias: !high, // High uses SMAA in the composer
        powerPreference: 'high-performance',
        // High: tone mapping happens in the composer; Low: ACES Filmic on the renderer
        toneMapping: high ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping,
      }}
    >
      <Atmosphere />
      <Villa ref={villa} />
      {interactive && <Interaction />}
      <CameraRig />
      {interactive && <Exporter target={villa} />}
      {high && <Effects />}
      <Monitor />
      <Stats />
    </Canvas>
  )
}
