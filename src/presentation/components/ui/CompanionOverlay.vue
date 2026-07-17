<script setup lang="ts">
import { computed } from 'vue'
import { TresCanvas } from '@tresjs/core'
import CompanionScene from '@presentation/components/three/CompanionScene.vue'
import { useQuality } from '@application/composables/useQuality'

// Fixed, fully transparent Three.js overlay hosting the space companion —
// pointer-events: none so it can never block a click. Grounded only by
// prefers-reduced-motion.
const { deviceCapabilities } = useQuality()
const visible = computed(() => !deviceCapabilities.prefersReducedMotion)

// On coarse-pointer (touch) devices the overlay renders at DPR 1 without
// MSAA: a full-screen GL layer at retina DPR is a battery cost phones don't
// need for a 44px companion.
const isCoarse = window.matchMedia('(pointer: coarse)').matches
const dpr: [number, number] = isCoarse ? [1, 1] : [1, 1.5]
const antialias = !isCoarse
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
    <TresCanvas
      :alpha="true"
      :clear-alpha="0"
      :antialias="antialias"
      :dpr="dpr"
      power-preference="low-power"
    >
      <CompanionScene />
    </TresCanvas>
  </div>
</template>
