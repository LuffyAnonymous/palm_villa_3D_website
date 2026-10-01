import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js'
import { useViewer } from '../state/viewer'
import { useQuality } from '../state/quality'
import { useSceneReady } from '../state/ready'
import { nightMats } from './materials'

const lerp = THREE.MathUtils.lerp
const base = import.meta.env.BASE_URL

/** Brightest-pixel direction of each HDRI, measured by scripts/sun-from-hdri.ts (degrees, in the HDRI's own frame). */
const HDRI_SUN = { day: { az: 36, el: 43.1 }, dusk: { az: 39.9, el: 9.7 } }
/** Where we want the sun/glow to sit in the villa's frame (azimuth from +x towards +z). Day: pool side, rear-left. */
const WANT_AZ = { day: -35, dusk: 125 }

const DAY_FOG = new THREE.Color('#c4d3e0')
const NIGHT_FOG = new THREE.Color('#4a3d55')

/** [x, y, z, intensity, colour, distance] */
const NIGHT_LIGHTS: [number, number, number, number, string, number][] = [
  [-6.2, 2.5, -2.4, 22, '#ffc98a', 8], // kitchen
  [-1.2, 2.5, -2.4, 16, '#ffc98a', 7], // dining
  [4.5, 4.4, 1.5, 35, '#ffc27d', 11], // living (double height)
  [4.5, 2.4, 5.0, 19, '#ffc27d', 8],
  [-1, 2.5, 3.5, 12, '#ffd29a', 6], // hall
  [-6, 2.5, 4.5, 9, '#ffd29a', 6], // garage
  [-5.8, 5.6, -2, 22, '#ffbf78', 8], // master
  [-6, 5.6, 5.2, 9, '#ffbf78', 6], // bedroom 2
  [3, 5.6, -3.8, 9, '#ffbf78', 6], // bedroom 3
  [-4, 2.2, -6.5, 16, '#ffbf78', 8], // terrace
  [5, -0.9, -12, 40, '#19ffe6', 14], // underwater pool light
  [3.1, 0.5, -8, 12, '#7ff3ff', 7], // waterfall pool glow
  [-1, 2.2, 8.5, 12, '#ffc98a', 7], // front carport / entrance
  [-6, 2.4, 8.2, 12, '#ffc98a', 7],
]

/** Equirect HDR -> highlight-clamped data (so the sun disc doesn't double-light the scene) + PMREM for lighting. */
function useHdri(file: string, clamp: number) {
  const gl = useThree((s) => s.gl)
  const raw = useLoader(HDRLoader, `${base}hdri/${file}.hdr`)
  return useMemo(() => {
    const tex = raw.clone()
    tex.image = { ...raw.image, data: new Uint16Array(raw.image.data as Uint16Array) }
    const d = tex.image.data as Uint16Array
    const max = THREE.DataUtils.toHalfFloat(clamp)
    for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) if (d[i + c] > max && d[i + c] < 0x7c00) d[i + c] = max
    tex.mapping = THREE.EquirectangularReflectionMapping
    tex.needsUpdate = true
    const pm = new THREE.PMREMGenerator(gl)
    const env = pm.fromEquirectangular(tex).texture
    pm.dispose()
    return { background: tex, env }
  }, [raw, gl, clamp])
}

const sunVec = (az: number, el: number) => {
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el)
  return new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a))
}

/**
 * HDRI sky + lighting (clear sky by day, dusk by night), sun/moon shadow light, fog and the day<->night blend.
 * `k` goes 0 (day) -> 1 (dusk/night) and drives emissive materials, lights and fog.
 */
export function Atmosphere() {
  const night = useViewer((s) => s.night)
  const quality = useQuality((s) => s.quality)
  const k = useRef(night ? 1 : 0)
  const sun = useRef<THREE.DirectionalLight>(null!)
  const fill = useRef<THREE.DirectionalLight>(null!)
  const pls = useRef<(THREE.PointLight | null)[]>([])
  const { scene, gl } = useThree()
  const markReady = useSceneReady((s) => s.setReady)
  const first = useRef(true)

  const day = useHdri('day', 24)
  const dusk = useHdri('dusk', 40)

  // HDRI rotation so the sun/glow sits where we want it in the villa's frame
  const rot = useMemo(() => ({
    day: THREE.MathUtils.degToRad(HDRI_SUN.day.az - WANT_AZ.day),
    dusk: THREE.MathUtils.degToRad(HDRI_SUN.dusk.az - WANT_AZ.dusk),
  }), [])

  useLayoutEffect(() => {
    const h = night ? dusk : day
    const r = night ? rot.dusk : rot.day
    scene.background = h.background
    scene.environment = h.env
    scene.backgroundRotation.set(0, r, 0)
    scene.environmentRotation.set(0, r, 0)
    scene.backgroundIntensity = night ? 0.3 : 1
    scene.fog = new THREE.Fog(night ? NIGHT_FOG : DAY_FOG, 140, 1100)
  }, [night, day, dusk, rot, scene])

  const dir = useMemo(() => ({
    day: sunVec(WANT_AZ.day, HDRI_SUN.day.el).multiplyScalar(70),
    dusk: sunVec(WANT_AZ.dusk, 16).multiplyScalar(70),
  }), [])

  useFrame((_, dt) => {
    if (first.current) { first.current = false; markReady() }
    k.current += ((night ? 1 : 0) - k.current) * Math.min(1, dt * 3)
    const v = k.current
    nightMats.forEach(({ m, day: d, night: n }) => (m.emissiveIntensity = lerp(d, n, v)))
    sun.current.intensity = lerp(3.2, 0.55, v)
    sun.current.color.set(night ? '#a9b8ff' : '#fff1dc')
    fill.current.intensity = lerp(2.1, 0.14, v)
    sun.current.position.copy(night ? dir.dusk : dir.day)
    scene.environmentIntensity = lerp(0.8, 0.24, v)
    const f = scene.fog as THREE.Fog | null
    if (f) f.color.copy(DAY_FOG).lerp(NIGHT_FOG, v)
    pls.current.forEach((l) => l && (l.intensity = l.userData.base * v))
    gl.toneMappingExposure = lerp(1, 1, v)
  })

  const lights = quality === 'low' ? NIGHT_LIGHTS.filter((_, i) => i % 2 === 0 || i === 10) : NIGHT_LIGHTS
  const hi = quality === 'high'

  return (
    <>
      <directionalLight
        ref={sun}
        position={[28, 40, 22]}
        castShadow
        shadow-mapSize={hi ? [2048, 2048] : [1024, 1024]}
        shadow-radius={hi ? 4 : 1}
        shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34}
        shadow-camera-near={1} shadow-camera-far={150}
        shadow-bias={-0.0004} shadow-normalBias={0.04}
      />
      {/* soft shadowless fill from the street side so the front elevation is never in pure shade */}
      <directionalLight ref={fill} position={[-18, 22, 40]} color="#ffe9d2" intensity={1} />
      {lights.map(([x, y, z, i, c, d], idx) => (
        <pointLight
          key={idx}
          ref={(l) => { pls.current[idx] = l; if (l) l.userData.base = i }}
          position={[x, y, z]} color={c} intensity={0} distance={d} decay={2}
        />
      ))}
    </>
  )
}
