import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher'
import { Conversation, Marker, Message, MessageActions, PromptInput, Reasoning, Response, Suggestions, Tool } from './elements'
import { Card } from './cards'
import { useAlphaChat } from './useAlphaChat'
import type { ChatMessage } from './useAlphaChat'
import './alpha.css'

// The conversational resume: an AI chat interface (design language modelled
// on shadcn/ui + Vercel AI Elements, dark zinc theme). This is the official
// default experience — the classic 3D site lives at ?ui=classic. Live LLM
// answers when the chat backend has a provider, scripted engine otherwise.

const copy = {
  fr: {
    title: 'CV conversationnel',
    placeholder: 'Posez une question sur Damien…',
    thought: 'Raisonnement',
    thinking: 'Réflexion…',
    toolDone: 'ok',
    newChat: 'Nouvelle conversation',
    stop: 'Arrêter la réponse',
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

export default function AlphaApp() {
  const { i18n } = useTranslation()
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr'
  const text = copy[lang]

  const { messages, status, suggestions, send, retry, stop, reset, sendFeedback } = useAlphaChat(lang)
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})

  const backToClassic = () => {
    window.location.href = `${window.location.pathname}?ui=classic`
  }

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
        <span className="text-sm font-medium tracking-tight text-[var(--alpha-text)]">{text.title}</span>
        <div className="flex items-center gap-1.5">
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
                  return <div key={i} className="alpha-card-in"><Card kind={part.kind} onAsk={handlePick} /></div>
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
      <div className="shrink-0 border-t border-[var(--alpha-border)] bg-[var(--alpha-bg)]/95 backdrop-blur px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
          <Suggestions items={suggestions} onPick={handlePick} disabled={status === 'streaming'} />
          <PromptInput onSubmit={send} onStop={stop} placeholder={text.placeholder} busy={status === 'streaming'} stopLabel={text.stop} />
        </div>
      </div>
    </div>
  )
}
