import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useProgress } from '@react-three/drei'
import { site } from '../data/villa'
import { useSceneReady } from '../state/ready'
import { useLang } from './lang'

const Wrap = styled.div<{ $out: boolean }>`
  position: fixed; inset: 0; z-index: 300; background: #0f0f0f; display: grid; place-content: center; justify-items: center; gap: 28px;
  opacity: ${(p) => (p.$out ? 0 : 1)}; visibility: ${(p) => (p.$out ? 'hidden' : 'visible')}; transition: opacity .7s ease, visibility .7s;
  pointer-events: ${(p) => (p.$out ? 'none' : 'auto')};
`
const Logo = styled.div`font-weight: 300; letter-spacing: .4em; font-size: 15px; direction: ltr; b { font-weight: 500; color: var(--accent); }`
const Track = styled.div`width: min(280px, 64vw); height: 1px; background: rgba(255,255,255,.14); position: relative; overflow: hidden;`
const Fill = styled.div`position: absolute; inset: 0; background: var(--accent); transform-origin: left; html[dir='rtl'] & { transform-origin: right; } transition: transform .25s ease-out;`
const Caption = styled.div`font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); text-align: center; display: grid; gap: 6px;
  b { font-weight: 300; color: var(--text); font-size: 13px; letter-spacing: .12em; } span { opacity: .7; }`

/** Full-screen loader driven by drei's useProgress (textures, HDRIs, geometry) until the first 3D frame is drawn. */
export default function LoadingScreen() {
  const { t } = useLang()
  const { progress, active } = useProgress()
  const ready = useSceneReady((s) => s.ready)
  const [gone, setGone] = useState(false)
  const [shown, setShown] = useState(0)
  const peak = useRef(0)

  useEffect(() => { document.getElementById('splash')?.remove() }, []) // hand over from the static splash

  // progress only ever moves forward (more items can be queued while loading)
  peak.current = Math.max(peak.current, progress)
  useEffect(() => { setShown(ready ? 100 : peak.current) }, [progress, ready, active])

  // never trap the visitor: bail out after 20 s (e.g. WebGL unavailable)
  const [timeout_, setTimeout_] = useState(false)
  useEffect(() => { const id = window.setTimeout(() => setTimeout_(true), 20000); return () => clearTimeout(id) }, [])
  const done = (ready && shown >= 100) || timeout_
  useEffect(() => {
    if (!done) { document.body.style.overflow = 'hidden'; return }
    document.body.style.overflow = ''
    const id = window.setTimeout(() => setGone(true), 800)
    return () => clearTimeout(id)
  }, [done])

  if (gone) return null
  return (
    <Wrap $out={done} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(shown)} aria-label={t(site.loader.title)}>
      <Logo>VILLA <b>PALM</b></Logo>
      <Track><Fill style={{ transform: `scaleX(${shown / 100})` }} /></Track>
      <Caption><b>{Math.round(shown)}%</b>{t(site.loader.title)}<span>{t(site.loader.assets)}</span></Caption>
    </Wrap>
  )
}
