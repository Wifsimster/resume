import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedMaterials } from '@application/hooks/useSharedGeometries'
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

export default function UdmProUnit({ unit, isHovered, colors }: Props) {
    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Small display area */}
            <mesh position={[-0.181, 0, 0.37]} material={sharedMaterials.darkMetal}>
                <planeGeometry args={[0.4, 0.15]} />
            </mesh>
        </BaseServerUnit>
    )
}
