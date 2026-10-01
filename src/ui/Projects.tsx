import styled from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Reveal } from './Reveal'
import { Eyebrow, H2 } from './shared'

const Wrap = styled.section`max-width: 1600px; margin: 0 auto; padding: clamp(64px, 8vw, 120px) clamp(16px, 4vw, 56px);`
const Strip = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 40px;
  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`
const Card = styled.article<{ $i: number }>`
  position: relative; min-height: 280px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border: 1px solid var(--line);
  background: radial-gradient(120% 90% at ${(p) => [20, 80, 35, 70][p.$i % 4]}% 0%, rgba(200,160,106,${(p) => [0.16, 0.1, 0.13, 0.08][p.$i % 4]}), transparent 60%), var(--panel);
  transition: border-color .3s, transform .3s;
  &:hover { border-color: var(--accent); transform: translateY(-4px); }
  .n { font-weight: 200; font-size: 72px; line-height: 1; color: rgba(255,255,255,.12); letter-spacing: -.03em; }
  h3 { margin: 0 0 6px; font-weight: 300; font-size: 24px; }
  p { margin: 0; color: var(--muted); font-size: 13px; }
  .row { display: flex; justify-content: space-between; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--line); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #aaa; }
  .row b { font-weight: 300; color: var(--accent); }
`

/** "Other projects" strip. Placeholder projects (typographic cards, no imagery). */
export default function Projects() {
  const { t } = useLang()
  const P = site.projects
  return (
    <Wrap id="projects" aria-labelledby="projects-title">
      <Reveal>
        <Eyebrow>{t(P.eyebrow)}</Eyebrow>
        <H2 id="projects-title" style={{ fontSize: 'clamp(28px,3.6vw,48px)' }}>{t(P.title)}</H2>
      </Reveal>
      <Strip>
        {P.items.map((p, i) => (
          <Reveal key={p.name} delay={i * 90}>
            <Card $i={i}>
              <div className="n">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <h3>{p.name}</h3>
                <p>{t(p.type)}</p>
                <div className="row"><span>{p.area} {t(P.areaUnit)}</span><b>{t(p.status)}</b></div>
              </div>
            </Card>
          </Reveal>
        ))}
      </Strip>
    </Wrap>
  )
}
