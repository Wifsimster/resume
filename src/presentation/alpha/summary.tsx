import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

// The scannable escape hatch from the conversation.
//
// A recruiter who wants a 3-second read of the background should never have
// to prompt a chatbot for it. This drawer puts the whole resume — identity,
// numbers, experience, skills, projects, contact — on one scrollable surface
// they can skim or print, while the chat keeps its thread underneath.
//
// Content comes from resumeData + the locale files: no copy is duplicated
// here, so the two views can never drift apart.

const copy = {
  fr: {
    title: 'CV en un coup d\'œil',
    close: 'Fermer le CV',
    numbers: 'En chiffres',
    experience: 'Expérience',
    skills: 'Compétences',
    projects: 'Open source',
    contact: 'Contact',
    current: 'Poste actuel',
    print: 'Imprimer',
    classic: 'Version 3D',
    ask: 'Poser une question à l\'IA',
    years: 'Années d\'expérience',
    repos: 'Dépôts publics',
    team: 'Développeurs encadrés',
    stars: 'Étoiles GitHub'
  },
  en: {
    title: 'Resume at a glance',
    close: 'Close the resume',
    numbers: 'By the numbers',
    experience: 'Experience',
    skills: 'Skills',
    projects: 'Open source',
    contact: 'Contact',
    current: 'Current role',
    print: 'Print',
    classic: '3D version',
    ask: 'Ask the AI a question',
    years: 'Years of experience',
    repos: 'Public repositories',
    team: 'Developers mentored',
    stars: 'GitHub stars'
  }
}

const CLOSE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

function Section({ title, children }: { title: string, children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      {/* Size and weight come from alpha.css — see the heading note there */}
      <h3 className="uppercase tracking-[0.14em] text-[var(--alpha-subtle)]">{title}</h3>
      {children}
    </section>
  )
}

