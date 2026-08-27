import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAchievements } from '@application/hooks/useAchievements'

const linkedInUrl = 'https://www.linkedin.com/in/damien-battistella-%F0%9F%92%BB-67964115/'
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkedInUrl)}&bgcolor=FFFFFF&color=000000`

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
  'githubVisitor'
]

const hasHint = (id: string) => {
  return achievementsWithHints.includes(id)
}

export default function ContactSection() {
  const { t } = useTranslation()
  const { unlock, achievements } = useAchievements()

  const openLinkedIn = () => {
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer')
    unlock('networker')
  }

  // Get 3 random locked achievements with hints
  const lockedAchievementsPreview = achievements
    .filter(a => !a.unlocked && hasHint(a.id))
    .slice(0, 3)

  // Unlock contact achievement when section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            unlock('contactAttempt')
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    const section = document.querySelector('[data-section="contact"]')
    if (section) {
      observer.observe(section)
    }

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="contact" className="section bg-transparent min-h-svh section-padding" data-section="contact">
      {/* Content */}
      <div className="section-content flex flex-col justify-center items-center h-full">
        <div className="section-header reveal">
          <h2 className="text-[var(--color-terminal-green)] mb-2">{t('contact.title')}</h2>
          <p className="section-subtitle">{t('contact.subtitle')}</p>
        </div>

        {/* Real button for keyboard access; sizes are mobile-first */}
        <button
          type="button"
          className="glass reveal max-w-[400px] xl:max-w-[500px] 2xl:max-w-[600px] mx-2 sm:mx-auto mb-8 sm:mb-12 p-6 sm:p-8 flex flex-col items-center gap-6 cursor-pointer transition-[border-color,box-shadow,transform] duration-150 border-2 border-transparent hover:border-[var(--color-terminal-green)] hover:-translate-y-1 hover:shadow-[var(--shadow-glow-green)] active:translate-y-0 active:scale-[0.99]"
          onClick={openLinkedIn}>
          <div className="p-3 sm:p-4 bg-white rounded-xl">
            <img src={qrCodeUrl} alt="LinkedIn QR Code"
              className="block rounded-lg w-40 h-40 sm:w-[200px] sm:h-[200px] bg-white" />
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-3xl sm:text-4xl">💼</span>
            <h3 className="font-(--font-display) text-xl sm:text-2xl text-[var(--color-terminal-green)] m-0">{t('contact.cta')}
            </h3>
            <p className="text-lg text-[var(--color-paper-cream)] m-0">Damien Battistella</p>
            <span className="font-(--font-code) text-sm text-[var(--color-frontend-blue)] mt-2">{t('contact.linkedin')}
              {' '}→</span>
          </div>
        </button>

        {/* Locked Achievements Preview */}
        {lockedAchievementsPreview.length > 0 && (
          <div className="w-full max-w-[600px] xl:max-w-[800px] 2xl:max-w-[1000px] mx-auto mb-8 px-4 reveal" style={{ '--reveal-i': 1 } as CSSProperties}>
            <div className="glass p-4 sm:p-6 rounded-xl border border-white/10">
              <h3 className="text-center font-(--font-display) text-lg text-[var(--color-terminal-green)] mb-4">
                {t('contact.achievementsPreview')}
              </h3>
              <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2 sm:gap-4">
                {lockedAchievementsPreview.map(achievement => (
                  <div key={achievement.id}
                    className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg bg-black/20 border border-purple-400/20 hover:border-purple-400/40 transition-[border-color] duration-150">
                    <div className="text-2xl sm:text-3xl opacity-70" aria-hidden="true">{achievement.icon}</div>
                    <span className="font-(--font-display) text-xs text-purple-400/70 text-center leading-tight">
                      {t(`achievements.${achievement.id}.name`)}
                    </span>
                    <span className="text-xs text-[var(--color-text-faint)] text-center leading-tight">
                      {t(`achievements.${achievement.id}.hint`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 px-2 sm:py-8 border-t border-white/10 mt-8">
          <p className="text-base text-white/70 mb-2">
            {t('footer.madeWith')} 💚 {t('footer.and')} {t('footer.passion')}
          </p>
          <p className="font-(--font-code) text-xs text-[var(--color-text-faint)] mb-2">{t('footer.builtWith')}</p>
          <p className="text-xs text-[var(--color-text-faint)]">{t('footer.copyright')}</p>
        </footer>
      </div>
    </section>
  )
}
