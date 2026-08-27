import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

export default function AboutSection() {
  const { t } = useTranslation()

  return (
    <section id="about" className="section bg-transparent section-padding" data-section="about">
      {/* Content */}
      <div className="section-content flex flex-col justify-center items-center h-full">
        <div className="section-header w-full reveal">
          <h2 className="text-[var(--color-terminal-green)] mb-2">{t('about.title')}</h2>
          <p className="section-subtitle">{t('about.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[600px] xl:max-w-[800px] 2xl:max-w-[1000px]">
          {/* Behaviors */}
          {resumeData.behaviors && resumeData.behaviors.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {resumeData.behaviors.map((behavior, bIndex) => (
                  <div
                    key={behavior.id}
                    className="reveal inline-flex items-center gap-1.5 py-1.5 px-2.5 bg-[var(--color-surface-glass)] backdrop-blur border rounded-full transition-[background-color,border-color,transform] duration-150 hover:bg-[#0A0A0A]/70 hover:-translate-y-0.5"
                    style={{
                      borderColor: `color-mix(in srgb, ${behavior.color} 40%, transparent)`,
                      '--behavior-color': behavior.color,
                      '--reveal-i': Math.min(bIndex, 6)
                    } as CSSProperties}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = behavior.color }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${behavior.color} 40%, transparent)` }}
                  >
                    <span className="text-sm">{behavior.icon}</span>
                    <span className="text-sm text-white/90 font-medium">{t(`about.behaviors.${behavior.id}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths and Improvement Areas */}
          {((resumeData.strengths && resumeData.strengths.length > 0) || (resumeData.improvementAreas && resumeData.improvementAreas.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {resumeData.strengths && resumeData.strengths.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white/90 text-center">{t('about.strengths.title')}</h3>
                  {resumeData.strengths.map((strength, sIndex) => (
                    <div
                      key={strength.id}
                      className="reveal bg-[#0A0A0A]/60 backdrop-blur-md border border-purple-500/15 rounded-lg flex items-start gap-3 py-3 px-4 transition-[background-color,border-color] duration-150 hover:bg-[#0A0A0A]/80 hover:border-purple-500/30"
                      style={{ '--reveal-i': Math.min(sIndex, 4) } as CSSProperties}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{strength.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white/90 mb-1">{t(`about.strengths.${strength.id}.title`)}</div>
                        <p className="text-sm leading-relaxed text-white/70 m-0">{t(`about.strengths.${strength.id}.description`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Improvement Areas */}
              {resumeData.improvementAreas && resumeData.improvementAreas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white/90 text-center">{t('about.improvementAreas.title')}</h3>
                  {resumeData.improvementAreas.map((area, aIndex) => (
                    <div
                      key={area.id}
                      className="reveal bg-[#0A0A0A]/60 backdrop-blur-md border border-[color-mix(in_srgb,var(--color-accent-cool)_18%,transparent)] rounded-lg py-3 px-4 transition-[background-color,border-color] duration-150 hover:bg-[#0A0A0A]/80 hover:border-[color-mix(in_srgb,var(--color-accent-cool)_35%,transparent)]"
                      style={{ '--reveal-i': Math.min(aIndex, 4) } as CSSProperties}
                    >
                      <p className="text-sm leading-relaxed text-white/70 m-0">{t(`about.improvementAreas.${area.id}`)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footnote */}
          <div className="text-center mt-4">
            <p className="text-xs text-white/50">
              {t('about.footnote.prefix')}
              {' '}
              <a href="https://my.assessfirst.com/" target="_blank" rel="noopener noreferrer"
                className="text-white/70 hover:text-white underline transition-colors">
                {t('about.footnote.link')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
