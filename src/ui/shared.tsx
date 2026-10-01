import styled from 'styled-components'

export const Section = styled.section`
  padding: clamp(72px, 9vw, 140px) clamp(16px, 4vw, 56px);
  border-top: 1px solid var(--line);
  max-width: 1600px; margin: 0 auto; scroll-margin-top: 64px;
`
export const Eyebrow = styled.div`
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); margin-bottom: 18px;
`
export const H2 = styled.h2`
  font-weight: 200; font-size: clamp(34px, 5vw, 68px); line-height: 1.08; margin: 0 0 14px; letter-spacing: -0.02em;
  html[dir='rtl'] & { letter-spacing: 0; line-height: 1.25; }
`
export const Lead = styled.p`
  color: var(--muted); max-width: 580px; margin: 0 0 clamp(32px, 4vw, 56px); line-height: 1.65; font-size: 16px;
`
