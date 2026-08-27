import { useScrollSection } from '@application/hooks/useScrollSection'

export default function XPProgressBar() {
  const { currentSectionIndex, totalSections, progressPercent } = useScrollSection()

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] flex items-center gap-2 px-4 h-6 bg-black/50 backdrop-blur-sm">
      <div className="flex-1 h-1 bg-white/10 rounded-sm overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-terminal-green)] to-[var(--color-vue-green)] rounded-sm transition-[width] duration-300 shadow-[0_0_10px_rgba(0,255,65,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="font-(--font-code) text-xs text-[var(--color-terminal-green)] flex items-center gap-0.5 min-w-10">
        <span className="font-semibold">{currentSectionIndex + 1}</span>
        <span className="opacity-50">/</span>
        <span className="opacity-70">{totalSections}</span>
      </div>
    </div>
  )
}
