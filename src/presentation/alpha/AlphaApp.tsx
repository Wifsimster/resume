import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@presentation/components/ui/LanguageSwitcher'
import { Conversation, Message, PromptInput, Reasoning, Response, Suggestions, Tool } from './elements'
import { Card } from './cards'
import { useAlphaChat } from './useAlphaChat'
import './alpha.css'

// The conversational alpha of the resume: a scripted, fully client-side AI
// chat interface (design system modelled on Vercel AI Elements). Reached via
// /?ui=alpha — the classic 3D site stays the default experience.

const copy = {
  fr: {
    title: 'CV conversationnel',
    subtitle: 'alpha · scripté, sans LLM',
    back: '← Version classique',
    placeholder: 'Posez une question sur Damien…',
    thought: 'Raisonnement',
    toolDone: 'ok'
  },
  en: {
    title: 'Conversational resume',
    subtitle: 'alpha · scripted, no LLM',
    back: '← Classic version',
    placeholder: 'Ask something about Damien…',
    thought: 'Reasoning',
    toolDone: 'ok'
  }
}

export default function AlphaApp() {
  const { i18n } = useTranslation()
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr'
  const text = copy[lang]

  const { messages, status, suggestions, send } = useAlphaChat(lang)

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
    <div className="alpha-app fixed inset-0 flex flex-col bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-white/10 bg-black/40 backdrop-blur">
        <button
          onClick={backToClassic}
          className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer font-(--font-code)"
        >
          {text.back}
        </button>
        <div className="mx-auto text-center">
          <div className="text-sm font-(--font-display) text-[var(--color-paper-cream)]">
            🚀 {text.title}
          </div>
          <div className="text-[10px] font-(--font-code) text-[var(--color-accent-primary)] uppercase tracking-widest">{text.subtitle}</div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Thread */}
      <Conversation>
        {messages.map(message => (
          <Message key={message.id} from={message.role}>
            {message.parts.map((part, i) => {
              switch (part.type) {
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
      <div className="shrink-0 border-t border-white/10 bg-black/40 backdrop-blur px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
          <Suggestions items={suggestions} onPick={handlePick} disabled={status === 'streaming'} />
          <PromptInput onSubmit={send} placeholder={text.placeholder} busy={status === 'streaming'} />
        </div>
      </div>
    </div>
  )
}
