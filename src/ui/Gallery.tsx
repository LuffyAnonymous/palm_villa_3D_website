import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'
import { Reveal } from './Reveal'
import { Section, Eyebrow, H2, Lead } from './shared'

type Tab = 'exterior' | 'interior' | 'all'
const url = (p: string) => `${import.meta.env.BASE_URL}${p}`

const Tabs = styled.div`display: flex; gap: 4px; margin-bottom: 22px; border-bottom: 1px solid var(--line);`
const TabBtn = styled.button<{ $on: boolean }>`
  all: unset; cursor: pointer; padding: 12px 22px 14px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; position: relative;
  color: ${(p) => (p.$on ? 'var(--text)' : 'var(--muted)')}; transition: color .2s;
  &::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; height: 1px; background: var(--accent); transform: scaleX(${(p) => (p.$on ? 1 : 0)}); transition: transform .3s; }
  &:hover { color: var(--text); }
  &:focus-visible { outline: 1px solid var(--accent); outline-offset: -3px; }
`
const Viewport = styled.div`
  position: relative; overflow: hidden; touch-action: pan-y; background: #0b0b0b; border: 1px solid var(--line); cursor: zoom-in;
`
const Track = styled.div`
  display: flex; transition: transform .7s cubic-bezier(.2, .7, .2, 1);
  transform: translateX(calc(var(--i) * -100% * var(--dir)));
  @media (prefers-reduced-motion: reduce) { transition: none; }
`
const Slide = styled.figure`
  flex: 0 0 100%; margin: 0; position: relative; aspect-ratio: 1920 / 986; max-height: 78vh; min-height: 220px;
  img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
  figcaption { position: absolute; inset-inline: 0; bottom: 0; padding: 40px 22px 18px; font-size: 13px; letter-spacing: .04em; color: #ddd; background: linear-gradient(0deg, rgba(0,0,0,.7), transparent); }
`
const Arrow = styled.button<{ $side: 'start' | 'end' }>`
  all: unset; cursor: pointer; position: absolute; top: 50%; translate: 0 -50%; z-index: 2; width: 48px; height: 48px; display: grid; place-items: center;
  background: rgba(15,15,15,.6); border: 1px solid var(--line); backdrop-filter: blur(8px); transition: background .2s, color .2s, opacity .2s;
  ${(p) => (p.$side === 'start' ? 'inset-inline-start: 14px;' : 'inset-inline-end: 14px;')}
  &:hover, &:focus-visible { background: var(--accent); color: #111; }
  &[disabled] { opacity: .25; pointer-events: none; }
  svg { transform: scaleX(var(--dir)); }
  @media (max-width: 600px) { width: 40px; height: 40px; }
`
const ExpandBtn = styled.button`
  all: unset; cursor: pointer; position: absolute; top: 14px; inset-inline-end: 14px; z-index: 2; width: 40px; height: 40px; display: grid; place-items: center;
  background: rgba(15,15,15,.6); border: 1px solid var(--line); backdrop-filter: blur(8px); transition: background .2s, color .2s;
  &:hover, &:focus-visible { background: var(--accent); color: #111; }
`
const Count = styled.div`position: absolute; inset-inline-start: 22px; top: 22px; z-index: 2; font-size: 12px; letter-spacing: .2em; text-shadow: 0 1px 8px #000; pointer-events: none;`
const Thumbs = styled.div`display: flex; gap: 10px; margin-top: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin;`
const Thumb = styled.button<{ $on: boolean }>`
  all: unset; cursor: pointer; flex: 0 0 clamp(96px, 14vw, 168px); aspect-ratio: 16 / 9; position: relative; overflow: hidden; border: 1px solid ${(p) => (p.$on ? 'var(--accent)' : 'var(--line)')};
  opacity: ${(p) => (p.$on ? 1 : 0.55)}; transition: opacity .25s, border-color .25s;
  &:hover { opacity: 1; }
  &:focus-visible { outline: 1px solid var(--accent); outline-offset: 2px; }
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`
// lightbox
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 200; background: rgba(5,5,5,.96); display: flex; flex-direction: column; touch-action: pan-y;
  animation: fade .25s ease both; @keyframes fade { from { opacity: 0; } }
`
const LbImgWrap = styled.div`flex: 1; min-height: 0; display: grid; place-items: center; padding: 56px clamp(8px, 6vw, 96px) 8px; img { max-width: 100%; max-height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; }`
const LbBar = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 14px clamp(16px, 3vw, 32px) 22px; font-size: 13px; color: #ccc; gap: 20px;`
const LbClose = styled.button`
  all: unset; cursor: pointer; position: absolute; top: 12px; inset-inline-end: 12px; width: 44px; height: 44px; display: grid; place-items: center; z-index: 3;
  &:hover, &:focus-visible { color: var(--accent); }
`

function useSwipe(onPrev: () => void, onNext: () => void, dir: 'ltr' | 'rtl') {
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)
  return {
    moved,
    handlers: {
      onPointerDown: (e: RPointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; moved.current = false },
      onPointerUp: (e: RPointerEvent) => {
        const s = start.current
        start.current = null
        if (!s) return
        const dx = e.clientX - s.x, dy = e.clientY - s.y
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          moved.current = true
          // swipe towards the reading-start side = next
          const next = dir === 'ltr' ? dx < 0 : dx > 0
          next ? onNext() : onPrev()
        }
      },
      onPointerCancel: () => { start.current = null },
    },
  }
}

