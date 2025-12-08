/**
 * Revenue & Performance Metrics API
 * 
 * GET /api/workforce/intelligence/metrics
 * Returns revenue metrics, conversion funnel, fees, time-to-fill, and top metros
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual database queries
    // const payments = await db.workforce_payments.findMany({ ... })
    // const requests = await db.workforce_requests.findMany({ ... })
    // const bookings = await db.workforce_bookings.findMany({ ... })

    // Mock data - replace with actual queries
    const monthlyRevenue = [
      { month: 'Jan', revenue: 125000, mrr: 120000 },
      { month: 'Feb', revenue: 138000, mrr: 130000 },
      { month: 'Mar', revenue: 152000, mrr: 138000 },
      { month: 'Apr', revenue: 165000, mrr: 145000 },
      { month: 'May', revenue: 178000, mrr: 152000 },
      { month: 'Jun', revenue: 192000, mrr: 165000 },
    ]

    const conversionFunnel = [
      { stage: 'Requests Created', count: 156, percentage: 100 },
      { stage: 'Candidates Suggested', count: 142, percentage: 91.0 },
      { stage: 'Offers Sent', count: 118, percentage: 75.6 },
      { stage: 'Shifts Accepted', count: 89, percentage: 57.1 },
      { stage: 'Shifts Completed', count: 84, percentage: 53.8 },
    ]

    const avgFeePerRole = [
      { role: 'MD', fee: 450, shiftCount: 12 },
      { role: 'NP', fee: 175, shiftCount: 48 },
      { role: 'PA', fee: 165, shiftCount: 32 },
      { role: 'RN', fee: 95, shiftCount: 67 },
      { role: 'IV Nurse', fee: 110, shiftCount: 45 },
      { role: 'Tech', fee: 65, shiftCount: 28 },
    ]

    const timeToFill = [
      { role: 'NP', avgHours: 18.5, metro: 'Los Angeles' },
      { role: 'RN', avgHours: 12.3, metro: 'Dallas' },
      { role: 'MD', avgHours: 32.1, metro: 'Miami' },
      { role: 'PA', avgHours: 22.7, metro: 'Atlanta' },
      { role: 'IV Nurse', avgHours: 15.8, metro: 'Phoenix' },
    ]

    const topMetros = [
      { city: 'Los Angeles', state: 'CA', revenue: 45000, placements: 28, margin: 72.5 },
      { city: 'Miami', state: 'FL', revenue: 38000, placements: 24, margin: 68.3 },
      { city: 'Dallas', state: 'TX', revenue: 32000, placements: 32, margin: 65.1 },
      { city: 'Phoenix', state: 'AZ', revenue: 28000, placements: 19, margin: 71.2 },
      { city: 'Atlanta', state: 'GA', revenue: 24000, placements: 16, margin: 63.8 },
    ]

    return NextResponse.json({
      metrics: {
        monthlyRevenue,
        conversionFunnel,
        avgFeePerRole,
        timeToFill,
        topMetros,
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Revenue metrics API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

