import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { ViewerProvider, createViewerStore, useViewer } from '../state/viewer'
import { useActions } from '../state/actions'
import { PRESETS, type PresetId } from '../three/cameraPresets'
import { roomById, roomArea, roomDims, planFile, zones, zoneArea, zoneRoomCount, site, type Room, type Zone } from '../data/villa'
import { useProgress } from '@react-three/drei'
import { useQuality } from '../state/quality'
import { useLang } from './lang'
import { Reveal, useVisible } from './Reveal'
import { Section, Eyebrow, H2, Lead } from './shared'

const Scene = lazy(() => import('../three/Scene'))
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

// ───────────── styles ─────────────
const Grid = styled.div`
  display: grid; grid-template-columns: minmax(320px, 410px) 1fr; gap: 24px; align-items: stretch;
  min-height: min(760px, 86vh);
  @media (max-width: 960px) { grid-template-columns: 1fr; min-height: 0; }
`
const Left = styled.div`
  display: flex; flex-direction: column; gap: 10px; min-width: 0;
  max-height: min(760px, 86vh); overflow-y: auto; padding-right: 4px;
  @media (max-width: 960px) { max-height: none; overflow: visible; padding: 0; }
`
const Card = styled.button<{ $active: boolean }>`
  all: unset; box-sizing: border-box; cursor: pointer; display: block; width: 100%;
  padding: 18px 20px; border: 1px solid var(--line); background: var(--panel); text-align: start;
  transition: border-color 0.25s, background 0.25s, transform 0.25s;
  &:hover, &:focus-visible { border-color: rgba(200, 160, 106, 0.6); transform: translateX(calc(3px * var(--dir))); }
  &:focus-visible { outline: 1px solid var(--accent); }
  ${(p) => p.$active && css`border-color: var(--accent); background: linear-gradient(90deg, rgba(200,160,106,.12), rgba(200,160,106,.02)); transform: none;`}
`
const CardTop = styled.div`display: flex; justify-content: space-between; align-items: baseline; gap: 12px;`
const CardTitle = styled.div`font-size: 20px; font-weight: 300;`
const CardArea = styled.div`font-size: 22px; font-weight: 200; color: var(--accent); white-space: nowrap; small { font-size: 12px; margin-left: 2px; }`
const CardBlurb = styled.p`margin: 6px 0 12px; font-size: 13px; color: var(--muted); line-height: 1.5;`
const Meta = styled.div`display: flex; gap: 16px; align-items: center; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);`
const Status = styled.span<{ $on: boolean }>`
  display: inline-flex; align-items: center; gap: 6px; margin-left: auto;
  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: ${(p) => (p.$on ? 'var(--accent)' : '#555')}; }
`
const Stage = styled.div`
  position: relative; border: 1px solid var(--line); background: #0b0b0d; min-height: 420px; overflow: hidden;
  @media (max-width: 960px) { height: 62vh; min-height: 380px; order: 2; }
`
const Fill = styled.div`position: absolute; inset: 0;`
const Bar = styled.div`
  position: absolute; inset-inline: 12px; top: 12px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 5; pointer-events: none;
  > * { pointer-events: auto; }
`
const Chip = styled.button<{ $active?: boolean }>`
  all: unset; pointer-events: auto; cursor: pointer; padding: 8px 12px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  background: rgba(15, 15, 15, 0.7); border: 1px solid var(--line); backdrop-filter: blur(8px); color: var(--text);
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  &:hover { border-color: var(--accent); }
  &:focus-visible { outline: 1px solid var(--accent); }
  ${(p) => p.$active && css`background: var(--accent); color: #111; border-color: var(--accent);`}
`
const Toggle = styled.div`display: flex; &:first-of-type { margin-inline-start: auto; }`
const Hint = styled.div`
  position: absolute; inset-inline-start: 14px; bottom: 12px; z-index: 5; font-size: 11px; color: rgba(255,255,255,.5); letter-spacing: .06em; pointer-events: none;
`
const Loading = styled.div`
  position: absolute; inset: 0; display: grid; place-content: center; gap: 14px; text-align: center;
  font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted);
  &::after { content: ''; display: block; width: 160px; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); background-size: 60% 100%; background-repeat: no-repeat; animation: slide 1.4s infinite ease-in-out; }
  @keyframes slide { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }
