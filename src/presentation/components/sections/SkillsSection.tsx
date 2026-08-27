import { useMemo } from 'react'
import type { CSSProperties, ElementType } from 'react'
import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

export default function SkillsSection() {
  const { t } = useTranslation()

  // Group skills by category, preserving the intentional order from the data file
  // The order groups related items together (e.g., DevOps tools, then Testing, then IDE/AI tools)
  const skillsByCategory = useMemo(() => {
    const categories = ['soft', 'ia', 'hardskills'] as const
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[800px] xl:max-w-[900px] 2xl:max-w-[1000px] mx-auto justify-items-center lg:justify-items-stretch">
          {skillsByCategory.map((category, cIndex) => (
            <div
              key={category.id}
              className="glass reveal p-3 w-full max-w-[230px] sm:max-w-none lg:w-full flex flex-col"
              style={{ '--reveal-i': cIndex } as CSSProperties}
            >
              <h3 className="font-(--font-display) text-sm text-[var(--color-terminal-green)] mb-1.5 pb-0.5 border-b border-[color-mix(in_srgb,var(--color-accent-secondary)_20%,transparent)]">{category.name}</h3>

              <div className="flex flex-col gap-1.5 flex-1">
                {category.skills.map(skill => {
                  const Tag = (skill.url ? 'a' : 'div') as ElementType
                  return (
                    <Tag
                      key={skill.id}
                      href={skill.url || undefined}
                      target={skill.url ? '_blank' : undefined}
                      rel={skill.url ? 'noopener noreferrer' : undefined}
                      className={`group flex items-center gap-2 py-1.5 px-2.5 bg-black/15 rounded-md transition-[background-color,transform] duration-150 hover:bg-black/25 hover:translate-x-1 ${skill.url ? 'cursor-pointer' : ''}`}
                    >
                      {skill.logo ? (
                        <img src={skill.logo} alt={skill.name} className="w-5 h-5 rounded-sm" />
                      ) : skill.icon ? (
                        <span className="text-lg">{skill.icon}</span>
                      ) : null}
                      <span className="text-sm text-[var(--color-paper-cream)]">{skill.name}</span>
                      {skill.url && <span className="ml-auto text-[var(--color-text-faint)] text-xs transition-[transform,color] duration-150 group-hover:text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>}
                    </Tag>
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
