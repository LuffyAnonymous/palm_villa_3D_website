// Finds the brightest pixel of each HDRI -> unit direction, so the shadow light matches the sky.
// Writes public/hdri/sun.json. Run: npx tsx scripts/sun-from-hdri.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DataUtils } from 'three'

const out: Record<string, { dir: number[]; elevationDeg: number; azimuthDeg: number }> = {}
for (const k of ['day', 'dusk']) {
  const buf = readFileSync(`public/hdri/${k}.hdr`)
  const r = new RGBELoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer)
  const { width: W, height: H, data } = r as { width: number; height: number; data: Uint16Array }
  let best = -1, bx = 0, by = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4
    const l = DataUtils.fromHalfFloat(data[i]) + DataUtils.fromHalfFloat(data[i + 1]) + DataUtils.fromHalfFloat(data[i + 2])
    if (l > best) { best = l; bx = x; by = y }
  }
  // row 0 = top of the image (+y up)
  const u = (bx + 0.5) / W, v = 1 - (by + 0.5) / H
  const phi = (u - 0.5) * 2 * Math.PI, el = (v - 0.5) * Math.PI
  const dir = [Math.cos(el) * Math.cos(phi), Math.sin(el), Math.cos(el) * Math.sin(phi)]
  out[k] = { dir, elevationDeg: +(el * 180 / Math.PI).toFixed(1), azimuthDeg: +(Math.atan2(dir[2], dir[0]) * 180 / Math.PI).toFixed(1) }
  console.log(k, out[k], 'peak', best.toFixed(1))
}
writeFileSync('public/hdri/sun.json', JSON.stringify(out, null, 1))
