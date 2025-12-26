<script setup lang="ts">
import { useScrollSection } from '@application/composables/useScrollSection'
import { useI18n } from 'vue-i18n'

const { sections, currentSectionIndex, scrollToSection } = useScrollSection()
const { t } = useI18n()

const getSectionLabel = (sectionId: string): string => {
  const labels: Record<string, string> = {
    hero: t('toc.hero'),
    about: t('toc.about'),
    experience: t('toc.experience'),
    leadership: t('toc.leadership'),
    skills: t('toc.skills'),
    maker: t('toc.maker'),
    projects: t('toc.projects'),
    books: t('toc.books'),
    contact: t('toc.contact')
  }
  return labels[sectionId] || sectionId
}

const handleSectionClick = (sectionId: string) => {
  scrollToSection(sectionId)
}
</script>

<template>
  <nav class="table-of-contents">
    <ul class="toc-list">
      <li
        v-for="(section, index) in sections"
        :key="section.id"
        class="toc-item"
        :class="{ 'toc-item-active': index === currentSectionIndex }"
      >
        <button
          class="toc-link"
          :aria-label="getSectionLabel(section.id)"
          @click="handleSectionClick(section.id)"
        >
          <span class="toc-dot" />
          <span class="toc-label">{{ getSectionLabel(section.id) }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.table-of-contents {
  position: fixed;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: none;
}

@media (min-width: 1024px) {
  .table-of-contents {
    display: block;
  }
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.toc-item {
  position: relative;
}

.toc-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-code);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  position: relative;
  border-radius: 4px;
}

.toc-link:hover {
  color: var(--color-text-secondary);
  background: rgba(124, 58, 237, 0.05);
}

.toc-item-active .toc-link {
  color: var(--color-accent-primary);
}

.toc-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0.6;
}

.toc-item-active .toc-dot {
  background: var(--color-accent-primary);
  box-shadow: 0 0 6px rgba(124, 58, 237, 0.5);
  transform: scale(1.4);
  opacity: 1;
}

.toc-link:hover .toc-dot {
  background: var(--color-text-secondary);
  opacity: 0.8;
}

.toc-item-active .toc-link:hover .toc-dot {
  background: var(--color-accent-secondary);
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
}

.toc-label {
  opacity: 0.7;
  transition: all var(--transition-normal);
  white-space: nowrap;
  font-weight: 500;
}

.toc-item:hover .toc-label {
  opacity: 1;
}

.toc-item-active .toc-label {
  opacity: 1;
}

/* Connector line between items */
.toc-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 0.4375rem;
  top: 1.5rem;
  width: 1px;
  height: 0.375rem;
  background: var(--color-border);
  opacity: 0.2;
  transition: all var(--transition-fast);
}

.toc-item-active:not(:last-child)::after {
  background: var(--color-accent-primary);
  opacity: 0.4;
  box-shadow: 0 0 4px rgba(124, 58, 237, 0.3);
}
</style>

