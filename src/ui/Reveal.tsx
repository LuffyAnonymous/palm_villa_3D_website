import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode, type RefObject } from 'react'

/** true while the element is within `margin` of the viewport (continuous). */
export function useVisible(ref: RefObject<Element | null>, margin = '0px') {
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setV(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin])
  return v
}

/** becomes true once, the first time the element enters view. */
export function useSeen(ref: RefObject<Element | null>, margin = '0px', threshold = 0) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: margin, threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, seen, margin, threshold])
  return seen
}

/** Fades and slides its content up by 40px, once, when scrolled into view. `delay` in ms for staggering. */
export function Reveal({ children, delay = 0, as = 'div', className = '', style }: {
  children: ReactNode; delay?: number; as?: ElementType; className?: string; style?: CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)
  const seen = useSeen(ref, '0px 0px -8% 0px', 0.05)
  return createElement(
    as,
    { ref, className: `reveal${seen ? ' in' : ''} ${className}`, style: { '--d': `${delay}ms`, ...style } as CSSProperties },
    children,
  )
}
