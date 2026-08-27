import { useImperativeHandle } from 'react'
import type { Ref } from 'react'
import { useFPS } from '@application/hooks/useFPS'

export interface FPSDisplayHandle {
  start: () => void
  stop: () => void
}

interface Props {
  ref?: Ref<FPSDisplayHandle>
}

export default function FPSDisplay({ ref }: Props) {
  const { fps, enabled, start, stop } = useFPS()

  useImperativeHandle(ref, () => ({ start, stop }), [start, stop])

  if (!enabled) return null

  return (
    <div className="fixed top-4 left-4 z-[var(--z-header)] bg-[var(--color-surface-overlay-strong)] backdrop-blur-md border border-[var(--color-border)] rounded-lg px-3 py-2 font-(--font-code) text-xs text-[var(--color-text-primary)] shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-accent-primary)]">FPS:</span>
        <span
          className={`font-bold ${
            fps >= 55
              ? 'text-[var(--color-success)]'
              : fps >= 30
                ? 'text-[var(--color-warning)]'
                : 'text-[var(--color-danger)]'
          }`}
        >
          {fps}
        </span>
      </div>
    </div>
  )
}
