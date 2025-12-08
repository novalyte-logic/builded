import { NextRequest, NextResponse } from 'next/server'

import { getRevenueIntelligence } from '@/lib/analytics/revenueIntelligence'
import { getDateRange } from '@/lib/bigquery/utils'
import type { RevenueIntelligenceResponse, ServiceLine } from '@/lib/types/analytics'

const VALID_SERVICE_LINES: ServiceLine[] = ['TRT', 'WEIGHT_LOSS', 'IV_THERAPY']

function parseDate(value: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceLineParam = searchParams.get('serviceLine')
    const startParam = parseDate(searchParams.get('startDate'))
    const endParam = parseDate(searchParams.get('endDate'))

    const fallbackRange = getDateRange(30)
    const startDate = startParam || fallbackRange.startDate
    const endDate = endParam || fallbackRange.endDate

    const serviceLine =
      serviceLineParam && VALID_SERVICE_LINES.includes(serviceLineParam as ServiceLine)
        ? (serviceLineParam as ServiceLine)
        : undefined

    const result = await getRevenueIntelligence({
      startDate,
      endDate,
      serviceLine,
    })

    const response: RevenueIntelligenceResponse = {
      regions: result.regions,
      clinics: result.clinics,
      meta: result.meta,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('revenue-intel API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
