import { useCallback, useEffect, useRef, useState } from 'react'
import type { CardKind } from './cards'
import { answerFor, matchIntent, WELCOME } from './answers'

// Chat state + the streaming orchestrator, mirroring the shape of the AI
// SDK's useChat (messages with typed parts, a status, a send function).
// Two engines share the same message store:
//  - live: streams real LLM answers from /api/chat (SSE relayed by the chat
//    backend, Vercel AI SDK server-side) when the health endpoint says a
//    provider is configured;
//  - scripted: the original client-side intent engine, used for the welcome
//    message and as an automatic fallback whenever the API is absent or fails.

export type MessagePart =
  | { type: 'status', stage: 'thinking' }
  | { type: 'reasoning', text: string, streaming: boolean }
  | { type: 'tool', name: string, args: string, status: 'running' | 'done' }
  | { type: 'text', text: string, streaming: boolean }
  | { type: 'card', kind: CardKind }

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: MessagePart[]
}

export type ChatStatus = 'ready' | 'streaming'

const REDUCED_MOTION = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let idCounter = 0
const nextId = () => `msg-${++idCounter}`

const CARD_KINDS: readonly CardKind[] = ['profile', 'experience', 'skills', 'projects', 'maker', 'stats', 'contact', 'books']
const isCardKind = (value: string): value is CardKind => (CARD_KINDS as readonly string[]).includes(value)

// Names shown in the visible tool part when the live model picks a card
const TOOL_NAMES: Record<CardKind, string> = {
  profile: 'resume.getProfile',
  experience: 'resume.getExperience',
  skills: 'resume.getSkills',
  projects: 'resume.getProjects',
  maker: 'resume.getHomelab',
  stats: 'resume.getStats',
  contact: 'resume.getContact',
  books: 'resume.getBooks'
}

type ServerEvent =
  | { type: 'card-intent', kind: string }
  | { type: 'text', delta: string }
  | { type: 'done' }
  | { type: 'error', message?: string }

