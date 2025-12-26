<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import ContactScene from '@presentation/components/three/scenes/ContactScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'

const { t } = useI18n()
const { quality } = useQuality()
const { unlock } = useAchievements()

const linkedInUrl = 'https://www.linkedin.com/in/damien-battistella-%F0%9F%92%BB-67964115/'
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkedInUrl)}&bgcolor=0A0A0A&color=7C3AED`

const openLinkedIn = () => {
  window.open(linkedInUrl, '_blank', 'noopener,noreferrer')
  unlock('networker')
}

// Unlock contact achievement when section becomes visible
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          unlock('contactAttempt')
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )
  
  const section = document.querySelector('[data-section="contact"]')
  if (section) {
    observer.observe(section)
  }
})
</script>

<template>
  <section class="section bg-transparent min-h-screen" data-section="contact">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <ContactScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="text-center mb-12">
        <h2 class="text-(--color-terminal-green) mb-2">{{ t('contact.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('contact.subtitle') }}</p>
      </div>

      <div 
        class="glass max-w-[400px] mx-auto mb-12 md:mx-4 sm:mx-2 sm:mb-8 p-8 sm:p-6 flex flex-col items-center gap-6 cursor-pointer transition-all duration-150 border-2 border-transparent hover:border-(--color-terminal-green) hover:-translate-y-1 hover:shadow-[var(--shadow-glow-green)]"
        @click="openLinkedIn"
      >
        <div class="p-4 sm:p-3 bg-white rounded-xl">
          <img :src="qrCodeUrl" alt="LinkedIn QR Code" class="block rounded-lg w-[200px] h-[200px] sm:w-40 sm:h-40" />
        </div>
        <div class="text-center flex flex-col items-center gap-2">
          <span class="text-4xl sm:text-3xl">💼</span>
          <h3 class="font-(--font-display) text-2xl sm:text-xl text-(--color-terminal-green) m-0">{{ t('contact.cta') }}</h3>
          <p class="text-lg text-(--color-paper-cream) m-0">Damien Battistella</p>
          <span class="font-(--font-code) text-sm text-(--color-frontend-blue) mt-2">{{ t('contact.linkedin') }} →</span>
        </div>
      </div>

      <!-- Footer -->
      <footer class="text-center py-8 sm:py-6 sm:px-2 border-t border-white/10 mt-8">
        <p class="text-base text-white/70 mb-2">
          {{ t('footer.madeWith') }} 💚 {{ t('footer.and') }} {{ t('footer.passion') }}
        </p>
        <p class="font-(--font-code) text-xs text-white/50 mb-2">{{ t('footer.builtWith') }}</p>
        <p class="text-xs text-white/40">{{ t('footer.copyright') }}</p>
      </footer>
    </div>
  </section>
</template>

