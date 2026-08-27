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

export default function UPSUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Status display */}
            <mesh position={[0, 0.1, 0.37]}>
                <planeGeometry args={[0.4, 0.15]} />
                <meshBasicMaterial color={colors.serverGreen} opacity={0.8} transparent />
            </mesh>
            {/* Battery status LEDs */}
            {range(5).map((bat) => (
                <mesh key={`ups-bat-${bat}`} position={[-0.302 + bat * 0.072, -0.1, 0.38]}>
                    <sphereGeometry args={[0.02, 6, 6]} />
                    <meshBasicMaterial color={bat < 4 ? colors.serverGreen : colors.led}
                        opacity={bat < 4 ? 0.9 : 0.3} transparent />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
