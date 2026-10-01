import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useViewer } from '../state/viewer'
import { useActions } from '../state/actions'
import { useLang } from '../ui/lang'
import { rooms, roomArea, FLOOR_Y, type Room } from '../data/villa'

const ACCENT = new THREE.Color('#c8a06a')

/** [x0, x1, y0, y1, z0, z1] translucent volumes shown when a zone card is hovered */
const VOLUMES: Record<string, [number, number, number, number, number, number]> = {
  ground: [-9.15, 8.15, 0, 3.2, -5.65, 7.15],
  first: [-9.7, 9.7, 3.2, 6.4, -7.7, 8.1],
  roof: [-9.7, 9.7, 6.4, 9.3, -7.7, 8.1],
  terrace: [-9.4, 8.5, -1.4, 0.3, -19.4, -4.4],
  full: [-9.7, 9.7, 0, 9.3, -7.7, 8.1],
}

function Volume({ id }: { id: string }) {
  const hover = useViewer((s) => s.hoverZone)
  const mesh = useRef<THREE.Mesh>(null!)
  const lines = useRef<THREE.LineSegments>(null!)
  const v = VOLUMES[id]
  const { geo, edges, pos } = useMemo(() => {
    const g = new THREE.BoxGeometry(v[1] - v[0], v[3] - v[2], v[5] - v[4])
    return { geo: g, edges: new THREE.EdgesGeometry(g), pos: [(v[0] + v[1]) / 2, (v[2] + v[3]) / 2, (v[4] + v[5]) / 2] as [number, number, number] }
  }, [v])
  useFrame(({ clock }, dt) => {
    const on = hover === id
    const m = mesh.current.material as THREE.MeshBasicMaterial
    const l = lines.current.material as THREE.LineBasicMaterial
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3)
    m.opacity += ((on ? 0.16 + pulse * 0.12 : 0) - m.opacity) * Math.min(1, dt * 10)
    l.opacity += ((on ? 0.9 : 0) - l.opacity) * Math.min(1, dt * 10)
    mesh.current.visible = lines.current.visible = m.opacity > 0.003 || l.opacity > 0.01
  })
  return (
    <group position={pos}>
      <mesh ref={mesh} geometry={geo} renderOrder={5} visible={false}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} />
      </mesh>
      <lineSegments ref={lines} geometry={edges} renderOrder={6} visible={false}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

/** Height at which a room's pick-plane / label sits. */
function planeY(r: Room) {
  if (r.id === 'teche') return 6.4 + 2.87
  if (r.id === 'techb') return 6.4 + 2.47
  if (r.floor === 2) return 6.47
  return FLOOR_Y[r.floor] + (r.floor === 1 ? 0.07 : 0.05)
}

function RoomPlane({ room }: { room: Room }) {
  const hover = useViewer((s) => s.hoverRoom)
  const selected = useViewer((s) => s.selectedRoom)
  const setHover = useViewer((s) => s.setHoverRoom)
  const act = useActions()
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const [x0, x1, z0, z1] = room.rect
  const on = hover === room.id || selected === room.id
  useFrame((_, dt) => {
    const target = selected === room.id ? 0.4 : hover === room.id ? 0.28 : 0.0001
    mat.current.opacity += (target - mat.current.opacity) * Math.min(1, dt * 12)
  })
  useEffect(() => () => { document.body.style.cursor = '' }, [])
  return (
    <mesh
      position={[(x0 + x1) / 2, planeY(room), (z0 + z1) / 2]}
      rotation-x={-Math.PI / 2}
      renderOrder={4}
      onPointerOver={(e) => { e.stopPropagation(); setHover(room.id); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(null); document.body.style.cursor = '' }}
      onClick={(e) => { if (e.delta < 6) { e.stopPropagation(); act.selectRoom(room.id) } }}
    >
      <planeGeometry args={[x1 - x0 - 0.12, z1 - z0 - 0.12]} />
      <meshBasicMaterial ref={mat} color={on ? ACCENT : '#ffffff'} transparent opacity={0.0001} depthWrite={false} />
    </mesh>
  )
}

function RoomLabel({ room }: { room: Room }) {
  const { t } = useLang()
  const hover = useViewer((s) => s.hoverRoom)
  const selected = useViewer((s) => s.selectedRoom)
  const setHover = useViewer((s) => s.setHoverRoom)
  const act = useActions()
  const [x0, x1, z0, z1] = room.rect
  const [lx, lz] = room.labelAt ?? [(x0 + x1) / 2, (z0 + z1) / 2]
  const small = (x1 - x0) * (z1 - z0) < 9
  return (
    <Html position={[lx, planeY(room) + 0.1, lz]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <button
        type="button"
        className={`room-label${hover === room.id ? ' hover' : ''}${selected === room.id ? ' active' : ''}${small ? ' small' : ''}`}
        style={{ pointerEvents: 'auto' }}
        onPointerEnter={() => setHover(room.id)}
        onPointerLeave={() => setHover(null)}
        onClick={() => act.selectRoom(room.id)}
      >
        <span className="rl-name">{t(room.name)}</span>
        <span className="rl-area">{roomArea(room)} m²</span>
      </button>
    </Html>
  )
}

/** Hover volumes for zone cards + (when a floor/zone is opened) pickable rooms with labelled m². */
export function Interaction() {
  const zone = useViewer((s) => s.activeZone)
  const viewId = useViewer((s) => s.view.id)
  const interior = useViewer((s) => !!s.view.interior)
  const list = useMemo(() => rooms.filter((r) => r.zone === zone), [zone])
  // rooms are only pickable/labelled in the top-down views, where the labels don't pile up
  const show = zone !== 'full' && !interior && (viewId.startsWith('dollhouse') || viewId === 'top' || viewId === 'terrace')
  return (
    <>
      {Object.keys(VOLUMES).map((id) => <Volume key={id} id={id} />)}
      {show && list.map((r) => <RoomPlane key={r.id} room={r} />)}
      {show && list.map((r) => <RoomLabel key={r.id} room={r} />)}
    </>
  )
}
