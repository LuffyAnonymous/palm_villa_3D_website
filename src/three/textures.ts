import * as THREE from 'three'

/** Procedural, tileable-ish canvas textures. No external files, ~tiny payload. */

function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function cv(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return [c, c.getContext('2d')!] as const
}

function finish(c: HTMLCanvasElement, tile: number, color = true) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1 / tile, 1 / tile)
  t.anisotropy = 8
  if (color) t.colorSpace = THREE.SRGBColorSpace
  return t
}

function speckle(ctx: CanvasRenderingContext2D, size: number, r: () => number, n: number, amp: number) {
  for (let i = 0; i < n; i++) {
    const v = r() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${v},${v},${v},${r() * amp})`
    ctx.fillRect(r() * size, r() * size, 1 + r() * 2, 1 + r() * 2)
  }
}

function blotches(ctx: CanvasRenderingContext2D, size: number, r: () => number, n: number, col: string, a: number) {
  for (let i = 0; i < n; i++) {
    const x = r() * size, y = r() * size, rad = 20 + r() * size * 0.25
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, col.replace('A', String(a * r())))
    g.addColorStop(1, col.replace('A', '0'))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
}

export function concreteTex() {
  const [c, ctx] = cv(512), r = rng(3)
  ctx.fillStyle = '#d4d4d4'; ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, r, 40, 'rgba(120,120,120,A)', 0.5)
  blotches(ctx, 512, r, 30, 'rgba(255,255,255,A)', 0.4)
  speckle(ctx, 512, r, 6000, 0.35)
  return finish(c, 3)
}

export function renderTex() {
  const [c, ctx] = cv(512), r = rng(5)
  ctx.fillStyle = '#e6e0d4'; ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, r, 30, 'rgba(160,150,130,A)', 0.25)
  speckle(ctx, 512, r, 5000, 0.18)
  return finish(c, 3)
}

export function oakTex() {
  const [c, ctx] = cv(512), r = rng(11)
  ctx.fillStyle = '#b8834c'; ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 260; i++) {
    const x = r() * 512, w = 1 + r() * 3
    const dark = r() > 0.45
    ctx.fillStyle = dark ? `rgba(70,38,12,${0.1 + r() * 0.25})` : `rgba(235,185,120,${0.08 + r() * 0.2})`
    ctx.fillRect(x, 0, w, 512)
  }
  // knots / wavy figure
  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = `rgba(80,45,15,${0.12 + r() * 0.12})`
    ctx.lineWidth = 1 + r() * 2
    ctx.beginPath()
    const x = r() * 512
    ctx.moveTo(x, 0)
    for (let y = 0; y <= 512; y += 32) ctx.lineTo(x + Math.sin(y * 0.03 + i) * 6, y)
    ctx.stroke()
  }
  return finish(c, 1.2)
}

export function travertineTex() {
  const [c, ctx] = cv(512), r = rng(17)
  ctx.fillStyle = '#d9c9aa'; ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 90; i++) {
    const y = r() * 512
    ctx.fillStyle = r() > 0.5 ? `rgba(160,135,95,${0.02 + r() * 0.06})` : `rgba(255,248,230,${0.04 + r() * 0.08})`
    ctx.fillRect(0, y, 512, 1 + r() * 5)
  }
  speckle(ctx, 512, r, 2500, 0.25)
  // tile joints (1.2 m tile, texture tiles 2.4 m => 2x2)
  ctx.strokeStyle = 'rgba(90,75,50,0.35)'; ctx.lineWidth = 2
  ctx.strokeRect(0, 0, 512, 512)
  ctx.beginPath(); ctx.moveTo(256, 0); ctx.lineTo(256, 512); ctx.moveTo(0, 256); ctx.lineTo(512, 256); ctx.stroke()
  return finish(c, 2.4)
}

export function stoneTex() {
  const [c, ctx] = cv(512), r = rng(23)
  ctx.fillStyle = '#e4dccb'; ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, r, 24, 'rgba(180,165,135,A)', 0.2)
  speckle(ctx, 512, r, 3000, 0.2)
  ctx.strokeStyle = 'rgba(120,110,90,0.4)'; ctx.lineWidth = 2
  ctx.strokeRect(0, 0, 512, 512)
  ctx.beginPath(); ctx.moveTo(256, 0); ctx.lineTo(256, 512); ctx.moveTo(0, 256); ctx.lineTo(512, 256); ctx.stroke()
  return finish(c, 2)
}

export function grassTex() {
  const [c, ctx] = cv(512), r = rng(29)
  ctx.fillStyle = '#3d6a2c'; ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, r, 60, 'rgba(80,130,50,A)', 0.5)
  blotches(ctx, 512, r, 40, 'rgba(25,60,20,A)', 0.5)
  for (let i = 0; i < 9000; i++) {
    const x = r() * 512, y = r() * 512
    ctx.strokeStyle = r() > 0.5 ? `rgba(120,170,70,${r() * 0.5})` : `rgba(20,50,15,${r() * 0.5})`
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 6); ctx.stroke()
  }
  return finish(c, 5)
}

export function paverTex() {
  const [c, ctx] = cv(512), r = rng(31)
  ctx.fillStyle = '#c9c2b7'; ctx.fillRect(0, 0, 512, 512)
  // herringbone-ish running bond bricks 20x10cm => texture covers 1.28m
  const bw = 64, bh = 32
  for (let y = 0; y < 512; y += bh) {
    for (let x = -(y / bh % 2) * (bw / 2); x < 512; x += bw) {
      const v = 190 + r() * 28
      ctx.fillStyle = `rgb(${v},${v - 4},${v - 10})`
      ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2)
    }
  }
  speckle(ctx, 512, r, 3000, 0.15)
  return finish(c, 1.28)
}

export function marbleTex() {
  const [c, ctx] = cv(512), r = rng(37)
  ctx.fillStyle = '#d6d6d6'; ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, r, 20, 'rgba(60,60,60,A)', 0.6)
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + r() * 0.4})`
    ctx.lineWidth = 0.5 + r() * 1.5
    ctx.beginPath()
    let x = r() * 512, y = 0
    ctx.moveTo(x, y)
    while (y < 512) { x += (r() - 0.5) * 40; y += 20 + r() * 30; ctx.lineTo(x, y) }
    ctx.stroke()
  }
  return finish(c, 3)
}

