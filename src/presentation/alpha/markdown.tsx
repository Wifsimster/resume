import type { ReactNode } from 'react'

// Minimal markdown renderer for chat messages — covers what the LLM is asked
// to produce (bold, italic, inline code, links, bullet/numbered lists) plus a
// heading fallback. Renders straight to React elements: no innerHTML, so the
// model's output can never inject markup.

const INLINE_RE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g
const LINK_RE = /^\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)$/

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let i = 0
  for (const match of text.matchAll(INLINE_RE)) {
    const token = match[0]
    const start = match.index
    if (start > last) nodes.push(text.slice(last, start))
    const key = `${keyPrefix}-${i++}`
    if (token.startsWith('`')) {
      nodes.push(<code key={key} className="px-1 py-0.5 rounded bg-white/10 font-(--font-code) text-[0.85em]">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key} className="text-[var(--alpha-text)]">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*') || token.startsWith('_')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    } else {
      const link = LINK_RE.exec(token)
      if (link) {
        nodes.push(
          <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-[var(--alpha-accent)] underline underline-offset-2 hover:opacity-80">
            {link[1]}
          </a>
        )
      } else {
        nodes.push(token)
      }
    }
    last = start + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

const BULLET_RE = /^\s*[-*•]\s+(.*)$/
const ORDERED_RE = /^\s*\d+[.)]\s+(.*)$/
const HEADING_RE = /^#{1,4}\s+(.*)$/

interface Block { type: 'p' | 'ul' | 'ol', lines: string[] }

function toBlocks(text: string): Block[] {
  const blocks: Block[] = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd()
    if (!line.trim()) {
      // Blank line closes the current block
      if (blocks[blocks.length - 1]?.lines.length) blocks.push({ type: 'p', lines: [] })
      continue
    }
    const bullet = BULLET_RE.exec(line)
    const ordered = bullet ? null : ORDERED_RE.exec(line)
    const type: Block['type'] = bullet ? 'ul' : ordered ? 'ol' : 'p'
    const content = bullet?.[1] ?? ordered?.[1] ?? line
    const current = blocks[blocks.length - 1]
    if (current && current.type === type && current.lines.length > 0) {
      current.lines.push(content)
    } else {
      if (current && current.lines.length === 0) blocks.pop()
      blocks.push({ type, lines: [content] })
    }
  }
  return blocks.filter(b => b.lines.length > 0)
}

export function Markdown({ text, cursor }: { text: string, cursor?: ReactNode }) {
  const blocks = toBlocks(text)
  if (blocks.length === 0) return <>{cursor}</>
  return (
    <div className="alpha-md">
      {blocks.map((block, blockIndex) => {
        const isLast = blockIndex === blocks.length - 1
        if (block.type === 'p') {
          return (
            <p key={blockIndex}>
              {block.lines.map((line, lineIndex) => {
                const heading = HEADING_RE.exec(line)
                const content = renderInline(heading?.[1] ?? line, `${blockIndex}-${lineIndex}`)
                return (
                  <span key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {heading ? <strong className="text-[var(--alpha-text)]">{content}</strong> : content}
                  </span>
                )
              })}
              {isLast && cursor}
            </p>
          )
        }
        const List = block.type === 'ul' ? 'ul' : 'ol'
        return (
          <List key={blockIndex} className={block.type === 'ul' ? 'list-disc' : 'list-decimal'}>
            {block.lines.map((line, lineIndex) => (
              <li key={lineIndex}>
                {renderInline(line, `${blockIndex}-${lineIndex}`)}
                {isLast && lineIndex === block.lines.length - 1 && cursor}
              </li>
            ))}
          </List>
        )
      })}
    </div>
  )
}
