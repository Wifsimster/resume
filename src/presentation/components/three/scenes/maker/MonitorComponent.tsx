import type { CanvasTexture } from 'three'
import type { makerColors } from '@domain/data/makerRack'

interface Props {
  screenTexture: CanvasTexture | null
  colors: typeof makerColors
}

export default function MonitorComponent({ screenTexture, colors }: Props) {
  return (
    <group position={[-2, 0.925, 0.2]}>
      {/* Monitor frame (32 inch, 16:9 ratio) */}
      <mesh>
        <boxGeometry args={[1.59, 0.896, 0.157]} />
        <meshStandardMaterial color={colors.darkMetal} roughness={0.25} />
      </mesh>

      {/* Screen with content texture. Unlit and excluded from tone mapping so
           the display reads bright and true like a real backlit panel. */}
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[1.55, 0.87]} />
        <meshBasicMaterial map={screenTexture} toneMapped={false} />
      </mesh>

      {/* Bottom bezel accent strip */}
      <mesh position={[0, -0.46, 0.08]}>
        <boxGeometry args={[1.59, 0.024, 0.02]} />
        <meshStandardMaterial color="#B87333" roughness={0.35} metalness={0.6} />
      </mesh>

      {/* Power LED */}
      <mesh position={[0.7, -0.46, 0.095]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#00FF88" />
      </mesh>

      {/* Stand neck */}
      <mesh position={[0, -0.62, -0.03]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.09, 0.42, 0.04]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Stand base plate on the desk */}
      <mesh position={[0, -0.88, 0.02]}>
        <boxGeometry args={[0.52, 0.025, 0.34]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Rear cable running down the neck */}
      <mesh position={[0, -0.62, -0.07]} rotation={[-0.12, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
    </group>
  )
}
