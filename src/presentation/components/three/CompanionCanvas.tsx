import { Canvas } from '@react-three/fiber'
import CompanionScene from './CompanionScene'

// Lazily imported by CompanionOverlay after the browser goes idle: the
// companion is pure decoration and must never compete with first paint.
export default function CompanionCanvas() {
  // On coarse-pointer (touch) devices the overlay renders at DPR 1 without
  // MSAA: a full-screen GL layer at retina DPR is a battery cost phones don't
  // need for a 44px companion.
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  const dpr: [number, number] = isCoarse ? [1, 1] : [1, 1.5]
  const antialias = !isCoarse

  return (
    <Canvas
      dpr={dpr}
      gl={{ alpha: true, antialias, powerPreference: 'low-power' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <CompanionScene />
    </Canvas>
  )
}
