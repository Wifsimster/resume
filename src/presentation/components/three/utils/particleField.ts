import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  NormalBlending,
  Points,
  PointsMaterial,
  type ColorRepresentation
} from 'three'

// Shared soft-dot sprite so every particle renders as a round, feathered glow
// instead of the default hard square. Created lazily once and NEVER disposed —
// all fields reference the same texture.
let softSprite: CanvasTexture | null = null
function getSoftSprite(): CanvasTexture {
  if (!softSprite) {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.7)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    softSprite = new CanvasTexture(canvas)
  }
  return softSprite
}

export interface ParticleFieldOptions {
  count: number
  color: ColorRepresentation
  size: number
  opacity?: number
  additive?: boolean
  /**
   * Fills `out` (length 3) with an (x, y, z) position for particle `i`.
   * Called once per particle at build time only — never per frame.
   */
  position: (i: number, out: Float32Array) => void
}

/**
 * Builds a single-draw-call `Points` particle field.
 *
 * Replaces the duplicated "allocate Float32Array, fill in a loop, build a
 * BufferGeometry + PointsMaterial" blocks that were copy-pasted across scenes.
 * Animation is expected to be done cheaply by rotating the whole `Points`
 * object, not by touching the position buffer every frame.
 */
export function createParticleField(opts: ParticleFieldOptions): Points {
  const positions = new Float32Array(opts.count * 3)
  const scratch = new Float32Array(3)

  for (let i = 0; i < opts.count; i++) {
    opts.position(i, scratch)
    positions[i * 3] = scratch[0]
    positions[i * 3 + 1] = scratch[1]
    positions[i * 3 + 2] = scratch[2]
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))

  const material = new PointsMaterial({
    color: opts.color,
    size: opts.size,
    map: getSoftSprite(),
    opacity: opts.opacity ?? 1,
    transparent: true,
    depthWrite: false,
    blending: opts.additive ? AdditiveBlending : NormalBlending
  })

  return new Points(geometry, material)
}

/** Disposes a `Points` field's GPU resources. Safe to call with null. */
export function disposeParticleField(points: Points | null) {
  if (!points) return
  points.geometry.dispose()
  ;(points.material as PointsMaterial).dispose()
}
