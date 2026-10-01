import type { ReactNode, SVGProps } from 'react'

const P: Record<string, ReactNode> = {
  // nearby places
  beach: <><circle cx="12" cy="8" r="3.2" /><path d="M3 16c2 0 2.5-1.5 4.5-1.5S10 16 12 16s2.5-1.5 4.5-1.5S19 16 21 16M3 20c2 0 2.5-1.5 4.5-1.5S10 20 12 20s2.5-1.5 4.5-1.5S19 20 21 20" /></>,
  school: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6" /></>,
  mall: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8a3 3 0 016 0" /></>,
  hospital: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8M8 12h8" /></>,
  airport: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />,
  metro: <><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 11h14M9 21l2-4M15 21l-2-4" /><circle cx="9" cy="14" r=".6" /><circle cx="15" cy="14" r=".6" /></>,
  park: <><circle cx="12" cy="9" r="6" /><path d="M12 15v7M9 22h6" /></>,
  marina: <><path d="M12 3v13M12 4l7 11h-7M12 7L6 15h6M4 19c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1" /></>,
  // specifications
  walls: <><rect x="3" y="4" width="18" height="16" /><path d="M3 9.3h18M3 14.6h18M9 4v5.3M15 9.3v5.3M9 14.6V20" /></>,
  insulation: <><path d="M3 7c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 12c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 17c2-2 4 2 6 0s4 2 6 0 4 2 6 0" /></>,
  glazing: <><rect x="4" y="3" width="16" height="18" /><path d="M12 3v18M4 12h16M7 6l2 2M15 14l2 2" /></>,
  roof: <><path d="M2 10h20M4 10V8h16v2M6 10v10h12V10" /><path d="M9 14h6" /></>,
  facade: <><rect x="3" y="3" width="18" height="18" /><path d="M7 3v18M10.5 3v18M14 3v18M17.5 3v18" /></>,
  cooling: <><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" /><path d="M9.5 4l2.5 2 2.5-2M9.5 20l2.5-2 2.5 2" /></>,
  smart: <><path d="M3 11l9-8 9 8v9H3z" /><path d="M8.5 15a5 5 0 017 0M6.5 12.5a8 8 0 0111 0" /><circle cx="12" cy="17.5" r=".7" /></>,
  installations: <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
  slabs: <><path d="M2 8l10-5 10 5-10 5zM2 12l10 5 10-5M2 16l10 5 10-5" /></>,
  // ui
  pin: <><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.6" /></>,
  phone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 7l9 6 9-6" /></>,
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  chevL: <path d="M15 4l-8 8 8 8" />,
  chevR: <path d="M9 4l8 8-8 8" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  paperclip: <path d="M20 11l-8.5 8.5a5 5 0 01-7-7L13 4a3.3 3.3 0 014.7 4.7L9.2 17.2a1.7 1.7 0 01-2.4-2.4L14 7.5" />,
  check: <path d="M4 12.5l5 5L20 6" />,
}

export type IconName = keyof typeof P

export function Icon({ name, size = 24, ...rest }: { name: string; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {P[name]}
    </svg>
  )
}
