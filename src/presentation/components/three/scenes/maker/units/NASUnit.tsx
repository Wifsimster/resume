import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedGeometries, sharedMaterials } from '@application/hooks/useSharedGeometries'
import BaseServerUnit from '../BaseServerUnit'

interface Props {
    unit: ServerUnit
    isHovered: boolean
    colors: typeof makerColors
}

const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function NASUnit({ unit, isHovered, colors }: Props) {
    const ledRefs = useRef<any[]>([])

    useFrame(({ clock }) => {
        const elapsed = clock.elapsedTime
        for (let i = 0; i < ledRefs.current.length; i++) {
            const led = ledRefs.current[i]
            if (led?.material) {
                const ledNum = i + 1
                led.material.opacity = Math.sin(elapsed * (2 + ledNum) + ledNum) > 0.3 ? 1 : 0.4
            }
        }
    })

    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            <mesh position={[0.302, 0, 0.37]}>
                <planeGeometry args={[0.2, 0.1]} />
                <meshBasicMaterial color="#2D2D2D" />
            </mesh>
            {range(4).map((led) => (
                <mesh key={`nas-led-${led}`} position={[-0.302 + led * 0.151, 0.15, 0.38]}
                    geometry={sharedGeometries.smallLED}
                    ref={(el: any) => { if (el) ledRefs.current[led - 1] = el }}>
                    <meshBasicMaterial color={colors.serverBlue} opacity={0.9} transparent />
                </mesh>
            ))}
            {range(4).map((bay) => (
                <mesh key={`nas-bay-${bay}`} position={[-0.302 + bay * 0.151, -0.15, 0.37]}
                    material={sharedMaterials.darkMetal3}>
                    <boxGeometry args={[0.18, 0.12, 0.02]} />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
