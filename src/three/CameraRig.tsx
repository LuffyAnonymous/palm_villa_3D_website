import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import gsap from 'gsap'
import { useViewer, useViewerApi } from '../state/viewer'

// Camera moves are time-based: without this GSAP slows the tween down on slow frames (weak GPUs, High tier on a laptop)
gsap.ticker.lagSmoothing(0)

/** Animates the camera to the requested view and manages orbit limits for exterior vs. interior. */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null!)
  const { camera } = useThree()
  const api = useViewerApi()
  const nonce = useViewer((s) => s.viewNonce)
  const first = useRef(true)
  const engaged = useRef(false)
  const { gl } = useThree()

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const { view } = api.getState()
    const cam = camera as THREE.PerspectiveCamera
    const toP = new THREE.Vector3(...view.eye)
    const toT = new THREE.Vector3(...view.target)
    // portrait canvases (mobile): pull exterior cameras back so the whole villa still fits
    const aspect = cam.aspect
    if (!view.interior && aspect < 1.2) toP.sub(toT).multiplyScalar(1 + (1.2 / Math.max(aspect, 0.4) - 1) * 0.55).add(toT)
    const from = { p: cam.position.clone(), t: c.target.clone(), fov: cam.fov }
    const toFov = view.interior ? 74 : 38
    const look = toT.clone().sub(toP).normalize()
    const interiorTarget = toP.clone().add(look.clone().multiplyScalar(0.05))

    c.autoRotate = false
    c.enableZoom = engaged.current && !view.interior
    c.enablePan = !view.interior
    c.rotateSpeed = view.interior ? -0.45 : 0.7
    c.minPolarAngle = 0
    c.maxPolarAngle = view.interior ? Math.PI : Math.PI / 2 - 0.02
    c.minDistance = view.interior ? 0.01 : 6
    c.maxDistance = 95
    cam.near = view.interior ? 0.05 : 0.3
    cam.updateProjectionMatrix()

    const p = { v: first.current ? 1 : 0 }
    first.current = false
    const apply = () => {
      cam.position.lerpVectors(from.p, toP, p.v)
      c.target.lerpVectors(from.t, toT, p.v)
      cam.fov = THREE.MathUtils.lerp(from.fov, toFov, p.v)
      cam.updateProjectionMatrix()
      c.update()
    }
    apply()
    const tw = gsap.to(p, {
      v: 1, duration: 1.9, ease: 'power3.inOut', onUpdate: apply,
      onComplete: () => {
        if (view.interior) c.target.copy(interiorTarget)
        c.autoRotate = !!view.orbit
        c.autoRotateSpeed = 0.35
        c.update()
      },
    })
    return () => { tw.kill() }
  }, [nonce, camera, api])

  // Wheel-zoom only after the user clicks into the canvas, so the page can still scroll past it.
  useEffect(() => {
    const el = gl.domElement
    const set = (v: boolean) => {
      engaged.current = v
      if (controls.current) controls.current.enableZoom = v && !api.getState().view.interior
    }
    const down = () => set(true)
    const leave = () => set(false)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerleave', leave)
    if (window.matchMedia('(pointer: coarse)').matches) el.style.touchAction = 'pan-y'
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointerleave', leave) }
  }, [gl, api])

  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.07} />
}
