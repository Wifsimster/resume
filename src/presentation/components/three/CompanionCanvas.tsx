import { Canvas } from '@react-three/fiber'
import CompanionScene from './CompanionScene'

export default function CompanionCanvas() {
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
