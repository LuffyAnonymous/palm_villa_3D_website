import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'

const Bar = styled.nav<{ $solid: boolean }>`
  position: fixed; top: 0; inset-inline: 0; z-index: 50; height: 68px;
  display: flex; align-items: center; gap: 32px; padding: 0 clamp(16px, 4vw, 56px);
  transition: background .35s, border-color .35s, backdrop-filter .35s; border-bottom: 1px solid transparent;
  ${(p) => p.$solid && css`background: rgba(15,15,15,.82); backdrop-filter: blur(14px); border-color: var(--line);`}
`
const Logo = styled.a`
  font-weight: 300; letter-spacing: .32em; font-size: 14px; text-decoration: none; white-space: nowrap;
  b { font-weight: 500; color: var(--accent); }
  html[dir='rtl'] & { letter-spacing: .2em; direction: ltr; }
`
const Links = styled.ul`
  display: flex; gap: 28px; list-style: none; margin: 0 auto; padding: 0;
  @media (max-width: 900px) { display: none; }
`
const NavLink = styled.a<{ $on: boolean }>`
  position: relative; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; text-decoration: none; padding: 8px 0;
  color: ${(p) => (p.$on ? 'var(--text)' : '#a8a8a8')}; transition: color .2s;
  &::after { content: ''; position: absolute; inset-inline: 0; bottom: 2px; height: 1px; background: var(--accent); transform: scaleX(${(p) => (p.$on ? 1 : 0)}); transition: transform .3s; transform-origin: center; }
  &:hover { color: var(--text); }
  &:hover::after { transform: scaleX(1); }
`
const Right = styled.div`display: flex; align-items: center; gap: 18px; margin-inline-start: auto; @media (min-width: 901px) { margin-inline-start: 0; }`
const LangSwitch = styled.div`
  display: flex; font-size: 11px; letter-spacing: .14em; border: 1px solid var(--line);
  button { all: unset; cursor: pointer; padding: 7px 10px; color: var(--muted); transition: background .2s, color .2s; }
  button[aria-pressed='true'] { background: var(--accent); color: #111; }
  button:not([aria-pressed='true']):hover { color: var(--text); }
  button:focus-visible { outline: 1px solid var(--accent); outline-offset: -2px; }
`
const Contact = styled.a`
  font-size: 11px; letter-spacing: .16em; text-transform: uppercase; text-decoration: none; padding: 11px 18px; border: 1px solid var(--accent); color: var(--accent);
  transition: background .25s, color .25s; white-space: nowrap;
  &:hover { background: var(--accent); color: #111; }
  @media (max-width: 900px) { display: none; }
`
const Burger = styled.button`
  all: unset; cursor: pointer; display: none; padding: 8px; margin-inline-end: -8px;
  &:focus-visible { outline: 1px solid var(--accent); }
  @media (max-width: 900px) { display: block; }
`
const Sheet = styled.div<{ $open: boolean }>`
  position: fixed; inset: 0; z-index: 49; background: rgba(10,10,10,.97); backdrop-filter: blur(10px);
  display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 90px clamp(24px, 8vw, 64px) 40px;
  opacity: ${(p) => (p.$open ? 1 : 0)}; visibility: ${(p) => (p.$open ? 'visible' : 'hidden')};
  transform: translateY(${(p) => (p.$open ? 0 : '-12px')}); transition: opacity .3s, transform .3s, visibility .3s;
  a.big { font-weight: 200; font-size: clamp(34px, 9vw, 52px); text-decoration: none; padding: 10px 0; border-bottom: 1px solid var(--line); }
  a.big:hover { color: var(--accent); }
  a.cta { margin-top: 24px; text-align: center; background: var(--accent); color: #111; text-decoration: none; padding: 18px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; }
`

/** Sticky navigation: smooth anchor links, scrollspy, EN/AR switch, hamburger on mobile. */
export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    // 'contact' / 'top' are observed too so the highlight clears once you leave the menu sections
    const els = [...site.nav.map((n) => n.id), 'contact', 'top'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <Bar $solid={solid || open} aria-label="Main">
        <Logo href="#top" onClick={() => setOpen(false)}>VILLA <b>PALM</b></Logo>
        <Links>
          {site.nav.map((n) => (
            <li key={n.id}><NavLink href={`#${n.id}`} $on={active === n.id}>{t(n.label)}</NavLink></li>
          ))}
        </Links>
        <Right>
          <LangSwitch role="group" aria-label={t(site.a11y.language)}>
            <button aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">EN</button>
            <button aria-pressed={lang === 'ar'} onClick={() => setLang('ar')} lang="ar">AR</button>
          </LangSwitch>
          <Contact href="#contact">{t(site.contactCta)}</Contact>
          <Burger aria-expanded={open} aria-label={t(open ? site.a11y.closeMenu : site.a11y.menu)} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'close' : 'menu'} size={26} />
          </Burger>
        </Right>
      </Bar>
      <Sheet $open={open} aria-hidden={!open}>
        {site.nav.map((n) => (
          <a key={n.id} className="big" href={`#${n.id}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>{t(n.label)}</a>
        ))}
        <a className="cta" href="#contact" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>{t(site.contactCta)}</a>
      </Sheet>
    </>
  )
}
