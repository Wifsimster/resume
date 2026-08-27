import { Canvas } from '@react-three/fiber'
import CompanionScene from '@presentation/components/three/CompanionScene'
import './CompanionOverlay.css'

// Fixed, fully transparent Three.js overlay hosting the space companion.
// Always rendered: it is decoration the site's identity is built around, and
// the OS-level reduced-motion setting was silently hiding it on desktops.
// Interaction safety is handled in CSS (CompanionOverlay.css).

export default function CompanionOverlay() {
  // On coarse-pointer (touch) devices the overlay renders at DPR 1 without
  // MSAA: a full-screen GL layer at retina DPR is a battery cost phones don't
  // need for a 44px companion.
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const dpr: [number, number] = isCoarse ? [1, 1] : [1, 1.5]
  const antialias = !isCoarse

  return (
    <div className="companion-overlay fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ alpha: true, antialias, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <CompanionScene />
      </Canvas>
    </div>
  )
}
