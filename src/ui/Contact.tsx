import { useEffect, useRef, useState, type FormEvent } from 'react'
import styled, { css } from 'styled-components'
import { site } from '../data/villa'
import { useLang } from './lang'
import { Icon } from './icons'
import { Reveal } from './Reveal'
import { Eyebrow } from './shared'
import { submitContact, checkFile, FILE_ACCEPT, type ContactPayload } from '../lib/contact'

const Wrap = styled.section`
  background: #080808; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); scroll-margin-top: 64px;
`
const Inner = styled.div`
  max-width: 1600px; margin: 0 auto; padding: clamp(80px, 10vw, 150px) clamp(16px, 4vw, 56px);
  display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: clamp(32px, 6vw, 110px);
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`
const Title = styled.h2`
  font-weight: 200; font-size: clamp(48px, 8vw, 128px); line-height: 1; letter-spacing: -0.03em; margin: 0 0 24px;
  html[dir='rtl'] & { letter-spacing: 0; line-height: 1.2; }
`
const Lead = styled.p`color: var(--muted); max-width: 420px; line-height: 1.65; margin: 0 0 clamp(32px, 5vw, 64px);`
const Blocks = styled.div`display: grid; gap: 0; border-top: 1px solid var(--line);`
const Block = styled.a`
  display: grid; grid-template-columns: 28px 1fr; gap: 18px; padding: 22px 0; border-bottom: 1px solid var(--line); text-decoration: none; transition: color .2s, padding .25s;
  svg { color: var(--accent); margin-top: 2px; }
  small { display: block; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  span { font-size: 18px; font-weight: 300; overflow-wrap: anywhere; }
  &:hover { color: var(--accent); padding-inline-start: 8px; }
`
const Form = styled.form`display: grid; gap: 26px; align-content: start;`
const Field = styled.div`
  display: grid; gap: 8px;
  label { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
  input[type='text'], input[type='email'], textarea {
    all: unset; box-sizing: border-box; width: 100%; padding: 12px 0 14px; border-bottom: 1px solid var(--line); font-size: 18px; font-weight: 300; transition: border-color .25s;
    white-space: pre-wrap; overflow-wrap: anywhere;
  }
  textarea { min-height: 120px; resize: vertical; line-height: 1.5; }
  input:focus, textarea:focus { border-bottom-color: var(--accent); }
  input[aria-invalid='true'], textarea[aria-invalid='true'] { border-bottom-color: #d9695f; }
`
const Err = styled.div`font-size: 12.5px; color: #e88a82;`
const FileRow = styled.div`display: flex; align-items: center; gap: 12px; flex-wrap: wrap;`
const FileBtn = styled.button`
  all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; padding: 11px 16px; border: 1px dashed rgba(255,255,255,.28); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; transition: border-color .2s, color .2s;
  &:hover, &:focus-visible { border-color: var(--accent); color: var(--accent); }
`
const FileName = styled.span`font-size: 14px; color: #ccc; display: inline-flex; align-items: center; gap: 10px; overflow-wrap: anywhere;
  button { all: unset; cursor: pointer; color: var(--muted); text-decoration: underline; font-size: 12px; } button:hover { color: var(--accent); }`
const Hint = styled.div`font-size: 12px; color: var(--muted);`
const Consent = styled.label`
  display: grid; grid-template-columns: 20px 1fr; gap: 14px; font-size: 13px; line-height: 1.6; color: #a8a8a8; cursor: pointer;
  input { appearance: none; width: 18px; height: 18px; margin: 2px 0 0; border: 1px solid rgba(255,255,255,.4); display: grid; place-content: center; cursor: pointer; background: transparent; }
  input:checked { background: var(--accent); border-color: var(--accent); }
  input:checked::after { content: ''; width: 9px; height: 5px; border: solid #111; border-width: 0 0 2px 2px; transform: rotate(-45deg) translate(1px, -1px); }
  input[aria-invalid='true'] { border-color: #d9695f; }
`
const Row = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`
const Btn = styled.button<{ $primary?: boolean }>`
  all: unset; box-sizing: border-box; cursor: pointer; text-align: center; padding: 18px 30px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; border: 1px solid var(--line);
  transition: background .2s, color .2s, border-color .2s; flex: 1 1 180px;
  &:hover, &:focus-visible { border-color: var(--accent); color: var(--accent); }
  &[disabled] { opacity: .5; pointer-events: none; }
  ${(p) => p.$primary && css`background: var(--accent); color: #111; border-color: var(--accent); &:hover, &:focus-visible { background: #dcb584; color: #111; }`}
