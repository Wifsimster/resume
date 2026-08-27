import { useTranslation } from 'react-i18next'
import { resumeData } from '@domain/data/resume'

// Generative-UI blocks the scripted engine "renders" inside assistant
// messages — each one is fed by the real resumeData, never duplicated copy.

export type CardKind = 'profile' | 'experience' | 'skills' | 'projects' | 'maker' | 'stats' | 'contact' | 'books'

const cardShell = 'rounded-xl border border-white/10 bg-[#0D0D14]/80 p-4'

export function ProfileCard() {
  const { t } = useTranslation()
  return (
    <div className={`${cardShell} flex items-center gap-4`}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--palette-cyan-400)] flex items-center justify-center text-2xl" aria-hidden="true">👨‍🚀</div>
      <div>
        <div className="font-(--font-display) text-lg text-[var(--color-paper-cream)]">{resumeData.name}</div>
        <div className="text-sm text-[var(--color-terminal-green)]">{t('hero.tagline')}</div>
        <div className="text-xs text-white/50 mt-0.5">{resumeData.title} · {resumeData.company} · {resumeData.location}</div>
      </div>
    </div>
  )
}

export function ExperienceCard() {
  const { t } = useTranslation()
  return (
    <div className={`${cardShell} flex flex-col gap-4`}>
      {resumeData.experiences.map(exp => (
        <div key={exp.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${exp.current ? 'bg-[var(--color-terminal-green)] shadow-[0_0_8px_rgba(0,255,65,0.6)]' : 'bg-white/30'}`} />
            <div className="flex-1 w-px bg-white/10 mt-1" />
          </div>
          <div className="pb-1">
            <div className="text-sm font-semibold text-[var(--color-paper-cream)]">
              {t(`experience.${exp.id}.title`)} <span className="text-white/40 font-normal">· {exp.company}</span>
            </div>
            <div className="text-xs font-(--font-code) text-[var(--color-terminal-green)]/80 mb-1.5">{exp.period}</div>
            <ul className="text-xs text-white/60 leading-relaxed list-disc pl-4">
              {(t(`experience.${exp.id}.achievements`, { returnObjects: true }) as string[] ?? []).slice(0, 4).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkillsCard() {
  const { t } = useTranslation()
  const hard = resumeData.skills.filter(s => s.category === 'hardskills')
  const soft = resumeData.skills.filter(s => s.category === 'soft')
  return (
    <div className={`${cardShell} grid sm:grid-cols-2 gap-4`}>
      {[{ label: t('skills.hardskills'), items: hard }, { label: t('skills.soft'), items: soft }].map(group => (
        <div key={group.label}>
          <div className="text-xs font-(--font-code) text-[var(--color-terminal-green)] mb-2">{group.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map(skill => (
              <span key={skill.id} className="px-2.5 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-white/75">
                <span aria-hidden="true">{skill.icon}</span> {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectsCard() {
  const { t } = useTranslation()
  const projects = resumeData.projects.filter(p => p.type === 'github')
  return (
    <div className={`${cardShell} grid sm:grid-cols-2 gap-2.5`}>
      {projects.map(project => (
        <a key={project.id} href={project.url} target="_blank" rel="noopener noreferrer"
          className="rounded-lg border border-white/10 bg-black/25 p-3 no-underline hover:border-[var(--color-accent-primary)]/50 transition-colors">
          <div className="flex items-center gap-2 text-sm text-[var(--color-paper-cream)]">
            <span aria-hidden="true">{project.icon}</span>
            <span className="font-(--font-code)">{project.name}</span>
            {project.stars ? <span className="ml-auto text-xs text-[var(--color-growth-yellow)]">⭐ {project.stars}</span> : null}
          </div>
          <div className="text-[11px] text-[var(--color-terminal-green)]/70 font-(--font-code) mt-0.5">{project.tech}</div>
          <div className="text-xs text-white/55 mt-1 leading-snug">{t(`projects.${project.id}.desc`)}</div>
        </a>
      ))}
    </div>
  )
}

export function MakerCard() {
  const { t } = useTranslation()
  const unitIds = ['freebox', 'udmPro', 'nas', 'gamingComputer', 'ups']
  return (
    <div className={cardShell}>
      <div className="text-xs font-(--font-code) text-[var(--color-copper,#B87333)] mb-2">🗄️ Homelab</div>
      <div className="flex flex-col gap-1.5">
        {unitIds.map(id => (
          <div key={id} className="flex items-baseline gap-2 text-xs">
            <span className="text-[var(--color-paper-cream)] shrink-0">{t(`maker.rackUnits.${id}.name`)}</span>
            <span className="text-white/45 truncate">{t(`maker.rackUnits.${id}.description`)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsCard() {
  const { t } = useTranslation()
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
          <div className="font-(--font-display) text-2xl text-[var(--color-accent-primary)]">{stat.value}</div>
          <div className="text-[11px] text-white/50 leading-tight">{stat.label}</div>
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
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-black/25 text-sm text-[var(--color-paper-cream)] no-underline hover:border-[var(--color-accent-primary)]/50 transition-colors">
          <span aria-hidden="true">{link.icon}</span> {link.name}
        </a>
      ))}
      <a href="https://cv.battistella.ovh/" className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-black/25 text-sm text-[var(--color-paper-cream)] no-underline hover:border-[var(--color-accent-primary)]/50 transition-colors">
        <span aria-hidden="true">🌐</span> cv.battistella.ovh
      </a>
    </div>
  )
}

export function BooksCard() {
  const read = resumeData.books.filter(b => b.status === 'read')
  return (
    <div className={`${cardShell} flex flex-col gap-2`}>
      {read.map(book => (
        <a key={book.id} href={book.url} target="_blank" rel="noopener noreferrer"
          className="text-xs no-underline hover:opacity-80">
          <span className="text-[var(--color-paper-cream)]">📖 {book.title}</span>
          <span className="text-white/45"> — {book.author}</span>
        </a>
      ))}
    </div>
  )
}

export function Card({ kind }: { kind: CardKind }) {
  switch (kind) {
    case 'profile': return <ProfileCard />
    case 'experience': return <ExperienceCard />
    case 'skills': return <SkillsCard />
    case 'projects': return <ProjectsCard />
    case 'maker': return <MakerCard />
    case 'stats': return <StatsCard />
    case 'contact': return <ContactCard />
    case 'books': return <BooksCard />
  }
}