interface Item { id: string; src: string; w: number; h: number; alt: string }

function Lightbox({ items, index, onIndex, onClose }: { items: Item[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { dir, t } = useLang()
  const G = site.gallery
  const closeRef = useRef<HTMLButtonElement>(null)
  const prev = useCallback(() => onIndex(Math.max(0, index - 1)), [index, onIndex])
  const next = useCallback(() => onIndex(Math.min(items.length - 1, index + 1)), [index, items.length, onIndex])
  const swipe = useSwipe(prev, next, dir)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow; opener?.focus?.() }
  }, [])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') (dir === 'ltr' ? next : prev)()
      else if (e.key === 'ArrowLeft') (dir === 'ltr' ? prev : next)()
      else if (e.key === 'Home') onIndex(0)
      else if (e.key === 'End') onIndex(items.length - 1)
      else if (e.key === 'Tab') {
        // keep focus inside the dialog
        const f = document.querySelectorAll<HTMLElement>('[data-lb] button:not([disabled])')
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [dir, next, prev, onClose, onIndex, items.length])

  const cur = items[index]
  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-label={cur.alt} data-lb {...swipe.handlers} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <LbClose ref={closeRef} onClick={onClose} aria-label={t(G.close)}><Icon name="close" size={28} /></LbClose>
      <LbImgWrap onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <img src={url(cur.src)} width={cur.w} height={cur.h} alt={cur.alt} draggable={false} />
      </LbImgWrap>
      <LbBar>
        <span>{cur.alt}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Arrow as="button" $side="start" style={{ position: 'static', translate: 'none' }} onClick={prev} disabled={index === 0} aria-label={t(G.prev)}><Icon name="chevL" size={20} /></Arrow>
          <span style={{ letterSpacing: '.2em', fontSize: 12, minWidth: 56, textAlign: 'center' }}>{index + 1} / {items.length}</span>
          <Arrow as="button" $side="end" style={{ position: 'static', translate: 'none' }} onClick={next} disabled={index === items.length - 1} aria-label={t(G.next)}><Icon name="chevR" size={20} /></Arrow>
        </span>
      </LbBar>
      {/* preload neighbours */}
      {[items[index - 1], items[index + 1]].filter(Boolean).map((n) => <link key={n.id} rel="prefetch" as="image" href={url(n.src)} />)}
    </Overlay>,
    document.body,
  )
}

/** Gallery: Exterior | Interior | All tabs, swipeable slider, fullscreen lightbox (keyboard + swipe). */
export default function Gallery() {
  const { t, dir } = useLang()
  const G = site.gallery
  const [tab, setTab] = useState<Tab>('all')
  const [idx, setIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const items: Item[] = useMemo(
    () => G.items.filter((i) => tab === 'all' || i.tab === tab).map((i) => ({ id: i.id, src: i.src, w: i.w, h: i.h, alt: t(i.alt) })),
    [G.items, tab, t],
  )
  const go = (i: number) => setIdx(Math.min(Math.max(0, i), items.length - 1))
  const swipe = useSwipe(() => go(idx - 1), () => go(idx + 1), dir)
  const onTab = (k: Tab) => { setTab(k); setIdx(0) }

  return (
    <Section id="gallery">
      <Reveal>
        <Eyebrow>{t(G.eyebrow)}</Eyebrow>
        <H2>{t(G.title)}</H2>
        <Lead>{t(G.lead)}</Lead>
      </Reveal>
      <Reveal delay={100}>
        <Tabs role="tablist">
          {(['exterior', 'interior', 'all'] as Tab[]).map((k) => (
            <TabBtn key={k} role="tab" aria-selected={tab === k} $on={tab === k} onClick={() => onTab(k)}>{t(G.tabs[k])}</TabBtn>
          ))}
        </Tabs>
        <Viewport
          {...swipe.handlers}
          onClick={() => { if (!swipe.moved.current) setOpen(true) }}
          role="group"
          aria-roledescription="carousel"
        >
          <Track style={{ '--i': idx } as React.CSSProperties}>
            {items.map((it, n) => (
              <Slide key={it.id} aria-hidden={n !== idx}>
                <img src={url(it.src)} width={it.w} height={it.h} alt={it.alt} loading={n === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
                <figcaption>{it.alt}</figcaption>
              </Slide>
            ))}
          </Track>
          <Count>{String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</Count>
          <ExpandBtn aria-label={t(G.open)} onClick={(e) => { e.stopPropagation(); setOpen(true) }}><Icon name="expand" size={18} /></ExpandBtn>
          <Arrow $side="start" onClick={(e) => { e.stopPropagation(); go(idx - 1) }} disabled={idx === 0} aria-label={t(G.prev)}><Icon name="chevL" size={22} /></Arrow>
          <Arrow $side="end" onClick={(e) => { e.stopPropagation(); go(idx + 1) }} disabled={idx === items.length - 1} aria-label={t(G.next)}><Icon name="chevR" size={22} /></Arrow>
        </Viewport>
        <Thumbs>
          {items.map((it, n) => (
            <Thumb key={it.id} $on={n === idx} onClick={() => setIdx(n)} aria-label={it.alt} aria-current={n === idx}>
              <img src={url(it.src)} alt="" loading="lazy" width={168} height={95} />
            </Thumb>
          ))}
        </Thumbs>
      </Reveal>
      {open && <Lightbox items={items} index={idx} onIndex={setIdx} onClose={() => setOpen(false)} />}
    </Section>
  )
}
