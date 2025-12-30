<script setup lang="ts">
import type { makerColors } from '@domain/data/makerRack'

defineProps<{
  colors: typeof makerColors
}>()
</script>

<template>
  <TresGroup :position="[-2, 0.08, 0.8]">
    <!-- Main keyboard body - white/cream -->
    <TresMesh>
      <TresBoxGeometry :args="[1.7, 0.07, 0.55]" />
      <TresMeshStandardMaterial :color="'#E8E4DC'" :roughness="0.4" :metalness="0.1" />
    </TresMesh>

    <!-- Keyboard top bezel -->
    <TresMesh :position="[0, 0.04, 0]">
      <TresBoxGeometry :args="[1.65, 0.015, 0.5]" />
      <TresMeshStandardMaterial :color="'#F0EDE5'" :roughness="0.35" :metalness="0.05" />
    </TresMesh>

    <!-- ===== ROTARY KNOB (top right) ===== -->
    <TresGroup :position="[0.72, 0.06, -0.2]">
      <!-- Knob base -->
      <TresMesh>
        <TresCylinderGeometry :args="[0.055, 0.055, 0.03, 24]" />
        <TresMeshStandardMaterial :color="'#C0C0C0'" :roughness="0.2" :metalness="0.8" />
      </TresMesh>
      <!-- Knob top -->
      <TresMesh :position="[0, 0.025, 0]">
        <TresCylinderGeometry :args="[0.05, 0.05, 0.02, 24]" />
        <TresMeshStandardMaterial :color="'#A0A0A0'" :roughness="0.15" :metalness="0.9" />
      </TresMesh>
      <!-- Knob grip lines -->
      <TresMesh v-for="line in 12" :key="`knob-${line}`"
        :position="[Math.cos(line * Math.PI / 6) * 0.048, 0.025, Math.sin(line * Math.PI / 6) * 0.048]">
        <TresBoxGeometry :args="[0.004, 0.015, 0.008]" />
        <TresMeshStandardMaterial :color="'#707070'" :metalness="0.7" />
      </TresMesh>
    </TresGroup>

    <!-- ===== ESCAPE KEY (dark navy) ===== -->
    <TresMesh :position="[-0.75, 0.055, -0.2]">
      <TresBoxGeometry :args="[0.08, 0.035, 0.065]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.5" />
    </TresMesh>

    <!-- ===== FUNCTION ROW ===== -->
    <!-- F1-F4 (light) -->
    <TresMesh v-for="key in 4" :key="`f1-4-${key}`" :position="[-0.58 + key * 0.095, 0.055, -0.2]">
      <TresBoxGeometry :args="[0.07, 0.03, 0.055]" />
      <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
    </TresMesh>
    <!-- F5-F8 (gray-blue) -->
    <TresMesh v-for="key in 4" :key="`f5-8-${key}`" :position="[-0.2 + key * 0.095, 0.055, -0.2]">
      <TresBoxGeometry :args="[0.07, 0.03, 0.055]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- F9-F12 (light) -->
    <TresMesh v-for="key in 4" :key="`f9-12-${key}`" :position="[0.18 + key * 0.095, 0.055, -0.2]">
      <TresBoxGeometry :args="[0.07, 0.03, 0.055]" />
      <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
    </TresMesh>

    <!-- ===== NUMBER ROW (white keys) ===== -->
    <TresMesh v-for="key in 13" :key="`num-${key}`" :position="[-0.72 + key * 0.095, 0.055, -0.1]">
      <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
    </TresMesh>
    <!-- Backspace (gray-blue) -->
    <TresMesh :position="[0.58, 0.055, -0.1]">
      <TresBoxGeometry :args="[0.12, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Delete -->
    <TresMesh :position="[0.72, 0.055, -0.1]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>

    <!-- ===== QWERTY ROW ===== -->
    <!-- Tab (gray-blue) -->
    <TresMesh :position="[-0.75, 0.055, 0]">
      <TresBoxGeometry :args="[0.1, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Letter keys (white) -->
    <TresMesh v-for="key in 12" :key="`qwerty-${key}`" :position="[-0.6 + key * 0.095, 0.055, 0]">
      <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
    </TresMesh>
    <!-- PgUp -->
    <TresMesh :position="[0.72, 0.055, 0]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>

    <!-- ===== HOME ROW ===== -->
    <!-- Caps Lock (gray-blue) -->
    <TresMesh :position="[-0.73, 0.055, 0.09]">
      <TresBoxGeometry :args="[0.12, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Letter keys (white) -->
    <TresMesh v-for="key in 10" :key="`home-${key}`" :position="[-0.55 + key * 0.095, 0.055, 0.09]">
      <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
    </TresMesh>
    <!-- Enter (dark navy) -->
    <TresMesh :position="[0.52, 0.055, 0.09]">
      <TresBoxGeometry :args="[0.14, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
    </TresMesh>
    <!-- PgDn -->
    <TresMesh :position="[0.72, 0.055, 0.09]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>

    <!-- ===== BOTTOM ROW ===== -->
    <!-- Left Shift (gray-blue) -->
    <TresMesh :position="[-0.7, 0.055, 0.18]">
      <TresBoxGeometry :args="[0.15, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Letter keys (white) -->
    <TresMesh v-for="key in 9" :key="`shift-row-${key}`" :position="[-0.5 + key * 0.095, 0.055, 0.18]">
      <TresBoxGeometry :args="[0.075, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#F5F5F0'" :roughness="0.45" />
    </TresMesh>
    <!-- Right Shift -->
    <TresMesh :position="[0.45, 0.055, 0.18]">
      <TresBoxGeometry :args="[0.1, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Up arrow (dark) -->
    <TresMesh :position="[0.58, 0.055, 0.18]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
    </TresMesh>

    <!-- ===== SPACE ROW ===== -->
    <!-- Ctrl, Win, Alt (gray-blue) -->
    <TresMesh v-for="(_key, i) in 3" :key="`mod-left-${i}`" :position="[-0.7 + i * 0.1, 0.055, 0.27]">
      <TresBoxGeometry :args="[0.08, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Spacebar (dark navy) -->
    <TresMesh :position="[-0.1, 0.055, 0.27]">
      <TresBoxGeometry :args="[0.45, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
    </TresMesh>
    <!-- Fn, Ctrl right (gray-blue) -->
    <TresMesh v-for="(_key, i) in 2" :key="`mod-right-${i}`" :position="[0.22 + i * 0.1, 0.055, 0.27]">
      <TresBoxGeometry :args="[0.08, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#B8C5D0'" :roughness="0.45" />
    </TresMesh>
    <!-- Arrow keys (dark) -->
    <TresMesh :position="[0.45, 0.055, 0.27]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
    </TresMesh>
    <TresMesh :position="[0.58, 0.055, 0.27]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
    </TresMesh>
    <TresMesh :position="[0.71, 0.055, 0.27]">
      <TresBoxGeometry :args="[0.07, 0.035, 0.07]" />
      <TresMeshStandardMaterial :color="'#2C3E50'" :roughness="0.45" />
    </TresMesh>
  </TresGroup>
</template>

