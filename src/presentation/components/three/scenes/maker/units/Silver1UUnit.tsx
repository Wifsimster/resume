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

export default function Silver1UUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Status LEDs */}
            <mesh position={[0.302, 0.08, 0.38]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshBasicMaterial color={colors.serverGreen} opacity={0.9} transparent />
            </mesh>
        </BaseServerUnit>
    )
}
