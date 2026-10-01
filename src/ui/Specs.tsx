import styled from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'
import { Reveal } from './Reveal'
import { Section, Eyebrow, H2, Lead } from './shared'

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); border-inline-start: 1px solid var(--line);
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`
const Cell = styled.article`
  height: 100%; padding: clamp(24px, 3vw, 40px); border-bottom: 1px solid var(--line); border-inline-end: 1px solid var(--line);
  display: flex; flex-direction: column; gap: 18px; transition: background .3s;
  &:hover { background: rgba(200,160,106,.05); }
  &:hover svg { transform: translateY(-3px); }
  svg { color: var(--accent); transition: transform .3s; }
  h3 { margin: 0; font-weight: 300; font-size: 22px; }
  p { margin: 0; color: var(--muted); line-height: 1.65; font-size: 14.5px; }
`
const Wrap = styled.div`> div { display: block; }`

/** 3×3 specification grid with line icons; cells stagger in on scroll. */
export default function Specs() {
  const { t } = useLang()
  const S = site.specs
  return (
    <Section id="specifications">
      <Reveal>
        <Eyebrow>{t(S.eyebrow)}</Eyebrow>
        <H2>{t(S.title)}</H2>
        <Lead>{t(S.lead)}</Lead>
      </Reveal>
      <Grid>
        {S.items.map((it, i) => (
          <Reveal key={it.icon} delay={(i % 3) * 110 + Math.floor(i / 3) * 70}>
            <Wrap style={{ height: '100%' }}>
              <Cell>
                <Icon name={it.icon} size={38} />
                <h3>{t(it.title)}</h3>
                <p>{t(it.text)}</p>
              </Cell>
            </Wrap>
          </Reveal>
        ))}
      </Grid>
    </Section>
  )
}
