import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useAchievements } from '@application/hooks/useAchievements'

// Achievements that should show hints when locked
const achievementsWithHints = [
  'codeHunter',
  'speedRunner',
  'explorer',
  'bookworm',
  'networker',
  'scrollMaster',
  'clickHappy',
  'timeSpent',
  'earlyBird',
  'weekendWarrior',
  'makerFan',
  'githubVisitor',
  'bookBuyer',
  'completionist',
  'bilingual',
  'nightOwl',
  'firstVisit',
  'returnVisitor',
  'qualityToggler',
  'patience',
  'contactAttempt',
  'nightExplorer',
  'keyboardNinja',
  'boomerang',
  'mobileScout',
  'printReady',
  'devotedReader',
  'frequentFlyer',
  'secretWhisper',
  'consoleExplorer'
]

const hasHint = (id: string) => {
  return achievementsWithHints.includes(id)
}

// Duration of the `.panel-*` transition defined in main.css
const PANEL_TRANSITION_MS = 300

export default function AchievementsIndicator() {
  const { t } = useTranslation()
  const { achievements, unlockedCount, totalCount, progress } = useAchievements()

  const [isOpen, setIsOpen] = useState(false)

  // Vue <Transition name="panel"> equivalent: keep the panel mounted during the
  // leave transition and apply the same `.panel-*` classes from main.css.
  const [shouldRender, setShouldRender] = useState(false)
  const [transitionClass, setTransitionClass] = useState('')
  const renderedRef = useRef(false)

  useEffect(() => {
    let rafId: number | null = null
    let timerId: ReturnType<typeof setTimeout> | null = null

    if (isOpen) {
      renderedRef.current = true
      setShouldRender(true)
      setTransitionClass('panel-enter-active panel-enter-from')
      // Double rAF: let the enter-from state paint before transitioning to it
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          setTransitionClass('panel-enter-active panel-enter-to')
          timerId = setTimeout(() => setTransitionClass(''), PANEL_TRANSITION_MS)
        })
      })
    } else if (renderedRef.current) {
      setTransitionClass('panel-leave-active panel-leave-from')
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          setTransitionClass('panel-leave-active panel-leave-to')
          timerId = setTimeout(() => {
            renderedRef.current = false
            setShouldRender(false)
            setTransitionClass('')
          }, PANEL_TRANSITION_MS)
        })
      })
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (timerId !== null) clearTimeout(timerId)
    }
  }, [isOpen])

  const togglePanel = () => {
    setIsOpen(prev => !prev)
  }

  const closePanel = () => {
    setIsOpen(false)
  }

  const sortedAchievements = useMemo(() => {
    return [...achievements].sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1
      if (!a.unlocked && b.unlocked) return 1
      return 0
    })
  }, [achievements])

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 py-1.5 px-3 bg-[#1E1E1E]/80 backdrop-blur-md border border-[var(--color-border)] rounded-lg cursor-pointer transition-all duration-150 hover:border-[var(--color-achievement-gold)] hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
        onClick={togglePanel}
        title={t('achievements.viewAll')}
      >
        <span className="text-base animate-trophy-shine">🏆</span>
        <span className="font-(--font-code) text-xs text-[var(--color-text-secondary)]">{unlockedCount}/{totalCount}</span>
      </button>

      {shouldRender && createPortal(
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 ${transitionClass}`}
          onClick={closePanel}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closePanel()
          }}
        >
          {/* dvh tracks the real visible height on phones (vh can exceed it
               while browser chrome is expanded); safe-area padding clears the
               iOS home indicator. */}
          <div
            className="achievements-panel bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-primary)] border-2 border-[var(--color-border)] rounded-xl sm:rounded-2xl w-full max-w-[420px] max-h-[85dvh] overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)] shadow-[0_0_60px_rgba(124,58,237,0.2),0_20px_60px_rgba(0,0,0,0.6)]"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between py-4 px-5 border-b border-[var(--color-border)] bg-black/30">
              <h3 className="font-(--font-display) text-xl font-bold text-[var(--color-achievement-gold)] flex items-center gap-2 before:content-['🏆']">{t('achievements.title')}</h3>
              <button
                className="bg-transparent border-none text-[var(--color-text-secondary)] text-2xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150 hover:bg-white/10 hover:text-[var(--color-text-primary)]"
                onClick={closePanel}
                aria-label="Close"
              >×</button>
            </div>

            <div className="py-4 px-5 flex items-center gap-4 border-b border-[var(--color-border)]">
              <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-achievement-gold)] to-amber-500 rounded transition-[width] duration-500 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-(--font-code) text-sm text-[var(--color-achievement-gold)] font-semibold min-w-[50px] text-right">{unlockedCount} / {totalCount}</span>
            </div>

            <div className="p-3 overflow-y-auto overscroll-contain flex-1">
              {sortedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-white/2 mb-2 last:mb-0 transition-all duration-150 border border-transparent ${
                    achievement.unlocked
                      ? 'bg-amber-400/5 border-amber-400/20 hover:bg-amber-400/10 hover:border-amber-400/30'
                      : 'opacity-50'
                  }`}
                >
                  <div
                    className={`text-[1.75rem] sm:text-2xl w-12 sm:w-10 h-12 sm:h-10 flex items-center justify-center bg-black/30 rounded-xl shrink-0 ${
                      achievement.unlocked ? 'bg-amber-400/10 animate-icon-glow' : hasHint(achievement.id) ? 'bg-purple-400/10' : ''
                    }`}
                  >{achievement.unlocked ? achievement.icon : (hasHint(achievement.id) ? achievement.icon : '🔒')}</div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span
                      className={`font-(--font-display) text-sm font-semibold ${
                        achievement.unlocked
                          ? 'text-[var(--color-achievement-gold)]'
                          : hasHint(achievement.id)
                            ? 'text-purple-400/70'
                            : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {achievement.unlocked ? t(`achievements.${achievement.id}.name`) : (hasHint(achievement.id) ? t(`achievements.${achievement.id}.name`) : '???')}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] leading-tight">
                      {achievement.unlocked ? t(`achievements.${achievement.id}.desc`) : (hasHint(achievement.id) ? t(`achievements.${achievement.id}.hint`) : t('achievements.locked'))}
                    </span>
                  </div>
                  {achievement.unlocked && (
                    <div className="w-6 h-6 bg-[var(--color-achievement-gold)] text-[var(--color-bg-primary)] rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
