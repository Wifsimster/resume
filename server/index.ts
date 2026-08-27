import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { appendFile, mkdir, readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { streamText } from 'ai'
import type { LanguageModel, ModelMessage } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { SYSTEM_PROMPT, isCardKind } from './context'

// Chat backend of the conversational resume (Vercel AI SDK). Holds the LLM
// credentials server-side and relays the answer as a small SSE protocol the
// frontend understands: card-intent → text deltas → done. Provider is picked
// from the environment:
//   CHAT_API_BASE_URL (+ CHAT_API_KEY, CHAT_MODEL) → any OpenAI-compatible
//     endpoint: Ollama (http://host:11434/v1), LM Studio, HuggingFace router,
//     OpenRouter…
//   GEMINI_API_KEY (+ GEMINI_MODEL) → Google AI Studio (free tier friendly)
// With neither set the endpoint reports live:false and the frontend keeps its
// scripted engine — the site never breaks.

const PORT = Number(process.env.CHAT_PORT ?? 8787)

function resolveModel(): { model: LanguageModel, label: string } | null {
  const baseURL = process.env.CHAT_API_BASE_URL
  if (baseURL) {
    const modelId = process.env.CHAT_MODEL ?? 'llama3.2'
    const provider = createOpenAICompatible({
      name: 'chat-api',
      baseURL,
      apiKey: process.env.CHAT_API_KEY
    })
    return { model: provider(modelId), label: modelId }
  }
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    const modelId = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'
    const provider = createGoogleGenerativeAI({ apiKey: geminiKey })
    return { model: provider(modelId), label: modelId }
  }
  return null
}

const configured = resolveModel()

// ---- Conversation logs: one JSONL file per day in CHAT_LOG_DIR -------------
// Every visitor turn and assistant answer is appended with the conversation
// id, ip and user-agent. Read them back through GET /api/chat/logs, guarded
// by CHAT_ADMIN_TOKEN (endpoint answers 404 unless both env vars are set).
const LOG_DIR = process.env.CHAT_LOG_DIR ?? ''
const ADMIN_TOKEN = process.env.CHAT_ADMIN_TOKEN ?? ''
if (LOG_DIR) {
  mkdir(LOG_DIR, { recursive: true })
    .then(() => console.log(`[chat] conversation logs → ${LOG_DIR}`))
    .catch(err => console.error('[chat] log dir unavailable:', err instanceof Error ? err.message : err))
}

function logTurn(entry: Record<string, unknown>) {
  if (!LOG_DIR) return
  const day = new Date().toISOString().slice(0, 10)
  appendFile(join(LOG_DIR, `${day}.jsonl`), `${JSON.stringify(entry)}\n`)
    .catch(err => console.error('[chat] log write failed:', err instanceof Error ? err.message : err))
}

// ---- Abuse guards: the endpoint is public and the upstream quota is small --
const MAX_MESSAGES = 16
const MAX_MESSAGE_CHARS = 1000
const MAX_BODY_BYTES = 32 * 1024
const PER_IP_PER_MINUTE = 8
const GLOBAL_PER_DAY = 400

const ipHits = new Map<string, number[]>()
let dayKey = ''
let dayCount = 0

function allowRequest(ip: string): boolean {
  const now = Date.now()
  const today = new Date(now).toISOString().slice(0, 10)
  if (today !== dayKey) {
    dayKey = today
    dayCount = 0
    ipHits.clear()
  }
  if (dayCount >= GLOBAL_PER_DAY) return false
  const recent = (ipHits.get(ip) ?? []).filter(t => now - t < 60_000)
  if (recent.length >= PER_IP_PER_MINUTE) {
    ipHits.set(ip, recent)
    return false
  }
  recent.push(now)
  ipHits.set(ip, recent)
  dayCount++
  return true
}

function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim()
  return first || req.socket.remoteAddress || 'unknown'
}

// ---- Helpers ---------------------------------------------------------------
function sendJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
  res.end(payload)
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

interface ChatTurn { role: 'user' | 'assistant', text: string }

