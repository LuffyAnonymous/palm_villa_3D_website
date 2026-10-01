import * as THREE from 'three'
import * as T from './textures'

/**
 * Shared PBR materials. Surface textures are CC0 sets from Poly Haven / ambientCG (see public/textures/CREDITS.md),
 * converted to 1K WebP by scripts/fetch-assets.py. UVs are in metres, so `scale` below is the real-world size (m)
 * covered by one texture tile.
 * Emissive materials register in `nightMats` and are lerped by <Atmosphere/>.
 */
export const nightMats: { m: THREE.MeshStandardMaterial; day: number; night: number }[] = []

const base = import.meta.env.BASE_URL
const loader = new THREE.TextureLoader()

interface Pbr { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }
function pbr(name: string, scale: number): Pbr {
  const load = (file: string, color: boolean, mime: string) => {
    const t = loader.load(`${base}textures/${name}/${file}.webp`)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1 / scale, 1 / scale)
    t.anisotropy = 8
    if (color) t.colorSpace = THREE.SRGBColorSpace
    t.userData.mimeType = mime // used by the GLB exporter
    return t
  }
  return { map: load('color', true, 'image/jpeg'), normalMap: load('normal', false, 'image/png'), roughnessMap: load('rough', false, 'image/jpeg') }
}

const tex = {
  concrete: pbr('concrete', 2.0),
  oak: pbr('oak', 1.83),
  render: pbr('render', 3.0),
  renderGrey: pbr('renderGrey', 3.0),
  grass: pbr('grass', 2.0),
  paver: pbr('paver', 2.5),
  asphalt: pbr('asphalt', 2.5),
  travertine: pbr('travertine', 1.2),
  beigeStone: pbr('beigeStone', 1.2),
  stone: pbr('stone', 2.0),
  marble: pbr('marble', 1.2),
  poolTile: pbr('poolTile', 1.0),
}

function std(p: THREE.MeshStandardMaterialParameters, night?: [number, number]) {
  const m = new THREE.MeshStandardMaterial(p)
  if (night) nightMats.push({ m, day: night[0], night: night[1] })
  return m
}
/** linear tint that may exceed 1 (lightens dark albedo maps) */
const rgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b)
const textured = (t: Pbr, p: THREE.MeshStandardMaterialParameters = {}) =>
  std({ ...t, roughness: 1, normalScale: new THREE.Vector2(0.9, 0.9), ...p })

const rattanMap = T.rattanTex()
const waterNormal = T.waterNormalTex()
export const waterfallMap = T.waterfallTex()
export { waterNormal }

export const glass = new THREE.MeshPhysicalMaterial({
  color: '#dbe9ee', roughness: 0.03, metalness: 0, transmission: 1, thickness: 0.05, ior: 1.45,
  envMapIntensity: 1.2, side: THREE.FrontSide,
})
/** cheap alternative for the Low quality tier (no transmission pass) */
export const glassLite = new THREE.MeshStandardMaterial({
  color: '#9db6bf', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.28, envMapIntensity: 1.5,
})

export const M = {
  concrete: textured(tex.concrete, { color: rgb(0.78, 0.76, 0.74) }),
  concreteLight: textured(tex.concrete, { color: rgb(1.5, 1.5, 1.55) }),
  render: textured(tex.render, { color: '#f2e6d0' }),
  renderGrey: textured(tex.renderGrey, { color: rgb(1.15, 1.13, 1.1) }),
  oak: textured(tex.oak, { color: rgb(1.3, 1.12, 0.95) }),
  oakDark: textured(tex.oak, { color: rgb(0.85, 0.66, 0.46) }),
  black: std({ color: '#0d0d0e', roughness: 0.4, metalness: 0.7 }),
  travertine: textured(tex.travertine, { color: '#ffffff' }),
  stone: textured(tex.stone, { color: rgb(1.1, 1.08, 1.04) }),
  beigeStone: textured(tex.beigeStone, { color: '#ffffff' }),
  grass: textured(tex.grass, { color: rgb(0.55, 0.85, 0.4), side: THREE.DoubleSide }),
  marble: textured(tex.marble, { color: '#ffffff', metalness: 0.05 }),
  rattan: std({ color: '#2b2724', map: rattanMap, roughness: 0.8, side: THREE.DoubleSide }),
  paver: textured(tex.paver, { color: rgb(1.6, 1.6, 1.62) }),
  stepper: textured(tex.concrete, { color: rgb(1.9, 1.9, 1.95) }),
  asphalt: textured(tex.asphalt, { color: rgb(1.5, 1.5, 1.55) }),
  white: std({ color: '#eeece8', roughness: 0.25 }),
  steel: std({ color: '#b9bcc0', roughness: 0.25, metalness: 1 }),
  fabric: std({ color: '#8b8378', roughness: 1 }),
  fabricDark: std({ color: '#3d3a38', roughness: 1 }),
  cream: std({ color: '#e2d6c1', roughness: 1 }),
  bedding: std({ color: '#d9cfc0', roughness: 1 }),
  wall: std({ color: '#ded4c2', roughness: 1 }),
  ceiling: std({ color: '#e8e1d4', roughness: 1 }),
  leaf: std({ color: '#2f5e2b', roughness: 0.7, side: THREE.DoubleSide }),
  leafLight: std({ color: '#4f8a3a', roughness: 0.7, side: THREE.DoubleSide }),
  trunk: std({ color: '#6b5842', roughness: 1 }),
  hedge: std({ color: '#25461f', roughness: 1 }),
  pot: std({ color: '#4a4c4e', roughness: 0.8 }),
  soil: std({ color: '#2d241b', roughness: 1 }),
  curtain: std({ color: '#f1ece2', roughness: 1, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  tileFloor: textured(tex.poolTile, { color: '#ffffff', side: THREE.DoubleSide }),
  // emissive / night-reactive (LED strips glow past 1.0 so the bloom pass picks them up)
  led: std({ color: '#ffe2b0', emissive: '#ffb865', emissiveIntensity: 0.4 }, [0.5, 6]),
  glow: std({ color: '#ffe7c4', emissive: '#ffbf75', emissiveIntensity: 0, roughness: 1 }, [0, 1.6]),
  uplight: std({ color: '#fff3d6', emissive: '#ffc87a', emissiveIntensity: 0 }, [0.2, 7]),
  fire: std({ color: '#ff9a3c', emissive: '#ff7a1a', emissiveIntensity: 3 }),
  // pool water: animated normal map, emissive turns on with the underwater light
  water: new THREE.MeshPhysicalMaterial({
    color: '#10b7b0', roughness: 0.04, metalness: 0, normalMap: waterNormal, normalScale: new THREE.Vector2(0.18, 0.18),
    transparent: true, opacity: 0.82, emissive: '#00e0d0', emissiveIntensity: 0.05, clearcoat: 1, side: THREE.DoubleSide,
  }),
  waterfall: new THREE.MeshStandardMaterial({
    map: waterfallMap, color: '#ffffff', transparent: true, opacity: 0.85, roughness: 0.1, side: THREE.DoubleSide,
    emissive: '#8fe9ff', emissiveIntensity: 0.05, depthWrite: false,
  }),
}

nightMats.push({ m: M.water as unknown as THREE.MeshStandardMaterial, day: 0.05, night: 1.4 })
nightMats.push({ m: M.waterfall as unknown as THREE.MeshStandardMaterial, day: 0.05, night: 0.8 })

// names make the baked / exported meshes readable
Object.entries(M).forEach(([k, m]) => { m.name = k })
glass.name = 'glass'
glassLite.name = 'glassLite'

export type MatKey = keyof typeof M
