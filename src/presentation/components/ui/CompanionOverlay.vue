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
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
    <TresCanvas
      :alpha="true"
      :clear-alpha="0"
      :antialias="true"
      :dpr="[1, 1.5]"
      power-preference="low-power"
    >
      <CompanionScene />
    </TresCanvas>
  </div>
</template>
