import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

export default function SkillsSection() {
  const { t } = useTranslation()

  // Group skills by category, preserving the intentional order from the data file
  const skillsByCategory = useMemo(() => {
    const categories = ['hardskills', 'soft'] as const
    return categories.map(cat => ({
      id: cat,
      name: t(`skills.${cat}`),
      skills: resumeData.skills.filter(s => s.category === cat) // filter preserves order
    }))
  }, [t])

  return (
    <section id="skills" className="section bg-transparent section-padding" data-section="skills">
      {/* Content */}
      <div className="section-content">
        <div className="section-header reveal">
          <h2 className="text-[var(--color-growth-yellow)] mb-2">{t('skills.title')}</h2>
          <p className="section-subtitle">{t('skills.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[600px] xl:max-w-[680px] mx-auto justify-items-center sm:justify-items-stretch">
          {skillsByCategory.map((category, cIndex) => (
            <div
              key={category.id}
              className="glass reveal p-3 w-full max-w-[230px] sm:max-w-none lg:w-full flex flex-col"
              style={{ '--reveal-i': cIndex } as CSSProperties}
            >
              <h3 className="font-(--font-display) text-sm text-[var(--color-terminal-green)] mb-1.5 pb-0.5 border-b border-[color-mix(in_srgb,var(--color-accent-secondary)_20%,transparent)]">{category.name}</h3>

              <div className="flex flex-col gap-1.5 flex-1">
                {category.skills.map(skill => {
                  const itemClass = `group flex items-center gap-2 py-1.5 px-2.5 bg-black/15 rounded-md transition-[background-color,transform] duration-150 hover:bg-black/25 hover:translate-x-1 ${skill.url ? 'cursor-pointer' : ''}`
                  const content = (
                    <>
                      {skill.logo ? (
                        <img src={skill.logo} alt={skill.name} className="w-5 h-5 rounded-sm" />
                      ) : skill.icon ? (
                        <span className="text-lg">{skill.icon}</span>
                      ) : null}
                      <span className="text-sm text-[var(--color-paper-cream)]">{skill.name}</span>
                      {skill.url && <span className="ml-auto text-[var(--color-text-faint)] text-xs transition-[transform,color] duration-150 group-hover:text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>}
                    </>
                  )
                  return skill.url ? (
                    <a key={skill.id} href={skill.url} target="_blank" rel="noopener noreferrer" className={itemClass}>
                      {content}
                    </a>
                  ) : (
                    <div key={skill.id} className={itemClass}>
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
