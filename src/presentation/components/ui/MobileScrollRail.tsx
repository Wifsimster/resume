import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useScrollSection } from '@application/hooks/useScrollSection'
import './MobileScrollRail.css'

// Unified scroll minimap for touch devices and narrow screens — the merge of
// the old left-hand TOC dot rail and the custom scrollbar, in the style of an
// AI-chat conversation outline: one right-hand rail carrying a tappable
// landmark dot per section (always faintly visible), a purple→cyan comet
// trail, and a rocket thumb labelled with the current section while
// scrolling. Native overlay scrollbars are hidden on coarse pointers (CSS).
const RAIL_QUERY = '(pointer: coarse), (max-width: 1023px)'

interface SectionMark {
  id: string
  top: number // % of document height at the section's centre
}

export default function MobileScrollRail() {
  const { t } = useTranslation()
  const { sections, scrollProgress, currentSectionIndex, totalSections, scrollToSection } = useScrollSection()

  const [enabled, setEnabled] = useState(() => window.matchMedia(RAIL_QUERY).matches)
  const [active, setActive] = useState(false)
  const [goingUp, setGoingUp] = useState(false)
  const [marks, setMarks] = useState<SectionMark[]>([])
  const hideTimerRef = useRef<number | null>(null)
  const prevProgressRef = useRef(scrollProgress)

  // Follow viewport/pointer changes (device rotation, window resize)
  useEffect(() => {
    const mql = window.matchMedia(RAIL_QUERY)
    const onChange = () => setEnabled(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  // Measure each section's centre as a % of the document height so the
  // landmark dots sit where the sections actually are. Re-measured on resize
  // and once after load (lazy canvases can shift the layout).
  const measure = useCallback(() => {
    const docHeight = document.body.scrollHeight
    if (docHeight === 0) return
    const found: SectionMark[] = []
    document.querySelectorAll<HTMLElement>('[data-section]').forEach(el => {
      const id = el.getAttribute('data-section')
      if (!id) return
      found.push({ id, top: ((el.offsetTop + el.offsetHeight / 2) / docHeight) * 100 })
    })
    setMarks(found)
  }, [])

  useEffect(() => {
    if (!enabled) return
    measure()
    const settleTimer = window.setTimeout(measure, 1500)
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
    }
  }, [enabled, measure])

  // Fade the trail/thumb in while scrolling, out after a moment of stillness
  useEffect(() => {
    if (!enabled) return
    const prev = prevProgressRef.current
    if (scrollProgress === prev) return
    setGoingUp(scrollProgress < prev)
    prevProgressRef.current = scrollProgress

    setActive(true)
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setActive(false), 1400)
    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
    }
  }, [scrollProgress, enabled])

  if (!enabled) return null

  const progress = Math.max(0, Math.min(100, scrollProgress))
  const currentId = sections[currentSectionIndex]?.id

  return (
    <div className={`mobile-scroll-rail ${active ? 'is-active' : ''}`}>
      {/* Track */}
      <div className="msr-track" aria-hidden="true" />
      {/* Comet trail: gradient fill up to the rocket */}
      <div className="msr-trail" style={{ height: `${progress}%` }} aria-hidden="true" />

      {/* Section landmark dots — tappable, like an AI chat's conversation outline */}
      {marks.map(mark => (
        <button
          key={mark.id}
          className={`msr-dot ${mark.id === currentId ? 'is-current' : ''}`}
          style={{ top: `${mark.top}%` }}
          onClick={() => scrollToSection(mark.id)}
          aria-label={t(`toc.${mark.id}`)}
        />
      ))}

      {/* Rocket thumb, nose following the scroll direction, labelled with the
          current section while scrolling */}
      <div className="msr-thumb" style={{ top: `${progress}%` }} aria-hidden="true">
        <span className={`msr-rocket ${goingUp ? 'is-up' : ''}`}>🚀</span>
        <span className="msr-counter">
          {currentId ? t(`toc.${currentId}`) : ''}
          <span className="msr-counter-index">{currentSectionIndex + 1}/{totalSections}</span>
        </span>
      </div>
    </div>
  )
}
