<script setup lang="ts">
import type { ServerUnit } from '@domain/types/makerRack'
import type { makerColors } from '@domain/data/makerRack'

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
            <!-- Unit chassis with hover effect -->
            <!-- Freebox has custom dimensions: 180 x 45 x 190 mm, depth scaled proportionally -->
            <TresMesh v-if="unit.type === 'freebox'">
                <TresBoxGeometry :args="[1.5, unit.height, 0.44]" />
                <TresMeshStandardMaterial :color="hoveredUnitId === unit.id ? '#B87333' : unit.color" :roughness="0.4"
                    :metalness="0.3" :emissive="hoveredUnitId === unit.id ? '#B87333' : '#000000'"
                    :emissive-intensity="hoveredUnitId === unit.id ? 0.2 : 0" />
            </TresMesh>
            <TresMesh v-else>
                <TresBoxGeometry :args="[1.5, unit.height, 0.7]" />
                <TresMeshStandardMaterial :color="hoveredUnitId === unit.id ? '#B87333' : unit.color" :roughness="0.35"
                    :metalness="unit.type === 'silver-1u' ? 0.8 : 0.6"
                    :emissive="hoveredUnitId === unit.id ? '#B87333' : '#000000'"
                    :emissive-intensity="hoveredUnitId === unit.id ? 0.2 : 0" />
            </TresMesh>

            <!-- Unit front plate -->
            <TresMesh :position="[0, 0, 0.36]">
                <TresBoxGeometry :args="[1.45, unit.height - 0.1, 0.02]" />
                <TresMeshStandardMaterial
                    :color="unit.type === 'pdu' ? '#1A1A1A' : unit.color === '#FFFFFF' ? '#F5F5F5' : '#1A1A1A'"
                    :roughness="0.25" :metalness="0.8" />
            </TresMesh>

            <!-- Freebox mini 4K specific details -->
            <template v-if="unit.type === 'freebox'">
                <!-- LCD display on the left showing "13 37" in yellow-green -->
                <TresMesh :position="[-0.6, 0, 0.37]">
                    <TresPlaneGeometry :args="[0.25, 0.25]" />
                    <TresMeshBasicMaterial :color="'#0A0A0A'" />
                </TresMesh>
                <!-- LCD numbers background (yellow-green glow for "13 37") -->
                <TresMesh :position="[-0.6, 0.05, 0.371]">
                    <TresPlaneGeometry :args="[0.2, 0.15]" />
                    <TresMeshBasicMaterial :color="'#ADFF2F'" :opacity="0.4" :transparent="true" />
                </TresMesh>

                <!-- Directional pad in center -->
                <!-- Up arrow button -->
                <TresMesh :position="[0, 0.08, 0.37]">
                    <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
                    <TresMeshStandardMaterial :color="'#1A1A1A'" />
                </TresMesh>
                <!-- Down arrow button -->
                <TresMesh :position="[0, -0.08, 0.37]">
                    <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
                    <TresMeshStandardMaterial :color="'#1A1A1A'" />
                </TresMesh>
                <!-- Left arrow button -->
                <TresMesh :position="[-0.08, 0, 0.37]">
                    <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
                    <TresMeshStandardMaterial :color="'#1A1A1A'" />
                </TresMesh>
                <!-- Right arrow button -->
                <TresMesh :position="[0.08, 0, 0.37]">
                    <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
                    <TresMeshStandardMaterial :color="'#1A1A1A'" />
                </TresMesh>
                <!-- Center OK button (square, slightly larger) -->
                <TresMesh :position="[0, 0, 0.37]">
                    <TresBoxGeometry :args="[0.06, 0.06, 0.01]" />
                    <TresMeshStandardMaterial :color="'#2D2D2D'" />
                </TresMesh>

                <!-- Back/Menu button (circular with curved arrow) to the right of pad -->
                <TresMesh :position="[0.2, 0, 0.37]">
                    <TresCylinderGeometry :args="[0.04, 0.04, 0.01, 16]" />
                    <TresMeshStandardMaterial :color="'#1A1A1A'" />
                </TresMesh>

                <!-- Freebox logo text on the far right -->
                <TresMesh :position="[0.5, 0, 0.37]">
                    <TresPlaneGeometry :args="[0.25, 0.08]" />
                    <TresMeshBasicMaterial :color="'#FFFFFF'" :opacity="0.9" :transparent="true" />
                </TresMesh>
            </template>

            <!-- UDM Pro specific details -->
            <template v-if="unit.type === 'udm-pro'">
                <!-- Status LED -->
                <TresMesh :position="[0.6, 0.1, 0.38]">
                    <TresSphereGeometry :args="[0.03, 8, 8]" />
                    <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.9" :transparent="true" />
                </TresMesh>
                <!-- Small display area -->
                <TresMesh :position="[-0.3, 0, 0.37]">
                    <TresPlaneGeometry :args="[0.4, 0.15]" />
                    <TresMeshBasicMaterial :color="'#0A0A0A'" />
                </TresMesh>
            </template>

            <!-- Switch specific details -->
            <template v-if="unit.type === 'switch'">
                <!-- Ethernet ports with indicator lights -->
                <TresMesh v-for="port in 12" :key="`port-${port}`"
                    :position="[-0.6 + (port % 6) * 0.2, -0.15 + Math.floor(port / 6) * 0.3, 0.37]">
                    <TresBoxGeometry :args="[0.08, 0.06, 0.02]" />
                    <TresMeshStandardMaterial :color="'#0A0A0A'" />
                </TresMesh>
                <!-- Port indicator lights -->
                <TresMesh v-for="led in 12" :key="`switch-led-${led}`"
                    :position="[-0.6 + (led % 6) * 0.2, -0.12 + Math.floor(led / 6) * 0.3, 0.38]">
                    <TresSphereGeometry :args="[0.015, 6, 6]" />
                    <TresMeshBasicMaterial :color="led % 3 === 0 ? colors.serverGreen : colors.wifi"
                        :opacity="Math.sin(anim.time * (2 + led * 0.3) + led) > 0.3 ? 1 : 0.3" :transparent="true" />
                </TresMesh>
            </template>

            <!-- Access Point specific details -->
            <template v-if="unit.type === 'ap'">
                <!-- Circular AP design -->
                <TresMesh :position="[0, 0, 0.36]">
                    <TresCylinderGeometry :args="[0.3, 0.3, 0.02, 32]" />
                    <TresMeshStandardMaterial :color="'#FFFFFF'" :roughness="0.3" />
                </TresMesh>
                <!-- Status LED -->
                <TresMesh :position="[0, 0.1, 0.38]">
                    <TresSphereGeometry :args="[0.02, 8, 8]" />
                    <TresMeshBasicMaterial :color="colors.wifi" :opacity="0.9" :transparent="true" />
                </TresMesh>
            </template>

            <!-- Silver 1U device -->
            <template v-if="unit.type === 'silver-1u'">
                <!-- Status LEDs -->
                <TresMesh :position="[0.5, 0.08, 0.38]">
                    <TresSphereGeometry :args="[0.02, 6, 6]" />
                    <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.9" :transparent="true" />
                </TresMesh>
            </template>

            <!-- PDU specific details -->
            <template v-if="unit.type === 'pdu'">
                <!-- 8 red illuminated rocker switches -->
                <TresMesh v-for="switchNum in 8" :key="`pdu-switch-${switchNum}`"
                    :position="[-0.6 + switchNum * 0.15, 0, 0.37]">
                    <TresBoxGeometry :args="[0.1, 0.08, 0.02]" />
                    <TresMeshStandardMaterial :color="'#1A1A1A'" />
                </TresMesh>
                <!-- Red illuminated switches -->
                <TresMesh v-for="switchNum in 8" :key="`pdu-led-${switchNum}`"
                    :position="[-0.6 + switchNum * 0.15, 0.05, 0.38]">
                    <TresSphereGeometry :args="[0.02, 6, 6]" />
                    <TresMeshBasicMaterial :color="'#F44336'" :opacity="0.9" :transparent="true" />
                </TresMesh>
            </template>

            <!-- NAS (SilverStone) specific details -->
            <template v-if="unit.type === 'nas'">
                <!-- SilverStone logo area -->
                <TresMesh :position="[0.5, 0, 0.37]">
                    <TresPlaneGeometry :args="[0.2, 0.1]" />
                    <TresMeshBasicMaterial :color="'#2D2D2D'" />
                </TresMesh>
                <!-- Blue LED indicators -->
                <TresMesh v-for="led in 4" :key="`nas-led-${led}`" :position="[-0.5 + led * 0.25, 0.15, 0.38]">
                    <TresSphereGeometry :args="[0.02, 6, 6]" />
                    <TresMeshBasicMaterial :color="colors.serverBlue"
                        :opacity="Math.sin(anim.time * (2 + led) + led) > 0.3 ? 1 : 0.4" :transparent="true" />
                </TresMesh>
                <!-- Drive bays -->
                <TresMesh v-for="bay in 4" :key="`nas-bay-${bay}`" :position="[-0.5 + bay * 0.25, -0.15, 0.37]">
                    <TresBoxGeometry :args="[0.18, 0.12, 0.02]" />
                    <TresMeshStandardMaterial :color="'#2D2D2D'" :metalness="0.5" />
                </TresMesh>
            </template>

            <!-- Enclosure specific details -->
            <template v-if="unit.type === 'enclosure'">
                <!-- Blue indicator lights in two rows -->
                <TresMesh v-for="led in 8" :key="`enclosure-led-${led}`"
                    :position="[-0.4 + (led % 4) * 0.25, 0.1 - Math.floor(led / 4) * 0.2, 0.38]">
                    <TresSphereGeometry :args="[0.02, 6, 6]" />
                    <TresMeshBasicMaterial :color="colors.serverBlue"
                        :opacity="Math.sin(anim.time * (1.5 + led * 0.2) + led) > 0.3 ? 1 : 0.3" :transparent="true" />
                </TresMesh>
            </template>

            <!-- UPS specific details -->
            <template v-if="unit.type === 'ups'">
                <!-- Status display -->
                <TresMesh :position="[0, 0.1, 0.37]">
                    <TresPlaneGeometry :args="[0.4, 0.15]" />
                    <TresMeshBasicMaterial :color="colors.serverGreen" :opacity="0.8" :transparent="true" />
                </TresMesh>
                <!-- Battery status LEDs -->
                <TresMesh v-for="bat in 5" :key="`ups-bat-${bat}`" :position="[-0.5 + bat * 0.12, -0.1, 0.38]">
                    <TresSphereGeometry :args="[0.02, 6, 6]" />
                    <TresMeshBasicMaterial :color="bat < 4 ? colors.serverGreen : colors.led"
                        :opacity="bat < 4 ? 0.9 : 0.3" :transparent="true" />
                </TresMesh>
            </template>
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
