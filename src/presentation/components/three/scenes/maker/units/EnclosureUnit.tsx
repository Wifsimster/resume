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

const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function EnclosureUnit({ unit, isHovered, colors }: Props) {
    const ledRefs = useRef<any[]>([])

    useFrame(({ clock }) => {
        const elapsed = clock.elapsedTime
        for (let i = 0; i < ledRefs.current.length; i++) {
            const led = ledRefs.current[i]
            if (led?.material) {
                const ledNum = i + 1
                led.material.opacity = Math.sin(elapsed * (1.5 + ledNum * 0.2) + ledNum) > 0.3 ? 1 : 0.3
            }
        }
    })

    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {range(8).map((led) => (
                <mesh key={`enclosure-led-${led}`}
                    position={[-0.241 + (led % 4) * 0.151, 0.1 - Math.floor(led / 4) * 0.2, 0.38]}
                    geometry={sharedGeometries.smallLED}
                    ref={(el: any) => { if (el) ledRefs.current[led - 1] = el }}>
                    <meshBasicMaterial color={colors.serverBlue} opacity={0.9} transparent />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
