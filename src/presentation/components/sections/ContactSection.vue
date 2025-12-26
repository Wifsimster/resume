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
  <section class="section contact-section" data-section="contact">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <ContactScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="contact-header">
        <h2 class="section-title">{{ t('contact.title') }}</h2>
        <p class="section-subtitle">{{ t('contact.subtitle') }}</p>
      </div>

      <div class="contact-card glass" @click="openLinkedIn">
        <div class="qr-code">
          <img :src="qrCodeUrl" alt="LinkedIn QR Code" width="200" height="200" />
        </div>
        <div class="linkedin-info">
          <span class="linkedin-icon">💼</span>
          <h3>{{ t('contact.cta') }}</h3>
          <p class="linkedin-handle">Damien Battistella</p>
          <span class="linkedin-link">{{ t('contact.linkedin') }} →</span>
        </div>
      </div>

      <!-- Footer -->
      <footer class="site-footer">
        <p class="footer-made">
          {{ t('footer.madeWith') }} 💚 {{ t('footer.and') }} {{ t('footer.passion') }}
        </p>
        <p class="footer-built">{{ t('footer.builtWith') }}</p>
        <p class="footer-copyright">{{ t('footer.copyright') }}</p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  background: transparent;
  min-height: 100vh;
}

.contact-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-terminal-green);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.contact-card {
  max-width: 400px;
  margin: 0 auto 3rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 2px solid transparent;
}

.contact-card:hover {
  border-color: var(--color-terminal-green);
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow-green);
}

.qr-code {
  padding: 1rem;
  background: white;
  border-radius: 12px;
}

.qr-code img {
  display: block;
  border-radius: 8px;
}

.linkedin-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.linkedin-icon {
  font-size: 2.5rem;
}

.linkedin-info h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-terminal-green);
  margin: 0;
}

.linkedin-handle {
  font-size: 1.1rem;
  color: var(--color-paper-cream);
  margin: 0;
}

.linkedin-link {
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--color-frontend-blue);
  margin-top: 0.5rem;
}

.site-footer {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 2rem;
}

.footer-made {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.footer-built {
  font-family: var(--font-code);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.footer-copyright {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .contact-card {
    margin: 0 1rem 3rem;
  }
}

@media (max-width: 480px) {
  .contact-card {
    padding: 1.5rem;
    margin: 0 0.5rem 2rem;
  }
  
  .qr-code {
    padding: 0.75rem;
  }
  
  .qr-code img {
    width: 160px;
    height: 160px;
  }
  
  .linkedin-icon {
    font-size: 2rem;
  }
  
  .linkedin-info h3 {
    font-size: 1.25rem;
  }
  
  .site-footer {
    padding: 1.5rem 0.5rem;
  }
}
</style>

