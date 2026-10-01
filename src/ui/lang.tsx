import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { L } from '../data/villa'

export type Lang = 'en' | 'ar'
interface Ctx { lang: Lang; dir: 'ltr' | 'rtl'; setLang: (l: Lang) => void; t: (l: L) => string }
const LangCtx = createContext<Ctx | null>(null)

const read = (): Lang => {
  try {
    const s = localStorage.getItem('lang')
    if (s === 'ar' || s === 'en') return s
  } catch { /* storage blocked */ }
  return 'en'
}

/** EN/AR with full right-to-left layout for Arabic (sets <html dir lang>). */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(read)
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr'
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('lang', l) } catch { /* ignore */ }
  }, [])
  const t = useCallback((l: L) => l[lang], [lang])
  const value = useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t])
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang outside LangProvider')
  return c
}
