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

// Equivalent of Vue's `v-for="x in n"`: [1..n]
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function PatchPanelUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Patch panel ports (24 ports in 2 rows) */}
            {range(24).map((port) => (
                <mesh key={`port-${port}`}
                    position={[-0.362 + (port % 12) * 0.0605, -0.15 + Math.floor(port / 12) * 0.3, 0.37]}>
                    <boxGeometry args={[0.05, 0.04, 0.02]} />
                    <meshStandardMaterial color="#0A0A0A" />
                </mesh>
            ))}
            {/* Port numbers/labels (small text indicators) */}
            {range(24).map((label) => (
                <mesh key={`label-${label}`}
                    position={[-0.362 + (label % 12) * 0.0605, -0.15 + Math.floor(label / 12) * 0.3, 0.38]}>
                    <boxGeometry args={[0.03, 0.02, 0.01]} />
                    <meshStandardMaterial color="#2A2A2A" />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
