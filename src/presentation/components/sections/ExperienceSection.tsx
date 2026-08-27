import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

export default function ExperienceSection() {
  const { t } = useTranslation()

  const getAchievements = (expId: string): string[] => {
    const achievements = t(`experience.${expId}.achievements`, { returnObjects: true })
    return Array.isArray(achievements) ? (achievements as string[]) : []
  }

  return (
    <section id="experience" className="section bg-transparent section-padding" data-section="experience">
      {/* Content */}
      <div className="section-content">
        <div className="section-header reveal">
          <h2 className="text-[var(--color-terminal-green)] mb-2">{t('experience.title')}</h2>
          <p className="section-subtitle">{t('experience.subtitle')}</p>
        </div>

        <div className="max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] mx-auto">
          {resumeData.experiences.map((exp, index) => (
            <div
              key={exp.id}
              className={`glass reveal flex flex-col md:flex-row gap-4 md:gap-6 p-4 sm:p-6 mb-4 sm:mb-6 relative transition-[background-color,border-color,box-shadow] duration-150 hover:bg-black/20 hover:border-[var(--color-terminal-green)]/30 ${exp.current ? 'border-[var(--color-terminal-green)] shadow-[var(--shadow-glow-green)]' : ''}`}
              style={{ '--reveal-i': Math.min(index, 4) } as CSSProperties}
            >
              <div className="flex flex-row md:flex-col items-center shrink-0 gap-2">
                <div
                  className={`w-4 h-4 rounded-full bg-[var(--color-terminal-green)] shadow-[0_0_10px_var(--color-terminal-green)] ${exp.current ? 'animate-pulse-glow' : ''}`}
                />
                <div className="flex-1 h-0.5 md:h-auto md:w-0.5 bg-gradient-to-r md:bg-gradient-to-b from-[var(--color-terminal-green)] to-transparent md:mt-2" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-(--font-code) text-sm text-[var(--color-vue-green)]">{t(`experience.${exp.id}.company`)}</span>
                    {exp.current && <span className="text-xs py-0.5 px-2 bg-[var(--color-terminal-green)] text-[var(--color-wood-dark)] rounded uppercase font-semibold">{t('experience.current')}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-(--font-code) text-sm text-white/50">{t(`experience.${exp.id}.period`)}</span>
                    <span className="font-(--font-code) text-xs text-[var(--color-terminal-green)]/70">· {t(`experience.${exp.id}.duration`)}</span>
                  </div>
                </div>

                <h3 className="font-(--font-display) text-[1.4rem] sm:text-[1.75rem] text-[var(--color-paper-cream)] mb-2">{t(`experience.${exp.id}.title`)}</h3>
                <p className="text-sm sm:text-base text-white/70 mb-4 leading-relaxed">{t(`experience.${exp.id}.description`)}</p>

                <div>
                  <h4 className="font-(--font-code) text-xs text-[var(--color-terminal-green)] uppercase tracking-widest mb-2">{t('experience.achievements')}</h4>
                  <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                    {getAchievements(exp.id).map((achievement, achievementIndex) => (
                      <li
                        key={achievementIndex}
                        className="flex items-start gap-2 text-sm text-white/80"
                      >
                        <span className="text-[var(--color-terminal-green)] font-bold">✓</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
