import type { makerColors } from '@domain/data/makerRack'

interface Props {
  colors: typeof makerColors
}

const padPositions = [[-0.15, -0.7285, -0.45], [0.15, -0.7285, -0.45], [-0.15, -0.7285, 0.45], [0.15, -0.7285, 0.45]] as const

export default function DeskComponent({ colors }: Props) {
  return (
    <group position={[-2, 0, 0.5]}>
      {/* Desktop surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.494, 0.056, 1.798]} />
        <meshStandardMaterial color={colors.wood} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Left foot with vertical column */}
      <group position={[-2.247, -0.9, 0]}>
        {/* Wide flat foot base */}
        <mesh position={[0, -0.7285, 0]}>
          <boxGeometry args={[0.35, 0.05, 1.0]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Vertical column centered on foot */}
        <mesh position={[0, 0.0585, 0]}>
          <boxGeometry args={[0.12, 1.627, 0.12]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Corner pads on underside of foot */}
        {padPositions.map((padPos, i) => (
          <mesh key={`left-pad-${i}`} position={[padPos[0], padPos[1], padPos[2]]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Right foot with vertical column */}
      <group position={[2.247, -0.9, 0]}>
        {/* Wide flat foot base */}
        <mesh position={[0, -0.7285, 0]}>
          <boxGeometry args={[0.35, 0.05, 1.0]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Vertical column centered on foot */}
        <mesh position={[0, 0.0585, 0]}>
          <boxGeometry args={[0.12, 1.627, 0.12]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Corner pads on underside of foot */}
        {padPositions.map((padPos, i) => (
          <mesh key={`right-pad-${i}`} position={[padPos[0], padPos[1], padPos[2]]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Desk edge trim */}
      <mesh position={[0, 0, 0.899]}>
        <boxGeometry args={[4.494, 0.056, 0.08]} />
        <meshStandardMaterial color="#3E2723" roughness={0.7} />
      </mesh>
    </group>
  )
}
