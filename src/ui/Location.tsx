import { useRef } from 'react'
import styled from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'
import { Reveal, useSeen } from './Reveal'
import { Section, Eyebrow, H2, Lead } from './shared'

const Grid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 24px; align-items: stretch;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`
const MapBox = styled.div`
  position: relative; min-height: 440px; border: 1px solid var(--line); background: #151515; overflow: hidden;
  iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; filter: grayscale(1) invert(.92) contrast(.88) brightness(.9); }
  @media (max-width: 960px) { min-height: 340px; }
`
const MapLink = styled.a`
  position: absolute; inset-inline-start: 12px; bottom: 12px; z-index: 2; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; text-decoration: none;
  background: rgba(15,15,15,.82); border: 1px solid var(--line); padding: 9px 12px; display: inline-flex; gap: 8px; align-items: center; backdrop-filter: blur(8px);
  &:hover { border-color: var(--accent); color: var(--accent); }
`
const Places = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-content: stretch;
  @media (max-width: 480px) { gap: 8px; }
`
const Place = styled.li`
  border: 1px solid var(--line); background: var(--panel); padding: 20px; display: flex; flex-direction: column; justify-content: space-between; gap: 22px; min-height: 120px;
  transition: border-color .25s, transform .25s;
  &:hover { border-color: rgba(200,160,106,.6); transform: translateY(-3px); }
  svg { color: var(--accent); }
  div { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #b8b8b8; }
  b { display: block; font-weight: 200; font-size: 34px; color: var(--text); letter-spacing: -.01em; margin-top: 4px; text-transform: none; }
  b small { font-size: 12px; letter-spacing: .1em; color: var(--accent); margin-inline-start: 4px; text-transform: uppercase; }
`
const Addr = styled.p`display: flex; gap: 10px; align-items: center; margin: -28px 0 36px; color: #bbb; font-size: 14px; svg { color: var(--accent); flex: none; }`

/** Map (lazy iframe) + nearby places grid. */
export default function Location() {
  const { t } = useLang()
  const S = site.location
  const ref = useRef<HTMLDivElement>(null)
  const seen = useSeen(ref, '400px')
  const q = encodeURIComponent(S.mapQuery)
  return (
    <Section id="location">
      <Reveal>
        <Eyebrow>{t(S.eyebrow)}</Eyebrow>
        <H2>{t(S.title)}</H2>
        <Lead>{t(S.lead)}</Lead>
        <Addr><Icon name="pin" size={18} />{t(S.address)}</Addr>
      </Reveal>
      <Grid>
        <Reveal delay={60}>
          <MapBox ref={ref} style={{ height: '100%' }}>
            {seen && (
              <iframe
                title={t(S.mapTitle)}
                src={`https://www.google.com/maps?q=${q}&z=13&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            )}
            <MapLink href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
              <Icon name="pin" size={14} />{t(S.openMap)}
            </MapLink>
          </MapBox>
        </Reveal>
        <Places>
          {S.places.map((p, i) => (
            <Reveal as="li" key={p.icon} delay={80 + i * 60}>
              <Place as="div">
                <Icon name={p.icon} size={30} />
                <div>{t(p.name)}<b>{p.km}<small>{t(S.unit)}</small></b></div>
              </Place>
            </Reveal>
          ))}
        </Places>
      </Grid>
    </Section>
  )
}
