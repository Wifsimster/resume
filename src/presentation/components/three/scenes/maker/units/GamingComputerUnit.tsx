import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries } from '@application/hooks/useSharedGeometries'
import BaseServerUnit from '../BaseServerUnit'

interface Props {
    unit: ServerUnit
    isHovered: boolean
    colors: typeof makerColors
}

// Equivalent of Vue's `v-for="x in n"`: [1..n]
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function GamingComputerUnit({ unit, isHovered, colors }: Props) {
    // Direct Three.js ref for LED animation
    const statusLedRef = useRef<any>(null)

    // Status blink — mutates the material directly on the render loop
    useFrame(({ clock }) => {
        const elapsed = clock.elapsedTime
        if (statusLedRef.current?.material) {
            statusLedRef.current.material.opacity = Math.sin(elapsed * 2) > 0.3 ? 1 : 0.5
        }
    })

    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Gaming computer front panel details */}
            {/* Power button */}
            <mesh position={[-0.4, 0.15, 0.37]} geometry={sharedGeometries.smallLED}>
                <meshStandardMaterial color={colors.serverGreen} />
            </mesh>
            {/* Status LED - animated via useFrame */}
            <mesh position={[-0.35, 0.15, 0.37]} geometry={sharedGeometries.tinyLED}
                ref={(el: any) => { statusLedRef.current = el }}>
                <meshBasicMaterial color={colors.serverBlue} opacity={0.9} transparent />
            </mesh>
            {/* Front panel vents/grilles */}
            {range(6).map((vent) => (
                <mesh key={`vent-${vent}`}
                    position={[-0.2 + vent * 0.08, -0.1, 0.37]}>
                    <boxGeometry args={[0.06, 0.15, 0.01]} />
                    <meshStandardMaterial color="#0A0A0A" />
                </mesh>
            ))}
            {/* GPU/PCIe slot indicators */}
            {range(3).map((slot) => (
                <mesh key={`slot-${slot}`}
                    position={[0.2 + slot * 0.1, 0, 0.37]}>
                    <boxGeometry args={[0.08, 0.05, 0.01]} />
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
