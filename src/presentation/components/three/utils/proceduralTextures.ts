import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Procedural planet/sun/ring textures, generated ONCE on an offscreen canvas
// at build time — no asset downloads, tiny VRAM cost, zero per-frame work.
// All randomness is seeded so a texture looks identical across rebuilds.

/** Deterministic PRNG (mulberry32) so planet surfaces are stable per seed. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function toTexture(canvas: HTMLCanvasElement, repeatX = false): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  if (repeatX) texture.wrapS = RepeatWrapping
  texture.anisotropy = 4
  return texture
}

/**
 * Rocky planet: base colour with seeded crater/terrain splotches in a darker
 * and a lighter shade, plus soft polar shading. Equirectangular 512×256.
 */
export function createRockyTexture(
  base: string,
  shadow: string,
  highlight: string,
  seed: number
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 256)
  const rand = mulberry32(seed * 7919 + 17)

  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 256)

  // Terrain splotches — large soft patches first, small sharp ones on top.
  // Each blob is drawn at x and x±512 so the texture tiles seamlessly at the
  // sphere's UV wrap line.
  for (let i = 0; i < 260; i++) {
    const large = i < 60
    const r = large ? 14 + rand() * 34 : 2 + rand() * 9
    const x = rand() * 512
    const y = rand() * 256
    const dark = rand() < 0.55
    const color = dark ? shadow : highlight
    ctx.globalAlpha = large ? 0.10 + rand() * 0.10 : 0.16 + rand() * 0.18
    for (const wx of [x - 512, x, x + 512]) {
      const g = ctx.createRadialGradient(wx, y, 0, wx, y, r)
      g.addColorStop(0, color)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(wx, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Soft darkening toward the poles sells the sphere silhouette.
  ctx.globalAlpha = 1
  const pole = ctx.createLinearGradient(0, 0, 0, 256)
  pole.addColorStop(0, 'rgba(0,0,0,0.28)')
  pole.addColorStop(0.25, 'rgba(0,0,0,0)')
  pole.addColorStop(0.75, 'rgba(0,0,0,0)')
  pole.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = pole
  ctx.fillRect(0, 0, 512, 256)

  return toTexture(canvas, true)
}

/**
 * Gas giant: latitudinal bands with sine-wobbled edges and a few storm ovals.
 * Equirectangular 512×256.
 */
export function createGasGiantTexture(bands: string[], seed: number): CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 256)
  const rand = mulberry32(seed * 104729 + 31)

  ctx.fillStyle = bands[0]
  ctx.fillRect(0, 0, 512, 256)

  // Wobbly horizontal bands.
  const bandCount = 9 + Math.floor(rand() * 4)
  for (let b = 0; b < bandCount; b++) {
    const yCenter = (b + 0.5) * (256 / bandCount)
    const thickness = (256 / bandCount) * (0.55 + rand() * 0.7)
    const wobbleAmp = 2 + rand() * 5
    // Integer frequency keeps the sine continuous across the UV wrap line.
    const wobbleFreq = 2 + Math.floor(rand() * 4)
    const phase = rand() * Math.PI * 2
    ctx.fillStyle = bands[b % bands.length]
    ctx.globalAlpha = 0.5 + rand() * 0.4
    ctx.beginPath()
    ctx.moveTo(0, yCenter - thickness / 2)
    for (let x = 0; x <= 512; x += 8) {
      const w = Math.sin((x / 512) * Math.PI * 2 * wobbleFreq + phase) * wobbleAmp
      ctx.lineTo(x, yCenter - thickness / 2 + w)
    }
    for (let x = 512; x >= 0; x -= 8) {
      const w = Math.sin((x / 512) * Math.PI * 2 * wobbleFreq + phase + 1.1) * wobbleAmp
      ctx.lineTo(x, yCenter + thickness / 2 + w)
    }
    ctx.closePath()
    ctx.fill()
  }

  // A few storm ovals (great-red-spot style), wrapped across the seam.
  for (let s = 0; s < 3; s++) {
    const x = rand() * 512
    const y = 60 + rand() * 136
    const rx = 12 + rand() * 22
    const ry = rx * (0.4 + rand() * 0.25)
    ctx.globalAlpha = 0.25 + rand() * 0.2
    ctx.fillStyle = bands[Math.floor(rand() * bands.length)]
    for (const wx of [x - 512, x, x + 512]) {
      ctx.beginPath()
      ctx.ellipse(wx, y, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
  const pole = ctx.createLinearGradient(0, 0, 0, 256)
  pole.addColorStop(0, 'rgba(0,0,0,0.25)')
  pole.addColorStop(0.2, 'rgba(0,0,0,0)')
  pole.addColorStop(0.8, 'rgba(0,0,0,0)')
  pole.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = pole
  ctx.fillRect(0, 0, 512, 256)

  return toTexture(canvas, true)
}

/** Sun surface: bright plasma base with seeded granulation cells. 512×256. */
export function createSunTexture(seed = 3): CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 256)
  const rand = mulberry32(seed * 15485863 + 7)

  const base = ctx.createLinearGradient(0, 0, 0, 256)
  base.addColorStop(0, '#FFB347')
  base.addColorStop(0.5, '#FDD835')
  base.addColorStop(1, '#FFB347')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 256)

  // Granulation: hot white-ish cells and cooler orange pores, seam-wrapped.
  for (let i = 0; i < 340; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 2 + rand() * 10
    const hot = rand() < 0.5
    ctx.globalAlpha = 0.22 + rand() * 0.2
    for (const wx of [x - 512, x, x + 512]) {
      const g = ctx.createRadialGradient(wx, y, 0, wx, y, r)
      g.addColorStop(0, hot ? '#FFF3C4' : '#F57C00')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(wx, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
  return toTexture(canvas, true)
}

/**
 * Planetary ring: concentric translucent bands with a gap, drawn centred so
 * RingGeometry's planar UVs sample it correctly. 256×256 RGBA.
 */
export function createRingTexture(color: string, seed = 5): CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256)
  const rand = mulberry32(seed * 2654435761 + 3)
  const cx = 128
  const cy = 128

  for (let r = 44; r < 126; r += 2) {
    // Density waves: alpha varies per band, with a Cassini-like gap.
    const t = (r - 44) / 82
    const gap = t > 0.62 && t < 0.72 ? 0.12 : 1
    const alpha = (0.25 + 0.55 * Math.abs(Math.sin(t * 9 + rand() * 0.6))) * gap
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  return toTexture(canvas)
}
