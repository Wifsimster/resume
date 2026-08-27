import { useScrollSection } from '@application/hooks/useScrollSection'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import './TableOfContents.css'

export default function TableOfContents() {
  const { sections, currentSectionIndex, scrollToSection } = useScrollSection()
  const { t } = useTranslation()

  // Track current hash (state for rendering + ref for effect reads)
  const [currentHash, setCurrentHash] = useState(window.location.hash)
  const currentHashRef = useRef(currentHash)
  const updateHash = (hash: string) => {
    currentHashRef.current = hash
    setCurrentHash(hash)
  }

  const tocListRef = useRef<HTMLUListElement | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const [itemHeight, setItemHeight] = useState(32) // Will be measured
  // Measurement tick: template refs are not reactive in React, so bump a
  // counter after each measurement pass to recompute sidebarTransform.
  const [, setMeasureTick] = useState(0)

  // Determine active section index based on URL hash or scroll position
  const activeSectionIndex = (() => {
    // If there's a hash in the URL, use it to find the section
    if (currentHash) {
      const hashSectionId = currentHash.slice(1) // Remove the #
      const hashIndex = sections.findIndex(s => s.id === hashSectionId)
      if (hashIndex !== -1) {
        return hashIndex
      }
    }
    // Otherwise, use the scroll-based currentSectionIndex
    return currentSectionIndex
  })()

  const getSectionLabel = (sectionId: string): string => {
    const labels: Record<string, string> = {
      hero: t('toc.hero'),
      about: t('toc.about'),
      experience: t('toc.experience'),
      motivation: t('toc.motivation'),
      skills: t('toc.skills'),
      maker: t('toc.maker'),
      projects: t('toc.projects'),
      books: t('toc.books'),
      contact: t('toc.contact')
    }
    return labels[sectionId] || sectionId
  }

  const handleSectionClick = (sectionId: string) => {
    // replaceState instead of assigning location.hash: a hash assignment fires
    // router navigation + hashchange, each of which triggers ANOTHER smooth
    // scroll on top of the explicit one below — the fighting scrolls made nav
    // clicks stutter. replaceState updates the URL silently.
    window.history.replaceState(null, '', `#${sectionId}`)
    updateHash(`#${sectionId}`)
    scrollToSection(sectionId)
  }

  const measureItems = () => {
    if (!tocListRef.current) return

    const items = tocListRef.current.querySelectorAll('.toc-item')
    if (items.length > 0) {
      const firstItem = items[0] as HTMLElement
      const secondItem = items[1] as HTMLElement

      if (firstItem && secondItem) {
        const firstRect = firstItem.getBoundingClientRect()
        const secondRect = secondItem.getBoundingClientRect()
        setItemHeight(secondRect.top - firstRect.top)
      } else if (firstItem) {
        const rect = firstItem.getBoundingClientRect()
        setItemHeight(rect.height + 6) // height + gap (0.375rem ≈ 6px)
      }
    }
    setMeasureTick(tick => tick + 1)
  }

  // Calculate transform to center the active item
  const sidebarTransform = (() => {
    if (sections.length === 0 || !navRef.current) return 'translateY(-50%)'

    // Mobile dot rail: stay simply centered, no active-item tracking.
    if (window.matchMedia('(max-width: 1023px)').matches) return 'translateY(-50%)'

    const viewportHeight = window.innerHeight

    // Calculate the position of the active item relative to the list top
    const activeItemTop = activeSectionIndex * itemHeight

    // Get the total height of the sidebar
    const sidebarHeight = tocListRef.current?.offsetHeight || 0

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
  })()

  // Sync URL hash when currentSectionIndex changes during scroll
  useEffect(() => {
    const sectionId = sections[currentSectionIndex]?.id
    if (sectionId && currentHashRef.current !== `#${sectionId}`) {
      // Update hash without triggering navigation
      window.history.replaceState(null, '', `#${sectionId}`)
      updateHash(`#${sectionId}`)
    }
    // Re-measure items if needed (effects run after the DOM commit,
    // equivalent to Vue's nextTick here)
    measureItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex])

  useEffect(() => {
    // Watch for hash changes (browser back/forward or direct navigation)
    const handleHashChange = () => {
      updateHash(window.location.hash)
      const sectionId = window.location.hash.slice(1)
      if (sectionId) {
        scrollToSection(sectionId)
      }
    }

    measureItems()

    // Re-measure on window resize
    const resizeHandler = () => {
      measureItems()
    }
    window.addEventListener('resize', resizeHandler)

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    // Handle initial hash if present
    if (window.location.hash) {
      handleHashChange()
    }

    return () => {
      window.removeEventListener('resize', resizeHandler)
      window.removeEventListener('hashchange', handleHashChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    /* Desktop: full labelled rail. Below lg: compact dot rail (labels hidden,
       hit areas enlarged) so phones/tablets keep jump-to-section navigation. */
    <nav
      ref={navRef}
      className="table-of-contents fixed left-1 lg:left-6 top-1/2 z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ transform: sidebarTransform }}
    >
      <ul ref={tocListRef} className="toc-list list-none m-0 p-0 flex flex-col gap-0.5 lg:gap-1.5">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className={`toc-item relative group ${index === activeSectionIndex ? 'toc-item-active' : ''}`}
          >
            <button
              className={`toc-link flex items-center gap-2.5 px-3 py-2 lg:px-2 lg:py-1.5 bg-transparent border-none cursor-pointer transition-[color,background-color] duration-150 font-(--font-code) text-[0.7rem] uppercase tracking-widest relative rounded hover:bg-[rgba(124,58,237,0.05)] active:scale-95 ${
                index === activeSectionIndex
                  ? 'text-[var(--color-accent-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
              aria-label={getSectionLabel(section.id)}
              onClick={() => handleSectionClick(section.id)}
            >
              <span
                className={`toc-dot w-1.5 h-1.5 rounded-full transition-all duration-150 shrink-0 ${
                  index === activeSectionIndex
                    ? 'bg-[var(--color-accent-primary)] shadow-[0_0_6px_rgba(124,58,237,0.5)] scale-[1.4] opacity-100'
                    : 'bg-[var(--color-text-muted)] opacity-60 group-hover:bg-[var(--color-text-secondary)] group-hover:opacity-80'
                }`}
              />
              <span
                className={`toc-label hidden lg:inline transition-opacity duration-300 whitespace-nowrap font-medium ${
                  index === activeSectionIndex ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                }`}
              >{getSectionLabel(section.id)}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