`
// room panel
const Back = styled.button`
  all: unset; cursor: pointer; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted);
  padding: 4px 0 10px; width: fit-content; transition: color .2s;
  &:hover, &:focus-visible { color: var(--accent); }
`
const Panel = styled.div`
  border: 1px solid var(--accent); background: var(--panel); padding: 22px; display: flex; flex-direction: column; gap: 16px;
  animation: in .35s ease both; @keyframes in { from { opacity: 0; transform: translateY(10px); } }
`
const Photo = styled.img`width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; border: 1px solid var(--line);`
const RoomName = styled.h3`margin: 0; font-weight: 200; font-size: 30px; line-height: 1.1;`
const Facts = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);`
const Fact = styled.div`
  padding: 12px 0; &:not(:first-child) { padding-left: 14px; border-left: 1px solid var(--line); }
  b { display: block; font-weight: 200; font-size: 24px; color: var(--accent); }
  span { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
`
const Desc = styled.p`margin: 0; color: #b8b8b8; line-height: 1.6; font-size: 14px;`
const Actions = styled.div`display: flex; flex-direction: column; gap: 8px;`
const Btn = styled.button<{ $primary?: boolean }>`
  all: unset; box-sizing: border-box; cursor: pointer; text-align: center; text-decoration: none; padding: 14px 16px;
  font-size: 12px; letter-spacing: .16em; text-transform: uppercase; border: 1px solid var(--line); transition: background .2s, color .2s, border-color .2s;
  &:hover, &:focus-visible { border-color: var(--accent); color: var(--accent); }
  ${(p) => p.$primary && css`background: var(--accent); color: #111; border-color: var(--accent); &:hover, &:focus-visible { background: #d8b27d; color: #111; }`}
`
const BtnRow = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 8px; @media (max-width: 420px) { grid-template-columns: 1fr; }`
const DevBtn = styled(Chip)`position: absolute; inset-inline-end: 12px; bottom: 12px; z-index: 5;`

