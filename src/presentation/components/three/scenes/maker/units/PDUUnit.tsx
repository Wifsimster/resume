import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries, sharedMaterials } from '@application/hooks/useSharedGeometries'
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

export default function PDUUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* 8 red illuminated rocker switches */}
            {range(8).map((switchNum) => (
                <mesh key={`pdu-switch-${switchNum}`}
                    position={[-0.362 + switchNum * 0.090, 0, 0.37]} material={sharedMaterials.darkMetal2}>
                    <boxGeometry args={[0.1, 0.08, 0.02]} />
                </mesh>
            ))}
            {/* Red illuminated switches - using shared LED geometry */}
            {range(8).map((switchNum) => (
                <mesh key={`pdu-led-${switchNum}`}
                    position={[-0.362 + switchNum * 0.090, 0.05, 0.38]} geometry={sharedGeometries.smallLED}
                    material={sharedMaterials.ledRed} />
            ))}
        </BaseServerUnit>
    )
}
