import { useCallback, useEffect, useRef, useState } from 'react'
import type { CardKind } from './cards'
import { answerFor, matchIntent, WELCOME } from './answers'

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

const STORAGE_KEY = 'wifsimster_chat_v1'

const CARD_KINDS: readonly CardKind[] = ['profile', 'experience', 'skills', 'projects', 'maker', 'stats', 'contact', 'books']
const isCardKind = (value: string): value is CardKind => (CARD_KINDS as readonly string[]).includes(value)

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

const SUGGEST_ALL_RE = /\[suggest:[^\]]*\]/gi
const stripSuggestTail = (text: string) => text.replace(/\s*\[sugg[^\]]*\]?\s*$/i, '')
const stripSuggest = (text: string) => text.replace(SUGGEST_ALL_RE, '').replace(/\s+$/, '')
function parseSuggest(text: string): string[] | null {
  const match = /\[suggest:\s*([^\]]+)\]/i.exec(text)
  if (!match) return null
  const items = match[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 3)
  return items.length > 0 ? items : null
}

const newConversationId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `conv-${Math.random().toString(36).slice(2, 12)}`

function restoreConversation(): { conversationId: string, messages: ChatMessage[], suggestions: string[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { conversationId?: unknown, messages?: unknown, suggestions?: unknown }
    if (!Array.isArray(data.messages) || data.messages.length === 0) return null
    const messages: ChatMessage[] = []
    let maxId = 0
    for (const entry of data.messages as ChatMessage[]) {
      if (!entry || typeof entry.id !== 'string' || (entry.role !== 'user' && entry.role !== 'assistant') || !Array.isArray(entry.parts)) return null
      const idMatch = /^msg-(\d+)$/.exec(entry.id)
      if (idMatch) maxId = Math.max(maxId, Number(idMatch[1]))
      const parts = entry.parts
        .filter(p => p && typeof p === 'object' && p.type !== 'status')
        .map(p => (
          p.type === 'text' || p.type === 'reasoning' ? { ...p, streaming: false }
            : p.type === 'tool' ? { ...p, status: 'done' as const }
              : p
        ))
      if (parts.length > 0) messages.push({ id: entry.id, role: entry.role, parts })
    }
    if (messages.length === 0) return null
    idCounter = Math.max(idCounter, maxId)
    return {
      conversationId: typeof data.conversationId === 'string' ? data.conversationId : newConversationId(),
      messages,
      suggestions: Array.isArray(data.suggestions) ? (data.suggestions as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 4) : []
    }
  } catch {
    return null
  }
}

