import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useAchievements } from '@application/hooks/useAchievements'
import { resumeData } from '@domain/data/resume'

export default function ProjectsSection() {
  const { t } = useTranslation()
  const { unlock } = useAchievements()

  // Cards are real <a> links now (keyboard + middle-click support); the click
  // handler only tracks the achievement, navigation is native.
  const trackProject = (url: string) => {
    if (url.includes('github.com')) {
      unlock('githubVisitor')
    }
  }

  const trackGithubProfile = () => {
    unlock('githubVisitor')
  }

  return (
    <section id="projects" className="section bg-transparent section-padding" data-section="projects">
      {/* Content */}
      <div className="section-content flex flex-col items-center justify-center pointer-events-none">
        <div className="section-header reveal">
          <h2 className="text-[var(--color-frontend-blue)] mb-2">{t('projects.title')}</h2>
          <p className="section-subtitle">{t('projects.subtitle')}</p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[420px] sm:max-w-[680px] lg:max-w-[880px]">
            {/* Blog Card */}
            {resumeData.projects.map((project, pIndex) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass reveal flex flex-col gap-2 p-4 lg:p-5 cursor-pointer transition-[border-color,transform,box-shadow,background-color] duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur no-underline hover:border-[var(--color-frontend-blue)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-indigo)] hover:bg-[#0F0F19]/95 active:translate-y-0 active:scale-[0.99]"
                style={{ '--reveal-i': pIndex } as CSSProperties}
                onClick={() => trackProject(project.url)}
              >
                {/* Header: Icon + Name */}
                <div className="flex items-center gap-2">
                  <span className="text-base shrink-0" aria-hidden="true">{project.icon}</span>
                  <span className="font-(--font-code) text-sm text-[var(--color-paper-cream)] flex-1">{project.name}</span>
                  {project.stars && <span className="text-xs text-[var(--color-growth-yellow)] shrink-0">⭐ {project.stars}</span>}
                </div>

                {/* Tech tag */}
                <span className="font-(--font-code) text-xs text-[var(--color-terminal-green)]/80">{project.tech}</span>

                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed">{t(`projects.${project.id}.desc`)}</p>
              </a>
            ))}

            {/* GitHub Open Source Projects Card */}
            <a
              href={resumeData.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass reveal flex flex-col gap-2 p-4 lg:p-5 cursor-pointer transition-[border-color,transform,box-shadow,background-color] duration-150 border border-white/10 pointer-events-auto bg-[#0A0A0F]/85 backdrop-blur no-underline hover:border-[var(--color-frontend-blue)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-indigo)] hover:bg-[#0F0F19]/95 active:translate-y-0 active:scale-[0.99] group"
              style={{ '--reveal-i': resumeData.projects.length } as CSSProperties}
              onClick={trackGithubProfile}
            >
              {/* Header: Icon + Title */}
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0" aria-hidden="true">🐙</span>
                <span className="font-(--font-code) text-sm text-[var(--color-paper-cream)] flex-1">{t('projects.github.title')}</span>
              </div>

              {/* Tech tag */}
              <span className="font-(--font-code) text-xs text-[var(--color-terminal-green)]/80">{t('projects.github.tech')}</span>

              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed">{t('projects.github.desc', { count: resumeData.github.totalRepos })}</p>

              {/* Footer: Username + Arrow */}
              <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                <span className="font-(--font-code) text-xs text-[var(--color-paper-cream)]">@{resumeData.github.username}</span>
                <span className="text-sm text-[var(--color-frontend-blue)] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-[opacity,transform] duration-150">→</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
