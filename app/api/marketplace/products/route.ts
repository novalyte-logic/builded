/**
 * Public Marketplace Products API Route
 * 
 * GET /api/marketplace/products - Get products with AI-optimized ordering
 * 
 * This endpoint is consumed by the public marketplace (app.novalyte.io)
 * It respects AI optimization suggestions (featured products, reordering, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { MarketplaceProduct } from '@/lib/types/marketplace'

// Mock data store (replace with database)
const products: MarketplaceProduct[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const use_ai_ordering = searchParams.get('use_ai_ordering') !== 'false' // Default true

    // TODO: Fetch products from database
    let filteredProducts = [...products]

    // Filter by category if provided
    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.category === category)
    }

    // Filter to only show products visible in marketplace
    filteredProducts = filteredProducts.filter((p) => p.show_in_marketplace)

    // Apply AI-optimized ordering if enabled
    if (use_ai_ordering) {
      // TODO: Fetch applied optimization suggestions from database
      // Priority order:
      // 1. Featured products first
      // 2. Products with REORDER suggestions (higher position = earlier)
      // 3. Products with AI performance scores (higher = earlier)
      // 4. Default ordering (created_at or alphabetical)

      filteredProducts.sort((a, b) => {
        // Featured products first
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1

        // TODO: Check for REORDER suggestions and apply position
        // const aPosition = getSuggestedPosition(a.id)
        // const bPosition = getSuggestedPosition(b.id)
        // if (aPosition !== null && bPosition !== null) return aPosition - bPosition

        // TODO: Apply AI performance score ordering
        // const aScore = getProductPerformanceScore(a.id)
        // const bScore = getProductPerformanceScore(b.id)
        // if (aScore && bScore) return bScore - aScore

        // Default: by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }

    // Apply limit
    const limitedProducts = filteredProducts.slice(0, limit)

    return NextResponse.json({
      products: limitedProducts,
      total: filteredProducts.length,
      category: category || 'all',
      ai_optimized: use_ai_ordering,
    })
  } catch (error: any) {
    console.error('Marketplace products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    )
  }
}

