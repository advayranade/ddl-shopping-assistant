'use client'

import { useChat } from 'ai/react'
import type { UserProfile, ProviderConfig } from '@/types'

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
}

export default function AgentPanel({ profile, providerConfig }: Props) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error } = useChat({
    api: '/api/chat',
    body: { profile, providerConfig },
  })

  const hasMessages = messages.length > 0

  return (
    <div className="w-96 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛍️</span>
            <span className="font-semibold text-white text-sm">Shopping Assistant</span>
          </div>
          {hasMessages && (
            <button
              onClick={() => setMessages([])}
              className="text-blue-200 hover:text-white text-xs transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {profile && (
          <p className="text-blue-200 text-xs mt-1">
            Helping: {profile.name}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
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
                  className="w-full text-left text-xs p-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-colors border border-gray-200 hover:border-blue-200"
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
                <div key={m.id} className="flex justify-end">
                  <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                    {m.content as string}
                  </div>
                </div>
              )
            }
            if (m.role === 'assistant') {
              // In AI SDK v4, content is a plain string for streamed text responses.
              // With multi-step tool use, intermediate steps may have empty content — skip those.
              const text = (m.content as string) ?? ''
              if (!text.trim()) return null
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%] whitespace-pre-wrap leading-relaxed">
                    {text}
                  </div>
                </div>
              )
            }
            return null
          })
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              </span>
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
        className="p-3 border-t border-gray-200 flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about products…"
          disabled={isLoading}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ↑
        </button>
      </form>
    </div>
  )
}
