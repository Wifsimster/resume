import type { CanvasTexture } from 'three'
import type { makerColors } from '@domain/data/makerRack'

interface Props {
  screenTexture: CanvasTexture | null
  colors: typeof makerColors
}

export default function MonitorComponent({ screenTexture, colors }: Props) {
  return (
    <group position={[-2, 0.925, 0.2]}>
      <mesh>
        <boxGeometry args={[1.59, 0.896, 0.157]} />
        <meshStandardMaterial color={colors.darkMetal} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[1.55, 0.87]} />
        <meshBasicMaterial key={screenTexture ? 'tex' : 'none'} map={screenTexture} toneMapped={false} color={screenTexture ? '#FFFFFF' : '#0D1117'} />
      </mesh>

      <mesh position={[0, 0, -0.083]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.95, 1.25]} />
        <meshBasicMaterial color="#1E3A50" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh position={[0, -0.46, 0.08]}>
        <boxGeometry args={[1.59, 0.024, 0.02]} />
        <meshStandardMaterial color="#B87333" roughness={0.35} metalness={0.6} />
      </mesh>

      <mesh position={[0.7, -0.46, 0.095]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#00FF88" />
      </mesh>

      <mesh position={[0, -0.62, -0.03]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.09, 0.42, 0.04]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.4} metalness={0.7} />
      </mesh>

      <mesh position={[0, -0.88, 0.02]}>
        <boxGeometry args={[0.52, 0.025, 0.34]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.35} metalness={0.75} />
      </mesh>

      <mesh position={[0, -0.62, -0.07]} rotation={[-0.12, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
    </group>
  )
}
