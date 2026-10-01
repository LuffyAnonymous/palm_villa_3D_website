import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

/** DEV ONLY: lets the in-app "Export GLB" button write into public/models/. */
function villaExport(): Plugin {
  return {
    name: 'villa-export',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__export', (req, res) => {
        const kind = new URL(req.url ?? '', 'http://x').searchParams.get('kind')
        const chunks: Buffer[] = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => {
          const dir = resolve(server.config.root, 'public/models')
          mkdirSync(dir, { recursive: true })
          const body = Buffer.concat(chunks)
          if (kind === 'glb') {
            // raw export -> Meshopt + WebP (1K) via gltf-transform; falls back to the raw file if the CLI is missing
            const raw = resolve(dir, 'villa.raw.glb')
            const out = resolve(dir, 'villa.glb')
            writeFileSync(raw, body)
            let optimized = false
            try {
              execFileSync('npx', ['gltf-transform', 'optimize', raw, out, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024', '--simplify', 'false', '--flatten', 'false', '--join', 'false', '--palette', 'false', '--instance', 'false'], { cwd: server.config.root, stdio: 'pipe' })
              optimized = true
            } catch (e) {
              console.warn('[villa-export] gltf-transform failed, keeping the raw GLB:', (e as Error).message.split('\n')[0])
              writeFileSync(out, body)
            }
            rmSync(raw, { force: true })
            res.setHeader('content-type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ rawBytes: body.length, bytes: statSync(out).size, optimized }))
            return
          }
          else if (kind === 'parts') {
            const parts = JSON.parse(body.toString()) as { id: string; status: string; note: string }[]
            const md = ['# Model elements', '', '| Status | Element | Source / note |', '|---|---|---|',
              ...parts.sort((a, b) => a.status.localeCompare(b.status) || a.id.localeCompare(b.id)).map((p) => `| ${p.status} | \`${p.id}\` | ${p.note} |`)].join('\n')
            writeFileSync(resolve(server.config.root, 'ELEMENTS.md'), md + '\n')
          }
          res.statusCode = 200
          res.end('ok')
        })
      })
    },
  }
}

/** Keep the full-size originals in public/images (source), ship only the WebP web versions in dist/. */
function dropOriginals(): Plugin {
  return {
    name: 'drop-original-images',
    apply: 'build',
    closeBundle() {
      for (const sub of ['exterior', 'interior']) {
        const dir = resolve('dist/images', sub)
        try { readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).forEach((f) => rmSync(resolve(dir, f))) } catch { /* no images */ }
      }
    },
  }
}

// base './' => relative asset paths, so dist/ can be dropped on any (sub)domain.
export default defineConfig({
  base: './',
  plugins: [react(), villaExport(), dropOriginals()],
  build: { chunkSizeWarningLimit: 1500 },
})
