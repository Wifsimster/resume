import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import BaseServerUnit from '../BaseServerUnit'

interface AnimationState {
    time: number
    fanRotation: number
}

interface Props {
    unit: ServerUnit
    isHovered: boolean
    anim: AnimationState
    colors: typeof makerColors
}

export default function FreeboxUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Status LED (blue, like real Freebox Mini) */}
            <mesh position={[-0.42, 0, 0.38]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color="#00AAFF" opacity={0.95} transparent />
            </mesh>
            {/* LED glow halo */}
            <mesh position={[-0.42, 0, 0.375]}>
                <circleGeometry args={[0.04, 12]} />
                <meshBasicMaterial color="#00AAFF" opacity={0.2} transparent />
            </mesh>

            {/* LCD display background */}
            <mesh position={[-0.25, 0, 0.37]}>
                <planeGeometry args={[0.22, 0.06]} />
                <meshBasicMaterial color="#050505" />
            </mesh>
            {/* LCD numbers (yellow-green glow) */}
            <mesh position={[-0.25, 0, 0.371]}>
                <planeGeometry args={[0.18, 0.04]} />
                <meshBasicMaterial color="#ADFF2F" opacity={0.8} transparent />
            </mesh>

            {/* D-pad buttons (lighter color for visibility) */}
            <mesh position={[0.05, 0.03, 0.37]}>
                <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
                <meshStandardMaterial color="#3A3A3A" metalness={0.5} />
            </mesh>
            <mesh position={[0.05, -0.03, 0.37]}>
                <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
                <meshStandardMaterial color="#3A3A3A" metalness={0.5} />
            </mesh>
            <mesh position={[0.02, 0, 0.37]}>
                <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
                <meshStandardMaterial color="#3A3A3A" metalness={0.5} />
            </mesh>
            <mesh position={[0.08, 0, 0.37]}>
                <cylinderGeometry args={[0.025, 0.025, 0.01, 12]} />
                <meshStandardMaterial color="#3A3A3A" metalness={0.5} />
            </mesh>
            {/* Center OK button */}
            <mesh position={[0.05, 0, 0.37]}>
                <boxGeometry args={[0.03, 0.03, 0.01]} />
                <meshStandardMaterial color="#4A4A4A" metalness={0.5} />
            </mesh>

            {/* Freebox logo area on the right */}
            <mesh position={[0.3, 0, 0.37]}>
                <planeGeometry args={[0.2, 0.05]} />
                <meshBasicMaterial color="#FFFFFF" opacity={0.85} transparent />
            </mesh>
        </BaseServerUnit>
    )
}
