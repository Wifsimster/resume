import { Canvas } from '@react-three/fiber'
import HeroScene from './scenes/HeroScene'
import { useQuality } from '@application/hooks/useQuality'

interface Props {
  onReady?: () => void
}

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
