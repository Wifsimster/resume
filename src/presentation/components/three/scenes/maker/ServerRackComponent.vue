<script setup lang="ts">
import { ref } from 'vue'
import type { ServerUnit, ServerUnitType } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'
import FreeboxUnit from './units/FreeboxUnit.vue'
import UdmProUnit from './units/UdmProUnit.vue'
import SwitchUnit from './units/SwitchUnit.vue'
import AccessPointUnit from './units/AccessPointUnit.vue'
import Silver1UUnit from './units/Silver1UUnit.vue'
import PDUUnit from './units/PDUUnit.vue'
import NASUnit from './units/NASUnit.vue'
import EnclosureUnit from './units/EnclosureUnit.vue'
import UPSUnit from './units/UPSUnit.vue'

interface AnimationState {
    time: number
    fanRotation: number
}

const props = defineProps<{
    visibleRackUnits: ServerUnit[]
    hoveredUnitId: string | null
    anim: AnimationState
    colors: typeof makerColors
}>()

const emit = defineEmits<{
    unitRef: [unitId: string, ref: any]
    rackRef: [ref: any]
}>()

const rackGroupRef = ref()

const handleUnitRef = (unitId: string, el: any) => {
    if (el) {
        emit('unitRef', unitId, el.value || el)
    }
}

const handleRackRef = (el: any) => {
    if (el) {
        rackGroupRef.value = el
        emit('rackRef', el.value || el)
    }
}

// Component mapper for dynamic rendering
const unitComponents: Record<ServerUnitType, any> = {
    'freebox': FreeboxUnit,
    'udm-pro': UdmProUnit,
    'switch': SwitchUnit,
    'ap': AccessPointUnit,
    'silver-1u': Silver1UUnit,
    'pdu': PDUUnit,
    'nas': NASUnit,
    'enclosure': EnclosureUnit,
    'ups': UPSUnit
}

const getUnitComponent = (unitType: ServerUnitType) => {
    return unitComponents[unitType]
}
</script>

<template>
    <TresGroup :position="[1.372, -1.7735, 0.5]" :ref="handleRackRef">
        <!-- Rack frame - Simple black box with open front -->
        <!-- Top -->
        <TresMesh :position="[0, 3.3, 0]">
            <TresBoxGeometry :args="[1.086, 0.05, 1.35]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0.1" />
        </TresMesh>
        <!-- Bottom -->
        <TresMesh :position="[0, 0, 0]">
            <TresBoxGeometry :args="[1.086, 0.05, 1.35]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0.1" />
        </TresMesh>
        <!-- Left side -->
        <TresMesh :position="[-0.518, 1.65, 0]">
            <TresBoxGeometry :args="[0.05, 3.3, 1.35]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0.1" />
        </TresMesh>
        <!-- Right side -->
        <TresMesh :position="[0.518, 1.65, 0]">
            <TresBoxGeometry :args="[0.05, 3.3, 1.35]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0.1" />
        </TresMesh>
        <!-- Back -->
        <TresMesh :position="[0, 1.65, -0.675]">
            <TresBoxGeometry :args="[1.086, 3.3, 0.05]" />
            <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0.1" />
        </TresMesh>

        <!-- Rack rails -->
        <TresMesh :position="[-0.54, 1.65, 0.3]">
            <TresBoxGeometry :args="[0.04, 3.1, 0.04]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" :metalness="0.8" />
        </TresMesh>
        <TresMesh :position="[0.54, 1.65, 0.3]">
            <TresBoxGeometry :args="[0.04, 3.1, 0.04]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" :metalness="0.8" />
        </TresMesh>

        <!-- Server units - Actual equipment (inside the rack) -->
        <TresGroup v-for="unit in visibleRackUnits" :key="`unit-${unit.id}`" :position="[0, unit.y, 0.4]"
            :ref="(el: any) => handleUnitRef(unit.id, el)">
            <component :is="getUnitComponent(unit.type)" :unit="unit" :is-hovered="hoveredUnitId === unit.id"
                :anim="anim" :colors="colors" />
        </TresGroup>

        <!-- Top cooling unit (inside the rack, at the top) -->
        <TresGroup :position="[0, 3.15, 0]">
            <TresMesh>
                <TresBoxGeometry :args="[0.965, 0.15, 0.7875]" />
                <TresMeshStandardMaterial :color="'#1A1A1A'" :metalness="0.6" />
            </TresMesh>
            <!-- Fans -->
            <TresGroup v-for="fan in 2" :key="`top-fan-${fan}`" :position="[-0.241 + fan * 0.482, 0.08, 0]"
                :rotation="[-Math.PI / 2, 0, anim.fanRotation * (fan % 2 === 0 ? 1 : -1)]">
                <TresMesh>
                    <TresCircleGeometry :args="[0.25, 16]" />
                    <TresMeshStandardMaterial :color="'#2D2D2D'" />
                </TresMesh>
                <TresMesh :position="[0, 0, 0.01]">
                    <TresRingGeometry :args="[0.05, 0.22, 16]" />
                    <TresMeshBasicMaterial :color="'#37474F'" />
                </TresMesh>
                <!-- Fan blades -->
                <TresMesh v-for="blade in 5" :key="`blade-${fan}-${blade}`"
                    :rotation="[0, 0, blade * (Math.PI * 2 / 5)]">
                    <TresPlaneGeometry :args="[0.04, 0.18]" />
                    <TresMeshBasicMaterial :color="'#455A64'" :side="2" />
                </TresMesh>
            </TresGroup>
        </TresGroup>

        <!-- Rear network ports glow (on the back panel) -->
        <TresGroup :position="[0, 1.65, -0.675]">
            <TresMesh v-for="port in 4" :key="`net-port-${port}`" :position="[-0.241 + port * 0.151, 0, 0.03]">
                <TresSphereGeometry :args="[0.03, 6, 6]" />
                <TresMeshBasicMaterial :color="port % 2 === 0 ? colors.serverGreen : colors.led"
                    :opacity="Math.sin(anim.time * (5 + port) + port * 2) > 0.3 ? 1 : 0.2" :transparent="true" />
            </TresMesh>
        </TresGroup>
    </TresGroup>
</template>
