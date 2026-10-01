import styled from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'

const Wrap = styled.footer`
  border-top: 1px solid var(--line); padding: 40px clamp(16px, 4vw, 56px) 36px; max-width: 1600px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px 40px; align-items: center;
  @media (max-width: 900px) { grid-template-columns: 1fr; justify-items: start; }
`
const Logo = styled.a`font-weight: 300; letter-spacing: .32em; font-size: 14px; text-decoration: none; b { font-weight: 500; color: var(--accent); } html[dir='rtl'] & { direction: ltr; }`
const Nav = styled.nav`display: flex; gap: 26px; flex-wrap: wrap; a { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; text-decoration: none; color: #aaa; } a:hover { color: var(--accent); }`
const Contacts = styled.div`
  display: flex; gap: 10px; justify-self: end; @media (max-width: 900px) { justify-self: start; }
  a { width: 42px; height: 42px; display: grid; place-items: center; border: 1px solid var(--line); transition: border-color .2s, color .2s, background .2s; }
  a:hover, a:focus-visible { border-color: var(--accent); color: var(--accent); }
`
const Copy = styled.div`grid-column: 1 / -1; padding-top: 24px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); letter-spacing: .06em;`

export default function Footer() {
  const { t } = useLang()
  const F = site.footer
  return (
    <Wrap>
      <Logo href="#top">VILLA <b>PALM</b></Logo>
      <Nav aria-label="Footer">
        {site.nav.map((n) => <a key={n.id} href={`#${n.id}`}>{t(n.label)}</a>)}
        <a href="#contact">{t(site.contactCta)}</a>
      </Nav>
      <Contacts>
        <a href={`tel:${F.phone.replace(/\s/g, '')}`} aria-label={F.phone}><Icon name="phone" size={18} /></a>
        <a href={`mailto:${F.email}`} aria-label={F.email}><Icon name="mail" size={18} /></a>
      </Contacts>
      <Copy>{t(F.rights)}</Copy>
    </Wrap>
  )
}
