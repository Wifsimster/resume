<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import MakerScene from '@presentation/components/three/scenes/MakerScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { quality } = useQuality()
const { unlock } = useAchievements()

const techStack = [
  { icon: '🔌', label: 'ESP8266' },
  { icon: '🍓', label: 'Raspberry Pi' },
  { icon: '💡', label: 'LED WS2812' },
  { icon: '🏠', label: 'Home Assistant' },
  { icon: '🪵', label: 'Woodworking' }
]

// Unlock maker fan achievement when section becomes visible
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          unlock('makerFan')
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )
  
  const section = document.querySelector('[data-section="maker"]')
  if (section) {
    observer.observe(section)
  }
})
</script>

<template>
  <section class="section bg-transparent relative" data-section="maker">
    <!-- 3D Canvas - Full background -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <MakerScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Compact Content Overlay -->
    <div class="section-content flex items-end justify-center pb-12 pointer-events-none">
      <div class="bg-[#0A0A0A]/75 backdrop-blur-md border border-white/8 rounded-2xl py-6 px-8 max-w-[700px] pointer-events-auto md:mx-4 md:py-5 md:px-6">
        <div class="text-center mb-4">
          <h2 class="text-(--color-copper) mb-2">{{ t('maker.title') }}</h2>
          <p class="font-(--font-display) text-2xl text-white/70">{{ t('maker.subtitle') }}</p>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="tech in techStack" 
            :key="tech.label"
            class="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white/5 border border-white/10 rounded-full text-sm text-(--color-paper-cream) transition-all duration-200 hover:bg-white/10 hover:border-(--color-copper)"
          >
            <span class="text-base">{{ tech.icon }}</span>
            <span class="text-xs">{{ tech.label }}</span>
          </span>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <span class="text-xs text-white/60 py-1 px-2.5 bg-[#B87333]/15 rounded whitespace-nowrap">🚿 Italian Shower</span>
          <span class="text-xs text-white/60 py-1 px-2.5 bg-[#B87333]/15 rounded whitespace-nowrap">💡 Ambilight</span>
          <span class="text-xs text-white/60 py-1 px-2.5 bg-[#B87333]/15 rounded whitespace-nowrap">🤖 Domotics</span>
          <span class="text-xs text-white/60 py-1 px-2.5 bg-[#B87333]/15 rounded whitespace-nowrap">🖥️ Self-Hosting</span>
        </div>
      </div>
    </div>
  </section>
</template>
