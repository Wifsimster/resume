<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import HeroScene from '@presentation/components/three/scenes/HeroScene.vue'
import { useScrollSection } from '@application/composables/useScrollSection'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { scrollToNext } = useScrollSection()
const { quality, renderSettings } = useQuality()

const isLoaded = ref(false)
const isMounted = ref(false)

const currentDate = computed(() => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
})

onMounted(() => {
  isMounted.value = true
})

const handleCanvasReady = () => {
  isLoaded.value = true
}
</script>

<template>
  <section id="hero" class="section bg-transparent section-padding" data-section="hero">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <!-- Transparent clear: the solar system floats on the shared aurora
           backdrop instead of its own opaque black plate. -->
      <TresCanvas
        v-if="isMounted"
        :alpha="true"
        :clear-alpha="0"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
        @ready="handleCanvasReady"
      >
        <HeroScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Update Date -->
    <div class="absolute top-3 left-3 z-10 opacity-0 animate-fadeIn [animation-delay:1.5s]">
      <span class="font-(--font-code) text-xs text-white/40">{{ t('hero.lastUpdate') }} {{ currentDate }}</span>
    </div>

    <!-- Content Overlay -->
    <div class="section-content flex flex-col justify-center items-center text-center min-h-svh px-2 py-8 pb-20 sm:px-0 md:pt-12 md:pb-16">
      <div class="max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px]">
        <p class="font-(--font-code) text-sm sm:text-base text-[var(--color-terminal-green)] mb-2 opacity-0 animate-fadeInUp [animation-delay:0.2s]">{{ t('hero.greeting') }}</p>
        <h1 class="text-[clamp(3rem,10vw,7rem)] text-[var(--color-text-primary)] mb-4 [text-shadow:0_0_40px_rgba(124,58,237,0.3)] opacity-0 animate-fadeInUp [animation-delay:0.4s]">{{ t('hero.name') }}</h1>
        <p class="font-(--font-display) text-[clamp(1.25rem,3vw,2rem)] text-white/90 mb-2 opacity-0 animate-fadeInUp [animation-delay:0.6s]">{{ t('hero.tagline') }}</p>
        <p class="text-base md:text-lg text-white/70 mb-8 opacity-0 animate-fadeInUp [animation-delay:0.8s]">{{ t('hero.subtitle') }}</p>
        
        <button class="btn btn-primary px-6 py-3 text-base opacity-0 animate-fadeInUp [animation-delay:1s]" @click="scrollToNext">
          {{ t('hero.cta') }}
          <span class="inline-block animate-bounce">↓</span>
        </button>
      </div>
      
      <div class="absolute bottom-8 sm:bottom-12 md:bottom-16 flex flex-col items-center gap-2 opacity-0 animate-fadeIn [animation-delay:1.5s]">
        <span class="font-(--font-code) text-xs text-[var(--color-text-faint)] uppercase tracking-widest">{{ t('common.scrollDown') }}</span>
        <div class="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-xl flex justify-center pt-2">
          <div class="w-1 h-2 bg-[var(--color-accent-primary)] rounded-sm animate-scrollDot" />
        </div>
      </div>
    </div>
  </section>
</template>