function parseChatRequest(raw: string): { turns: ChatTurn[], lang: 'fr' | 'en', conversationId?: string } | null {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const { messages, lang, conversationId } = data as { messages?: unknown, lang?: unknown, conversationId?: unknown }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null
  const turns: ChatTurn[] = []
  for (const entry of messages) {
    if (typeof entry !== 'object' || entry === null) return null
    const { role, text } = entry as { role?: unknown, text?: unknown }
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string') return null
    const trimmed = text.trim().slice(0, MAX_MESSAGE_CHARS)
    if (trimmed) turns.push({ role, text: trimmed })
  }
  if (turns.length === 0 || turns[turns.length - 1].role !== 'user') return null
  const conv = typeof conversationId === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(conversationId) ? conversationId : undefined
  return { turns, lang: lang === 'en' ? 'en' : 'fr', conversationId: conv }
}

type ChatEvent =
  | { type: 'card-intent', kind: string }
  | { type: 'text', delta: string }
  | { type: 'done' }
  | { type: 'error', message: string }

// The model is asked to open with a "[card:kind]" line naming the visual card
// to render. This works with any model — including small local ones that are
// unreliable at function calling. The parser buffers the head of the stream
// until that first line is settled, then passes everything through.
function createDirectiveParser(emit: (event: ChatEvent) => void) {
  let head = ''
  let resolved = false
  // Tolerant: models drift on the exact format ("[skills]", "[card: skills]",
  // mixed case…), so accept any bracketed variant — but only swallow the line
  // when the word is a known card kind (or "none"), never arbitrary text.
  const parseDirective = (line: string): string | null => {
    const match = /^\[\s*(?:card\s*:\s*)?([a-z]+)\s*\]$/i.exec(line.trim())
    if (!match) return null
    const kind = match[1].toLowerCase()
    return isCardKind(kind) || kind === 'none' ? kind : null
  }
  const resolveHead = (first: string, rest: string | null) => {
    resolved = true
    const kind = parseDirective(first)
    if (kind !== null) {
      if (isCardKind(kind)) emit({ type: 'card-intent', kind })
      const text = rest?.replace(/^\s+/, '') ?? ''
      if (text) emit({ type: 'text', delta: text })
    } else {
      const text = rest === null ? first : `${first}\n${rest}`
      if (text) emit({ type: 'text', delta: text })
    }
  }
  return {
    push(delta: string) {
      if (resolved) {
        if (delta) emit({ type: 'text', delta })
        return
      }
      head += delta
      const newline = head.indexOf('\n')
      if (newline !== -1) {
        resolveHead(head.slice(0, newline), head.slice(newline + 1))
      } else if (head.length > 48) {
        // Too long to be a directive: it's just text
        resolveHead('', head)
      }
    },
    flush() {
      if (!resolved && head) resolveHead(head, null)
      resolved = true
    }
  }
}

