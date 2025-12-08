/**
 * Marketplace Public Service
 * 
 * Helper functions for the public marketplace to consume AI-optimized product data
 * Used by app.novalyte.io marketplace pages
 */

import { MarketplaceProduct } from '@/lib/types/marketplace'
import { MarketplaceOptimizationSuggestion } from '@/lib/types/marketplace-optimization'

/**
 * Get AI-Optimized Product Ordering
 * 
 * Returns products in order that respects applied AI optimization suggestions:
 * 1. Featured products first
 * 2. Products with REORDER suggestions (by position)
 * 3. Products by performance score
 * 4. Default ordering
 */
export async function getAIOptimizedProductOrder(
  products: MarketplaceProduct[],
  appliedSuggestions?: MarketplaceOptimizationSuggestion[]
): Promise<MarketplaceProduct[]> {
  const suggestions = appliedSuggestions || []

  // Build a map of product IDs to suggested positions
  const positionMap = new Map<string, number>()
  suggestions
    .filter((s) => s.type === 'REORDER' && s.status === 'APPLIED')
    .forEach((s) => {
      if (s.metadata?.suggested_position) {
        positionMap.set(s.target_id, s.metadata.suggested_position as number)
      }
    })

  // Sort products
  const sorted = [...products].sort((a, b) => {
    // 1. Featured products first
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1

    // 2. Products with REORDER suggestions (lower position number = earlier)
    const aPosition = positionMap.get(a.id)
    const bPosition = positionMap.get(b.id)
    if (aPosition !== undefined && bPosition !== undefined) {
      return aPosition - bPosition
    }
    if (aPosition !== undefined) return -1
    if (bPosition !== undefined) return 1

    // 3. Default ordering (created_at desc)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return sorted
}

/**
 * Get Recommended Products for Stack
 * 
 * Returns products that are frequently paired with the given product
 * Based on AI stack suggestions
 */
export async function getRecommendedStackProducts(
  productId: string,
  allProducts: MarketplaceProduct[]
): Promise<MarketplaceProduct[]> {
  // TODO: Query database for stack suggestions
  // For now, return empty or mock data
  // In production, this would:
  // 1. Find stack suggestions containing this product
  // 2. Return other products in those stacks
  // 3. Order by frequency/confidence

  return []
}

/**
 * Get Featured Products for Category
 * 
 * Returns featured products for a category, respecting AI optimization
 */
export async function getFeaturedProductsForCategory(
  category: string,
  products: MarketplaceProduct[]
): Promise<MarketplaceProduct[]> {
  const categoryProducts = products.filter(
    (p) => p.category === category && p.is_featured && p.show_in_marketplace
  )

  // Apply AI ordering
  return await getAIOptimizedProductOrder(categoryProducts)
}

/**
 * Get Products for Homepage Recommendations
 * 
 * Returns products to feature on homepage based on AI suggestions
 */
export async function getHomepageRecommendedProducts(
  products: MarketplaceProduct[],
  region?: string // For future "Trending in Your Region" feature
): Promise<{
  for_hormones: MarketplaceProduct[]
  trending: MarketplaceProduct[]
  recommended_stacks: Array<{ name: string; products: MarketplaceProduct[] }>
}> {
  // Filter to featured, visible products
  const visibleProducts = products.filter((p) => p.show_in_marketplace && p.is_featured)

  // "Recommended for Men Focused on Hormones"
  const hormoneProducts = visibleProducts
    .filter((p) => p.use_case_tags.includes('TRT') || p.use_case_tags.includes('Hormones'))
    .slice(0, 6)

  // "Trending" (could be based on recent performance metrics)
  const trendingProducts = visibleProducts.slice(0, 6)

  // Recommended stacks (placeholder - would come from AI suggestions)
  const recommendedStacks: Array<{ name: string; products: MarketplaceProduct[] }> = []

  return {
    for_hormones: hormoneProducts,
    trending: trendingProducts,
    recommended_stacks: recommendedStacks,
  }
}

