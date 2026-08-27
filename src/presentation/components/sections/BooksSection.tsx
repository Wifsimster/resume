import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAchievements } from '@application/hooks/useAchievements'
import { resumeData } from '@domain/data/resume'

export default function BooksSection() {
  const { t } = useTranslation()
  const { unlock } = useAchievements()

  // One config drives all shelf columns (they only ever differed by status
  // key, border tint and emoji).
  const shelves = useMemo(() => [
    { key: 'read', label: t('books.read'), emoji: '📗', border: '', books: resumeData.books.filter(b => b.status === 'read') },
    { key: 'toRead', label: t('books.toRead'), emoji: '📕', border: 'border-purple-400/30', books: resumeData.books.filter(b => b.status === 'toRead') },
    { key: 'toBuy', label: t('books.toBuy'), emoji: '📘', border: 'border-[color-mix(in_srgb,var(--color-accent-cool)_30%,transparent)]', books: resumeData.books.filter(b => b.status === 'toBuy') }
  ], [t])

  // Rows are real <a> links; the handler only tracks achievements.
  const trackBook = (status?: string) => {
    unlock('bookworm')
    if (status === 'toBuy') {
      unlock('bookBuyer')
    }
  }

  return (
    <section id="books" className="section bg-transparent section-padding" data-section="books">
      {/* Content */}
      <div className="section-content mx-auto">
        <div className="section-header reveal">
          <h2 className="text-[var(--color-book-amber)] mb-2">{t('books.title')}</h2>
          <p className="section-subtitle">{t('books.subtitle')}</p>
        </div>

        <div className="w-full flex justify-center">
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px]">
            {shelves.map((shelf, shelfIndex) => (
              <div
                key={shelf.key}
                className={`glass reveal p-4 flex-1 min-w-[280px] max-w-[360px] ${shelf.border}`}
                style={{ '--reveal-i': shelfIndex } as CSSProperties}
              >
                <h3 className="font-(--font-display) text-xl text-[var(--color-paper-cream)] mb-3">
                  {shelf.label}
                </h3>
                <div className="flex flex-col gap-2">
                  {shelf.books.map(book => (
                    <a
                      key={book.id}
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-2.5 min-h-11 bg-black/15 rounded-lg cursor-pointer no-underline transition-[background-color,transform] duration-150 hover:bg-black/25 hover:translate-x-1 active:scale-[0.99]"
                      onClick={() => trackBook(book.status)}
                    >
                      <div className="text-2xl w-[40px] h-[48px] flex items-center justify-center bg-white/3 rounded" aria-hidden="true">{shelf.emoji}</div>
                      <div className="flex flex-col justify-center gap-0.5">
                        <span className="text-xs text-[var(--color-paper-cream)] leading-tight">{book.title}</span>
                        <span className="text-xs text-[var(--color-text-faint)]">{book.author}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
