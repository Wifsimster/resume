import { Canvas } from '@react-three/fiber'
import HeroScene from './scenes/HeroScene'
import { useQuality } from '@application/hooks/useQuality'

interface Props {
  onReady?: () => void
}

// Lazily imported by HeroSection: this file is the entry point of the
// three.js vendor chunk, so the initial bundle stays free of WebGL code.
export default function HeroCanvas({ onReady }: Props) {
  const { quality, renderSettings } = useQuality()

  return (
    <Canvas
      dpr={renderSettings.dpr}
      gl={{
        alpha: true,
        antialias: renderSettings.antialias,
        powerPreference: renderSettings.powerPreference
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        onReady?.()
      }}
    >
      <HeroScene quality={quality} />
    </Canvas>
  )
}
