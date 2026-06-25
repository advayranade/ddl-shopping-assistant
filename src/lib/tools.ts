import { tool } from 'ai'
import { z } from 'zod'
import { products } from '@/data/products'
import type { Product } from '@/types'
import { log } from './logger'

export const searchProducts = tool({
  description:
    'Search the product catalog using natural language. Optionally filter by category, min price, or max price.',
  parameters: z.object({
    query: z.string().describe('Natural language search query, e.g. "gift for a 7-year-old girl"'),
    category: z
      .enum(['electronics', 'toys', 'kitchen', 'clothing', 'sports'])
      .optional()
      .describe('Filter by product category'),
    maxPrice: z.number().optional().describe('Maximum price in USD'),
    minPrice: z.number().optional().describe('Minimum price in USD'),
  }),
  execute: async ({ query, category, maxPrice, minPrice }) => {
    log('tool:search_products', { query, category, maxPrice, minPrice })
    const terms = query.toLowerCase().split(/\s+/)
    let results = products.filter((p) => {
      const haystack = `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase()
      return terms.some((term: string) => haystack.includes(term))
    })
    if (category) results = results.filter((p) => p.category === category)
    if (maxPrice !== undefined) results = results.filter((p) => p.price <= maxPrice)
    if (minPrice !== undefined) results = results.filter((p) => p.price >= minPrice)
    const top = results.slice(0, 6)
    log('tool:search_products:result', { count: top.length, total: results.length })
    return { products: top, total: results.length }
  },
})

export const getProductDetails = tool({
  description: 'Get full details for a specific product by its ID.',
  parameters: z.object({
    productId: z.string().describe('The product ID (e.g. "e1", "t3")'),
  }),
  execute: async ({ productId }) => {
    log('tool:get_product_details', { productId })
    const product = products.find((p) => p.id === productId)
    if (!product) return { error: `Product "${productId}" not found` }
    return { product }
  },
})

export const compareProducts = tool({
  description: 'Compare 2–4 products side by side on price, rating, and features.',
  parameters: z.object({
    productIds: z
      .array(z.string())
      .min(2)
      .max(4)
      .describe('Array of product IDs to compare'),
  }),
  execute: async ({ productIds }) => {
    log('tool:compare_products', { productIds })
    const found = productIds
      .map((id: string) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined)
    return { products: found }
  },
})

export const trackPrice = tool({
  description:
    'Set a price drop alert for a product. The user will be notified when the price falls to or below their target.',
  parameters: z.object({
    productId: z.string().describe('Product ID to track'),
    targetPrice: z.number().describe('Alert when price drops to or below this amount (USD)'),
  }),
  execute: async ({ productId, targetPrice }) => {
    log('tool:track_price', { productId, targetPrice })
    const product = products.find((p) => p.id === productId)
    if (!product) return { error: `Product "${productId}" not found` }
    const alreadyMet = product.price <= targetPrice
    return {
      success: true,
      alreadyMet,
      message: alreadyMet
        ? `Great news — "${product.name}" is already at $${product.price.toFixed(2)}, below your target of $${targetPrice.toFixed(2)}!`
        : `Price alert set for "${product.name}". You'll be notified when it drops from $${product.price.toFixed(2)} to $${targetPrice.toFixed(2)}.`,
      product: { id: product.id, name: product.name, currentPrice: product.price },
      targetPrice,
    }
  },
})

export const getRecommendations = tool({
  description:
    'Get personalized product recommendations. Uses the active user profile to tailor suggestions.',
  parameters: z.object({
    context: z
      .string()
      .optional()
      .describe('Extra context about what the user is looking for'),
    category: z
      .enum(['electronics', 'toys', 'kitchen', 'clothing', 'sports'])
      .optional()
      .describe('Limit recommendations to a category'),
  }),
  execute: async ({ context, category }) => {
    log('tool:get_recommendations', { context, category })
    const pool = category ? products.filter((p) => p.category === category) : products
    const recommendations = pool
      .filter((p) => p.inStock)
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, 5)
    return { recommendations, context }
  },
})

export const tools = {
  searchProducts,
  getProductDetails,
  compareProducts,
  trackPrice,
  getRecommendations,
}
