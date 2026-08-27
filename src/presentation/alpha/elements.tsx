import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Markdown } from './markdown'

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
        <div className="max-w-[85%] rounded-xl rounded-br-sm bg-[var(--alpha-surface)] border border-[var(--alpha-border)] px-4 py-2.5 text-sm text-[var(--alpha-text)]">
          {children}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg border border-[var(--alpha-border)] bg-[var(--alpha-surface)] flex items-center justify-center text-sm" aria-hidden="true">
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
    <div className="text-sm leading-relaxed text-[var(--alpha-body)]">
      <Markdown text={children} cursor={streaming ? <span className="alpha-cursor" aria-hidden="true" /> : null} />
    </div>
  )
}

/* ========================= Reasoning ========================= */

export function Reasoning({ children, streaming, label }: { children: string, streaming?: boolean, label: string }) {
  // Open while streaming, collapsed once done — the AI Elements behaviour
  const [manuallyOpen, setManuallyOpen] = useState<boolean | null>(null)
  const open = manuallyOpen ?? Boolean(streaming)

  return (
    <div className="border border-[var(--alpha-border)] rounded-lg bg-white/[0.02] overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--alpha-subtle)] hover:text-[var(--alpha-muted)] transition-colors cursor-pointer"
        onClick={() => setManuallyOpen(!open)}
      >
        <span className={streaming ? 'animate-pulse' : ''} aria-hidden="true">✦</span>
        <span className="font-(--font-code)">{label}</span>
        <span className="ml-auto transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 text-xs leading-relaxed text-[var(--alpha-subtle)] italic whitespace-pre-wrap">
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
    <div className="flex items-center gap-2.5 px-3 py-2 border border-[var(--alpha-border)] rounded-lg bg-[var(--alpha-surface)] text-xs font-(--font-code)">
      {call.status === 'running' ? (
        <span className="alpha-spinner shrink-0 text-[var(--alpha-accent)]" aria-hidden="true" />
      ) : (
        <span className="text-[var(--alpha-ok)]" aria-hidden="true">✓</span>
      )}
      <span className="text-[var(--alpha-muted)] truncate">
        {call.name}<span className="text-[var(--alpha-subtle)]/70">({call.args})</span>
      </span>
      {call.status === 'done' && (
        <span className="ml-auto text-[var(--alpha-subtle)] shrink-0">{resultLabel}</span>
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
          className="px-3.5 py-1.5 text-xs rounded-full border border-[var(--alpha-border)] bg-transparent text-[var(--alpha-muted)] hover:bg-white/5 hover:text-[var(--alpha-text)] hover:border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
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
        className="w-full resize-none rounded-xl border border-[var(--alpha-border)] bg-[var(--alpha-surface)] px-4 py-3 pr-14 text-sm text-[var(--alpha-text)] placeholder-[var(--alpha-subtle)] outline-none focus:ring-2 focus:ring-[var(--alpha-ring)] focus:border-transparent transition-shadow"
      />
      <button
        type="submit"
        disabled={!text.trim() || busy}
        aria-label="Send"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[var(--alpha-text)] text-[#09090b] flex items-center justify-center transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-default hover:opacity-85"
      >
        {busy ? <span className="alpha-spinner" aria-hidden="true" /> : '↑'}
      </button>
    </form>
  )
}