// ───────────── pieces ─────────────
function ZoneCard({ z }: { z: Zone }) {
  const { t } = useLang()
  const active = useViewer((s) => s.activeZone === z.id)
  const setHover = useViewer((s) => s.setHoverZone)
  const act = useActions()
  return (
    <Card
      $active={active}
      aria-pressed={active}
      onMouseEnter={() => setHover(z.id)}
      onMouseLeave={() => setHover(null)}
      onFocus={() => setHover(z.id)}
      onBlur={() => setHover(null)}
      onClick={() => {
        act.selectZone(z.id)
        if (window.matchMedia('(max-width: 960px)').matches) document.getElementById('layout-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }}
    >
      <CardTop>
        <CardTitle>{t(z.title)}</CardTitle>
        <CardArea>{zoneArea(z)}<small>m²</small></CardArea>
      </CardTop>
      <CardBlurb>{t(z.blurb)}</CardBlurb>
      <Meta>
        <span>{zoneRoomCount(z)} {t(site.layouts.rooms)}</span>
        <Status $on={z.ready}>{t(z.status)}</Status>
      </Meta>
    </Card>
  )
}

function RoomPanel({ room }: { room: Room }) {
  const { t } = useLang()
  const L = site.layouts
  const act = useActions()
  const interior = useViewer((s) => !!s.view.interior)
  const book = () => {
    window.dispatchEvent(new CustomEvent('book-viewing', { detail: { room: t(room.name) } }))
    window.location.hash = 'contact'
  }
  const dims = roomDims(room)
  const level = t(room.zone === 'terrace' ? L.levels[3] : L.levels[room.floor])
  return (
    <>
      <Back onClick={act.back}>{t(L.back)}</Back>
      <Panel>
        {room.photo && <Photo src={asset(`images/interior/${room.photo}.webp`)} alt={t(room.name)} loading="lazy" />}
        <RoomName>{t(room.name)}</RoomName>
        <Facts>
          <Fact><b>{roomArea(room)}</b><span>{t(L.area)}</span></Fact>
          <Fact><b style={{ fontSize: 17, paddingTop: 5 }}>{dims ?? '—'}</b><span>{t(dims ? L.dims : L.irregular)}</span></Fact>
          <Fact><b style={{ fontSize: 16, paddingTop: 6 }}>{level}</b><span>{t(L.level)}</span></Fact>
        </Facts>
        <Desc>{t(room.desc)}</Desc>
        <Actions>
          <Btn $primary onClick={() => (interior ? act.exitInterior() : act.viewInside(room))}>
            {t(interior ? L.exitInside : L.viewInside)}
          </Btn>
          <BtnRow>
            <Btn as="a" href={asset(planFile(room))} target="_blank" rel="noopener" download>{t(L.plan)}</Btn>
            <Btn onClick={book}>{t(L.book)}</Btn>
          </BtnRow>
        </Actions>
      </Panel>
    </>
  )
}

function Toolbar() {
  const view = useViewer((s) => s.view.id)
  const night = useViewer((s) => s.night)
  const setNight = useViewer((s) => s.setNight)
  const { t } = useLang()
  const act = useActions()
  const quality = useQuality((s) => s.quality)
  const setQuality = useQuality((s) => s.set)
  return (
    <Bar>
      {(Object.keys(PRESETS) as PresetId[]).map((k) => (
        <Chip key={k} $active={view === k} onClick={() => act.preset(k)}>{t(site.layouts.presets[k])}</Chip>
      ))}
      <Toggle role="group" aria-label={t(site.layouts.quality)} title={t(site.layouts.qualityTip)}>
        <Chip $active={quality === 'high'} onClick={() => setQuality('high')}>{t(site.layouts.high)}</Chip>
        <Chip $active={quality === 'low'} onClick={() => setQuality('low')}>{t(site.layouts.low)}</Chip>
      </Toggle>
      <Toggle style={{ marginInlineStart: 8 }} role="group" aria-label="Lighting">
        <Chip $active={!night} onClick={() => setNight(false)}>{t(site.layouts.day)}</Chip>
        <Chip $active={night} onClick={() => setNight(true)}>{t(site.layouts.night)}</Chip>
      </Toggle>
    </Bar>
  )
}

function Loader3D() {
  const { t } = useLang()
  const { progress } = useProgress()
  return <Loading>{t(site.layouts.loading)}{progress > 0 && progress < 100 ? ` ${Math.round(progress)}%` : ''}</Loading>
}

function Canvas3D() {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const visible = useVisible(ref, '100px')
  const [seen, setSeen] = useState(false)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: '300px' })
    ref.current && io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail
      setMsg(d.error ? `Export failed: ${d.error}` : `Saved public/models/villa.glb (${(d.bytes / 1e6).toFixed(1)} MB${d.optimized ? ', Meshopt + WebP' : ', NOT optimised'})`)
    }
    window.addEventListener('export-done', h)
    return () => window.removeEventListener('export-done', h)
  }, [])
  return (
    <Stage ref={ref} id="layout-stage">
      <Fill>
        {seen && (
          <Suspense fallback={<Loader3D />}>
            <Scene interactive active={visible} />
          </Suspense>
        )}
        {!seen && <Loader3D />}
      </Fill>
      <Toolbar />
      <Hint>{t(site.layouts.hint)}</Hint>
      {import.meta.env.DEV && (
        <DevBtn onClick={() => { setMsg('Exporting…'); window.dispatchEvent(new Event('export-villa')) }} title="Dev only: writes public/models/villa.glb">
          {msg || 'Export GLB'}
        </DevBtn>
      )}
    </Stage>
  )
}

function Layouts() {
  const { t } = useLang()
  const L = site.layouts
  const selected = useViewer((s) => s.selectedRoom)
  const room = selected ? roomById(selected) : null
  return (
    <Section id="layouts">
      <Reveal>
        <Eyebrow>{t(L.eyebrow)}</Eyebrow>
        <H2>{t(L.title)}</H2>
        <Lead>{t(L.lead)}</Lead>
      </Reveal>
      <Reveal delay={120}>
        <Grid>
          <Left>{room ? <RoomPanel room={room} /> : zones.map((z) => <ZoneCard key={z.id} z={z} />)}</Left>
          <Canvas3D />
        </Grid>
      </Reveal>
    </Section>
  )
}

/** Layout configurator (`#layouts`). Owns its own viewer state so other canvases (hero) stay independent. */
export default function Configurator() {
  const store = useMemo(() => createViewerStore(), [])
  return (
    <ViewerProvider store={store}>
      <Layouts />
    </ViewerProvider>
  )
}
