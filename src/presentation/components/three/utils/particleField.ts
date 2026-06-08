import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  type ColorRepresentation
} from 'three'

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
    opacity: opts.opacity ?? 1,
    transparent: (opts.opacity ?? 1) < 1 || opts.additive === true,
    depthWrite: false,
    blending: opts.additive ? AdditiveBlending : undefined
  })

  return new Points(geometry, material)
}

/** Disposes a `Points` field's GPU resources. Safe to call with null. */
export function disposeParticleField(points: Points | null) {
  if (!points) return
  points.geometry.dispose()
  ;(points.material as PointsMaterial).dispose()
}
