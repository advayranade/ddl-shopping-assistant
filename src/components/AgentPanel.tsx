'use client'

import { useEffect } from 'react'
import { useChat } from 'ai/react'
import type { UserProfile, ProviderConfig } from '@/types'
import { renderInlineMarkdown } from '@/lib/markdown'

const SUGGESTED_PROMPTS = [
  'Find me a gift for a 7-year-old girl under $25',
  'Compare the wireless headphones and bluetooth speaker',
  'What are the best-rated kitchen items?',
  'Set a price alert for the air fryer at $65',
  'Recommend something for working from home',
]

interface Props {
  profile: UserProfile | null
  providerConfig: ProviderConfig | null
  onHighlightProducts: (ids: string[]) => void
}

export default function AgentPanel({ profile, providerConfig, onHighlightProducts }: Props) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
    api: '/api/chat',
    body: { profile, providerConfig },
  })

  const hasMessages = messages.length > 0

  // Whenever the assistant's tool calls resolve with product data, surface
  // those products in the catalog so the user can actually find them.
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    if (!lastAssistant) return

    const ids: string[] = []
    const seen = new Set<string>()
    const addId = (id: unknown) => {
      if (typeof id === 'string' && !seen.has(id)) {
        seen.add(id)
        ids.push(id)
      }
    }

    for (const invocation of lastAssistant.toolInvocations ?? []) {
      if (invocation.state !== 'result') continue
      const result = invocation.result as {
        products?: { id: string }[]
        recommendations?: { id: string }[]
        product?: { id: string }
      }
      result.products?.forEach((p) => addId(p?.id))
      result.recommendations?.forEach((p) => addId(p?.id))
      if (result.product?.id) addId(result.product.id)
    }

    if (ids.length > 0) onHighlightProducts(ids.slice(0, 4))
  }, [messages, onHighlightProducts])

  const handleClear = () => {
    setMessages([])
    onHighlightProducts([])
  }

  return (
    <div className="w-96 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛍️</span>
            <span className="font-semibold text-white text-sm">Shopping Assistant</span>
          </div>
          {hasMessages && (
            <button
              onClick={handleClear}
              className="text-blue-100 hover:text-white text-xs transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {profile && (
          <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300" />
            Helping: {profile.name}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-gradient-to-b from-slate-50 to-white">
        {!hasMessages ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 text-center pt-2">
              Ask me anything about the products!
            </p>
            <div className="space-y-1.5">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    const form = document.getElementById('agent-form') as HTMLFormElement
                    const textarea = form?.querySelector('input') as HTMLInputElement
                    if (textarea) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        'value'
                      )?.set
                      nativeInputValueSetter?.call(textarea, prompt)
                      textarea.dispatchEvent(new Event('input', { bubbles: true }))
                    }
                    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLInputElement>)
                    setTimeout(() => form?.requestSubmit(), 50)
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-all border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            if (m.role === 'user') {
              return (
                <div key={m.id} className="flex justify-end animate-[fadeIn_0.2s_ease-out]">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                    {m.content as string}
                  </div>
                </div>
              )
            }
            if (m.role === 'assistant') {
              // In AI SDK v4, content is a plain string for streamed text responses.
              // With multi-step tool use, intermediate steps may have empty content — skip those.
              const text = (m.content as string) ?? ''
              const thoughts = ((m.annotations ?? []) as { type?: string; text?: string }[]).filter(
                (a) => a?.type === 'thinking' && a.text
              )
              if (!text.trim() && thoughts.length === 0) return null
              return (
                <div key={m.id} className="space-y-1.5">
                  {thoughts.length > 0 && (
                    <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-start gap-2 max-w-[92%]">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs mt-0.5">
                          🧠
                        </span>
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-2 space-y-1">
                          {thoughts.map((t, i) => (
                            <p key={i} className="text-[11px] text-slate-500 italic leading-snug">
                              {t.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {text.trim() && (
                    <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-start gap-2 max-w-[92%]">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs shadow-sm mt-0.5">
                          🛍️
                        </span>
                        <div className="bg-white text-gray-800 text-sm rounded-2xl rounded-tl-sm px-3 py-2 whitespace-pre-wrap leading-relaxed border border-gray-100 shadow-sm">
                          {renderInlineMarkdown(text)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            return null
          })
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs shadow-sm mt-0.5">
                🛍️
              </span>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          Error: {error.message}
        </div>
      )}

      {/* Input */}
      <form
        id="agent-form"
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 flex gap-2 bg-white"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about products…"
          disabled={isLoading}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-shadow"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3.5 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
        >
          ↑
        </button>
      </form>
    </div>
  )
}
