import { lazy, Suspense, useMemo, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { ViewerProvider, createViewerStore } from '../state/viewer'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'
import { useSeen, useVisible } from './Reveal'

const Scene = lazy(() => import('../three/Scene'))

const rise = keyframes`from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; }`

const Wrap = styled.header`
  position: relative; min-height: 100svh; display: flex; align-items: flex-end; overflow: hidden; background: #0b0b0d;
`
const CanvasBox = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  /* portrait: villa in the upper part, copy underneath */
  @media (max-width: 900px) { bottom: 40%; mask-image: linear-gradient(#000 78%, transparent); -webkit-mask-image: linear-gradient(#000 78%, transparent); }
`
const Shade = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(15,15,15,.7) 0%, rgba(15,15,15,0) 16%),
    linear-gradient(0deg, rgba(15,15,15,.95) 0%, rgba(15,15,15,.55) 34%, rgba(15,15,15,0) 62%),
    linear-gradient(90deg, rgba(15,15,15,.6) 0%, rgba(15,15,15,0) 55%);
  html[dir='rtl'] & { background: linear-gradient(180deg, rgba(15,15,15,.7) 0%, rgba(15,15,15,0) 16%), linear-gradient(0deg, rgba(15,15,15,.95) 0%, rgba(15,15,15,.55) 34%, rgba(15,15,15,0) 62%), linear-gradient(270deg, rgba(15,15,15,.6) 0%, rgba(15,15,15,0) 55%); }
`
const Content = styled.div`
  position: relative; z-index: 2; width: 100%; max-width: 1600px; margin: 0 auto;
  padding: 120px clamp(16px, 4vw, 56px) clamp(32px, 5vw, 64px);
  display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 40px; align-items: end;
  animation: ${rise} 1.1s 0.2s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 28px; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`
const Pin = styled.div`
  display: inline-flex; align-items: center; gap: 8px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px;
`
const Title = styled.h1`
  font-weight: 200; font-size: clamp(44px, 8.2vw, 124px); line-height: 1; letter-spacing: -0.03em; margin: 0 0 24px; max-width: 12ch;
  html[dir='rtl'] & { letter-spacing: 0; line-height: 1.2; max-width: 14ch; }
`
const Desc = styled.p`
  margin: 0 0 32px; max-width: 520px; font-size: clamp(15px, 1.5vw, 18px); line-height: 1.6; color: #c9c9c9;
  span { display: block; }
`
const Cta = styled.a`
  display: inline-flex; align-items: center; gap: 14px; padding: 18px 28px; background: var(--accent); color: #111; text-decoration: none;
  font-size: 12px; letter-spacing: .18em; text-transform: uppercase; transition: background .25s, gap .25s;
  &:hover { background: #dcb584; gap: 20px; }
  svg { transition: transform .25s; html[dir='rtl'] & { transform: scaleX(-1); } }
`
const Stats = styled.dl`
  display: flex; gap: clamp(20px, 3vw, 44px); margin: 0;
  @media (max-width: 900px) { gap: 0; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 20px; }
`
const Stat = styled.div`
  dt, dd { margin: 0; }
  dt { font-weight: 200; font-size: clamp(40px, 5vw, 68px); line-height: 1; letter-spacing: -0.02em; white-space: nowrap; }
  dt small { font-size: 14px; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin-inline-start: 6px; }
  dd { margin-top: 10px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
`
const Scroll = styled.div`
  position: absolute; z-index: 2; inset-inline-end: clamp(16px, 4vw, 56px); top: 50%; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--muted);
  writing-mode: vertical-rl; display: flex; align-items: center; gap: 12px;
  &::after { content: ''; width: 1px; height: 56px; background: linear-gradient(var(--accent), transparent); }
  @media (max-width: 900px) { display: none; }
`

/** Full-screen hero: the villa orbits slowly at dusk. Own viewer state; render loop pauses off-screen. */
export default function Hero() {
  const { t } = useLang()
  const h = site.hero
  const store = useMemo(() => createViewerStore({ night: true }), [])
  const box = useRef<HTMLDivElement>(null)
  const seen = useSeen(box, '200px')
  const visible = useVisible(box, '0px')
  return (
    <Wrap id="top">
      <CanvasBox ref={box} aria-hidden="true">
        {seen && (
          <ViewerProvider store={store}>
            <Suspense fallback={null}>
              <Scene active={visible} />
            </Suspense>
          </ViewerProvider>
        )}
      </CanvasBox>
      <Shade />
      <Content>
        <div>
          <Pin><Icon name="pin" size={18} />{t(h.pin)}</Pin>
          <Title>{t(h.title)}</Title>
          <Desc><span>{t(h.line1)}</span><span>{t(h.line2)}</span></Desc>
          <Cta href="#layouts">{t(h.cta)}<Icon name="arrow" size={18} /></Cta>
        </div>
        <Stats>
          {h.stats.map((s) => (
            <Stat key={s.value}>
              <dt>{s.value}<small>{t(s.unit)}</small></dt>
              <dd>{t(s.label)}</dd>
            </Stat>
          ))}
        </Stats>
      </Content>
      <Scroll>{t(h.scroll)}</Scroll>
    </Wrap>
  )
}