export function useAlphaChat(lang: 'fr' | 'en') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [live, setLive] = useState(false)
  const cancelledRef = useRef(false)
  const stopRef = useRef(false)
  const liveAbortRef = useRef<AbortController | null>(null)
  const liveRef = useRef(false)
  const langRef = useRef(lang)
  langRef.current = lang
  const messagesRef = useRef<ChatMessage[]>([])
  useEffect(() => { messagesRef.current = messages }, [messages])
  const conversationIdRef = useRef<string>(newConversationId())

  const patchLast = useCallback((patch: (parts: MessagePart[]) => MessagePart[]) => {
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      return [...prev.slice(0, -1), { ...last, parts: patch(last.parts) }]
    })
  }, [])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
      .catch(() => { })
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  const playAnswer = useCallback(async (intent: Parameters<typeof answerFor>[0]) => {
    const answer = answerFor(intent, langRef.current)
    const instant = REDUCED_MOTION()
    stopRef.current = false
    setStatus('streaming')
    setSuggestions([])

    setMessages(prev => [...prev, { id: nextId(), role: 'assistant', parts: [] }])

    patchLast(() => [{ type: 'reasoning', text: instant ? answer.reasoning : '', streaming: !instant }])
    if (!instant) {
      for (let i = 0; i < answer.reasoning.length; i += 4) {
        if (cancelledRef.current) return
        if (stopRef.current) break
        const slice = answer.reasoning.slice(0, i + 4)
        patchLast(parts => parts.map(p => (p.type === 'reasoning' ? { ...p, text: slice } : p)))
        await sleep(12)
      }
    }
    patchLast(parts => parts.map(p => (p.type === 'reasoning' ? { ...p, text: answer.reasoning, streaming: false } : p)))

    patchLast(parts => [...parts, { type: 'tool', name: answer.tool.name, args: answer.tool.args, status: 'running' }])
    if (!instant && !stopRef.current) await sleep(550)
    if (cancelledRef.current) return
    patchLast(parts => parts.map(p => (p.type === 'tool' ? { ...p, status: 'done' as const } : p)))

    patchLast(parts => [...parts, { type: 'text', text: instant ? answer.text : '', streaming: !instant }])
    if (!instant) {
      for (let i = 0; i < answer.text.length; i += 3) {
        if (cancelledRef.current) return
        if (stopRef.current) break
        const slice = answer.text.slice(0, i + 3)
        patchLast(parts => parts.map(p => (p.type === 'text' ? { ...p, text: slice } : p)))
        await sleep(14)
      }
    }
    patchLast(parts => parts.map(p => (p.type === 'text' ? { ...p, text: answer.text, streaming: false } : p)))

    if (answer.card) {
      if (!instant && !stopRef.current) await sleep(200)
      if (cancelledRef.current) return
      patchLast(parts => [...parts, { type: 'card', kind: answer.card! }])
    }

    setSuggestions(answer.suggestions)
    setStatus('ready')
  }, [patchLast])

  const playLive = useCallback(async (history: { role: 'user' | 'assistant', text: string }[], userText: string) => {
    stopRef.current = false
    setStatus('streaming')
    setSuggestions([])
    setMessages(prev => [...prev, { id: nextId(), role: 'assistant', parts: [{ type: 'status', stage: 'thinking' }] }])

    let gotText = false
    let text = ''
    let cardKind: CardKind | null = null

    const finalize = () => {
      const modelSuggestions = parseSuggest(text)
      const finalText = stripSuggest(text)
      patchLast(parts => parts
        .filter(p => p.type !== 'status')
        .map(p => (
          p.type === 'text' ? { ...p, text: finalText, streaming: false }
            : p.type === 'tool' ? { ...p, status: 'done' as const }
              : p
        )))
      if (cardKind) {
        const kind = cardKind
        patchLast(parts => [...parts, { type: 'card', kind }])
      }
      setSuggestions(modelSuggestions ?? WELCOME[langRef.current].suggestions)
      setStatus('ready')
    }

    const dropEmptyTurn = () => {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        return last && last.role === 'assistant' && !last.parts.some(p => p.type === 'text')
          ? prev.slice(0, -1)
          : prev
      })
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
        const snapshot = stripSuggestTail(text)
        patchLast(parts => parts.map(p => (p.type === 'text' ? { ...p, text: snapshot } : p)))
      } else if (event.type === 'error') {
        throw new Error(event.message ?? 'chat-error')
      }
    }

    const controller = new AbortController()
    liveAbortRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, lang: langRef.current, conversationId: conversationIdRef.current }),
        signal: controller.signal
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
      if (stopRef.current) {
        if (gotText) {
          finalize()
        } else {
          dropEmptyTurn()
          setSuggestions(WELCOME[langRef.current].suggestions)
          setStatus('ready')
        }
        return
      }
      if (gotText) {
        finalize()
        return
      }
      dropEmptyTurn()
      void playAnswer(matchIntent(userText))
    } finally {
      if (liveAbortRef.current === controller) liveAbortRef.current = null
    }
  }, [patchLast, playAnswer])

  const toTurns = (msgs: ChatMessage[]) => msgs
    .map(m => ({
      role: m.role,
      text: m.parts.filter(p => p.type === 'text').map(p => p.text).join('\n')
    }))
    .filter(turn => turn.text)

  const send = useCallback((text: string) => {
    if (status === 'streaming') return
    const trimmed = text.trim()
    if (!trimmed) return
    const history = [...toTurns(messagesRef.current), { role: 'user' as const, text: trimmed }].slice(-12)
    setMessages(prev => [...prev, { id: nextId(), role: 'user', parts: [{ type: 'text', text: trimmed, streaming: false }] }])
    if (liveRef.current) {
      void playLive(history, trimmed)
    } else {
      void playAnswer(matchIntent(trimmed))
    }
  }, [playAnswer, playLive, status])

  const retry = useCallback(() => {
    if (status === 'streaming') return
    const msgs = messagesRef.current
    const last = msgs[msgs.length - 1]
    if (!last || last.role !== 'assistant') return
    let userText: string | null = null
    for (let i = msgs.length - 2; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        userText = msgs[i].parts.filter(p => p.type === 'text').map(p => p.text).join('\n')
        break
      }
    }
    if (!userText) return
    const trimmed = msgs.slice(0, -1)
    messagesRef.current = trimmed
    setMessages(trimmed)
    const history = toTurns(trimmed).slice(-12)
    if (liveRef.current) {
      void playLive(history, userText)
    } else {
      void playAnswer(matchIntent(userText))
    }
  }, [playAnswer, playLive, status])

  const stop = useCallback(() => {
    stopRef.current = true
    liveAbortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    if (status === 'streaming') return
    try { localStorage.removeItem(STORAGE_KEY) } catch { }
    conversationIdRef.current = newConversationId()
    setSuggestions([])
    setMessages([])
    messagesRef.current = []
    void playAnswer('welcome')
  }, [playAnswer, status])

  const sendFeedback = useCallback((messageId: string, rating: 'up' | 'down') => {
    const message = messagesRef.current.find(m => m.id === messageId)
    const text = message?.parts.filter(p => p.type === 'text').map(p => p.text).join('\n').slice(0, 600) ?? ''
    void fetch('/api/chat/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ conversationId: conversationIdRef.current, rating, text })
    }).catch(() => { })
  }, [])

  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    cancelledRef.current = false
    const restored = restoreConversation()
    if (restored) {
      conversationIdRef.current = restored.conversationId
      messagesRef.current = restored.messages
      setMessages(restored.messages)
      setSuggestions(restored.suggestions.length > 0 ? restored.suggestions : WELCOME[langRef.current].suggestions)
    } else {
      void playAnswer('welcome')
    }
    return () => { cancelledRef.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status !== 'ready' || messages.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        conversationId: conversationIdRef.current,
        messages,
        suggestions
      }))
    } catch { }
  }, [messages, suggestions, status])

  return { messages, status, suggestions, send, retry, stop, reset, sendFeedback, live, welcome: WELCOME[lang] }
}
