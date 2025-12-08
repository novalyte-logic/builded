/**
 * Marketplace Performance Metrics API Route
 * 
 * GET /api/admin/marketplace-optimization/performance - Get product performance data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProductPerformanceData } from '@/lib/services/marketplace-optimization-engine'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const performance = searchParams.get('performance') as 'top' | 'middle' | 'low' | null
    const for_who = searchParams.get('for_who')

    const filters: any = {}
    if (category) filters.category = category
    if (performance) filters.performance = performance
    if (for_who) filters.for_who = for_who

    const performanceData = await getProductPerformanceData(filters)

    return NextResponse.json({
      products: performanceData,
      total: performanceData.length,
    })
  } catch (error: any) {
    console.error('Performance API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data', details: error.message },
      { status: 500 }
    )
  }
}

