<script setup lang="ts">
import { useScrollSection } from '@application/composables/useScrollSection'
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const { sections, currentSectionIndex, scrollToSection } = useScrollSection()
const { t } = useI18n()

// Track current hash
const currentHash = ref(window.location.hash)

const tocListRef = ref<HTMLElement | null>(null)
const navRef = ref<HTMLElement | null>(null)
const itemHeight = ref(32) // Will be measured

// Determine active section index based on URL hash or scroll position
const activeSectionIndex = computed(() => {
  // If there's a hash in the URL, use it to find the section
  if (currentHash.value) {
    const hashSectionId = currentHash.value.slice(1) // Remove the #
    const hashIndex = sections.findIndex(s => s.id === hashSectionId)
    if (hashIndex !== -1) {
      return hashIndex
    }
  }
  // Otherwise, use the scroll-based currentSectionIndex
  return currentSectionIndex.value
})

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
  // Update hash and scroll to section
  window.location.hash = sectionId
  currentHash.value = `#${sectionId}`
  scrollToSection(sectionId)
}

const measureItems = () => {
  if (!tocListRef.value) return
  
  const items = tocListRef.value.querySelectorAll('.toc-item')
  if (items.length > 0) {
    const firstItem = items[0] as HTMLElement
    const secondItem = items[1] as HTMLElement
    
    if (firstItem && secondItem) {
      const firstRect = firstItem.getBoundingClientRect()
      const secondRect = secondItem.getBoundingClientRect()
      itemHeight.value = secondRect.top - firstRect.top
    } else if (firstItem) {
      const rect = firstItem.getBoundingClientRect()
      itemHeight.value = rect.height + 6 // height + gap (0.375rem ≈ 6px)
    }
  }
}

// Calculate transform to center the active item
const sidebarTransform = computed(() => {
  if (sections.length === 0 || !navRef.value) return 'translateY(-50%)'
  
  const viewportHeight = window.innerHeight
  
  // Calculate the position of the active item relative to the list top
  const activeItemTop = activeSectionIndex.value * itemHeight.value
  
  // Get the total height of the sidebar
  const sidebarHeight = tocListRef.value?.offsetHeight || 0
  
  // Base offset to center the entire nav (nav is at top: 50%, so move up by half its height)
  const baseOffset = -sidebarHeight / 2
  
  // Additional offset to center the active item
  // Active item is at (viewportHeight/2 + activeItemTop) from viewport top
  // To center it, we need to move up by activeItemTop
  let offset = baseOffset - activeItemTop
  
  // Clamp the offset to keep sidebar within viewport bounds
  const minOffset = -sidebarHeight / 2 + 20 // Minimum margin from top
  const maxOffset = viewportHeight - sidebarHeight / 2 - 20 // Minimum margin from bottom
  
  offset = Math.max(minOffset, Math.min(maxOffset, offset))
  
  return `translateY(${offset}px)`
})

let resizeHandler: (() => void) | null = null

// Sync URL hash when currentSectionIndex changes during scroll
watch(currentSectionIndex, (newIndex) => {
  const sectionId = sections[newIndex]?.id
  if (sectionId && currentHash.value !== `#${sectionId}`) {
    // Update hash without triggering navigation
    window.history.replaceState(null, '', `#${sectionId}`)
    currentHash.value = `#${sectionId}`
  }
  // Re-measure items if needed
  nextTick(() => {
    measureItems()
  })
})

// Watch for hash changes (browser back/forward or direct navigation)
const handleHashChange = () => {
  currentHash.value = window.location.hash
  const sectionId = window.location.hash.slice(1)
  if (sectionId) {
    scrollToSection(sectionId)
  }
}

onMounted(() => {
  nextTick(() => {
    measureItems()
    
    // Re-measure on window resize
    resizeHandler = () => {
      measureItems()
    }
    window.addEventListener('resize', resizeHandler)
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    // Handle initial hash if present
    if (window.location.hash) {
      handleHashChange()
    }
  })
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  window.removeEventListener('hashchange', handleHashChange)
})
</script>

<template>
  <nav ref="navRef" class="table-of-contents" :style="{ transform: sidebarTransform }">
    <ul ref="tocListRef" class="toc-list">
      <li
        v-for="(section, index) in sections"
        :key="section.id"
        class="toc-item"
        :class="{ 'toc-item-active': index === activeSectionIndex }"
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
  z-index: 50;
  display: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

