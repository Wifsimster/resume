import { useEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import SceneCamera from '../SceneCamera'
import { DoubleSide, type CanvasTexture, type Group, type Mesh, type Points } from 'three'
import type { QualityLevel } from '@application/hooks/useQuality'
import { useSceneAnimation } from '@application/hooks/useSceneAnimation'
import { createParticleField, disposeParticleField } from '../utils/particleField'
import {
  createRockyTexture,
  createGasGiantTexture,
  createSunTexture,
  createRingTexture
} from '../utils/proceduralTextures'

interface Props {
  quality: QualityLevel
}

// "Système Solaire" — a stylized low-poly solar system. An emissive sun is the
// single real light source; seven flat-shaded planets ride individually tilted
// orbital planes at Kepler-scaled speeds (outer = slower), with thin orbit
// guides, an asteroid belt, one ringed planet and one moon. The whole system
// slowly precesses for parallax depth against a distant starfield.
const themeColors = {
  sun: '#FDB813',
  sunGlow: '#FF9E4A',
  guide: '#8B5CF6',
  fill: '#22D3EE'
}

interface PlanetDef {
  color: string
  size: number
  orbit: number
  inclination: number
  node: number
  phase: number
  spin: number
  hasRing?: boolean
  hasMoon?: boolean
  /** Procedural surface (high quality only): rocky splotches or gas bands. */
  kind: 'rocky' | 'gas'
  shadow?: string
  highlight?: string
  bands?: string[]
}

// Orbit radii compressed to the camera frustum; speeds follow Kepler's third
// law (ω ∝ r^-1.5) so inner planets visibly outrun outer ones.
const planets: PlanetDef[] = [
  { color: '#A78BFA', size: 0.13, orbit: 1.6, inclination: 0.06, node: 0.0, phase: 0.0, spin: 0.9,
    kind: 'rocky', shadow: '#6D51C8', highlight: '#D6C6FF' },
  { color: '#F59E0B', size: 0.21, orbit: 2.2, inclination: -0.09, node: 0.6, phase: 2.1, spin: 0.7,
    kind: 'rocky', shadow: '#B45309', highlight: '#FDE68A' },
  { color: '#22D3EE', size: 0.24, orbit: 2.8, inclination: 0.04, node: 1.9, phase: 4.0, spin: 0.8, hasMoon: true,
    kind: 'rocky', shadow: '#0E7490', highlight: '#A5F3FC' },
  { color: '#F97316', size: 0.17, orbit: 3.4, inclination: 0.12, node: 2.8, phase: 1.2, spin: 0.75,
    kind: 'rocky', shadow: '#9A3412', highlight: '#FDBA74' },
  { color: '#FBBF24', size: 0.42, orbit: 4.3, inclination: -0.07, node: 4.1, phase: 5.3, spin: 0.5,
    kind: 'gas', bands: ['#FBBF24', '#D97706', '#FDE68A', '#B45309', '#F59E0B'] },
  { color: '#EC4899', size: 0.34, orbit: 5.1, inclination: 0.14, node: 5.0, phase: 3.0, spin: 0.45, hasRing: true,
    kind: 'gas', bands: ['#EC4899', '#BE185D', '#F9A8D4', '#DB2777'] },
  { color: '#3B82F6', size: 0.26, orbit: 5.8, inclination: -0.11, node: 0.9, phase: 0.7, spin: 0.6,
    kind: 'gas', bands: ['#3B82F6', '#1E40AF', '#93C5FD', '#2563EB'] }
]

const KEPLER_K = 1.15
const orbitalSpeeds = planets.map((p) => KEPLER_K / Math.pow(p.orbit, 1.5))

// --- Asteroid belt between the 4th and 5th orbits (single Points draw call) ---
const BELT_INNER = 3.7
const BELT_OUTER = 4.05

const CAM_BASE = { x: 0, y: 4.2, z: 9.8 }

export default function HeroScene({ quality }: Props) {
  const sunRef = useRef<Mesh>(null)
  const coronaRef = useRef<Mesh>(null)
  const systemRef = useRef<Group>(null)
  const planetRefs = useRef<(Group | null)[]>(planets.map(() => null))
  const spinRefs = useRef<(Mesh | null)[]>(planets.map(() => null))
  const moonPivotRefs = useRef<(Group | null)[]>(planets.map(() => null))

  const isMinimal = quality === 'minimal'

  // Geometry detail scales with quality. High tier renders smooth, textured
  // spheres; low/minimal keep the cheaper stylized flat-shaded look.
  const sunSegments = quality === 'high' ? 48 : quality === 'low' ? 20 : 12
  const planetSegments = quality === 'high' ? 32 : quality === 'low' ? 12 : 8
  const guideSegments = quality === 'high' ? 96 : quality === 'low' ? 48 : 24

  // --- Procedural surface textures (high quality only, generated once) ---
  const maps = useMemo(() => {
    if (quality !== 'high') {
      return {
        planetMaps: planets.map(() => null) as (CanvasTexture | null)[],
        sunMap: null as CanvasTexture | null,
        ringMap: null as CanvasTexture | null,
        moonMap: null as CanvasTexture | null
      }
    }
    return {
      planetMaps: planets.map((p, i) =>
        p.kind === 'gas'
          ? createGasGiantTexture(p.bands!, i + 1)
          : createRockyTexture(p.color, p.shadow!, p.highlight!, i + 1)
      ) as (CanvasTexture | null)[],
      sunMap: createSunTexture() as CanvasTexture | null,
      ringMap: createRingTexture('#F9A8D4') as CanvasTexture | null,
      moonMap: createRockyTexture('#94A3B8', '#64748B', '#E2E8F0', 42) as CanvasTexture | null
    }
  }, [quality])
  const { planetMaps, sunMap, ringMap, moonMap } = maps

  // Dispose the previous GPU textures only AFTER React has re-patched the
  // materials (effect cleanups run post-commit) — disposing synchronously
  // leaves materials sampling a dead texture for a frame (renders as white
  // artifacts).
  useEffect(() => {
    const created = [...maps.planetMaps, maps.sunMap, maps.ringMap, maps.moonMap].filter(
      (t): t is CanvasTexture => t !== null
    )
    return () => {
      for (const t of created) t.dispose()
    }
  }, [maps])

  // --- Background starfield (single Points draw call) ---
  const starField = useMemo(() => {
    if (quality === 'minimal') return null
    // Star size stays comfortably above one on-screen pixel — sub-pixel point
    // sprites twinkle hard at real frame rates, which reads as flickering.
    const count = quality === 'high' ? 700 : 200
    return createParticleField({
      count,
      color: 0xffffff,
      size: quality === 'high' ? 0.06 : 0.08,
      opacity: 0.5,
      position: (_i, out) => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = 18 + Math.random() * 26
        out[0] = r * Math.sin(phi) * Math.cos(theta)
        out[1] = r * Math.sin(phi) * Math.sin(theta)
        out[2] = r * Math.cos(phi)
      }
    })
  }, [quality])
  useEffect(() => () => disposeParticleField(starField), [starField])

  const belt = useMemo(() => {
    if (quality === 'minimal') return null
    const count = quality === 'high' ? 450 : 160
    return createParticleField({
      count,
      color: 0xc4b5a0,
      size: quality === 'high' ? 0.055 : 0.07,
      opacity: 0.6,
      position: (_i, out) => {
        const angle = Math.random() * Math.PI * 2
        const r = BELT_INNER + Math.random() * (BELT_OUTER - BELT_INNER)
        out[0] = Math.cos(angle) * r
        out[1] = (Math.random() - 0.5) * 0.12
        out[2] = Math.sin(angle) * r
      }
    })
  }, [quality])
  useEffect(() => () => disposeParticleField(belt), [belt])

  // --- Pointer parallax: the camera eases toward the cursor so the whole
  // system tilts subtly under the mouse. Passive listener, no per-move work
  // beyond two normalized floats; the easing runs in the render update. ---
  const camera = useThree((state) => state.camera)
  const pointer = useRef({ x: 0, y: 0 }).current

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [pointer])

  const update = (elapsed: number, delta: number) => {
    // Camera parallax (frame-rate independent easing, ~4% per 60Hz frame)
    const cam = camera
    if (cam) {
      const s = 1 - Math.exp(-delta * 0.0026)
      cam.position.x += (CAM_BASE.x + pointer.x * 0.9 - cam.position.x) * s
      cam.position.y += (CAM_BASE.y - pointer.y * 0.6 - cam.position.y) * s
      cam.lookAt(0, 0, 0)
    }

    // Sun: slow roll + gentle breathing pulse; corona counter-rotates.
    if (sunRef.current) {
      sunRef.current.rotation.y = elapsed * 0.05
      const pulse = 1 + Math.sin(elapsed * 0.8) * 0.025
      sunRef.current.scale.setScalar(pulse)
    }
    if (coronaRef.current) coronaRef.current.rotation.y = -elapsed * 0.03

    // Whole system precesses slowly for parallax depth.
    if (systemRef.current) systemRef.current.rotation.y = elapsed * 0.02

    // Planets: Kepler-scaled circular motion inside each tilted orbital plane
    // (local y stays 0 — the plane group carries inclination and node, and the
    // orbit guide shares the exact same transform so paths always align).
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i]
      const planet = planetRefs.current[i]
      if (planet) {
        const angle = p.phase + elapsed * orbitalSpeeds[i]
        planet.position.set(Math.cos(angle) * p.orbit, 0, Math.sin(angle) * p.orbit)
      }
      const sphere = spinRefs.current[i]
      if (sphere) sphere.rotation.y = elapsed * p.spin
      const moonPivot = moonPivotRefs.current[i]
      if (moonPivot) moonPivot.rotation.y = elapsed * 1.1
    }

    // Belt drifts on top of the system precession; stars barely move.
    if (belt) belt.rotation.y = elapsed * 0.015
    if (starField) starField.rotation.y = elapsed * 0.004
  }

  // Latest resources for the unmount cleanup below (the per-resource effect
  // cleanups above already handle disposal on quality changes).
  const resources = useRef<{
    starField: Points | null
    belt: Points | null
    maps: typeof maps
  }>({ starField, belt, maps })
  resources.current = { starField, belt, maps }

  useSceneAnimation('hero', update, () => {
    disposeParticleField(resources.current.starField)
    disposeParticleField(resources.current.belt)
    const m = resources.current.maps
    for (const t of [...m.planetMaps, m.sunMap, m.ringMap, m.moonMap]) t?.dispose()
  })

  return (
    <>
      {/* fov 45 = TresJS default perspective camera fov, kept explicit here */}
      <SceneCamera position={[0, 4.2, 9.8]} fov={45} lookAt={[0, 0, 0]} />

      {/* The sun is the light source: warm point light at the center. */}
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#FFD9A0" distance={26} decay={1} />
      {!isMinimal && (
        <pointLight position={[8, 5, 6]} intensity={0.4} color={themeColors.fill} distance={25} />
      )}

      {/* Sun: emissive core + additive corona shells */}
      <group>
        <mesh ref={sunRef}>
          <sphereGeometry args={[0.8, sunSegments, sunSegments]} />
          {/* key forces a fresh material when the texture set flips (shader
              program must be rebuilt when a map is added/removed) */}
          <meshBasicMaterial
            key={sunMap ? 'sun-tex' : 'sun-flat'}
            map={sunMap}
            color={sunMap ? '#FFFFFF' : themeColors.sun}
          />
        </mesh>
        {!isMinimal && (
          <mesh ref={coronaRef}>
            <sphereGeometry args={[1.05, sunSegments, sunSegments]} />
            <meshBasicMaterial
              color={themeColors.sunGlow}
              opacity={0.22}
              transparent={true}
              depthWrite={false}
            />
          </mesh>
        )}
        {!isMinimal && (
          <mesh>
            <sphereGeometry args={[1.45, sunSegments, sunSegments]} />
            <meshBasicMaterial
              color={themeColors.sunGlow}
              opacity={0.08}
              transparent={true}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>

      {/* Planetary system: orbital planes carry inclination + node so the guide
          ring and the moving planet always share the exact same transform. */}
      <group ref={systemRef}>
        {/* Inclination is a small X tilt; the ascending node rotates about Y so
            the planes stay near-planar like a real ecliptic. */}
        {planets.map((p, i) => (
          <group key={`plane-${i}`} rotation={[p.inclination, p.node, 0]}>
            {/* Orbit guide. Tube kept above ~1.5 device pixels: hairline tubes
                break into dashes and crawl/flicker as the system precesses. */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[p.orbit, 0.02, 6, guideSegments]} />
              <meshBasicMaterial
                color={themeColors.guide}
                opacity={0.11}
                transparent={true}
                depthWrite={false}
              />
            </mesh>

            {/* Planet (position driven per frame) */}
            <group
              ref={(el) => {
                planetRefs.current[i] = el
              }}
              position={[p.orbit, 0, 0]}
            >
              {/* Textured smooth sphere on high quality; stylized flat-shaded
                  solid colour on low/minimal. */}
              <mesh
                ref={(el) => {
                  spinRefs.current[i] = el
                }}
              >
                <sphereGeometry args={[p.size, planetSegments, planetSegments]} />
                <meshStandardMaterial
                  key={planetMaps[i] ? 'tex' : 'flat'}
                  map={planetMaps[i]}
                  color={planetMaps[i] ? '#FFFFFF' : p.color}
                  emissive={p.color}
                  emissiveIntensity={planetMaps[i] ? 0.05 : 0.12}
                  roughness={0.55}
                  metalness={planetMaps[i] ? 0.1 : 0.25}
                  flatShading={!planetMaps[i]}
                />
              </mesh>

              {/* Saturn-like ring */}
              {p.hasRing && (
                <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]}>
                  <ringGeometry args={[p.size * 1.45, p.size * 2.1, guideSegments]} />
                  <meshBasicMaterial
                    key={ringMap ? 'ring-tex' : 'ring-flat'}
                    map={ringMap}
                    color={ringMap ? '#FFFFFF' : '#F9A8D4'}
                    opacity={ringMap ? 0.9 : 0.5}
                    transparent={true}
                    depthWrite={false}
                    side={DoubleSide}
                  />
                </mesh>
              )}

              {/* Moon on its own pivot */}
              {p.hasMoon && (
                <group
                  ref={(el) => {
                    moonPivotRefs.current[i] = el
                  }}
                >
                  <mesh position={[p.size + 0.28, 0, 0]}>
                    <sphereGeometry args={[0.07, planetSegments, planetSegments]} />
                    <meshStandardMaterial
                      key={moonMap ? 'moon-tex' : 'moon-flat'}
                      map={moonMap}
                      color={moonMap ? '#FFFFFF' : '#CBD5E1'}
                      emissive="#CBD5E1"
                      emissiveIntensity={moonMap ? 0.04 : 0.1}
                      roughness={0.7}
                      flatShading={!moonMap}
                    />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        ))}

        {/* Asteroid belt (single Points draw call) */}
        {belt && <primitive object={belt} />}
      </group>

      {/* Distant starfield (single Points draw call) */}
      {starField && <primitive object={starField} />}
    </>
  )
}
