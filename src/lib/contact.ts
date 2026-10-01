export interface ContactPayload {
  intent: 'message' | 'call'
  name: string
  email: string
  message: string
  consent: boolean
  attachment: File | null
  lang: string
  /** room the visitor came from via "Book a viewing", if any */
  context?: string
}

/**
 * TODO(api): replace this stub with the real endpoint.
 *
 *   const body = new FormData()
 *   Object.entries({ intent, name, email, message, lang, context }).forEach(([k, v]) => v && body.append(k, String(v)))
 *   if (attachment) body.append('attachment', attachment)   // max 5 MB, validated client-side; re-validate on the server!
 *   const res = await fetch('https://<your-api>/contact', { method: 'POST', body })
 *   if (!res.ok) throw new Error(`HTTP ${res.status}`)
 *
 * Until then the data is only logged and a success state is shown.
 */
export async function submitContact(p: ContactPayload): Promise<void> {
  console.info('[contact] (no backend yet) would send:', {
    ...p,
    attachment: p.attachment ? { name: p.attachment.name, type: p.attachment.type, bytes: p.attachment.size } : null,
  })
  await new Promise((r) => setTimeout(r, 700))
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx'
const OK_EXT = /\.(pdf|jpe?g|png|webp|docx?)$/i

export type FileProblem = 'size' | 'type' | null
export function checkFile(f: File): FileProblem {
  if (!OK_EXT.test(f.name)) return 'type'
  if (f.size > MAX_FILE_BYTES) return 'size'
  return null
}
