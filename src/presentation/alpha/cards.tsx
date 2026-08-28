import type { KeyboardEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

// Generative-UI blocks the assistant renders inside its messages — each one
// fed by the real resumeData, never duplicated copy. Cards are interactive:
// clicking a skill, project, book, rack unit or experience asks the chat
// about it (external links stay reachable through a small ↗ anchor).

export type CardKind = 'profile' | 'experience' | 'skills' | 'projects' | 'maker' | 'stats' | 'contact' | 'books'

type Ask = (question: string) => void

const cardShell = 'rounded-xl border border-[var(--alpha-border)] bg-[var(--alpha-card)] p-4'

const useLang = () => {
  const { t, i18n } = useTranslation()
  return { t, fr: i18n.language !== 'en' }
}

// Accessible clickable row that may contain a real <a> inside (so it cannot
// be a <button>): div with button semantics, Enter/Space activation
function AskRow({ onAsk, question, className, children }: { onAsk: Ask, question: string, className: string, children: ReactNode }) {
  const activate = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onAsk(question)
    }
  }
  return (
    <div role="button" tabIndex={0} title={question} onClick={() => onAsk(question)} onKeyDown={activate} className={className}>
      {children}
    </div>
  )
}

const EXTERNAL_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
)

// The identity block that opens the thread. It is a message in the stream —
// never a floating overlay — so it has a single, unambiguous focal point and
// scrolls away with the rest of the conversation once the visitor engages.
export function ProfileCard({ onOpenSummary }: { onOpenSummary?: () => void }) {
  const { t, fr } = useLang()
  const stats = resumeData.statistics
  const facts = [
    `${stats?.yearsOfExperience ?? 9}+ ${fr ? 'ans d\u2019expérience' : 'years of experience'}`,
    `${stats?.developersRecruited ?? 6} ${fr ? 'développeurs encadrés' : 'developers mentored'}`,
    `${resumeData.github.totalRepos} ${fr ? 'dépôts publics' : 'public repos'}`
  ]
  return (
    <div className={`${cardShell} flex flex-col gap-3.5`} data-card="profile">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-lg border border-[var(--alpha-border)] bg-gradient-to-br from-violet-600/25 to-cyan-500/10 flex items-center justify-center text-sm font-semibold tracking-wide text-[var(--alpha-text)]" aria-hidden="true">DB</div>
        <div className="min-w-0">
          <div className="text-base font-medium tracking-tight text-[var(--alpha-text)]">{resumeData.name}</div>
          <div className="text-sm text-[var(--alpha-muted)]">{resumeData.title} · {resumeData.company}</div>
          <div className="text-xs text-[var(--alpha-subtle)] mt-0.5">{resumeData.location} · {t('hero.tagline')}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {facts.map(fact => (
          <span key={fact} className="px-2 py-0.5 text-[11px] rounded-full border border-[var(--alpha-border)] bg-white/[0.03] text-[var(--alpha-muted)]">{fact}</span>
        ))}
      </div>
      {onOpenSummary && (
        <button
          type="button"
          onClick={onOpenSummary}
          className="self-start text-xs text-[var(--alpha-accent)] hover:underline cursor-pointer bg-transparent"
        >
          {fr ? 'Voir le CV complet, sans discuter' : 'Read the full resume, no chat needed'} →
        </button>
      )}
    </div>
  )
}

export function ExperienceCard({ onAsk }: { onAsk: Ask }) {
  const { t, fr } = useLang()
  return (
    <div className={`${cardShell} flex flex-col gap-4`}>
      {resumeData.experiences.map(exp => {
        const title = t(`experience.${exp.id}.title`)
        const question = fr
          ? `Détaille son poste de ${title} chez ${exp.company}`
          : `Tell me more about his ${title} role at ${exp.company}`
        return (
          <div key={exp.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${exp.current ? 'bg-[var(--alpha-ok)]' : 'bg-white/20'}`} />
              <div className="flex-1 w-px bg-[var(--alpha-border)] mt-1" />
            </div>
            <AskRow onAsk={onAsk} question={question} className="pb-1 -m-1 p-1 rounded-lg cursor-pointer hover:bg-white/[0.03] transition-colors">
              <div className="text-sm font-medium text-[var(--alpha-text)]">
                {title} <span className="text-[var(--alpha-subtle)] font-normal">· {exp.company}</span>
              </div>
              <div className="text-xs alpha-mono text-[var(--alpha-subtle)] mb-1.5">{exp.period}</div>
              <ul className="text-xs text-[var(--alpha-muted)] leading-relaxed list-disc pl-4">
                {(t(`experience.${exp.id}.achievements`, { returnObjects: true }) as string[] ?? []).slice(0, 4).map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </AskRow>
          </div>
        )
      })}
    </div>
  )
}

export function SkillsCard({ onAsk }: { onAsk: Ask }) {
  const { t, fr } = useLang()
  const hard = resumeData.skills.filter(s => s.category === 'hardskills')
  const soft = resumeData.skills.filter(s => s.category === 'soft')
  return (
    <div className={`${cardShell} grid sm:grid-cols-2 gap-4`}>
      {[{ label: t('skills.hardskills'), items: hard }, { label: t('skills.soft'), items: soft }].map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--alpha-subtle)] mb-2">{group.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map(skill => {
              const question = fr ? `Parle-moi de sa compétence « ${skill.name} »` : `Tell me about his "${skill.name}" skill`
              return (
                <button
                  key={skill.id}
                  onClick={() => onAsk(question)}
                  title={question}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/[0.04] border border-[var(--alpha-border)] text-[var(--alpha-body)] hover:border-[var(--alpha-accent)]/50 hover:text-[var(--alpha-text)] transition-colors cursor-pointer"
                >
                  <span aria-hidden="true">{skill.icon}</span> {skill.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectsCard({ onAsk }: { onAsk: Ask }) {
  const { t, fr } = useLang()
  const projects = resumeData.projects.filter(p => p.type === 'github')
  return (
    <div className={`${cardShell} grid sm:grid-cols-2 gap-2.5`}>
      {projects.map(project => {
        const question = fr ? `Parle-moi du projet ${project.name}` : `Tell me about the ${project.name} project`
        return (
          <AskRow key={project.id} onAsk={onAsk} question={question}
            className="rounded-lg border border-[var(--alpha-border)] bg-white/[0.02] p-3 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-2 text-sm text-[var(--alpha-text)]">
              <span aria-hidden="true">{project.icon}</span>
              <span className="alpha-mono">{project.name}</span>
              {project.stars ? <span className="ml-auto text-xs text-amber-400/90">⭐ {project.stars}</span> : null}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub — ${project.name}`}
                onClick={(e) => e.stopPropagation()}
                className={`${project.stars ? '' : 'ml-auto '}text-[var(--alpha-subtle)] hover:text-[var(--alpha-text)] transition-colors`}
              >
                {EXTERNAL_ICON}
              </a>
            </div>
            <div className="text-[11px] text-[var(--alpha-subtle)] alpha-mono mt-0.5">{project.tech}</div>
            <div className="text-xs text-[var(--alpha-muted)] mt-1 leading-snug">{t(`projects.${project.id}.desc`)}</div>
          </AskRow>
        )
      })}
    </div>
  )
}

