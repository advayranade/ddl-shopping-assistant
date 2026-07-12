// Turns a completed tool call into a short, human-readable line describing
// what the agent just did — used to drive the "thinking" trace shown in the
// chat UI and logged to the terminal/log file as the agent works.
export function describeToolActivity(toolName: string, args: Record<string, unknown>, result: unknown): string {
  const r = result as Record<string, unknown> | undefined

  switch (toolName) {
    case 'searchProducts': {
      const filters: string[] = []
      if (args.category) filters.push(`in ${args.category}`)
      if (args.maxPrice !== undefined) filters.push(`under $${args.maxPrice}`)
      if (typeof args.minPrice === 'number' && args.minPrice > 0) filters.push(`over $${args.minPrice}`)
      const filterText = filters.length ? ` ${filters.join(', ')}` : ''
      const count = (r?.total as number | undefined) ?? (r?.products as unknown[] | undefined)?.length ?? 0
      return `🔍 Searching for "${args.query}"${filterText} — found ${count} match${count === 1 ? '' : 'es'}`
    }
    case 'getProductDetails': {
      const product = r?.product as { name?: string } | undefined
      return `📋 Looking up details for "${product?.name ?? args.productId}"`
    }
    case 'compareProducts': {
      const products = r?.products as { name: string }[] | undefined
      const names = products?.map((p) => p.name).join(' vs. ')
      return `⚖️ Comparing ${names ?? (args.productIds as string[]).join(', ')}`
    }
    case 'trackPrice': {
      const product = r?.product as { name?: string } | undefined
      return `🔔 Setting a price alert for "${product?.name ?? args.productId}" at $${args.targetPrice}`
    }
    case 'getRecommendations': {
      const count = (r?.recommendations as unknown[] | undefined)?.length ?? 0
      const scope = args.category ? ` in ${args.category}` : ''
      return `✨ Pulling ${count} personalized recommendation${count === 1 ? '' : 's'}${scope}`
    }
    default:
      return `🤔 Running ${toolName}`
  }
}
