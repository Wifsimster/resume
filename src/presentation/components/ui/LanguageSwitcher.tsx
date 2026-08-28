import { useTranslation } from 'react-i18next'
import { toggleLocale } from '@application/i18n'
import { useAchievements } from '@application/hooks/useAchievements'

// Locale switch as text labels (FR | EN) rather than flags: a flag names a
// country, not a language, and reads poorly for screen readers and for
// visitors whose locale doesn't match the flag they're shown.

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { unlock } = useAchievements()

  const isFrench = i18n.language === 'fr'

  const switchLanguage = () => {
    toggleLocale()
    unlock('bilingual')
  }

  const label = isFrench ? 'Switch to English' : 'Passer en français'
  const segment = (active: boolean) =>
    `px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
      active
        ? 'bg-white/12 text-[var(--color-paper-cream,#fafafa)] ring-1 ring-white/25'
        : 'text-white/45'
    }`

  return (
    <button
      data-component="language-switcher"
      className="flex items-center gap-0.5 h-8 px-1 bg-[var(--color-surface-overlay)] backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-200 hover:border-white/20 sm:h-9"
      onClick={switchLanguage}
      aria-label={label}
      title={label}
    >
      <span className={segment(isFrench)} aria-hidden="true">FR</span>
      <span className={segment(!isFrench)} aria-hidden="true">EN</span>
    </button>
  )
}
