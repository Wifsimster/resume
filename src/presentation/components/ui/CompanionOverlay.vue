<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import CompanionScene from '@presentation/components/three/CompanionScene.vue'

// Fixed, fully transparent Three.js overlay hosting the space companion.
// Always rendered: it is decoration the site's identity is built around, and
// the OS-level reduced-motion setting was silently hiding it on desktops.
// Interaction safety is handled in CSS below.

// On coarse-pointer (touch) devices the overlay renders at DPR 1 without
// MSAA: a full-screen GL layer at retina DPR is a battery cost phones don't
// need for a 44px companion.
const isCoarse = window.matchMedia('(pointer: coarse)').matches
const dpr: [number, number] = isCoarse ? [1, 1] : [1, 1.5]
const antialias = !isCoarse
</script>

<template>
  <div class="companion-overlay fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
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

<style scoped>
/* CRITICAL: TresJS writes inline `pointer-events: auto; touch-action: none`
   on the canvas it creates. Inline styles beat the wrapper's
   pointer-events-none, which made this full-screen overlay swallow every tap
   and block touch scrolling on mobile. !important rules beat inline styles. */
.companion-overlay :deep(canvas) {
  pointer-events: none !important;
  touch-action: auto !important;
}
</style>
