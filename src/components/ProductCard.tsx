import type { Product } from '@/types'
import { PRODUCT_EMOJI, CATEGORY_EMOJI } from '@/data/products'

const CATEGORY_BG: Record<string, string> = {
  electronics: 'bg-blue-50',
  toys: 'bg-yellow-50',
  kitchen: 'bg-green-50',
  clothing: 'bg-purple-50',
  sports: 'bg-orange-50',
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const emoji = PRODUCT_EMOJI[product.id] ?? CATEGORY_EMOJI[product.category] ?? '📦'
  const bg = CATEGORY_BG[product.category] ?? 'bg-gray-50'
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className={`${bg} rounded-t-lg flex items-center justify-center h-36 text-5xl`}>
        {emoji}
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Name */}
        <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2 mb-1">
          {product.name}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span className="text-gray-400 text-xs">({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
          {discount && (
            <span className="text-xs font-semibold text-green-600">-{discount}%</span>
          )}
        </div>

        {/* Stock */}
        {!product.inStock && (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        )}

        {/* Add to cart */}
        <button
          disabled={!product.inStock}
          className="mt-2 w-full text-sm font-medium py-1.5 rounded-md bg-amber-400 hover:bg-amber-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {product.inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  )
}
