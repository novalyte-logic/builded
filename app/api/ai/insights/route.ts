/**
 * AI Insights API Route
 * 
 * Server-side API endpoint for Vertex AI (Gemini) intelligence.
 * Requires superadmin authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  scoreLead,
  recommendChannelShifts,
  generateWeeklyInsightsBrief,
  type LeadFeatures,
  type ChannelMetrics,
} from '@/lib/vertex-ai/service'
import { getAdPerformanceByChannel } from '@/lib/bigquery/queries'
import { getDateRange } from '@/lib/bigquery/utils'

// Simple rate limiting (replace with proper rate limiter in production)
const requestCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100 // requests per hour
const RATE_WINDOW = 3600000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || record.resetAt < now) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    let result

    switch (type) {
      case 'score_lead':
        result = await scoreLead(data as LeadFeatures)
        break

      case 'recommend_channels':
        // Fetch actual ad metrics from BigQuery if not provided
        if (!data || !Array.isArray(data) || data.length === 0) {
          const dateRange = getDateRange(30)
          const adMetrics = await getAdPerformanceByChannel(dateRange)
          const channelMetrics: ChannelMetrics[] = adMetrics.map((m) => ({
            platform: m.platform,
            campaign: m.campaign_name,
            spend: m.spend,
            conversions: m.conversions,
            revenue: m.revenue,
            impressions: m.impressions,
            clicks: m.clicks,
          }))
          result = await recommendChannelShifts(channelMetrics, dateRange)
        } else {
          const dateRange = data.dateRange || getDateRange(30)
          result = await recommendChannelShifts(data.metrics as ChannelMetrics[], dateRange)
        }
        break

      case 'weekly_brief':
        const dateRange = data?.dateRange || getDateRange(7)
        result = await generateWeeklyInsightsBrief(dateRange)
        break

      case 'score_lead_quality':
        result = await import('@/lib/vertex-ai/service').then((m) =>
          m.scoreLeadQuality(data.features)
        )
        break

      case 'clinic_insight':
        result = await import('@/lib/vertex-ai/service').then((m) =>
          m.generateClinicInsight(data.clinicId, data.clinicData)
        )
        break

      case 'admin_brief':
        const briefDateRange = data?.dateRange || getDateRange(7)
        result = await import('@/lib/vertex-ai/service').then((m) =>
          m.generateWeeklyAdminBrief(data.summaries, briefDateRange)
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid insight type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Vertex AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error.message },
      { status: 500 }
    )
  }
}

