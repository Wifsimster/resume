import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher'
import { Conversation, Marker, Message, PromptInput, Reasoning, Response, Suggestions, Tool } from './elements'
import { Card } from './cards'
import { useAlphaChat } from './useAlphaChat'
import './alpha.css'

// The conversational resume: an AI chat interface (design language modelled
// on shadcn/ui + Vercel AI Elements, dark zinc theme). Reached via /?ui=alpha
// — the classic 3D site stays the default experience. Live LLM answers when
// the chat backend has a provider, scripted engine otherwise.

const copy = {
  fr: {
    title: 'CV conversationnel',
    subtitle: 'scripté, sans LLM',
    subtitleLive: 'IA en direct',
    back: '← Version classique',
    placeholder: 'Posez une question sur Damien…',
    thought: 'Raisonnement',
    thinking: 'Réflexion…',
    toolDone: 'ok'
  },
  en: {
    title: 'Conversational resume',
    subtitle: 'scripted, no LLM',
    subtitleLive: 'live AI',
    back: '← Classic version',
    placeholder: 'Ask something about Damien…',
    thought: 'Reasoning',
    thinking: 'Thinking…',
    toolDone: 'ok'
  }
}

export default function AlphaApp() {
  const { i18n } = useTranslation()
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr'
  const text = copy[lang]

  const { messages, status, suggestions, send, live } = useAlphaChat(lang)

  const backToClassic = () => {
    window.location.href = window.location.pathname
  }

  const handlePick = (suggestion: string) => {
    // The one navigation suggestion leaves the chat for the classic 3D site
    if (/classi/i.test(suggestion)) {
      backToClassic()
      return
    }
    send(suggestion)
  }

  return (
    <div className="alpha-app fixed inset-0 flex flex-col bg-[var(--alpha-bg)]">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--alpha-border)] bg-[var(--alpha-bg)]/95 backdrop-blur">
        <button
          onClick={backToClassic}
          className="text-[13px] text-[var(--alpha-muted)] hover:text-[var(--alpha-text)] transition-colors cursor-pointer"
        >
          {text.back}
        </button>
        <div className="mx-auto flex items-center gap-2.5">
          <span className="text-sm font-medium tracking-tight text-[var(--alpha-text)]">{text.title}</span>
          {live ? (
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--alpha-border)] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--alpha-ok)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--alpha-ok)]" aria-hidden="true" />
              {text.subtitleLive}
            </span>
          ) : (
            <span className="rounded-full border border-[var(--alpha-border)] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--alpha-subtle)]">
              {text.subtitle}
            </span>
          )}
        </div>
        <LanguageSwitcher />
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
                  return <div key={i} className="alpha-card-in"><Card kind={part.kind} /></div>
              }
            })}
          </Message>
        ))}
      </Conversation>

      {/* Composer */}
      <div className="shrink-0 border-t border-[var(--alpha-border)] bg-[var(--alpha-bg)]/95 backdrop-blur px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
          <Suggestions items={suggestions} onPick={handlePick} disabled={status === 'streaming'} />
          <PromptInput onSubmit={send} placeholder={text.placeholder} busy={status === 'streaming'} />
        </div>
      </div>
    </div>
  )
}
