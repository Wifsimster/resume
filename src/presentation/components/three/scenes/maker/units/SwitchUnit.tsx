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

export default function SwitchUnit({ unit, isHovered, colors }: Props) {
    const ledRefs = useRef<any[]>([])

    useFrame(({ clock }) => {
        const elapsed = clock.elapsedTime
        for (let i = 0; i < ledRefs.current.length; i++) {
            const led = ledRefs.current[i]
            if (led?.material) {
                const ledNum = i + 1
                led.material.opacity = Math.sin(elapsed * (2 + ledNum * 0.3) + ledNum) > 0.3 ? 1 : 0.3
            }
        }
    })

    return (
        <BaseServerUnit unit={unit} isHovered={isHovered} colors={colors}>
            {range(12).map((port) => (
                <mesh key={`port-${port}`}
                    position={[-0.362 + (port % 6) * 0.121, -0.15 + Math.floor(port / 6) * 0.3, 0.37]}
                    material={sharedMaterials.darkMetal}>
                    <boxGeometry args={[0.08, 0.06, 0.02]} />
                </mesh>
            ))}
            {range(12).map((led) => (
                <mesh key={`switch-led-${led}`}
                    position={[-0.362 + (led % 6) * 0.121, -0.12 + Math.floor(led / 6) * 0.3, 0.38]}
                    geometry={sharedGeometries.tinyLED}
                    ref={(el: any) => { if (el) ledRefs.current[led - 1] = el }}>
                    <meshBasicMaterial color={led % 3 === 0 ? '#00FF00' : '#0088FF'} opacity={0.9} transparent />
                </mesh>
            ))}
        </BaseServerUnit>
    )
}