export function useAlphaChat(lang: 'fr' | 'en') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [live, setLive] = useState(false)
  const cancelledRef = useRef(false)
  const liveRef = useRef(false)
  const langRef = useRef(lang)
  langRef.current = lang
  const messagesRef = useRef<ChatMessage[]>([])
  useEffect(() => { messagesRef.current = messages }, [messages])
  // Stable id for the whole visit — groups the turns in the server logs
  const conversationIdRef = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `conv-${Math.random().toString(36).slice(2, 12)}`
  )

  const patchLast = useCallback((patch: (parts: MessagePart[]) => MessagePart[]) => {
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      return [...prev.slice(0, -1), { ...last, parts: patch(last.parts) }]
    })
  }, [])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Probe the chat backend once: live answers only when a provider is up
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    fetch('/api/chat/health', { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then((data: { live?: boolean } | null) => {
        if (data?.live) {
          liveRef.current = true
          setLive(true)
        }
      })
      .catch(() => { /* no backend: scripted mode */ })
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  // Stream one scripted answer: reasoning → tool call → text → card
  const playAnswer = useCallback(async (intent: Parameters<typeof answerFor>[0]) => {
    const answer = answerFor(intent, langRef.current)
    const instant = REDUCED_MOTION()
    setStatus('streaming')
    setSuggestions([])

    setMessages(prev => [...prev, { id: nextId(), role: 'assistant', parts: [] }])

    // 1. Reasoning streams in
    patchLast(() => [{ type: 'reasoning', text: instant ? answer.reasoning : '', streaming: !instant }])
    if (!instant) {
      for (let i = 0; i < answer.reasoning.length; i += 4) {
        if (cancelledRef.current) return
        const slice = answer.reasoning.slice(0, i + 4)
        patchLast(parts => parts.map(p => (p.type === 'reasoning' ? { ...p, text: slice } : p)))
        await sleep(12)
      }
    }
    patchLast(parts => parts.map(p => (p.type === 'reasoning' ? { ...p, text: answer.reasoning, streaming: false } : p)))

    // 2. Tool call runs
    patchLast(parts => [...parts, { type: 'tool', name: answer.tool.name, args: answer.tool.args, status: 'running' }])
    await sleep(instant ? 0 : 550)
    if (cancelledRef.current) return
    patchLast(parts => parts.map(p => (p.type === 'tool' ? { ...p, status: 'done' as const } : p)))

    // 3. Answer text streams in
    patchLast(parts => [...parts, { type: 'text', text: instant ? answer.text : '', streaming: !instant }])
    if (!instant) {
      for (let i = 0; i < answer.text.length; i += 3) {
        if (cancelledRef.current) return
        const slice = answer.text.slice(0, i + 3)
        patchLast(parts => parts.map(p => (p.type === 'text' ? { ...p, text: slice } : p)))
        await sleep(14)
      }
    }
    patchLast(parts => parts.map(p => (p.type === 'text' ? { ...p, text: answer.text, streaming: false } : p)))

    // 4. Generative card appears
    if (answer.card) {
      await sleep(instant ? 0 : 200)
      if (cancelledRef.current) return
      patchLast(parts => [...parts, { type: 'card', kind: answer.card! }])
    }

    setSuggestions(answer.suggestions)
    setStatus('ready')
  }, [patchLast])

  // Stream one live answer from the chat backend. On failure before any text
  // arrived, falls back to the scripted engine so the UX never breaks.
  const playLive = useCallback(async (history: { role: 'user' | 'assistant', text: string }[], userText: string) => {
    setStatus('streaming')
    setSuggestions([])
    // Open the turn with a "Thinking…" marker until the first token arrives
    setMessages(prev => [...prev, { id: nextId(), role: 'assistant', parts: [{ type: 'status', stage: 'thinking' }] }])

    let gotText = false
    let text = ''
    let cardKind: CardKind | null = null

    const finalize = () => {
      patchLast(parts => parts.map(p => (
        p.type === 'text' ? { ...p, streaming: false }
          : p.type === 'tool' ? { ...p, status: 'done' as const }
            : p
      )))
      if (cardKind) {
        const kind = cardKind
        patchLast(parts => [...parts, { type: 'card', kind }])
      }
      setSuggestions(WELCOME[langRef.current].suggestions)
      setStatus('ready')
    }

    const handleEvent = (event: ServerEvent) => {
      if (event.type === 'card-intent' && isCardKind(event.kind)) {
        cardKind = event.kind
        const kind = event.kind
        patchLast(parts => [...parts.filter(p => p.type !== 'status'), {
          type: 'tool',
          name: TOOL_NAMES[kind],
          args: `{ lang: "${langRef.current}" }`,
          status: 'running'
        }])
      } else if (event.type === 'text' && event.delta) {
        if (!gotText) {
          gotText = true
          patchLast(parts => [
            ...parts.filter(p => p.type !== 'status').map(p => (p.type === 'tool' ? { ...p, status: 'done' as const } : p)),
            { type: 'text', text: '', streaming: true }
          ])
        }
        text += event.delta
        const snapshot = text
        patchLast(parts => parts.map(p => (p.type === 'text' ? { ...p, text: snapshot } : p)))
      } else if (event.type === 'error') {
        throw new Error(event.message ?? 'chat-error')
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, lang: langRef.current, conversationId: conversationIdRef.current })
      })
      if (!res.ok || !res.body) throw new Error(`chat ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (cancelledRef.current) {
          void reader.cancel()
          return
        }
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const raw of events) {
          const line = raw.split('\n').find(l => l.startsWith('data: '))
          if (line) handleEvent(JSON.parse(line.slice(6)) as ServerEvent)
        }
      }
      if (!gotText) throw new Error('empty-answer')
      finalize()
    } catch {
      if (cancelledRef.current) return
      if (gotText) {
        // Partial answer already visible: close it cleanly
        finalize()
        return
      }
      // Nothing arrived: drop the empty live message, replay through the
      // scripted engine so the visitor still gets an answer
      setMessages(prev => {
        const last = prev[prev.length - 1]
        return last && last.role === 'assistant' && !last.parts.some(p => p.type === 'text')
          ? prev.slice(0, -1)
          : prev
      })
      void playAnswer(matchIntent(userText))
    }
  }, [patchLast, playAnswer])

  const send = useCallback((text: string) => {
    if (status === 'streaming') return
    const trimmed = text.trim()
    if (!trimmed) return
    // History for the model: previous text parts + the new user turn
    const history = [
      ...messagesRef.current
        .map(m => ({
          role: m.role,
          text: m.parts.filter(p => p.type === 'text').map(p => p.text).join('\n')
        }))
        .filter(turn => turn.text),
      { role: 'user' as const, text: trimmed }
    ].slice(-12)
    setMessages(prev => [...prev, { id: nextId(), role: 'user', parts: [{ type: 'text', text: trimmed, streaming: false }] }])
    if (liveRef.current) {
      void playLive(history, trimmed)
    } else {
      void playAnswer(matchIntent(trimmed))
    }
  }, [playAnswer, playLive, status])

  // Welcome message on mount (guarded for StrictMode double-invoke) — always
  // scripted: instant, free, and it introduces the suggestions
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    cancelledRef.current = false
    void playAnswer('welcome')
    return () => { cancelledRef.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { messages, status, suggestions, send, live, welcome: WELCOME[lang] }
}
