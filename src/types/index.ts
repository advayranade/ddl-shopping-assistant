export type Category = 'electronics' | 'toys' | 'kitchen' | 'clothing' | 'sports'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'xai'

export interface ProviderConfig {
  provider: AIProvider
  apiKey: string
}

export const PROVIDER_META: Record<AIProvider, {
  label: string
  keyPlaceholder: string
  keyPrefix: string
  model: string
  docsUrl: string
}> = {
  openai: {
    label: 'OpenAI — GPT-4o mini',
    keyPlaceholder: 'sk-...',
    keyPrefix: 'sk-',
    model: 'gpt-4o-mini',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    label: 'Anthropic — Claude 3.5 Sonnet',
    keyPlaceholder: 'sk-ant-...',
    keyPrefix: 'sk-ant-',
    model: 'claude-3-5-sonnet-20241022',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  google: {
    label: 'Google — Gemini 2.0 Flash',
    keyPlaceholder: 'AIza...',
    keyPrefix: '',
    model: 'gemini-2.0-flash',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  xai: {
    label: 'xAI — Grok Beta',
    keyPlaceholder: 'xai-...',
    keyPrefix: 'xai-',
    model: 'grok-beta',
    docsUrl: 'https://console.x.ai',
  },
}

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: Category
  description: string
  rating: number
  reviewCount: number
  inStock: boolean
  tags: string[]
}

export interface UserProfile {
  id: string
  name: string
  description: string
  context: string
}
