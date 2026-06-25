'use client'

import { useState } from 'react'
import type { AIProvider, ProviderConfig } from '@/types'
import { PROVIDER_META } from '@/types'

const PROVIDERS = Object.entries(PROVIDER_META) as [AIProvider, (typeof PROVIDER_META)[AIProvider]][]

interface Props {
  onSave: (config: ProviderConfig) => void
}

export default function ApiKeyModal({ onSave }: Props) {
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const meta = PROVIDER_META[provider]

  const handleProviderChange = (p: AIProvider) => {
    setProvider(p)
    setApiKey('')
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = apiKey.trim()
    if (!trimmed) {
      setError('Please enter your API key')
      return
    }
    if (meta.keyPrefix && !trimmed.startsWith(meta.keyPrefix)) {
      setError(`${PROVIDER_META[provider].label.split('—')[0].trim()} keys start with "${meta.keyPrefix}"`)
      return
    }
    onSave({ provider, apiKey: trimmed })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">🔑</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connect your AI provider</h2>
            <p className="text-xs text-gray-500">For demo use — key is stored in your browser only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Provider selector */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">AI Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map(([id, info]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleProviderChange(id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors ${
                    provider === id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-base">{PROVIDER_ICONS[id]}</span>
                  <span className="font-medium leading-tight">{info.label.split('—')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model badge */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Model:</span>
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{meta.model}</span>
          </div>

          {/* API key input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError('') }}
              placeholder={meta.keyPlaceholder}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Continue to ShopSmart →
          </button>
        </form>

        {/* Docs link */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Get a key at{' '}
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {meta.docsUrl.replace('https://', '')}
          </a>
        </p>
      </div>
    </div>
  )
}

const PROVIDER_ICONS: Record<AIProvider, string> = {
  openai: '🤖',
  anthropic: '🔶',
  google: '🔵',
  xai: '✖️',
}
