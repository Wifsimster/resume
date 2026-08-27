import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries } from '@application/hooks/useSharedGeometries'
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

export default function AccessPointUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Circular AP design - reduced segments from 32 to 16 */}
            <mesh position={[0, 0, 0.36]}>
                <cylinderGeometry args={[0.3, 0.3, 0.02, 16]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </mesh>
            {/* Status LED - using shared geometry */}
            <mesh position={[0, 0.1, 0.38]} geometry={sharedGeometries.smallLED}>
                <meshBasicMaterial color={colors.wifi} opacity={0.9} transparent />
            </mesh>
        </BaseServerUnit>
    )
}
