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
    class="fixed top-4 left-4 z-[var(--z-header)] bg-[var(--color-surface-overlay-strong)] backdrop-blur-md border border-[var(--color-border)] rounded-lg px-3 py-2 font-(--font-code) text-xs text-[var(--color-text-primary)] shadow-lg"
  >
    <div class="flex items-center gap-2">
      <span class="text-[var(--color-accent-primary)]">FPS:</span>
      <span 
        class="font-bold"
        :class="{
          'text-[var(--color-success)]': fps >= 55,
          'text-[var(--color-warning)]': fps >= 30 && fps < 55,
          'text-[var(--color-danger)]': fps < 30
        }"
      >
        {{ fps }}
      </span>
    </div>
  </div>
</template>

