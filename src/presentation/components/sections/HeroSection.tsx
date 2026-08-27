import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useScrollSection } from '@application/hooks/useScrollSection'
import './HeroSection.css'

// Code-split: HeroCanvas pulls in the whole three.js vendor chunk, so it
// loads async and never blocks the first paint of the hero text.
const HeroCanvas = lazy(() => import('@presentation/components/three/HeroCanvas'))

export default function HeroSection() {
  const { t } = useTranslation()
  const { scrollToNext } = useScrollSection()

  const [, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const currentDate = useMemo(() => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCanvasReady = () => {
    setIsLoaded(true)
  }

  return (
    <section id="hero" className="hero-section section bg-transparent section-padding" data-section="hero">
      {/* 3D Canvas */}
      <div className="section-canvas">
        {/* Transparent clear: the solar system floats on the shared aurora
             backdrop instead of its own opaque black plate. */}
        {isMounted && (
          <Suspense fallback={null}>
            <HeroCanvas onReady={handleCanvasReady} />
          </Suspense>
        )}
      </div>

      {/* Update Date */}
      <div className="absolute top-3 left-3 z-10 opacity-0 animate-fadeIn [animation-delay:1.5s]">
        <span className="font-(--font-code) text-xs text-white/40">{t('hero.lastUpdate')} {currentDate}</span>
      </div>

      {/* Content Overlay */}
      <div className="section-content flex flex-col justify-center items-center text-center min-h-svh px-2 py-8 pb-20 sm:px-0 md:pt-12 md:pb-16">
        <div className="max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px]">
          <p className="font-(--font-code) text-sm sm:text-base text-[var(--color-terminal-green)] mb-2 opacity-0 animate-fadeInUp [animation-delay:0.2s]">{t('hero.greeting')}</p>
          <h1 className="text-[clamp(3rem,10vw,7rem)] text-[var(--color-text-primary)] mb-4 [text-shadow:0_0_40px_rgba(124,58,237,0.3)] opacity-0 animate-fadeInUp [animation-delay:0.4s]">{t('hero.name')}</h1>
          <p className="font-(--font-display) text-[clamp(1.25rem,3vw,2rem)] text-white/90 mb-2 opacity-0 animate-fadeInUp [animation-delay:0.6s]">{t('hero.tagline')}</p>
          <p className="text-base md:text-lg text-white/70 mb-8 opacity-0 animate-fadeInUp [animation-delay:0.8s]">{t('hero.subtitle')}</p>

          <button className="btn btn-primary px-6 py-3 text-base opacity-0 animate-fadeInUp [animation-delay:1s]" onClick={scrollToNext}>
            {t('hero.cta')}
            <span className="inline-block animate-bounce">↓</span>
          </button>
        </div>

        <div className="absolute bottom-8 sm:bottom-12 md:bottom-16 flex flex-col items-center gap-2 opacity-0 animate-fadeIn [animation-delay:1.5s]">
          <span className="font-(--font-code) text-xs text-[var(--color-text-faint)] uppercase tracking-widest">{t('common.scrollDown')}</span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/30 rounded-xl flex justify-center pt-2">
            <div className="w-1 h-2 bg-[var(--color-accent-primary)] rounded-sm animate-scrollDot" />
          </div>
        </div>
      </div>
    </section>
  )
}