// ---- Routes ----------------------------------------------------------------
async function handleChat(req: IncomingMessage, res: ServerResponse) {
  if (!configured) {
    sendJson(res, 503, { error: 'not-configured' })
    return
  }
  if (!allowRequest(clientIp(req))) {
    sendJson(res, 429, { error: 'rate-limited' })
    return
  }

  let raw: string
  try {
    raw = await readBody(req)
  } catch {
    sendJson(res, 413, { error: 'body-too-large' })
    return
  }
  const parsed = parseChatRequest(raw)
  if (!parsed) {
    sendJson(res, 400, { error: 'invalid-request' })
    return
  }

  const ip = clientIp(req)
  const conversation = parsed.conversationId ?? randomUUID()
  const userTurn = parsed.turns[parsed.turns.length - 1]
  logTurn({
    ts: new Date().toISOString(),
    conversation,
    ip,
    ua: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 300) : '',
    lang: parsed.lang,
    role: 'user',
    text: userTurn.text
  })

  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache, no-transform',
    'x-accel-buffering': 'no',
    connection: 'keep-alive'
  })
  let answerText = ''
  let answerCard: string | null = null
  const send = (event: ChatEvent) => {
    if (event.type === 'text') answerText += event.delta
    else if (event.type === 'card-intent') answerCard = event.kind
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  const abort = new AbortController()
  req.on('close', () => abort.abort())

  const messages: ModelMessage[] = parsed.turns.map(
    turn => ({ role: turn.role, content: turn.text }) as ModelMessage
  )

  const parser = createDirectiveParser(send)
  // streamText never throws: upstream failures surface through onError and
  // the stream simply ends, so track them and tell the client explicitly —
  // it falls back to the scripted engine when no text arrived.
  let failed = false
  try {
    const result = streamText({
      model: configured.model,
      instructions: `${SYSTEM_PROMPT}\n\nLangue de l'interface du visiteur (lang) : ${parsed.lang}`,
      messages,
      temperature: 0.7,
      maxOutputTokens: 800,
      abortSignal: abort.signal,
      onError: ({ error }) => {
        failed = true
        if (!abort.signal.aborted) {
          console.error('[chat] upstream error:', error instanceof Error ? error.message : error)
        }
      }
    })
    for await (const delta of result.textStream) {
      parser.push(delta)
    }
  } catch (error) {
    failed = true
    if (!abort.signal.aborted) {
      console.error('[chat] stream error:', error instanceof Error ? error.message : error)
    }
  }
  if (!abort.signal.aborted) {
    parser.flush()
    send(failed ? { type: 'error', message: 'upstream-error' } : { type: 'done' })
  }
  logTurn({
    ts: new Date().toISOString(),
    conversation,
    ip,
    lang: parsed.lang,
    role: 'assistant',
    model: configured.label,
    text: answerText,
    ...(answerCard ? { card: answerCard } : {}),
    ...(failed ? { error: true } : {}),
    ...(abort.signal.aborted ? { aborted: true } : {})
  })
  res.end()
}

// Protected log reader: GET /api/chat/logs?date=YYYY-MM-DD&limit=200
// Auth: Authorization: Bearer <CHAT_ADMIN_TOKEN> or ?token=<CHAT_ADMIN_TOKEN>
async function handleLogs(req: IncomingMessage, res: ServerResponse) {
  if (!ADMIN_TOKEN || !LOG_DIR) {
    sendJson(res, 404, { error: 'not-found' })
    return
  }
  const url = new URL(req.url ?? '/', 'http://localhost')
  const auth = req.headers.authorization ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : url.searchParams.get('token') ?? ''
  if (token !== ADMIN_TOKEN) {
    sendJson(res, 401, { error: 'unauthorized' })
    return
  }
  const dateParam = url.searchParams.get('date') ?? ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : new Date().toISOString().slice(0, 10)
  const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get('limit')) || 200))
  let entries: unknown[] = []
  try {
    const rawLog = await readFile(join(LOG_DIR, `${date}.jsonl`), 'utf8')
    entries = rawLog.trim().split('\n').slice(-limit)
      .map(line => { try { return JSON.parse(line) as unknown } catch { return null } })
      .filter(Boolean)
  } catch { /* no log file for that day */ }
  let days: string[] = []
  try {
    days = (await readdir(LOG_DIR)).filter(f => f.endsWith('.jsonl')).map(f => f.replace('.jsonl', '')).sort()
  } catch { /* dir unreadable */ }
  sendJson(res, 200, { date, days, count: entries.length, entries })
}

const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0]
  if (req.method === 'GET' && (path === '/api/chat/health' || path === '/health')) {
    sendJson(res, 200, { ok: true, live: configured !== null, model: configured?.label ?? null })
    return
  }
  if (req.method === 'POST' && path === '/api/chat') {
    void handleChat(req, res)
    return
  }
  if (req.method === 'GET' && path === '/api/chat/logs') {
    void handleLogs(req, res)
    return
  }
  sendJson(res, 404, { error: 'not-found' })
})

server.listen(PORT, () => {
  console.log(`[chat] listening on :${PORT} — ${configured ? `live (${configured.label})` : 'no provider configured, health reports live:false'}`)
})
