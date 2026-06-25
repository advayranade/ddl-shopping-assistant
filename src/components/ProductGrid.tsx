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
}

export default function ProductGrid({ products, activeCategory, onCategoryChange }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-200 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