export function MakerCard({ onAsk }: { onAsk: Ask }) {
  const { t, fr } = useLang()
  const unitIds = ['freebox', 'udmPro', 'nas', 'gamingComputer', 'ups']
  return (
    <div className={cardShell}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--alpha-subtle)] mb-2">🗄️ Homelab</div>
      <div className="flex flex-col gap-0.5">
        {unitIds.map(id => {
          const name = t(`maker.rackUnits.${id}.name`)
          const question = fr ? `À quoi lui sert son « ${name} » ?` : `What does he use his "${name}" for?`
          return (
            <button
              key={id}
              onClick={() => onAsk(question)}
              title={question}
              className="flex items-baseline gap-2 text-xs text-left -mx-1.5 px-1.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <span className="text-[var(--alpha-text)] shrink-0">{name}</span>
              <span className="text-[var(--alpha-subtle)] truncate">{t(`maker.rackUnits.${id}.description`)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function StatsCard() {
  const { t } = useLang()
  const stats = [
    { value: `${resumeData.statistics?.yearsOfExperience ?? 9}+`, label: t('about.stats.experience', { defaultValue: 'Years' }) },
    { value: String(resumeData.github.totalRepos), label: 'Repos GitHub' },
    { value: String(resumeData.statistics?.developersRecruited ?? 6), label: t('about.stats.developers', { defaultValue: 'Devs' }) },
    { value: '30', label: 'Achievements' }
  ]
  return (
    <div className={`${cardShell} grid grid-cols-2 sm:grid-cols-4 gap-3`}>
      {stats.map(stat => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl font-semibold tracking-tight text-[var(--alpha-text)]">{stat.value}</div>
          <div className="text-[11px] text-[var(--alpha-subtle)] leading-tight">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export function ContactCard() {
  return (
    <div className={`${cardShell} flex flex-wrap gap-2.5`}>
      {resumeData.socialLinks.map(link => (
        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--alpha-border)] bg-white/[0.02] text-sm text-[var(--alpha-text)] no-underline hover:border-white/20 hover:bg-white/[0.04] transition-colors">
          <span aria-hidden="true">{link.icon}</span> {link.name}
        </a>
      ))}
      <a href="https://cv.battistella.ovh/" className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--alpha-border)] bg-white/[0.02] text-sm text-[var(--alpha-text)] no-underline hover:border-white/20 hover:bg-white/[0.04] transition-colors">
        <span aria-hidden="true">🌐</span> cv.battistella.ovh
      </a>
    </div>
  )
}

export function BooksCard({ onAsk }: { onAsk: Ask }) {
  const { fr } = useLang()
  const read = resumeData.books.filter(b => b.status === 'read')
  return (
    <div className={`${cardShell} flex flex-col gap-1`}>
      {read.map(book => {
        const question = fr ? `Parle-moi du livre « ${book.title} »` : `Tell me about the book "${book.title}"`
        return (
          <AskRow key={book.id} onAsk={onAsk} question={question}
            className="flex items-center gap-2 text-xs -mx-1.5 px-1.5 py-1 rounded-md cursor-pointer hover:bg-white/[0.04] transition-colors">
            <span className="text-[var(--alpha-body)]">📖 {book.title}</span>
            <span className="text-[var(--alpha-subtle)] truncate"> — {book.author}</span>
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Amazon — ${book.title}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto shrink-0 text-[var(--alpha-subtle)] hover:text-[var(--alpha-text)] transition-colors"
            >
              {EXTERNAL_ICON}
            </a>
          </AskRow>
        )
      })}
    </div>
  )
}

export function Card({ kind, onAsk, onOpenSummary }: { kind: CardKind, onAsk: Ask, onOpenSummary?: () => void }) {
  switch (kind) {
    case 'profile': return <ProfileCard onOpenSummary={onOpenSummary} />
    case 'experience': return <ExperienceCard onAsk={onAsk} />
    case 'skills': return <SkillsCard onAsk={onAsk} />
    case 'projects': return <ProjectsCard onAsk={onAsk} />
    case 'maker': return <MakerCard onAsk={onAsk} />
    case 'stats': return <StatsCard />
    case 'contact': return <ContactCard />
    case 'books': return <BooksCard onAsk={onAsk} />
  }
}
