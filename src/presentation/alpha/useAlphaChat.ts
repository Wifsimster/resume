import { useCallback, useEffect, useRef, useState } from 'react'
import type { CardKind } from './cards'
import { answerFor, matchIntent, WELCOME } from './answers'

// Chat state + the streaming orchestrator. Mirrors the shape of the AI SDK's
// useChat (messages with typed parts, a status, a send function) so the alpha
// can later be rewired to a real LLM backend without touching the UI layer.

export type MessagePart =
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

export function useAlphaChat(lang: 'fr' | 'en') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>('ready')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const cancelledRef = useRef(false)
  const langRef = useRef(lang)
  langRef.current = lang

  const patchLast = useCallback((patch: (parts: MessagePart[]) => MessagePart[]) => {
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      return [...prev.slice(0, -1), { ...last, parts: patch(last.parts) }]
    })
  }, [])

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

  const send = useCallback((text: string) => {
    if (status === 'streaming') return
    setMessages(prev => [...prev, { id: nextId(), role: 'user', parts: [{ type: 'text', text, streaming: false }] }])
    void playAnswer(matchIntent(text))
  }, [playAnswer, status])

  // Welcome message on mount (guarded for StrictMode double-invoke)
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    cancelledRef.current = false
    void playAnswer('welcome')
    return () => { cancelledRef.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { messages, status, suggestions, send, welcome: WELCOME[lang] }
}
