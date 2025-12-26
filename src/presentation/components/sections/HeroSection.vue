<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import HeroScene from '@presentation/components/three/scenes/HeroScene.vue'
import { useScrollSection } from '@application/composables/useScrollSection'
import { useQuality } from '@application/composables/useQuality'

const { t } = useI18n()
const { scrollToNext } = useScrollSection()
const { quality } = useQuality()

const isLoaded = ref(false)

const handleCanvasReady = () => {
  isLoaded.value = true
}
</script>

<template>
  <section class="section hero-section" data-section="hero">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        @ready="handleCanvasReady"
      >
        <HeroScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content Overlay -->
    <div class="section-content hero-content">
      <div class="hero-text">
        <p class="hero-greeting">{{ t('hero.greeting') }}</p>
        <h1 class="hero-name">{{ t('hero.name') }}</h1>
        <p class="hero-tagline">{{ t('hero.tagline') }}</p>
        <p class="hero-subtitle">{{ t('hero.subtitle') }}</p>
        
        <button class="btn btn-primary hero-cta" @click="scrollToNext">
          {{ t('hero.cta') }}
          <span class="cta-arrow">↓</span>
        </button>
      </div>
      
      <div class="hero-hint">
        <span class="hint-text">{{ t('common.scrollDown') }}</span>
        <div class="scroll-indicator">
          <div class="scroll-dot" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(180deg, var(--color-bg-primary) 0%, #050505 100%);
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100vh;
  padding-top: 4rem;
}

.hero-text {
  max-width: 800px;
}

.hero-greeting {
  font-family: var(--font-code);
  font-size: 1rem;
  color: var(--color-terminal-green);
  margin-bottom: 0.5rem;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.2s;
}

.hero-name {
  font-size: clamp(3rem, 10vw, 7rem);
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  text-shadow: 0 0 40px rgba(124, 58, 237, 0.3);
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.4s;
}

.hero-tagline {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 3vw, 2rem);
  color: var(--color-terminal-green);
  margin-bottom: 0.5rem;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.6s;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 0.8s;
}

.hero-cta {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: 1s;
}

.cta-arrow {
  display: inline-block;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-hint {
  position: absolute;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  animation: fadeIn 1s ease forwards;
  animation-delay: 1.5s;
}

@keyframes fadeIn {
  to { opacity: 0.7; }
}

.hint-text {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.scroll-indicator {
  width: 24px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.scroll-dot {
  width: 4px;
  height: 8px;
  background: var(--color-accent-primary);
  border-radius: 2px;
  animation: scrollDot 1.5s ease-in-out infinite;
}

@keyframes scrollDot {
  0%, 100% { 
    transform: translateY(0);
    opacity: 1;
  }
  50% { 
    transform: translateY(12px);
    opacity: 0.3;
  }
}
</style>