export function rattanTex() {
  const [c, ctx] = cv(256), r = rng(41)
  ctx.fillStyle = '#d8d8d8'; ctx.fillRect(0, 0, 256, 256)
  ctx.lineWidth = 3
  for (let i = 0; i < 256; i += 12) {
    ctx.strokeStyle = `rgba(30,30,30,${0.5 + r() * 0.3})`
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 12, 256); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(i + 12, 0); ctx.lineTo(i, 256); ctx.stroke()
  }
  return finish(c, 0.4)
}

export function poolTileTex() {
  const [c, ctx] = cv(256), r = rng(43)
  ctx.fillStyle = '#e8f6f4'; ctx.fillRect(0, 0, 256, 256)
  for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) {
    const v = 215 + r() * 40
    ctx.fillStyle = `rgb(${v - 20},${v},${v - 4})`
    ctx.fillRect(x + 2, y + 2, 60, 60)
  }
  return finish(c, 1.2)
}

/** Tileable water normal map from summed integer-frequency sines (analytic gradient). */
export function waterNormalTex() {
  const N = 256
  const [c, ctx] = cv(N)
  const img = ctx.createImageData(N, N)
  const r = rng(47)
  const waves = Array.from({ length: 9 }, () => ({
    kx: Math.floor(r() * 7) - 3, ky: Math.floor(r() * 7) - 3 || 2,
    a: 0.4 + r() * 0.6, p: r() * Math.PI * 2,
  }))
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let dx = 0, dy = 0
    for (const w of waves) {
      const ph = ((w.kx * x + w.ky * y) / N) * Math.PI * 2 + w.p
      const d = Math.cos(ph) * w.a
      dx += d * w.kx; dy += d * w.ky
    }
    const s = 0.35
    let nx = -dx * s, ny = -dy * s, nz = 1
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l
    const i = (y * N + x) * 4
    img.data[i] = (nx * 0.5 + 0.5) * 255
    img.data[i + 1] = (ny * 0.5 + 0.5) * 255
    img.data[i + 2] = (nz * 0.5 + 0.5) * 255
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(0.35, 0.35)
  return t
}

/** Vertical streaks for the sheet waterfall. */
export function waterfallTex() {
  const [c, ctx] = cv(128), r = rng(53)
  ctx.clearRect(0, 0, 128, 128)
  for (let i = 0; i < 90; i++) {
    const x = r() * 128, w = 1 + r() * 2.5
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    const a = 0.25 + r() * 0.6
    g.addColorStop(0, `rgba(255,255,255,${a})`)
    g.addColorStop(0.5, `rgba(210,240,245,${a * 0.4})`)
    g.addColorStop(1, `rgba(255,255,255,${a})`)
    ctx.fillStyle = g
    ctx.fillRect(x, 0, w, 128)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1, 2)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