export function SummaryPanel({ open, onClose, onAsk, lang }: {
  open: boolean
  onClose: () => void
  onAsk: () => void
  lang: 'fr' | 'en'
}) {
  const { t } = useTranslation()
  const text = copy[lang]
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Escape closes; focus moves into the drawer on open and back to whatever
  // opened it on close
  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      restoreFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const stats = resumeData.statistics
  const totalStars = resumeData.projects.reduce((n, p) => n + (p.stars ?? 0), 0)
  const numbers = [
    { value: `${stats?.yearsOfExperience ?? 9}+`, label: text.years },
    { value: String(resumeData.github.totalRepos), label: text.repos },
    { value: String(stats?.developersRecruited ?? 6), label: text.team },
    { value: String(totalStars), label: text.stars }
  ]
  const hard = resumeData.skills.filter(s => s.category === 'hardskills')
  const soft = resumeData.skills.filter(s => s.category === 'soft')
  const projects = resumeData.projects.filter(p => p.type === 'github')

  const linkClass = 'flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--alpha-border)] bg-white/[0.02] text-sm text-[var(--alpha-text)] no-underline hover:border-white/20 hover:bg-white/[0.04] transition-colors'

  return (
    <div className="alpha-summary-layer fixed inset-0 z-50 flex" role="presentation">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="alpha-summary-scrim absolute inset-0 bg-black/60 backdrop-blur-[2px] cursor-default"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={text.title}
        data-component="summary-panel"
        className="alpha-summary-panel relative ml-auto flex h-full w-full max-w-full sm:max-w-xl flex-col bg-[var(--alpha-bg)] border-l border-[var(--alpha-border)] shadow-2xl shadow-black/50 outline-none"
      >
        {/* Sticky title bar so the close action never scrolls away */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--alpha-border)]">
          <span className="text-sm font-medium tracking-tight text-[var(--alpha-text)]">{text.title}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.print()}
              className="alpha-summary-hide-print h-8 px-2.5 rounded-md text-xs text-[var(--alpha-muted)] hover:text-[var(--alpha-text)] hover:bg-white/5 transition-colors cursor-pointer"
            >
              {text.print}
            </button>
            <button
              onClick={onClose}
              aria-label={text.close}
              title={text.close}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--alpha-muted)] hover:text-[var(--alpha-text)] hover:bg-white/5 transition-colors cursor-pointer"
            >
              {CLOSE_ICON}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(env(safe-area-inset-bottom),20px)] flex flex-col gap-7">
          {/* Identity */}
          <header className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 rounded-xl border border-[var(--alpha-border)] bg-gradient-to-br from-violet-600/30 to-cyan-500/10 flex items-center justify-center text-base font-semibold tracking-wide text-[var(--alpha-text)]" aria-hidden="true">DB</div>
            <div className="min-w-0">
              <h2 className="text-[var(--alpha-text)]">{resumeData.name}</h2>
              <p className="text-sm text-[var(--alpha-body)]">{resumeData.title} · {resumeData.company}</p>
              <p className="text-xs text-[var(--alpha-subtle)] mt-0.5">{resumeData.location} · {t('hero.subtitle')}</p>
              <p className="text-sm text-[var(--alpha-muted)] mt-2 leading-relaxed">{t('hero.tagline')}</p>
            </div>
          </header>

          <Section title={text.numbers}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {numbers.map(item => (
                <div key={item.label} className="rounded-lg border border-[var(--alpha-border)] bg-[var(--alpha-card)] px-3 py-2.5">
                  <div className="text-xl font-semibold tracking-tight text-[var(--alpha-text)]">{item.value}</div>
                  <div className="text-[11px] leading-tight text-[var(--alpha-subtle)]">{item.label}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={text.experience}>
            <ol className="flex flex-col gap-4 list-none">
              {resumeData.experiences.map(exp => (
                <li key={exp.id} className="rounded-lg border border-[var(--alpha-border)] bg-[var(--alpha-card)] p-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-[var(--alpha-text)]">{t(`experience.${exp.id}.title`)}</span>
                    <span className="text-sm text-[var(--alpha-subtle)]">· {exp.company}</span>
                    {exp.current && (
                      <span className="ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-[var(--alpha-ok)]/40 text-[var(--alpha-ok)]">{text.current}</span>
                    )}
                  </div>
                  <div className="text-xs alpha-mono text-[var(--alpha-subtle)] mt-0.5">{t(`experience.${exp.id}.period`)} · {t(`experience.${exp.id}.duration`)}</div>
                  <ul className="text-xs text-[var(--alpha-muted)] leading-relaxed list-disc pl-4 mt-2 flex flex-col gap-1">
                    {(t(`experience.${exp.id}.achievements`, { returnObjects: true }) as string[] ?? []).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Section>

          <Section title={text.skills}>
            <div className="flex flex-col gap-3">
              {[{ label: t('skills.hardskills'), items: hard }, { label: t('skills.soft'), items: soft }].map(group => (
                <div key={group.label}>
                  <div className="text-[11px] text-[var(--alpha-subtle)] mb-1.5">{group.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map(skill => (
                      <span key={skill.id} className="px-2.5 py-1 text-xs rounded-md bg-white/[0.04] border border-[var(--alpha-border)] text-[var(--alpha-body)]">
                        <span aria-hidden="true">{skill.icon}</span> {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={text.projects}>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {projects.map(project => (
                <a
                  key={project.id}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[var(--alpha-border)] bg-white/[0.02] p-3 no-underline hover:border-white/20 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--alpha-text)]">
                    <span aria-hidden="true">{project.icon}</span>
                    <span className="alpha-mono">{project.name}</span>
                    {project.stars ? <span className="ml-auto text-xs text-amber-400/90">⭐ {project.stars}</span> : null}
                  </div>
                  <div className="text-[11px] text-[var(--alpha-subtle)] alpha-mono mt-0.5">{project.tech}</div>
                  <div className="text-xs text-[var(--alpha-muted)] mt-1 leading-snug">{t(`projects.${project.id}.desc`)}</div>
                </a>
              ))}
            </div>
          </Section>

          <Section title={text.contact}>
            <div className="flex flex-wrap gap-2">
              {resumeData.socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <span aria-hidden="true">{link.icon}</span> {link.name}
                </a>
              ))}
              <a href="?ui=classic" className={`${linkClass} alpha-summary-hide-print`}>
                <span aria-hidden="true">🧊</span> {text.classic}
              </a>
            </div>
          </Section>

          <button
            type="button"
            onClick={onAsk}
            className="alpha-summary-hide-print self-start text-xs text-[var(--alpha-accent)] hover:underline cursor-pointer bg-transparent"
          >
            {text.ask} →
          </button>
        </div>
      </div>
    </div>
  )
}
