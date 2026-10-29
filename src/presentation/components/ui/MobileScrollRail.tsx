import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useScrollSection } from '@application/hooks/useScrollSection'
import './MobileScrollRail.css'

const RAIL_QUERY = '(pointer: coarse), (max-width: 1023px)'

interface SectionMark {
  id: string
  top: number
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

  useEffect(() => {
    const mql = window.matchMedia(RAIL_QUERY)
    const onChange = () => setEnabled(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

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
      <div className="msr-track" aria-hidden="true" />
      <div className="msr-trail" style={{ height: `${progress}%` }} aria-hidden="true" />

      {marks.map(mark => (
        <button
          key={mark.id}
          className={`msr-dot ${mark.id === currentId ? 'is-current' : ''}`}
          style={{ top: `${mark.top}%` }}
          onClick={() => scrollToSection(mark.id)}
          aria-label={t(`toc.${mark.id}`)}
        />
      ))}

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
