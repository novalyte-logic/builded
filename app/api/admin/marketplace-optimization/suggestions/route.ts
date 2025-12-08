/**
 * Marketplace Optimization Suggestions API Route
 * 
 * GET /api/admin/marketplace-optimization/suggestions - List suggestions
 * POST /api/admin/marketplace-optimization/suggestions - Generate new suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getPendingSuggestions,
  getMarketplaceAISuggestions,
  dismissOptimizationSuggestion,
} from '@/lib/services/marketplace-optimization-engine'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'PENDING' | 'APPLIED' | 'DISMISSED'

    // TODO: Fetch from database instead of service
    const suggestions = await getPendingSuggestions()

    const filtered = status
      ? suggestions.filter((s) => s.status === status)
      : suggestions

    return NextResponse.json({
      suggestions: filtered,
      total: filtered.length,
    })
  } catch (error: any) {
    console.error('Suggestions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - Generate new AI suggestions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Fetch products and metrics from database
    // const products = await db.products.find(...)
    // const productMetrics = await computeProductMetricsForAll()
    // const categoryMetrics = await computeCategoryMetrics()

    // For now, generate suggestions from mock data
    const suggestions = await getMarketplaceAISuggestions(
      [], // products
      [], // productMetrics
      [] // categoryMetrics
    )

    return NextResponse.json({
      suggestions,
      message: `Generated ${suggestions.length} new suggestions`,
    })
  } catch (error: any) {
    console.error('Generate suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error.message },
      { status: 500 }
    )
  }
}

