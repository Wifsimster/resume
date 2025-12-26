<script setup lang="ts">
import { useFPS } from '@application/composables/useFPS'

const { fps, enabled, start, stop } = useFPS()

defineExpose({
  start,
  stop,
  enabled
})
</script>

<template>
  <div
    v-if="enabled"
    class="fixed bottom-4 left-4 z-100 bg-[#1E1E1E]/90 backdrop-blur-md border border-(--color-border) rounded-lg px-3 py-2 font-(--font-code) text-xs text-(--color-text-primary) shadow-lg"
  >
    <div class="flex items-center gap-2">
      <span class="text-(--color-accent-primary)">FPS:</span>
      <span 
        class="font-bold"
        :class="{
          'text-green-400': fps >= 55,
          'text-yellow-400': fps >= 30 && fps < 55,
          'text-red-400': fps < 30
        }"
      >
        {{ fps }}
      </span>
    </div>
  </div>
</template>

