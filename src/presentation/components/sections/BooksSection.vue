<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAchievements } from '@application/composables/useAchievements'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { unlock } = useAchievements()

// One config drives all shelf columns (they only ever differed by status
// key, border tint and emoji).
const shelves = computed(() => [
  { key: 'read', label: t('books.read'), emoji: '📗', border: '', books: resumeData.books.filter(b => b.status === 'read') },
  { key: 'toRead', label: t('books.toRead'), emoji: '📕', border: 'border-purple-400/30', books: resumeData.books.filter(b => b.status === 'toRead') },
  { key: 'toBuy', label: t('books.toBuy'), emoji: '📘', border: 'border-[color-mix(in_srgb,var(--color-accent-cool)_30%,transparent)]', books: resumeData.books.filter(b => b.status === 'toBuy') }
])

// Rows are real <a> links; the handler only tracks achievements.
const trackBook = (status?: string) => {
  unlock('bookworm')
  if (status === 'toBuy') {
    unlock('bookBuyer')
  }
}
</script>

<template>
  <section id="books" class="section bg-transparent section-padding" data-section="books">
    <!-- Content -->
    <div class="section-content mx-auto">
      <div class="text-center mb-12 reveal">
        <h2 class="text-[var(--color-book-amber)] mb-2">{{ t('books.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('books.subtitle') }}</p>
      </div>

      <div class="w-full flex justify-center">
        <div class="flex flex-wrap justify-center gap-4 w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <div
            v-for="(shelf, shelfIndex) in shelves"
            :key="shelf.key"
            class="glass reveal p-4 flex-1 min-w-[280px] max-w-[360px]"
            :class="shelf.border"
            :style="{ '--reveal-i': shelfIndex }"
          >
            <h3 class="font-(--font-display) text-xl text-[var(--color-paper-cream)] mb-3">
              {{ shelf.label }}
            </h3>
            <div class="flex flex-col gap-2">
              <a
                v-for="book in shelf.books"
                :key="book.id"
                :href="book.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex gap-3 p-2.5 min-h-11 bg-black/15 rounded-lg cursor-pointer no-underline transition-[background-color,transform] duration-150 hover:bg-black/25 hover:translate-x-1 active:scale-[0.99]"
                @click="trackBook(book.status)"
              >
                <div class="text-2xl w-[40px] h-[48px] flex items-center justify-center bg-white/3 rounded">{{ shelf.emoji }}</div>
                <div class="flex flex-col justify-center gap-0.5">
                  <span class="text-xs text-[var(--color-paper-cream)] leading-tight">{{ book.title }}</span>
                  <span class="text-xs text-[var(--color-text-faint)]">{{ book.author }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

