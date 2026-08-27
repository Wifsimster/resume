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

export default function ElectricSwitchesUnit({ unit, isHovered, colors }: Props) {
    // Direct Three.js refs for LED animation
    const ledRefs = useRef<any[]>([])

    // Switch indicator blink — mutates materials directly on the render loop
    useFrame(({ clock }) => {
        const elapsed = clock.elapsedTime
        for (let i = 0; i < ledRefs.current.length; i++) {
            const led = ledRefs.current[i]
            if (led?.material) {
                const ledNum = i + 1
                led.material.opacity = Math.sin(elapsed * (1 + ledNum * 0.2) + ledNum) > 0.5 ? 1 : 0.4
            }
        }
    })

    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {/* Electric switches (8 toggle switches) */}
            {range(8).map((switchNum) => (
                <mesh key={`switch-${switchNum}`}
                    position={[-0.362 + (switchNum - 1) * 0.103, 0, 0.37]}>
                    <boxGeometry args={[0.08, 0.06, 0.02]} />
                    <meshStandardMaterial color="#1A1A1A" />
                </mesh>
            ))}
            {/* Switch indicators - animated via useFrame */}
            {range(8).map((led) => (
                <mesh key={`switch-led-${led}`}
                    position={[-0.362 + (led - 1) * 0.103, 0.03, 0.38]}
                    geometry={sharedGeometries.tinyLED}
                    ref={(el: any) => { if (el) ledRefs.current[led - 1] = el }}>
                    <meshBasicMaterial color={colors.serverGreen} opacity={0.9} transparent />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
