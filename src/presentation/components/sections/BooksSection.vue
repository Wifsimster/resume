<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import BooksScene from '@presentation/components/three/scenes/BooksScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality } = useQuality()
const { unlock } = useAchievements()

const booksByStatus = computed(() => ({
  read: resumeData.books.filter(b => b.status === 'read'),
  reading: resumeData.books.filter(b => b.status === 'reading'),
  toRead: resumeData.books.filter(b => b.status === 'toRead')
}))

const openBook = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
  unlock('bookworm')
}
</script>

<template>
  <section class="section books-section" data-section="books">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas :clear-color="'#0A0A0A'" :alpha="true">
        <BooksScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="books-header">
        <h2 class="section-title">{{ t('books.title') }}</h2>
        <p class="section-subtitle">{{ t('books.subtitle') }}</p>
      </div>

      <div class="books-grid">
        <!-- Read Books -->
        <div class="books-category glass">
          <h3 class="category-title">
            <span class="status-icon">✓</span>
            {{ t('books.read') }}
          </h3>
          <div class="books-list">
            <div 
              v-for="book in booksByStatus.read" 
              :key="book.id"
              class="book-item"
              @click="openBook(book.url)"
            >
              <div class="book-cover">📗</div>
              <div class="book-info">
                <span class="book-title">{{ book.title }}</span>
                <span class="book-author">{{ book.author }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- To Read Books -->
        <div class="books-category glass to-read">
          <h3 class="category-title">
            <span class="status-icon">📖</span>
            {{ t('books.toRead') }}
          </h3>
          <div class="books-list">
            <div 
              v-for="book in booksByStatus.toRead" 
              :key="book.id"
              class="book-item"
              @click="openBook(book.url)"
            >
              <div class="book-cover">📕</div>
              <div class="book-info">
                <span class="book-title">{{ book.title }}</span>
                <span class="book-author">{{ book.author }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.books-section {
  background: linear-gradient(180deg, #050505 0%, var(--color-bg-primary) 50%, #050505 100%);
}

.books-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-book-amber);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.books-category {
  padding: 1.5rem;
}

.books-category.to-read {
  border-color: rgba(255, 191, 0, 0.3);
}

.category-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-paper-cream);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.25rem;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.book-item:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: translateX(4px);
}

.book-cover {
  font-size: 2rem;
  width: 50px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.book-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
}

.book-title {
  font-size: 0.9rem;
  color: var(--color-paper-cream);
  line-height: 1.3;
}

.book-author {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>

