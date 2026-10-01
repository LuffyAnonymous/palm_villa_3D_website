import { useEffect, type RefObject } from 'react'
import type * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { registry, bakeOptions } from './primitives'

/**
 * DEV ONLY: exports the whole villa to public/models/villa.glb via the Vite dev-server middleware
 * (vite.config.ts), which then compresses it (Meshopt + WebP textures), and writes ELEMENTS.md
 * (every part, VISIBLE / INFERRED). Triggered by dispatching the window event "export-villa".
 *
 * The export contains the merged (baked) meshes, named `<group>/<material>/<VISIBLE|INFERRED>`
 * with `extras.status`, plus the instanced slats/pavers/stools (EXT_mesh_gpu_instancing).
 */
export function Exporter({ target }: { target: RefObject<THREE.Group | null> }) {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const run = async () => {
      const root = target.current
      if (!root) return
      // re-bake with VISIBLE / INFERRED kept apart so every exported mesh carries its status
      bakeOptions.splitStatus = true
      window.dispatchEvent(new Event('villa-rebake'))
      const restore: [THREE.Object3D, boolean][] = []
      root.traverse((o) => {
        if (o.userData.bakedSource) { restore.push([o, o.visible]); o.visible = false } // merged copies are exported instead
        else if (!o.visible) { restore.push([o, false]); o.visible = true } // cut-away floors
      })
      try {
        const buf = (await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true, maxTextureSize: 2048 })) as ArrayBuffer
        const res = await fetch('/__export?kind=glb', { method: 'POST', body: buf })
        const info = (await res.json()) as { rawBytes: number; bytes: number; optimized: boolean }
        const parts = [...registry.entries()].map(([id, v]) => ({ id, ...v }))
        await fetch('/__export?kind=parts', { method: 'POST', body: JSON.stringify(parts) })
        window.dispatchEvent(new CustomEvent('export-done', { detail: info }))
      } catch (e) {
        console.error(e)
        window.dispatchEvent(new CustomEvent('export-done', { detail: { error: String(e) } }))
      } finally {
        restore.forEach(([o, v]) => (o.visible = v))
        bakeOptions.splitStatus = false
        window.dispatchEvent(new Event('villa-rebake'))
      }
    }
    window.addEventListener('export-villa', run)
    return () => window.removeEventListener('export-villa', run)
  }, [target])
  return null
}
