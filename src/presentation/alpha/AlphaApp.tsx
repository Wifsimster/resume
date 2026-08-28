import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher'
import { Conversation, Marker, Message, MessageActions, PromptInput, Reasoning, Response, Suggestions, Tool } from './elements'
import type { PromptInputHandle } from './elements'
import { Card } from './cards'
import { SummaryPanel } from './summary'
import { useAlphaChat } from './useAlphaChat'
import { useViewportFit } from './useViewportFit'
import type { ChatMessage } from './useAlphaChat'
import './alpha.css'

// The conversational resume: an AI chat interface (design language modelled
// on shadcn/ui + Vercel AI Elements, dark zinc theme). This is the official
// default experience — the classic 3D site lives at ?ui=classic. Live LLM
// answers when the chat backend has a provider, scripted engine otherwise.
//
// Chatting is the default, never the toll gate: a visitor who only wants to
// scan the background opens the summary drawer from the header and reads the
// whole resume without typing a word.

const copy = {
  fr: {
    title: 'CV conversationnel',
    placeholder: 'Posez une question sur Damien…',
    thought: 'Raisonnement',
    thinking: 'Réflexion…',
    toolDone: 'ok',
    newChat: 'Nouvelle conversation',
    stop: 'Arrêter la réponse',
    summary: 'CV',
    summaryHint: 'Lire le CV complet, sans discuter',
    suggestionsToggle: 'Suggestions',
    actions: { copy: 'Copier la réponse', copied: 'Copié', retry: 'Réessayer', good: 'Bonne réponse', bad: 'Mauvaise réponse' }
  },
  en: {
    title: 'Conversational resume',
    placeholder: 'Ask something about Damien…',
    thought: 'Reasoning',
    thinking: 'Thinking…',
    toolDone: 'ok',
    newChat: 'New conversation',
    stop: 'Stop the answer',
    summary: 'Resume',
    summaryHint: 'Read the full resume, no chat needed',
    suggestionsToggle: 'Suggestions',
    actions: { copy: 'Copy the answer', copied: 'Copied', retry: 'Retry', good: 'Good answer', bad: 'Bad answer' }
  }
}

// An assistant message is settled once nothing in it is still streaming
const isSettled = (message: ChatMessage) =>
  message.role === 'assistant'
  && message.parts.some(p => p.type === 'text')
  && message.parts.every(p =>
    p.type !== 'status'
    && (p.type !== 'text' || !p.streaming)
    && (p.type !== 'reasoning' || !p.streaming)
    && (p.type !== 'tool' || p.status === 'done'))

const messageText = (message: ChatMessage) =>
  message.parts.filter(p => p.type === 'text').map(p => p.text).join('\n\n')

const DOC_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v5h5" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </svg>
)

export default function AlphaApp() {
  const { i18n } = useTranslation()
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr'
  const text = copy[lang]

  // Keeps the shell above the mobile browser chrome and the virtual keyboard
  useViewportFit()

  const { messages, status, suggestions, send, retry, stop, reset, sendFeedback } = useAlphaChat(lang)
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  const promptRef = useRef<PromptInputHandle>(null)

  const backToClassic = () => {
    window.location.href = `${window.location.pathname}?ui=classic`
  }

  const openSummary = useCallback(() => setSummaryOpen(true), [])
  const closeSummary = useCallback(() => setSummaryOpen(false), [])

  // "Ask a question instead" from inside the drawer: back to the thread with
  // the composer ready
  const askInstead = useCallback(() => {
    setSummaryOpen(false)
    promptRef.current?.focus()
  }, [])

  const handlePick = (suggestion: string) => {
    // The one navigation suggestion leaves the chat for the classic 3D site
    if (/classi/i.test(suggestion)) {
      backToClassic()
      return
    }
    send(suggestion)
  }

  const handleFeedback = (messageId: string) => (rating: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [messageId]: rating }))
    sendFeedback(messageId, rating)
  }

  const lastMessageId = messages[messages.length - 1]?.id
  const hasUserTurn = messages.some(m => m.role === 'user')

  return (
    <div className="alpha-app fixed inset-0 flex flex-col bg-[var(--alpha-bg)]">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--alpha-border)] bg-[var(--alpha-bg)]/95 backdrop-blur">
        <span className="min-w-0 truncate text-sm font-medium tracking-tight text-[var(--alpha-text)]">{text.title}</span>
        <div className="flex items-center gap-1.5">
          {/* The scannable way out of the conversation, labelled so a visitor
              in a hurry finds it without hunting for an icon */}
          <button
            onClick={openSummary}
            aria-haspopup="dialog"
            aria-expanded={summaryOpen}
            title={text.summaryHint}
            className="h-8 flex items-center gap-1.5 px-2.5 rounded-md border border-[var(--alpha-border)] text-xs text-[var(--alpha-muted)] hover:text-[var(--alpha-text)] hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            {DOC_ICON}
            {text.summary}
          </button>
          <button
            onClick={reset}
            disabled={status === 'streaming'}
            aria-label={text.newChat}
            title={text.newChat}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--alpha-muted)] hover:text-[var(--alpha-text)] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Thread */}
      <Conversation busy={status === 'streaming'}>
        {messages.map(message => (
          <Message key={message.id} from={message.role}>
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'status':
                  return <Marker key={i}>{text.thinking}</Marker>
                case 'reasoning':
                  return <Reasoning key={i} streaming={part.streaming} label={text.thought}>{part.text}</Reasoning>
                case 'tool':
                  return <Tool key={i} call={part} resultLabel={text.toolDone} />
                case 'text':
                  return <Response key={i} streaming={part.streaming}>{part.text}</Response>
                case 'card':
                  return <div key={i} className="alpha-card-in"><Card kind={part.kind} onAsk={handlePick} onOpenSummary={openSummary} /></div>
              }
            })}
            {isSettled(message) && (
              <MessageActions
                text={messageText(message)}
                canRetry={message.id === lastMessageId && hasUserTurn}
                onRetry={retry}
                feedback={feedback[message.id] ?? null}
                onFeedback={handleFeedback(message.id)}
                labels={text.actions}
              />
            )}
          </Message>
        ))}
      </Conversation>

      {/* Composer */}
      <div className="alpha-composer shrink-0 border-t border-[var(--alpha-border)] bg-[var(--alpha-bg)]/95 backdrop-blur px-4 pt-3">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
          <Suggestions
            items={suggestions}
            onPick={handlePick}
            disabled={status === 'streaming'}
            collapsible={hasUserTurn}
            label={text.suggestionsToggle}
          />
          <PromptInput ref={promptRef} onSubmit={send} onStop={stop} placeholder={text.placeholder} busy={status === 'streaming'} stopLabel={text.stop} />
        </div>
      </div>

      <SummaryPanel open={summaryOpen} onClose={closeSummary} onAsk={askInstead} lang={lang} />
    </div>
  )
}
