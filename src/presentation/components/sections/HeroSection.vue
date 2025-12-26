<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

onMounted(() => {
  isMounted.value = true
})

const handleCanvasReady = () => {
  isLoaded.value = true
}
</script>

<template>
  <section class="section bg-transparent" data-section="hero">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas
        v-if="isMounted"
        :clear-color="'#0A0A0A'"
        :alpha="true"
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
      <span class="font-(--font-code) text-xs text-white/40">{{ t('hero.lastUpdate') }} 26/12/24</span>
    </div>

    <!-- Content Overlay -->
    <div class="section-content flex flex-col justify-center items-center text-center min-h-screen pt-16 md:pt-12 md:pb-16 sm:px-2 sm:py-8 sm:pb-20">
      <div class="max-w-[800px]">
        <p class="font-(--font-code) text-base text-(--color-terminal-green) mb-2 opacity-0 animate-fadeInUp [animation-delay:0.2s] sm:text-sm">{{ t('hero.greeting') }}</p>
        <h1 class="text-[clamp(3rem,10vw,7rem)] text-(--color-text-primary) mb-4 [text-shadow:0_0_40px_rgba(124,58,237,0.3)] opacity-0 animate-fadeInUp [animation-delay:0.4s]">{{ t('hero.name') }}</h1>
        <p class="font-(--font-display) text-[clamp(1.25rem,3vw,2rem)] text-(--color-terminal-green) mb-2 opacity-0 animate-fadeInUp [animation-delay:0.6s]">{{ t('hero.tagline') }}</p>
        <p class="text-lg text-white/70 mb-8 opacity-0 animate-fadeInUp [animation-delay:0.8s] md:text-base">{{ t('hero.subtitle') }}</p>
        
        <button class="btn btn-primary opacity-0 animate-fadeInUp [animation-delay:1s]" @click="scrollToNext">
          {{ t('hero.cta') }}
          <span class="inline-block animate-bounce">↓</span>
        </button>
      </div>
      
      <div class="absolute bottom-8 flex flex-col items-center gap-2 opacity-0 animate-fadeIn [animation-delay:1.5s] md:bottom-6 sm:bottom-4">
        <span class="font-(--font-code) text-xs text-white/50 uppercase tracking-widest">{{ t('common.scrollDown') }}</span>
        <div class="w-6 h-10 border-2 border-white/30 rounded-xl flex justify-center pt-2 sm:w-5 sm:h-8">
          <div class="w-1 h-2 bg-(--color-accent-primary) rounded-sm animate-scrollDot" />
        </div>
      </div>
    </div>
  </section>
</template>

