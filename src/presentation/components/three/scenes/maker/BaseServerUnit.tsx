import type { ReactNode } from 'react'
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'

interface Props {
    unit: ServerUnit
    isHovered: boolean
    colors: typeof makerColors
    children?: ReactNode
}

export default function BaseServerUnit({ unit, isHovered, children }: Props) {
    return (
        <>
            {unit.type === 'freebox' ? (
                <mesh>
                    <boxGeometry args={[0.9045, unit.height, 0.495]} />
                    <meshStandardMaterial color={isHovered ? '#B87333' : unit.color} roughness={0.4}
                        metalness={0.3} emissive={isHovered ? '#B87333' : '#000000'}
                        emissiveIntensity={isHovered ? 0.2 : 0} />
                </mesh>
            ) : (
                <mesh>
                    <boxGeometry args={[0.9045, unit.height, 0.7875]} />
                    <meshStandardMaterial color={isHovered ? '#B87333' : unit.color} roughness={0.35}
                        metalness={unit.type === 'silver-1u' ? 0.8 : 0.6}
                        emissive={isHovered ? '#B87333' : '#000000'}
                        emissiveIntensity={isHovered ? 0.2 : 0} />
                </mesh>
            )}

            <mesh position={[0, 0, 0.405]}>
                <boxGeometry args={[0.87435, Math.max(unit.height - 0.02, 0.04), 0.02]} />
                <meshStandardMaterial
                    color={unit.type === 'pdu' ? '#1A1A1A' : unit.color === '#FFFFFF' ? '#F5F5F5' : '#1A1A1A'}
                    roughness={0.25} metalness={0.8} />
            </mesh>

            {children}
        </>
    )
}
