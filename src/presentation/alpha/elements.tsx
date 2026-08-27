import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

// AI-chat UI primitives for the alpha resume, modelled on Vercel AI Elements'
// component vocabulary (Conversation, Message, Response, Reasoning, Tool,
// Suggestions, PromptInput) so a future swap to the real library — and a real
// LLM backend — is a rename-free operation. Implemented natively on the
// site's Tailwind tokens: no shadcn/Next dependency in a static Vite build.

/* ========================= Conversation ========================= */

export function Conversation({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)

  // Stick to bottom while the visitor hasn't scrolled up
  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new MutationObserver(() => {
      if (stickToBottomRef.current) {
        el.scrollTop = el.scrollHeight
      }
    })
    observer.observe(el, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} onScroll={handleScroll} className="flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-6">
        {children}
      </div>
    </div>
  )
}

/* ========================= Message ========================= */

export function Message({ from, children }: { from: 'user' | 'assistant', children: ReactNode }) {
  if (from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[var(--color-accent-primary)]/20 border border-[var(--color-accent-primary)]/30 px-4 py-2.5 text-sm text-[var(--color-paper-cream)]">
          {children}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--palette-cyan-400)] flex items-center justify-center text-base shadow-[0_0_12px_rgba(124,58,237,0.4)]" aria-hidden="true">
        🚀
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3 pt-1">
        {children}
      </div>
    </div>
  )
}

/* ========================= Response (streaming text) ========================= */

export function Response({ children, streaming }: { children: string, streaming?: boolean }) {
  return (
    <div className="text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
      {children}
      {streaming && <span className="alpha-cursor" aria-hidden="true" />}
    </div>
  )
}

/* ========================= Reasoning ========================= */

export function Reasoning({ children, streaming, label }: { children: string, streaming?: boolean, label: string }) {
  // Open while streaming, collapsed once done — the AI Elements behaviour
  const [manuallyOpen, setManuallyOpen] = useState<boolean | null>(null)
  const open = manuallyOpen ?? Boolean(streaming)

  return (
    <div className="border border-white/10 rounded-lg bg-black/20 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/75 transition-colors cursor-pointer"
        onClick={() => setManuallyOpen(!open)}
      >
        <span className={streaming ? 'animate-pulse' : ''} aria-hidden="true">✦</span>
        <span className="font-(--font-code)">{label}</span>
        <span className="ml-auto transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 text-xs leading-relaxed text-white/45 italic whitespace-pre-wrap">
          {children}
          {streaming && <span className="alpha-cursor" aria-hidden="true" />}
        </div>
      )}
    </div>
  )
}

/* ========================= Tool ========================= */

export interface ToolCall {
  name: string
  args: string
  status: 'running' | 'done'
}

export function Tool({ call, resultLabel }: { call: ToolCall, resultLabel: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 border border-[var(--color-terminal-green)]/25 rounded-lg bg-[var(--color-terminal-green)]/5 text-xs font-(--font-code)">
      {call.status === 'running' ? (
        <span className="alpha-spinner shrink-0" aria-hidden="true" />
      ) : (
        <span className="text-[var(--color-terminal-green)]" aria-hidden="true">✓</span>
      )}
      <span className="text-[var(--color-terminal-green)]/90 truncate">
        {call.name}<span className="text-white/40">({call.args})</span>
      </span>
      {call.status === 'done' && (
        <span className="ml-auto text-white/35 shrink-0">{resultLabel}</span>
      )}
    </div>
  )
}

/* ========================= Suggestions ========================= */

export function Suggestions({ items, onPick, disabled }: { items: string[], onPick: (s: string) => void, disabled?: boolean }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map(item => (
        <button
          key={item}
          disabled={disabled}
          onClick={() => onPick(item)}
          className="px-3.5 py-1.5 text-xs rounded-full border border-white/15 bg-white/5 text-white/75 hover:border-[var(--color-accent-primary)]/60 hover:text-white hover:bg-[var(--color-accent-primary)]/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

/* ========================= PromptInput ========================= */

export function PromptInput({ onSubmit, placeholder, busy }: { onSubmit: (text: string) => void, placeholder: string, busy: boolean }) {
  const [text, setText] = useState('')

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.trim()
    if (!value || busy) return
    onSubmit(value)
    setText('')
  }

  return (
    <form onSubmit={submit} className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={placeholder}
        rows={1}
        className="w-full resize-none rounded-2xl border border-white/15 bg-[#101018]/90 backdrop-blur px-4 py-3 pr-14 text-sm text-[var(--color-paper-cream)] placeholder-white/30 outline-none focus:border-[var(--color-accent-primary)]/60 transition-colors"
      />
      <button
        type="submit"
        disabled={!text.trim() || busy}
        aria-label="Send"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[var(--color-accent-primary)] text-white flex items-center justify-center transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-default hover:opacity-90"
      >
        {busy ? <span className="alpha-spinner" aria-hidden="true" /> : '↑'}
      </button>
    </form>
  )
}
