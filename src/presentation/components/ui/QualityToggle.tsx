import { useTranslation } from 'react-i18next'
import { useQuality } from '@application/hooks/useQuality'
import { useAchievements } from '@application/hooks/useAchievements'

export default function QualityToggle() {
  const { quality, cycleQuality } = useQuality()
  const { t } = useTranslation()
  const { unlock } = useAchievements()

  const qualityLabel = (() => {
    switch (quality) {
      case 'high': return t('common.qualityHigh')
      case 'low': return t('common.qualityLow')
      case 'minimal': return t('common.qualityMinimal')
      default: return t('common.qualityLow')
    }
  })()

  const qualityIcon = (() => {
    switch (quality) {
      case 'high': return '✨'
      case 'low': return '⚡'
      case 'minimal': return '🔋'
      default: return '⚡'
    }
  })()

  const qualityTitle = t('common.quality')

  const handleCycle = () => {
    cycleQuality()
    unlock('qualityToggler')
  }

  return (
    <button
      className="flex items-center gap-1.5 py-2 px-3 bg-[var(--color-surface-overlay)] backdrop-blur-md border border-[var(--color-border)] rounded-lg cursor-pointer transition-all duration-150 font-(--font-code) text-xs text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] hover:shadow-[var(--shadow-glow-accent)] sm:p-2 sm:min-w-10 sm:min-h-10 sm:justify-center"
      onClick={handleCycle}
      title={qualityTitle}
      aria-label={qualityTitle}
    >
      <span className="text-sm sm:text-lg">{qualityIcon}</span>
      <span className="uppercase tracking-wide sm:hidden">{qualityLabel}</span>
    </button>
  )
}
