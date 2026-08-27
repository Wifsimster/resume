import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Markdown } from './markdown'

// AI-chat UI primitives for the alpha resume, modelled on Vercel AI Elements'
// component vocabulary (Conversation, Message, Response, Reasoning, Tool,
// Suggestions, PromptInput) so a future swap to the real library — and a real
// LLM backend — is a rename-free operation. Implemented natively on the
// site's Tailwind tokens: no shadcn/Next dependency in a static Vite build.

/* ========================= Conversation ========================= */

// Message scroller behaviours modelled on shadcn/ui's Message Scroller:
// - a new turn (user message) anchors near the top of the viewport, keeping a
//   peek of the previous content; the streamed answer grows below it and the
//   reader is never moved against their intent
// - while at the live edge the view follows the stream; scrolling away
//   (wheel, touch, keys, scrollbar) releases it
// - a floating button re-engages following when content waits below

const LIVE_EDGE_PX = 48
const ANCHOR_PEEK_PX = 64

export function Conversation({ children, busy }: { children: ReactNode, busy?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  const userRowCountRef = useRef(0)
  const [showJump, setShowJump] = useState(false)

  const atLiveEdge = (el: HTMLDivElement) => el.scrollHeight - el.scrollTop - el.clientHeight < LIVE_EDGE_PX

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    stickRef.current = atLiveEdge(el)
    setShowJump(!stickRef.current)
  }

  const releaseFollow = () => {
    stickRef.current = false
  }

  const smooth = (): ScrollBehavior =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  const jumpToLiveEdge = () => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth() })
    stickRef.current = true
    setShowJump(false)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new MutationObserver(() => {
      const userRows = el.querySelectorAll<HTMLElement>('[data-role="user"]')
      if (userRows.length > userRowCountRef.current) {
        // New turn: anchor it near the top with a peek of the previous item
        userRowCountRef.current = userRows.length
        const row = userRows[userRows.length - 1]
        const top = row.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
        el.scrollTo({ top: Math.max(0, top - ANCHOR_PEEK_PX), behavior: smooth() })
        stickRef.current = false
      } else if (stickRef.current) {
        el.scrollTop = el.scrollHeight
      }
      setShowJump(!atLiveEdge(el))
    })
    observer.observe(el, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={ref}
        onScroll={handleScroll}
        onWheel={(e) => { if (e.deltaY < 0) releaseFollow() }}
        onTouchMove={releaseFollow}
        onKeyDown={(e) => { if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) releaseFollow() }}
        role="region"
        aria-label="Messages"
        tabIndex={0}
        className="h-full overflow-y-auto overscroll-contain outline-none"
      >
        <div role="log" aria-relevant="additions" aria-busy={busy || undefined} className="mx-auto w-full max-w-3xl px-4 py-6 flex flex-col gap-6">
          {children}
        </div>
      </div>
      <button
        onClick={jumpToLiveEdge}
        tabIndex={showJump ? 0 : -1}
        aria-hidden={!showJump}
        data-active={showJump}
        aria-label="Scroll to latest messages"
        className={`absolute left-1/2 -translate-x-1/2 bottom-4 w-8 h-8 rounded-full border border-[var(--alpha-border)] bg-[var(--alpha-surface)] text-[var(--alpha-muted)] shadow-lg shadow-black/30 flex items-center justify-center text-sm transition-all cursor-pointer hover:text-[var(--alpha-text)] hover:border-white/20 ${showJump ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-1'}`}
      >
        ↓
      </button>
    </div>
  )
}

/* ========================= Message ========================= */

// Bubble variants modelled on shadcn/ui's Bubble: the user gets a tinted
// end-aligned bubble (max 80% width), the assistant is the ghost variant —
// full-width unframed content next to its avatar.

