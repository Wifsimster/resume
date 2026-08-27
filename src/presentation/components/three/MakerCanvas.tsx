import { Canvas } from '@react-three/fiber'
import MakerScene, { type MakerSceneHandle } from './scenes/MakerScene'
import { useQuality } from '@application/hooks/useQuality'
import type { CameraMode } from '@application/hooks/useMakerCamera'

interface Props {
  cameraMode: CameraMode
  projects: Array<{ icon: string, label: string, year: string }>
  techStack: Array<{ icon: string, label: string }>
  title: string
  subtitle: string
  onHoverUnit: (unitId: string | null) => void
  onHandle: (handle: MakerSceneHandle | null) => void
}

// Lazily imported by MakerSection once the section approaches the viewport —
// the heaviest scene of the site never loads for visitors who don't scroll
// down to it.
export default function MakerCanvas({ cameraMode, projects, techStack, title, subtitle, onHoverUnit, onHandle }: Props) {
  const { quality, renderSettings } = useQuality()

  return (
    <Canvas
      dpr={renderSettings.dpr}
      gl={{
        alpha: true,
        antialias: renderSettings.antialias,
        powerPreference: renderSettings.powerPreference
      }}
      onCreated={({ gl }) => gl.setClearColor('#0A0A0A', 1)}
    >
      <MakerScene
        ref={onHandle}
        quality={quality}
        cameraMode={cameraMode}
        projects={projects}
        techStack={techStack}
        title={title}
        subtitle={subtitle}
        onHoverUnit={onHoverUnit}
      />
    </Canvas>
  )
}
