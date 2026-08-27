import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Object3D } from 'three'
import type { ServerUnit, ServerUnitType } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import { sharedMaterials, sharedGeometries } from '@application/hooks/useSharedGeometries'
import FreeboxUnit from './units/FreeboxUnit'
import PatchPanelUnit from './units/PatchPanelUnit'
import UdmProUnit from './units/UdmProUnit'
import SwitchUnit from './units/SwitchUnit'
import AccessPointUnit from './units/AccessPointUnit'
import Silver1UUnit from './units/Silver1UUnit'
import ElectricSwitchesUnit from './units/ElectricSwitchesUnit'
import PDUUnit from './units/PDUUnit'
import NASUnit from './units/NASUnit'
import EnclosureUnit from './units/EnclosureUnit'
import UPSUnit from './units/UPSUnit'
import GamingComputerUnit from './units/GamingComputerUnit'

interface AnimationState {
    time: number
    fanRotation: number
}

interface Props {
    visibleRackUnits: ServerUnit[]
    hoveredUnitId: string | null
    anim: AnimationState
    colors: typeof makerColors
    onUnitRef?: (unitId: string, ref: Object3D) => void
    onRackRef?: (ref: Object3D) => void
}

// Component mapper for dynamic rendering
const unitComponents: Record<ServerUnitType, any> = {
    'freebox': FreeboxUnit,
    'patch-panel': PatchPanelUnit,
    'udm-pro': UdmProUnit,
    'switch': SwitchUnit,
    'ap': AccessPointUnit,
    'silver-1u': Silver1UUnit,
    'electric-switches': ElectricSwitchesUnit,
    'pdu': PDUUnit,
    'nas': NASUnit,
    'enclosure': EnclosureUnit,
    'ups': UPSUnit,
    'gaming-computer': GamingComputerUnit
}

const getUnitComponent = (unitType: ServerUnitType) => {
    return unitComponents[unitType]
}

// Equivalent of Vue's `v-for="x in n"`: [1..n]
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1)

export default function ServerRackComponent({ visibleRackUnits, hoveredUnitId, anim, colors, onUnitRef, onRackRef }: Props) {
    // Direct Three.js refs for animation (bypasses React reactivity)
    const fanGroupRefs = useRef<any[]>([])
    const ledMeshRefs = useRef<any[]>([])

    // Cooling fans spin (alternating direction) and rear port LEDs blink.
    // Runs on the R3F render loop and mutates Three objects directly, so no
    // React re-render is triggered per frame.
    useFrame(({ clock }) => {
        const elapsed = clock.elapsedTime
        const fanRotation = elapsed * 8
        for (let i = 0; i < fanGroupRefs.current.length; i++) {
            const fanGroup = fanGroupRefs.current[i]
            if (fanGroup) {
                fanGroup.rotation.z = fanRotation * (i % 2 === 0 ? 1 : -1)
            }
        }
        for (let i = 0; i < ledMeshRefs.current.length; i++) {
            const led = ledMeshRefs.current[i]
            if (led?.material) {
                led.material.opacity = Math.sin(elapsed * (5 + i) + i * 2) > 0.3 ? 1 : 0.2
            }
        }
    })

    const rackGroupRef = useRef<Object3D | null>(null)

    const handleUnitRef = (unitId: string, el: Object3D | null) => {
        if (el) {
            onUnitRef?.(unitId, el)
        }
    }

    const handleRackRef = (el: Object3D | null) => {
        if (el) {
            rackGroupRef.current = el
            onRackRef?.(el)
        }
    }

    return (
        <group position={[1.372, -1.7735, 0.5]} ref={(el) => { handleRackRef(el) }}>
            {/* Rack frame - Simple black box with open front */}
            {/* Using shared materials for better GPU batching */}
            {/* Top */}
            <mesh position={[0, 3.3, 0]} material={sharedMaterials.darkMetal}>
                <boxGeometry args={[1.086, 0.05, 1.35]} />
            </mesh>
            {/* Bottom */}
            <mesh position={[0, 0, 0]} material={sharedMaterials.darkMetal}>
                <boxGeometry args={[1.086, 0.05, 1.35]} />
            </mesh>
            {/* Left side */}
            <mesh position={[-0.518, 1.65, 0]} material={sharedMaterials.darkMetal}>
                <boxGeometry args={[0.05, 3.3, 1.35]} />
            </mesh>
            {/* Right side */}
            <mesh position={[0.518, 1.65, 0]} material={sharedMaterials.darkMetal}>
                <boxGeometry args={[0.05, 3.3, 1.35]} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 1.65, -0.675]} material={sharedMaterials.darkMetal}>
                <boxGeometry args={[1.086, 3.3, 0.05]} />
            </mesh>

            {/* Rack rails */}
            <mesh position={[-0.54, 1.65, 0.3]} material={sharedMaterials.darkMetal2}>
                <boxGeometry args={[0.04, 3.1, 0.04]} />
            </mesh>
            <mesh position={[0.54, 1.65, 0.3]} material={sharedMaterials.darkMetal2}>
                <boxGeometry args={[0.04, 3.1, 0.04]} />
            </mesh>

            {/* Server units - Actual equipment (inside the rack) */}
            {visibleRackUnits.map((unit) => {
                const UnitComponent = getUnitComponent(unit.type)
                return (
                    <group key={`unit-${unit.id}`} position={[0, unit.y, 0.4]}
                        ref={(el) => { handleUnitRef(unit.id, el) }}>
                        <UnitComponent unit={unit} isHovered={hoveredUnitId === unit.id}
                            anim={anim} colors={colors} />
                    </group>
                )
            })}

            {/* Top cooling unit (inside the rack, at the top) */}
            <group position={[0, 3.15, 0]}>
                <mesh material={sharedMaterials.darkMetal2}>
                    <boxGeometry args={[0.965, 0.15, 0.7875]} />
                </mesh>
                {/* Fans - animated via useFrame, not React reactivity */}
                {range(2).map((fan) => (
                    <group key={`top-fan-${fan}`} position={[-0.241 + fan * 0.482, 0.08, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        ref={(el) => { if (el) fanGroupRefs.current[fan - 1] = el }}>
                        <mesh material={sharedMaterials.darkMetal3}>
                            <circleGeometry args={[0.25, 12]} />
                        </mesh>
                        <mesh position={[0, 0, 0.01]}>
                            <ringGeometry args={[0.05, 0.22, 12]} />
                            <meshBasicMaterial color="#37474F" />
                        </mesh>
                        {/* Fan blades */}
                        {range(5).map((blade) => (
                            <mesh key={`blade-${fan}-${blade}`}
                                rotation={[0, 0, blade * (Math.PI * 2 / 5)]}>
                                <planeGeometry args={[0.04, 0.18]} />
                                <meshBasicMaterial color="#455A64" side={2} />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* Rear network ports glow - animated via useFrame, not React reactivity */}
            <group position={[0, 1.65, -0.675]}>
                {range(4).map((port) => (
                    <mesh key={`net-port-${port}`} position={[-0.241 + port * 0.151, 0, 0.03]}
                        geometry={sharedGeometries.smallLED}
                        ref={(el) => { if (el) ledMeshRefs.current[port - 1] = el }}>
                        <meshBasicMaterial color={port % 2 === 0 ? colors.serverGreen : colors.led}
                            opacity={0.9} transparent />
                    </mesh>
                ))}
            </group>
        </group>
    )
}
