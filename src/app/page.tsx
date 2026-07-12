'use client'

import { useState, useMemo, useEffect } from 'react'
import { products } from '@/data/products'
import type { Category, UserProfile, ProviderConfig } from '@/types'
import ProductGrid from '@/components/ProductGrid'
import AgentPanel from '@/components/AgentPanel'
import ApiKeyModal from '@/components/ApiKeyModal'

const STORAGE_KEY = 'shopsmart_provider_config'

const PROFILES: UserProfile[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    description: 'Mom · 2 kids (7 & 10)',
    context:
      'Sarah is a mom in her late 30s with two daughters aged 7 and 10. She shops for her family frequently, is budget-conscious, and cares about safety and age-appropriateness. She enjoys cooking and looks for quality kitchen products. Her daughters love arts & crafts, toys, and anything creative.',
  },
  {
    id: 'jake',
    name: 'Jake Torres',
    description: 'College student · Tech & gaming',
    context:
      'Jake is a 21-year-old college student who is passionate about technology and gaming. He is on a tight budget but willing to splurge on good electronics. He works from his dorm room and values portable, efficient gadgets. He works out occasionally and needs affordable fitness gear.',
  },
  {
    id: 'maria',
    name: 'Maria Kim',
    description: 'Fitness enthusiast · Quality over price',
    context:
      'Maria is a 32-year-old fitness enthusiast who prioritizes an active lifestyle. She regularly does yoga, running, and strength training. She values quality products and is willing to pay more for durability. She also cooks healthy meals at home and keeps a clean, organized kitchen.',
  },
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null)
  const [providerConfig, setProviderConfig] = useState<ProviderConfig | null>(null)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [highlightedIds, setHighlightedIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setProviderConfig(stored ? JSON.parse(stored) : null)
    } catch {
      setProviderConfig(null)
    }
    setConfigLoaded(true)
  }, [])

  const handleSaveConfig = (config: ProviderConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setProviderConfig(config)
  }

  const handleClearConfig = () => {
    localStorage.removeItem(STORAGE_KEY)
    setProviderConfig(null)
  }

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category === activeCategory)
  }, [activeCategory])

  if (!configLoaded) return null

  return (
    <div className="flex flex-col h-full">
      {!providerConfig && <ApiKeyModal onSave={handleSaveConfig} />}

      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 text-white px-4 py-3 flex items-center gap-4 shadow-md relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">🛒</span>
          <span className="text-xl font-bold tracking-tight">ShopSmart</span>
          <span className="text-blue-200 text-xs ml-1 italic bg-white/10 px-1.5 py-0.5 rounded-full">AI Demo</span>
        </div>

        {/* Fake search bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <input
            readOnly
            placeholder="Search products (try the AI assistant →)"
            className="w-full px-3 py-1.5 rounded-md text-sm text-gray-500 bg-white cursor-default"
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Profile selector */}
          <div className="flex items-center gap-2">
            <span className="text-blue-200 text-xs">Profile:</span>
            <select
              value={activeProfile?.id ?? ''}
              onChange={(e) => {
                const p = PROFILES.find((p) => p.id === e.target.value) ?? null
                setActiveProfile(p)
              }}
              className="text-sm px-2 py-1 rounded-md bg-blue-600 text-white border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value="">No profile</option>
              {PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.description}
                </option>
              ))}
            </select>
          </div>

          {/* Provider indicator */}
          <button
            onClick={handleClearConfig}
            title="Click to change provider / API key"
            className="flex items-center gap-1 text-xs text-blue-200 hover:text-white transition-colors"
          >
            <span>🔑</span>
            <span>{providerConfig ? providerConfig.provider.toUpperCase() : 'Add key'}</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <main className="flex flex-1 flex-col min-w-0 min-h-0">
          <ProductGrid
            products={visibleProducts}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            highlightedIds={highlightedIds}
            onClearHighlights={() => setHighlightedIds([])}
          />
        </main>

        <AgentPanel
          profile={activeProfile}
          providerConfig={providerConfig}
          onHighlightProducts={setHighlightedIds}
        />
      </div>
    </div>
  )
}
