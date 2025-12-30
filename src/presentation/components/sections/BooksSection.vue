<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TresCanvas } from '@tresjs/core'
import BooksScene from '@presentation/components/three/scenes/BooksScene.vue'
import { useQuality } from '@application/composables/useQuality'
import { useAchievements } from '@application/composables/useAchievements'
import { resumeData } from '@domain/data/resume'

const { t } = useI18n()
const { quality, renderSettings } = useQuality()
const { unlock } = useAchievements()

const booksByStatus = computed(() => ({
  read: resumeData.books.filter(b => b.status === 'read'),
  reading: resumeData.books.filter(b => b.status === 'reading'),
  toRead: resumeData.books.filter(b => b.status === 'toRead'),
  toBuy: resumeData.books.filter(b => b.status === 'toBuy')
}))

const openBook = (url: string, status?: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
  unlock('bookworm')
  if (status === 'toBuy') {
    unlock('bookBuyer')
  }
}
</script>

<template>
  <section id="books" class="section bg-transparent" data-section="books">
    <!-- 3D Canvas -->
    <div class="section-canvas">
      <TresCanvas
        :clear-color="'#0A0A0A'"
        :alpha="true"
        :dpr="renderSettings.dpr"
        :antialias="renderSettings.antialias"
        :power-preference="renderSettings.powerPreference"
      >
        <BooksScene :quality="quality" />
      </TresCanvas>
    </div>

    <!-- Content -->
    <div class="section-content">
      <div class="text-center mb-12">
        <h2 class="text-(--color-book-amber) mb-2">{{ t('books.title') }}</h2>
        <p class="font-(--font-display) text-2xl text-white/70">{{ t('books.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto mt-48">
        <!-- Read Books -->
        <div class="glass p-4">
          <h3 class="font-(--font-display) text-xl text-(--color-paper-cream) mb-3 flex items-center gap-2">
            <span class="text-lg">✓</span>
            {{ t('books.read') }}
          </h3>
          <div class="flex flex-col gap-2">
            <div 
              v-for="book in booksByStatus.read" 
              :key="book.id"
              class="flex gap-3 p-2 bg-black/15 rounded-lg cursor-pointer transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
              @click="openBook(book.url, book.status)"
            >
              <div class="text-2xl w-[40px] h-[48px] flex items-center justify-center bg-white/3 rounded">📗</div>
              <div class="flex flex-col justify-center gap-0.5">
                <span class="text-xs text-(--color-paper-cream) leading-tight">{{ book.title }}</span>
                <span class="text-[10px] text-white/50">{{ book.author }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- To Read Books -->
        <div class="glass p-4 border-amber-400/30">
          <h3 class="font-(--font-display) text-xl text-(--color-paper-cream) mb-3 flex items-center gap-2">
            <span class="text-lg">📖</span>
            {{ t('books.toRead') }}
          </h3>
          <div class="flex flex-col gap-2">
            <div 
              v-for="book in booksByStatus.toRead" 
              :key="book.id"
              class="flex gap-3 p-2 bg-black/15 rounded-lg cursor-pointer transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
              @click="openBook(book.url, book.status)"
            >
              <div class="text-2xl w-[40px] h-[48px] flex items-center justify-center bg-white/3 rounded">📕</div>
              <div class="flex flex-col justify-center gap-0.5">
                <span class="text-xs text-(--color-paper-cream) leading-tight">{{ book.title }}</span>
                <span class="text-[10px] text-white/50">{{ book.author }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- To Buy Books -->
        <div class="glass p-4 border-green-400/30">
          <h3 class="font-(--font-display) text-xl text-(--color-paper-cream) mb-3 flex items-center gap-2">
            <span class="text-lg">🛒</span>
            {{ t('books.toBuy') }}
          </h3>
          <div class="flex flex-col gap-2">
            <div 
              v-for="book in booksByStatus.toBuy" 
              :key="book.id"
              class="flex gap-3 p-2 bg-black/15 rounded-lg cursor-pointer transition-all duration-150 hover:bg-black/25 hover:translate-x-1"
              @click="openBook(book.url, book.status)"
            >
              <div class="text-2xl w-[40px] h-[48px] flex items-center justify-center bg-white/3 rounded">📘</div>
              <div class="flex flex-col justify-center gap-0.5">
                <span class="text-xs text-(--color-paper-cream) leading-tight">{{ book.title }}</span>
                <span class="text-[10px] text-white/50">{{ book.author }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

