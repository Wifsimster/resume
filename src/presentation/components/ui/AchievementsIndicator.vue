<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { achievements, unlockedCount, totalCount, progress } = useAchievements()

const isOpen = ref(false)

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const closePanel = () => {
  isOpen.value = false
}

const sortedAchievements = computed(() => {
  return [...achievements.value].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    return 0
  })
})
</script>

<template>
  <div class="relative">
    <button 
      class="flex items-center gap-1.5 py-1.5 px-3 bg-[#1E1E1E]/80 backdrop-blur-md border border-(--color-border) rounded-lg cursor-pointer transition-all duration-150 hover:border-(--color-achievement-gold) hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
      @click="togglePanel"
      :title="t('achievements.viewAll')"
    >
      <span class="text-base animate-trophy-shine">🏆</span>
      <span class="font-(--font-code) text-xs text-(--color-text-secondary)">{{ unlockedCount }}/{{ totalCount }}</span>
    </button>

    <Teleport to="body">
      <Transition name="panel">
        <div 
          v-if="isOpen" 
          class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          @click="closePanel"
        >
          <div 
            class="achievements-panel bg-gradient-to-br from-(--color-bg-tertiary) to-(--color-bg-primary) border-2 border-(--color-border) rounded-2xl sm:rounded-xl w-full max-w-[420px] max-h-[80vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(124,58,237,0.2),0_20px_60px_rgba(0,0,0,0.6)]"
            @click.stop
          >
            <div class="flex items-center justify-between py-4 px-5 border-b border-(--color-border) bg-black/30">
              <h3 class="font-(--font-display) text-xl font-bold text-(--color-achievement-gold) flex items-center gap-2 before:content-['🏆']">{{ t('achievements.title') }}</h3>
              <button 
                class="bg-transparent border-none text-(--color-text-secondary) text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150 hover:bg-white/10 hover:text-(--color-text-primary)"
                @click="closePanel" 
                aria-label="Close"
              >×</button>
            </div>

            <div class="py-4 px-5 flex items-center gap-4 border-b border-(--color-border)">
              <div class="flex-1 h-2 bg-white/10 rounded overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-(--color-achievement-gold) to-amber-500 rounded transition-[width] duration-500 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  :style="{ width: `${progress}%` }"
                />
              </div>
              <span class="font-(--font-code) text-sm text-(--color-achievement-gold) font-semibold min-w-[50px] text-right">{{ unlockedCount }} / {{ totalCount }}</span>
            </div>

            <div class="p-3 overflow-y-auto flex-1">
              <div 
                v-for="achievement in sortedAchievements" 
                :key="achievement.id"
                class="flex items-center gap-3 p-3 rounded-xl bg-white/2 mb-2 last:mb-0 transition-all duration-150 border border-transparent"
                :class="achievement.unlocked 
                  ? 'bg-amber-400/5 border-amber-400/20 hover:bg-amber-400/10 hover:border-amber-400/30' 
                  : 'opacity-50'"
              >
                <div 
                  class="text-[1.75rem] sm:text-2xl w-12 sm:w-10 h-12 sm:h-10 flex items-center justify-center bg-black/30 rounded-xl shrink-0"
                  :class="achievement.unlocked ? 'bg-amber-400/10 animate-icon-glow' : ''"
                >{{ achievement.unlocked ? achievement.icon : '🔒' }}</div>
                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span 
                    class="font-(--font-display) text-[0.95rem] font-semibold"
                    :class="achievement.unlocked ? 'text-(--color-achievement-gold)' : 'text-(--color-text-primary)'"
                  >
                    {{ achievement.unlocked ? t(`achievements.${achievement.id}.name`) : '???' }}
                  </span>
                  <span class="text-xs text-(--color-text-muted) leading-tight">
                    {{ achievement.unlocked ? t(`achievements.${achievement.id}.desc`) : t('achievements.locked') }}
                  </span>
                </div>
                <div 
                  v-if="achievement.unlocked" 
                  class="w-6 h-6 bg-(--color-achievement-gold) text-(--color-bg-primary) rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                >✓</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

