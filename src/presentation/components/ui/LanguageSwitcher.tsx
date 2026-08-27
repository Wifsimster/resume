import { useTranslation } from 'react-i18next'
import { toggleLocale } from '@application/i18n'
import { useAchievements } from '@application/hooks/useAchievements'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { unlock } = useAchievements()

  const isFrench = i18n.language === 'fr'

  const switchLanguage = () => {
    toggleLocale()
    unlock('bilingual')
  }

  return (
    <button
      className="relative flex items-center justify-between w-[70px] h-8 p-0.5 bg-[var(--color-surface-overlay)] backdrop-blur-md border border-white/10 rounded-2xl cursor-pointer transition-all duration-200 hover:border-white/20 sm:w-16 sm:h-9"
      onClick={switchLanguage}
      aria-label={isFrench ? 'Switch to English' : 'Passer en français'}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 select-none sm:w-6.5 sm:h-6.5 ${
          isFrench ? 'opacity-100 ring-1 ring-white/40' : 'opacity-50'
        }`}
      >
        <svg
          className="w-5 h-5 rounded-full"
          viewBox="0 0 30 30"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Français"
        >
          <rect width="10" height="30" fill="#0055A4" />
          <rect x="10" width="10" height="30" fill="#FFFFFF" />
          <rect x="20" width="10" height="30" fill="#EF4135" />
        </svg>
      </span>
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 select-none sm:w-6.5 sm:h-6.5 ${
          !isFrench ? 'opacity-100 ring-1 ring-white/40' : 'opacity-50'
        }`}
      >
        <svg
          className="w-5 h-5 rounded-full"
          viewBox="15 0 30 30"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="English"
        >
          <clipPath id="uk-flag-quadrants">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
          <path
            d="M0,0 L60,30 M60,0 L0,30"
            clipPath="url(#uk-flag-quadrants)"
            stroke="#C8102E"
            strokeWidth="4"
          />
          <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
          <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      </span>
    </button>
  )
}
