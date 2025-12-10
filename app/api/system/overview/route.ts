/**
 * System Overview API Route
 *
 * Returns mocked dashboard data shaped for the System Overview page.
 * Filters are accepted via query params and used to slightly adjust
 * the returned numbers so the UI feels live.
 */

import { NextRequest, NextResponse } from 'next/server'

export type ServiceStatus = 'LIVE' | 'DEGRADED' | 'DOWN'

export type SystemOverviewResponse = {
  kpis: {
    totalPatients: { value: number; deltaPct: number; label: string }
    activeClinics: { value: number; deltaPct: number; label: string }
    monthlyRevenue: { value: number; deltaPct: number; label: string }
    aiQueries: { value: number; deltaPct: number; label: string }
    systemHealth: { value: number; deltaPct: number; label: string }
    activeAssessments: { value: number; deltaPct: number; label: string }
  }
  charts: {
    patientRegistrations24h: { timestamp: string; value: number }[]
    revenueStream24h: { timestamp: string; value: number }[]
  }
  services: {
    coreServices: {
      patientEngine: ServiceStatus
      clinicNetwork: ServiceStatus
      marketplaceApi: ServiceStatus
      aiReasoning: ServiceStatus
    }
    infra: {
      primaryDb: ServiceStatus
      cacheLayer: ServiceStatus
      searchIndex: ServiceStatus
      analyticsDb: ServiceStatus
    }
  }
  alerts: {
    id: string
    message: string
    createdAt: string
    severity: 'info' | 'warning' | 'critical'
  }[]
  meta: {
    lastUpdated: string
  }
  error?: string
}

// Utility to generate time-series points
function generateSeries(
  points: number,
  base: number,
  variancePct: number = 0.15
): { timestamp: string; value: number }[] {
  const now = Date.now()
  const intervalMs = Math.floor((24 * 60 * 60 * 1000) / points)
  return Array.from({ length: points }, (_, i) => {
    const ts = new Date(now - (points - i) * intervalMs).toISOString()
    const variance = base * variancePct
    const value = Math.max(
      0,
      base + (Math.random() - 0.5) * 2 * variance
    )
    return { timestamp: ts, value: Math.round(value) }
  })
}

// Adjust numbers based on filters to feel responsive
function applyFilters(
  base: number,
  serviceLine: string,
  dateRange: string
): number {
  let value = base
  // Service line tweaks
  if (serviceLine === 'TRT') value *= 1.05
  if (serviceLine === 'WEIGHT_LOSS') value *= 0.98
  if (serviceLine === 'IV_THERAPY') value *= 0.95

  // Date range smoothing
  if (dateRange === '7d') value *= 1.2
  if (dateRange === '30d') value *= 1.8
  if (dateRange === '90d') value *= 2.5

  return Math.round(value)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceLine = searchParams.get('serviceLine') || 'ALL'
    const dateRange = searchParams.get('dateRange') || '24h'
    const region = searchParams.get('region') || 'ALL'

    const basePatients = 48000
    const baseClinics = 128
    const baseRevenue = 1250000
    const baseQueries = 3400000
    const baseHealth = 99.6
    const baseAssessments = 900

    const kpis = {
      totalPatients: {
        value: applyFilters(basePatients, serviceLine, dateRange),
        deltaPct: serviceLine === 'TRT' ? 2.8 : 2.1,
        label: 'Lifetime registrations',
      },
      activeClinics: {
        value: applyFilters(baseClinics, serviceLine, dateRange),
        deltaPct: 0.4,
        label: 'Nationwide network',
      },
      monthlyRevenue: {
        value: applyFilters(baseRevenue, serviceLine, dateRange),
        deltaPct: dateRange === '24h' ? 12.5 : 8.3,
        label: 'Current month',
      },
      aiQueries: {
        value: applyFilters(baseQueries, serviceLine, dateRange),
        deltaPct: serviceLine === 'TRT' ? 9.5 : 7.2,
        label: 'Processing requests',
      },
      systemHealth: {
        value: Number((baseHealth - (region !== 'ALL' ? 0.1 : 0)).toFixed(2)),
        deltaPct: 0.1,
        label: 'Uptime & performance',
      },
      activeAssessments: {
        value: applyFilters(baseAssessments, serviceLine, dateRange),
        deltaPct: -0.8,
        label: 'In-progress evaluations',
      },
    }

    // Time series (24h window represented)
    const patientRegistrations24h = generateSeries(18, 140)
    const revenueStream24h = generateSeries(18, 46000, 0.2)

    const services: SystemOverviewResponse['services'] = {
      coreServices: {
        patientEngine: 'LIVE',
        clinicNetwork: 'LIVE',
        marketplaceApi: 'LIVE',
        aiReasoning: 'LIVE',
      },
      infra: {
        primaryDb: 'LIVE',
        cacheLayer: 'LIVE',
        searchIndex: 'LIVE',
        analyticsDb: 'DEGRADED', // intentional
      },
    }

    const alerts: SystemOverviewResponse['alerts'] = [
      {
        id: 'alert-1',
        message: 'Analytics DB latency spike detected',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        severity: 'warning',
      },
      {
        id: 'alert-2',
        message: 'All systems operational',
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        severity: 'info',
      },
    ]

    const response: SystemOverviewResponse = {
      kpis,
      charts: {
        patientRegistrations24h,
        revenueStream24h,
      },
      services,
      alerts,
      meta: {
        lastUpdated: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('System overview API error:', error)
    const fallback: SystemOverviewResponse = {
      kpis: {
        totalPatients: { value: 0, deltaPct: 0, label: 'Lifetime registrations' },
        activeClinics: { value: 0, deltaPct: 0, label: 'Nationwide network' },
        monthlyRevenue: { value: 0, deltaPct: 0, label: 'Current month' },
        aiQueries: { value: 0, deltaPct: 0, label: 'Processing requests' },
        systemHealth: { value: 0, deltaPct: 0, label: 'Uptime & performance' },
        activeAssessments: { value: 0, deltaPct: 0, label: 'In-progress evaluations' },
      },
      charts: {
        patientRegistrations24h: [],
        revenueStream24h: [],
      },
      services: {
        coreServices: {
          patientEngine: 'DOWN',
          clinicNetwork: 'DOWN',
          marketplaceApi: 'DOWN',
          aiReasoning: 'DOWN',
        },
        infra: {
          primaryDb: 'DOWN',
          cacheLayer: 'DOWN',
          searchIndex: 'DOWN',
          analyticsDb: 'DOWN',
        },
      },
      alerts: [],
      meta: {
        lastUpdated: new Date().toISOString(),
      },
      error: 'Internal error',
    }
    return NextResponse.json(fallback, { status: 500 })
  }
}

