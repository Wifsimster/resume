<script setup lang="ts">
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
}>()

const handleUnitRef = (unitId: string, el: any) => {
    if (el) {
        emit('unitRef', unitId, el.value || el)
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
    <TresGroup :position="[3, 0, -0.5]">
        <!-- Rack frame -->
        <TresMesh :position="[0, 1.2, 0]">
            <TresBoxGeometry :args="[1.8, 4, 1.2]" />
            <TresMeshStandardMaterial :color="'#212121'" :roughness="0.4" :metalness="0.7" />
        </TresMesh>

        <!-- Rack front panel -->
        <TresMesh :position="[0, 1.2, 0.62]">
            <TresBoxGeometry :args="[1.7, 3.9, 0.02]" />
            <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.3" :metalness="0.8" />
        </TresMesh>

        <!-- Ventilation holes pattern -->
        <TresMesh v-for="(_row, ri) in 12" :key="`vent-row-${ri}`" :position="[-0.5, -0.4 + ri * 0.28, 0.64]">
            <TresPlaneGeometry :args="[0.3, 0.08]" />
            <TresMeshBasicMaterial :color="'#0A0A0A'" />
        </TresMesh>

        <!-- Server units - Actual equipment -->
        <TresGroup v-for="unit in visibleRackUnits" :key="`unit-${unit.id}`" :position="[0, unit.y, 0.4]"
            :ref="(el: any) => handleUnitRef(unit.id, el)">
            <component :is="getUnitComponent(unit.type)" :unit="unit" :is-hovered="hoveredUnitId === unit.id"
                :anim="anim" :colors="colors" />
        </TresGroup>

        <!-- Rack rails -->
        <TresMesh :position="[-0.85, 1.2, 0.3]">
            <TresBoxGeometry :args="[0.04, 3.8, 0.04]" />
            <TresMeshStandardMaterial :color="'#424242'" :metalness="0.8" />
        </TresMesh>
        <TresMesh :position="[0.85, 1.2, 0.3]">
            <TresBoxGeometry :args="[0.04, 3.8, 0.04]" />
            <TresMeshStandardMaterial :color="'#424242'" :metalness="0.8" />
        </TresMesh>

        <!-- Top cooling unit -->
        <TresGroup :position="[0, 3.4, 0]">
            <TresMesh>
                <TresBoxGeometry :args="[1.6, 0.3, 1]" />
                <TresMeshStandardMaterial :color="'#1A1A1A'" :metalness="0.6" />
            </TresMesh>
            <!-- Fans -->
            <TresGroup v-for="fan in 2" :key="`top-fan-${fan}`" :position="[-0.4 + fan * 0.8, 0.16, 0]"
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

        <!-- Rear network ports glow -->
        <TresGroup :position="[0, 2.6, -0.65]">
            <TresMesh v-for="port in 4" :key="`net-port-${port}`" :position="[-0.4 + port * 0.25, 0, 0]">
                <TresSphereGeometry :args="[0.03, 6, 6]" />
                <TresMeshBasicMaterial :color="port % 2 === 0 ? colors.serverGreen : colors.led"
                    :opacity="Math.sin(anim.time * (5 + port) + port * 2) > 0.3 ? 1 : 0.2" :transparent="true" />
            </TresMesh>
        </TresGroup>

        <!-- UPS unit at bottom -->
        <TresGroup :position="[0, -0.8, 0]">
            <TresMesh>
                <TresBoxGeometry :args="[1.5, 0.5, 1]" />
                <TresMeshStandardMaterial :color="'#1A1A1A'" :roughness="0.4" />
            </TresMesh>
            <TresMesh :position="[0, 0.1, 0.52]">
                <TresPlaneGeometry :args="[0.4, 0.15]" />
                <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.8" :transparent="true" />
            </TresMesh>
            <!-- Battery status LEDs -->
            <TresMesh v-for="bat in 5" :key="`bat-${bat}`" :position="[-0.5 + bat * 0.12, -0.1, 0.52]">
                <TresSphereGeometry :args="[0.02, 6, 6]" />
                <TresMeshBasicMaterial :color="bat < 4 ? colors.serverGreen : colors.led" :opacity="bat < 4 ? 0.9 : 0.3"
                    :transparent="true" />
            </TresMesh>
        </TresGroup>
    </TresGroup>
</template>
