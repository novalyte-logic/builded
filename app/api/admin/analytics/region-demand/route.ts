import { NextRequest, NextResponse } from 'next/server'

import { getLeadDemandByRegion } from '@/lib/bigquery/queries'
import { getDateRange } from '@/lib/bigquery/utils'
import type { RegionDemandResponse, ServiceLine } from '@/lib/types/analytics'

const VALID_SERVICE_LINES: ServiceLine[] = ['TRT', 'WEIGHT_LOSS', 'IV_THERAPY']

function parseDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().split('T')[0]
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

    const serviceLine = serviceLineParam && VALID_SERVICE_LINES.includes(serviceLineParam as ServiceLine)
      ? (serviceLineParam as ServiceLine)
      : undefined

    const rows = await getLeadDemandByRegion({
      startDate,
      endDate,
      serviceLine,
    })

    const response: RegionDemandResponse = {
      rows,
      meta: {
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('region-demand API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
