import type { ReactNode } from 'react'

// Minimal inline markdown renderer: supports **bold**, *italic*/_italic_, and `code`.
export function renderInlineMarkdown(text: string): ReactNode {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g)
  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      )
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="bg-black/5 px-1 py-0.5 rounded text-[0.85em] font-mono">
          {token.slice(1, -1)}
        </code>
      )
    }
    if (
      (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      return <em key={i}>{token.slice(1, -1)}</em>
    }
    return token
  })
}