`
const Done = styled.div`
  border: 1px solid var(--accent); padding: clamp(28px, 4vw, 52px); display: grid; gap: 16px; justify-items: start; animation: pop .5s ease both;
  @keyframes pop { from { opacity: 0; transform: translateY(16px); } }
  .tick { width: 54px; height: 54px; border: 1px solid var(--accent); border-radius: 50%; display: grid; place-items: center; color: var(--accent); }
  h3 { margin: 0; font-weight: 200; font-size: clamp(30px, 4vw, 48px); }
  p { margin: 0; color: #bbb; line-height: 1.6; max-width: 420px; }
`

type Errors = Partial<Record<'name' | 'email' | 'message' | 'file' | 'consent' | 'failed', string>>
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Contact form (no backend yet): validates, logs the payload, shows a success state. See lib/contact.ts. */
export default function Contact() {
  const { t, lang } = useLang()
  const C = site.contact
  const [v, setV] = useState({ name: '', email: '', message: '', consent: false })
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [sentIntent, setSentIntent] = useState<'message' | 'call'>('message')
  const [context, setContext] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)
  const msgRef = useRef<HTMLTextAreaElement>(null)

  // "Book a viewing" in the configurator prefills the message
  useEffect(() => {
    const h = (e: Event) => {
      const room = (e as CustomEvent<{ room: string }>).detail?.room
      if (!room) return
      setContext(room)
      setStatus('idle')
      setV((s) => ({ ...s, message: s.message.trim() ? s.message : `${t(C.viewingPrefill)}${room}` }))
    }
    window.addEventListener('book-viewing', h)
    return () => window.removeEventListener('book-viewing', h)
  }, [t, C.viewingPrefill])

  const set = (k: keyof typeof v, val: string | boolean) => {
    setV((s) => ({ ...s, [k]: val }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const onFile = (f: File | null) => {
    if (!f) return setFile(null)
    const p = checkFile(f)
    if (p) {
      setFile(null)
      setErrors((e) => ({ ...e, file: t(p === 'size' ? C.errors.file : C.errors.fileType) }))
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setFile(f)
    setErrors((e) => ({ ...e, file: undefined }))
  }

  const submit = async (intent: 'message' | 'call', ev?: FormEvent) => {
    ev?.preventDefault()
    const er: Errors = {}
    if (v.name.trim().length < 2) er.name = t(C.errors.name)
    if (!EMAIL.test(v.email.trim())) er.email = t(C.errors.email)
    if (intent === 'message' && v.message.trim().length < 10) er.message = t(C.errors.message)
    if (!v.consent) er.consent = t(C.errors.consent)
    if (errors.file) er.file = errors.file
    setErrors(er)
    if (Object.keys(er).length) {
      const first = ['name', 'email', 'message', 'file', 'consent'].find((k) => er[k as keyof Errors])
      document.getElementById(`c-${first}`)?.focus()
      return
    }
    const payload: ContactPayload = { intent, name: v.name.trim(), email: v.email.trim(), message: v.message.trim(), consent: v.consent, attachment: file, lang, context }
    setStatus('sending')
    try {
      await submitContact(payload)
      setSentIntent(intent)
      setStatus('sent')
      setV({ name: '', email: '', message: '', consent: false })
      setFile(null)
      setContext(undefined)
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      setStatus('idle')
      setErrors({ failed: t(C.errors.failed) })
    }
  }

  const ErrText = ({ id, text }: { id: string; text?: string }) => (text ? <Err id={`${id}-err`} role="alert">{text}</Err> : null)
  const B = C.blocks

  return (
    <Wrap id="contact">
      <Inner>
        <Reveal>
          <Eyebrow>{t(C.eyebrow)}</Eyebrow>
          <Title>{t(C.title)}</Title>
          <Lead>{t(C.lead)}</Lead>
          <Blocks>
            <Block href={`mailto:${B.write.value}`}><Icon name="mail" size={24} /><div><small>{t(B.write.title)}</small><span>{B.write.value}</span></div></Block>
            <Block href={`tel:${B.call.value.replace(/\s/g, '')}`}><Icon name="phone" size={24} /><div><small>{t(B.call.title)}</small><span dir="ltr">{B.call.value}</span></div></Block>
            <Block as="div"><Icon name="pin" size={24} /><div><small>{t(B.address.title)}</small><span>{t(B.address.value)}</span></div></Block>
          </Blocks>
        </Reveal>
        <Reveal delay={120}>
          {status === 'sent' ? (
            <Done role="status">
              <div className="tick"><Icon name="check" size={26} /></div>
              <h3>{t(C.success.title)}</h3>
              <p>{t(C.success.text)} {sentIntent === 'call' && t(C.success.callText)}</p>
              <Btn type="button" onClick={() => setStatus('idle')}>{t(C.success.again)}</Btn>
            </Done>
          ) : (
            <Form noValidate onSubmit={(e) => submit('message', e)} aria-busy={status === 'sending'}>
              <Field>
                <label htmlFor="c-name">{t(C.name)}</label>
                <input id="c-name" type="text" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby="c-name-err" />
                <ErrText id="c-name" text={errors.name} />
              </Field>
              <Field>
                <label htmlFor="c-email">{t(C.email)}</label>
                <input id="c-email" type="email" autoComplete="email" value={v.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby="c-email-err" dir="ltr" style={{ textAlign: 'start' }} />
                <ErrText id="c-email" text={errors.email} />
              </Field>
              <Field>
                <label htmlFor="c-message">{t(C.message)}</label>
                <textarea id="c-message" ref={msgRef} value={v.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby="c-message-err" />
                <ErrText id="c-message" text={errors.message} />
              </Field>
              <Field>
                <label htmlFor="c-file">{t(C.attach)}</label>
                <FileRow>
                  <input id="c-file" ref={fileRef} type="file" accept={FILE_ACCEPT} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} aria-describedby="c-file-hint c-file-err" />
                  <FileBtn type="button" onClick={() => fileRef.current?.click()}><Icon name="paperclip" size={16} />{t(C.choose)}</FileBtn>
                  {file && <FileName>{file.name} <span style={{ color: 'var(--muted)' }}>({(file.size / 1048576).toFixed(1)} MB)</span><button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }}>{t(C.remove)}</button></FileName>}
                </FileRow>
                <Hint id="c-file-hint">{t(C.attachHint)}</Hint>
                <ErrText id="c-file" text={errors.file} />
              </Field>
              <Field>
                <Consent>
                  <input id="c-consent" type="checkbox" checked={v.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby="c-consent-err" />
                  <span>{t(C.consent)}</span>
                </Consent>
                <ErrText id="c-consent" text={errors.consent} />
              </Field>
              <ErrText id="c-failed" text={errors.failed} />
              <Row>
                <Btn $primary type="submit" disabled={status === 'sending'}>{t(status === 'sending' ? C.sending : C.send)}</Btn>
                <Btn type="button" disabled={status === 'sending'} onClick={() => submit('call')}>{t(C.bookCall)}</Btn>
              </Row>
            </Form>
          )}
        </Reveal>
      </Inner>
    </Wrap>
  )
}
