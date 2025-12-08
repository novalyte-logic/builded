/**
 * Admin Metrics API Route
 * 
 * Server-side API endpoint for BigQuery-powered metrics.
 * Requires superadmin authentication (implement auth middleware).
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminOverviewMetrics,
  getFunnelMetrics,
  getClinicCohorts,
  getAdPerformanceByChannel,
  getMarketplaceCategoryRevenue,
} from '@/lib/bigquery/queries'

// Simple in-memory cache (replace with Redis in production)
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 30000 // 30 seconds

function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.data)
  }

  return fetcher().then((data) => {
    cache.set(key, { data, expires: Date.now() + CACHE_TTL })
    return data
  })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metricType = searchParams.get('type')
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const channel = searchParams.get('channel') || undefined
    const path = searchParams.get('path') || undefined
    const clinicId = searchParams.get('clinicId') || undefined
    const category = searchParams.get('category') || undefined

    const dateRange = startDate && endDate
      ? { startDate, endDate }
      : undefined

    let data

    switch (metricType) {
      case 'overview':
        data = await getCached(
          `overview:${startDate}:${endDate}`,
          () => getAdminOverviewMetrics(dateRange)
        )
        break

      case 'funnel':
        data = await getCached(
          `funnel:${startDate}:${endDate}:${channel}:${path}`,
          () => getFunnelMetrics(dateRange, channel || undefined, path || undefined)
        )
        break

      case 'clinics':
        data = await getCached(
          `clinics:${startDate}:${endDate}:${clinicId}`,
          () => getClinicCohorts(dateRange, clinicId || undefined)
        )
        break

      case 'ads':
        data = await getCached(
          `ads:${startDate}:${endDate}`,
          () => getAdPerformanceByChannel(dateRange)
        )
        break

      case 'marketplace':
        data = await getCached(
          `marketplace:${startDate}:${endDate}:${category}`,
          () => getMarketplaceCategoryRevenue(dateRange, category || undefined)
        )
        break

      case 'cities':
        data = await getCached(
          `cities:${startDate}:${endDate}`,
          () => import('@/lib/bigquery/queries').then((m) => m.getCityPerformance(dateRange))
        )
        break

      case 'trending_protocols':
        data = await getCached(
          `trending:${startDate}:${endDate}`,
          () => import('@/lib/bigquery/queries').then((m) => m.getTrendingProtocols(dateRange))
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('BigQuery API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error.message },
      { status: 500 }
    )
  }
}