export function Message({ from, children }: { from: 'user' | 'assistant', children: ReactNode }) {
  if (from === 'user') {
    return (
      <div className="flex justify-end alpha-msg-in" data-role="user">
        <div className="max-w-[80%] rounded-xl rounded-br-sm bg-[var(--alpha-accent)]/10 border border-[var(--alpha-accent)]/20 px-4 py-2.5 text-sm text-[var(--alpha-text)]">
          {children}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 alpha-msg-in" data-role="assistant">
      <div className="shrink-0 w-8 h-8 rounded-lg border border-[var(--alpha-border)] bg-[var(--alpha-surface)] flex items-center justify-center text-[10px] font-semibold tracking-wide text-[var(--alpha-muted)]" aria-hidden="true">
        DB
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3 pt-1">
        {children}
      </div>
    </div>
  )
}

/* ========================= MessageActions ========================= */

// shadcn MessageFooter: ghost icon actions under a settled assistant answer —
// copy, retry (last answer only), thumbs up/down (logged server-side)

const ICONS = {
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>,
  retry: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>,
  up: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>,
  down: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /></svg>
}

export interface ActionLabels {
  copy: string
  copied: string
  retry: string
  good: string
  bad: string
}

export function MessageActions({ text, canRetry, onRetry, feedback, onFeedback, labels }: {
  text: string
  canRetry: boolean
  onRetry: () => void
  feedback: 'up' | 'down' | null
  onFeedback: (rating: 'up' | 'down') => void
  labels: ActionLabels
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  const buttonClass = 'w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer hover:bg-white/5'
  return (
    <div className="flex items-center gap-0.5 -mt-1.5">
      <button onClick={copy} aria-label={copied ? labels.copied : labels.copy} title={labels.copy}
        className={`${buttonClass} ${copied ? 'text-[var(--alpha-ok)]' : 'text-[var(--alpha-subtle)] hover:text-[var(--alpha-text)]'}`}>
        {copied ? ICONS.check : ICONS.copy}
      </button>
      {canRetry && (
        <button onClick={onRetry} aria-label={labels.retry} title={labels.retry}
          className={`${buttonClass} text-[var(--alpha-subtle)] hover:text-[var(--alpha-text)]`}>
          {ICONS.retry}
        </button>
      )}
      <button onClick={() => onFeedback('up')} aria-label={labels.good} title={labels.good} data-active={feedback === 'up'}
        className={`${buttonClass} ${feedback === 'up' ? 'text-[var(--alpha-ok)]' : 'text-[var(--alpha-subtle)] hover:text-[var(--alpha-text)]'}`}>
        {ICONS.up}
      </button>
      <button onClick={() => onFeedback('down')} aria-label={labels.bad} title={labels.bad} data-active={feedback === 'down'}
        className={`${buttonClass} ${feedback === 'down' ? 'text-red-400' : 'text-[var(--alpha-subtle)] hover:text-[var(--alpha-text)]'}`}>
        {ICONS.down}
      </button>
    </div>
  )
}

/* ========================= Marker ========================= */

// Inline conversation indicator (shadcn Marker): status lines like
// "Thinking…" while waiting for the first streamed token.

export function Marker({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex items-center gap-2 text-xs text-[var(--alpha-subtle)]">
      <span aria-hidden="true">✦</span>
      <span className="alpha-shimmer">{children}</span>
    </div>
  )
}

/* ========================= Response (streaming text) ========================= */

export function Response({ children, streaming }: { children: string, streaming?: boolean }) {
  return (
    <div className="alpha-prose text-[var(--alpha-body)]">
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
        <span>{label}</span>
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
    <div className="flex items-center gap-2.5 px-3 py-2 border border-[var(--alpha-border)] rounded-lg bg-[var(--alpha-surface)] text-xs alpha-mono">
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
          className="px-3 py-1 text-[13px] rounded-full border border-[var(--alpha-border)] bg-transparent text-[var(--alpha-muted)] hover:bg-white/5 hover:text-[var(--alpha-text)] hover:border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

/* ========================= PromptInput ========================= */

export function PromptInput({ onSubmit, onStop, placeholder, busy, stopLabel }: {
  onSubmit: (text: string) => void
  onStop: () => void
  placeholder: string
  busy: boolean
  stopLabel: string
}) {
  const [text, setText] = useState('')
  const areaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow up to ~5 lines, then scroll inside the field
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [text])

  // Desktop nicety: the field is ready to type on load (never on touch — it
  // would pop the keyboard over the welcome message)
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) areaRef.current?.focus()
  }, [])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const value = text.trim()
    if (!value || busy) return
    onSubmit(value)
    setText('')
  }

  return (
    // shadcn InputGroup: the frame carries the border/ring, the textarea is
    // borderless and the button is a flex sibling — it can never overflow the
    // field, whatever the device font scale
    <form
      onSubmit={submit}
      className="flex items-end gap-2 rounded-xl border border-[var(--alpha-border)] bg-[var(--alpha-surface)] p-1.5 pl-4 focus-within:border-[var(--alpha-accent)]/50 focus-within:ring-[3px] focus-within:ring-[var(--alpha-accent)]/20 transition-[box-shadow,border-color]"
    >
      <textarea
        ref={areaRef}
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
        className="flex-1 min-w-0 resize-none bg-transparent py-2 max-h-[140px] overflow-y-auto text-sm text-[var(--alpha-text)] placeholder-[var(--alpha-subtle)] outline-none"
      />
      {busy ? (
        <button
          type="button"
          onClick={onStop}
          aria-label={stopLabel}
          title={stopLabel}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-[var(--alpha-text)] text-[#09090b] hover:bg-white/85"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
        </button>
      ) : (
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-[var(--alpha-text)] text-[#09090b] hover:bg-white/85 disabled:bg-white/10 disabled:text-[var(--alpha-subtle)] disabled:cursor-default"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
      )}
    </form>
  )
}
