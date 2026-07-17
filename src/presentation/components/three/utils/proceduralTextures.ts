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
 * Server blade front panel: dark faceplate with vent-slot rows, edge handles,
 * screws and a small status display. 512×128, shared by all blades.
 */
export function createServerPanelTexture(seed = 11): CanvasTexture {
  const { canvas, ctx } = makeCanvas(512, 128)
  const rand = mulberry32(seed * 48271 + 13)

  // Faceplate base with a subtle vertical sheen.
  const base = ctx.createLinearGradient(0, 0, 0, 128)
  base.addColorStop(0, '#221B33')
  base.addColorStop(0.5, '#191226')
  base.addColorStop(1, '#130E1D')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 512, 128)

  // Vent slots: two rows of rounded horizontal slits in the middle area.
  ctx.fillStyle = '#0B0714'
  for (let row = 0; row < 2; row++) {
    const y = 36 + row * 36
    for (let x = 76; x < 380; x += 22) {
      ctx.beginPath()
      ctx.roundRect(x, y, 15, 20, 3)
      ctx.fill()
    }
  }

  // Edge handles (vertical bars near each side).
  ctx.fillStyle = '#2E2545'
  ctx.beginPath()
  ctx.roundRect(14, 18, 14, 92, 4)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(484, 18, 14, 92, 4)
  ctx.fill()

  // Small status display block on the right.
  ctx.fillStyle = '#0B0714'
  ctx.beginPath()
  ctx.roundRect(398, 40, 64, 44, 4)
  ctx.fill()
  ctx.fillStyle = '#3B2F63'
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(406, 50 + i * 11, 40 + rand() * 8, 4)
  }

  // Corner screws.
  ctx.fillStyle = '#4C4368'
  for (const [sx, sy] of [[44, 22], [44, 106], [468, 22], [468, 106]] as const) {
    ctx.beginPath()
    ctx.arc(sx, sy, 3.4, 0, Math.PI * 2)
    ctx.fill()
  }

  return toTexture(canvas)
}

/**
 * Brushed dark metal: fine horizontal grain streaks over a near-black base.
 * 256×256, tileable horizontally.
 */
export function createBrushedMetalTexture(seed = 19): CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256)
  const rand = mulberry32(seed * 69621 + 29)

  ctx.fillStyle = '#100C1A'
  ctx.fillRect(0, 0, 256, 256)

  for (let i = 0; i < 240; i++) {
    const y = rand() * 256
    const x = rand() * 256
    const len = 30 + rand() * 120
    const light = rand() < 0.5
    ctx.strokeStyle = light ? 'rgba(120,105,160,0.10)' : 'rgba(0,0,0,0.16)'
    ctx.lineWidth = 0.8 + rand() * 0.8
    for (const wx of [x - 256, x, x + 256]) {
      ctx.beginPath()
      ctx.moveTo(wx, y)
      ctx.lineTo(wx + len, y)
      ctx.stroke()
    }
  }

  const texture = toTexture(canvas, true)
  return texture
}

/**
 * Book cover: coloured base with an inset border frame, title/author bars and
 * a small emblem — enough detail to read as a real book at arm's length.
 * 256×256.
 */
export function createBookCoverTexture(
  cover: string,
  accent: string,
  seed: number
): CanvasTexture {
  const { canvas, ctx } = makeCanvas(256, 256)
  const rand = mulberry32(seed * 25214903917 + 41)

  // Cover base with soft vertical shading.
  const base = ctx.createLinearGradient(0, 0, 256, 0)
  base.addColorStop(0, cover)
  base.addColorStop(0.5, cover)
  base.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = cover
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 256, 256)

  // Subtle paper grain.
  for (let i = 0; i < 130; i++) {
    ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'
    ctx.fillRect(rand() * 256, rand() * 256, 1.5 + rand() * 2, 1.5 + rand() * 2)
  }

  // Inset border frame.
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 3
  ctx.strokeRect(18, 18, 220, 220)
  ctx.globalAlpha = 1

  // Title bars (top) and author line (bottom).
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.roundRect(38, 48, 150 + rand() * 30, 14, 4)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(38, 74, 100 + rand() * 50, 10, 4)
  ctx.fill()
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.roundRect(38, 208, 80 + rand() * 30, 8, 3)
  ctx.fill()

  // Small centred emblem.
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = accent
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.arc(128, 148, 24, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(128, 148, 13, 0, Math.PI * 2)
  ctx.stroke()

  ctx.globalAlpha = 1
  return toTexture(canvas)
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
