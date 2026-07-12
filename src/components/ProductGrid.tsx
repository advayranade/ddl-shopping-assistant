import { useEffect, useMemo, useRef } from 'react'
import type { Product, Category } from '@/types'
import ProductCard from './ProductCard'

const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'electronics', label: '💻 Electronics' },
  { value: 'toys', label: '🎮 Toys' },
  { value: 'kitchen', label: '🍳 Kitchen' },
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'sports', label: '🏃 Sports' },
]

interface Props {
  products: Product[]
  activeCategory: Category | 'all'
  onCategoryChange: (c: Category | 'all') => void
  highlightedIds: string[]
  onClearHighlights: () => void
}

export default function ProductGrid({ products, activeCategory, onCategoryChange, highlightedIds, onClearHighlights }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const sortedProducts = useMemo(() => {
    if (highlightedIds.length === 0) return products
    const rank = new Map(highlightedIds.map((id, i) => [id, i]))
    return [...products].sort((a, b) => {
      const ra = rank.has(a.id) ? rank.get(a.id)! : Infinity
      const rb = rank.has(b.id) ? rank.get(b.id)! : Infinity
      return ra - rb
    })
  }, [products, highlightedIds])

  const highlightedInView = useMemo(
    () => sortedProducts.filter((p) => highlightedIds.includes(p.id)).length,
    [sortedProducts, highlightedIds]
  )

  useEffect(() => {
    if (highlightedIds.length > 0) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [highlightedIds])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-200 overflow-x-auto bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.value
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* AI recommendation banner */}
      {highlightedInView > 0 && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-lg bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200 px-4 py-2.5 text-sm animate-[fadeIn_0.3s_ease-out]">
          <span className="flex items-center gap-2 text-amber-900">
            <span className="text-base">✨</span>
            <span>
              <strong className="font-semibold">{highlightedInView}</strong> AI-recommended{' '}
              {highlightedInView === 1 ? 'item is' : 'items are'} highlighted below
            </span>
          </span>
          <button
            onClick={onClearHighlights}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline flex-shrink-0"
          >
            Clear
          </button>
        </div>
      )}

      {/* Grid */}
      {sortedProducts.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} highlighted={highlightedIds.includes(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
