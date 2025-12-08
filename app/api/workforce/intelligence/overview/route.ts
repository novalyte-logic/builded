/**
 * Workforce Intelligence Overview API
 * 
 * GET /api/workforce/intelligence/overview
 * Returns heatmap, demand index, and supply index data
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock data - replace with actual database queries
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual database queries
    // const requests = await db.workforce_requests.findMany({ where: { status: 'OPEN' } })
    // const practitioners = await db.practitioner_profiles.findMany()
    // const matches = await db.workforce_matches.findMany()

    // Mock heatmap data (regions)
    const regions = [
      {
        city: 'Los Angeles',
        state: 'CA',
        region: 'Greater Los Angeles',
        openRequests: 47,
        dominantRole: 'NP / Hormones',
        avgRate: 145,
        opportunityLevel: 'Critical' as const,
        demandScore: 92,
        supplyScore: 38,
      },
      {
        city: 'Miami',
        state: 'FL',
        region: 'South Florida',
        openRequests: 34,
        dominantRole: 'NP / TRT',
        avgRate: 135,
        opportunityLevel: 'Critical' as const,
        demandScore: 88,
        supplyScore: 42,
      },
      {
        city: 'Dallas',
        state: 'TX',
        region: 'DFW Metroplex',
        openRequests: 28,
        dominantRole: 'RN / IV Therapy',
        avgRate: 95,
        opportunityLevel: 'High' as const,
        demandScore: 75,
        supplyScore: 55,
      },
      {
        city: 'Phoenix',
        state: 'AZ',
        region: 'Phoenix Metro',
        openRequests: 22,
        dominantRole: 'NP / Weight Loss',
        avgRate: 125,
        opportunityLevel: 'High' as const,
        demandScore: 72,
        supplyScore: 48,
      },
      {
        city: 'Atlanta',
        state: 'GA',
        region: 'Metro Atlanta',
        openRequests: 19,
        dominantRole: 'PA / Hormones',
        avgRate: 115,
        opportunityLevel: 'Medium' as const,
        demandScore: 65,
        supplyScore: 52,
      },
      {
        city: 'Chicago',
        state: 'IL',
        region: 'Chicagoland',
        openRequests: 16,
        dominantRole: 'NP / GLP-1',
        avgRate: 130,
        opportunityLevel: 'Medium' as const,
        demandScore: 58,
        supplyScore: 62,
      },
      {
        city: 'Denver',
        state: 'CO',
        region: 'Front Range',
        openRequests: 14,
        dominantRole: 'NP / TRT',
        avgRate: 120,
        opportunityLevel: 'Medium' as const,
        demandScore: 55,
        supplyScore: 58,
      },
      {
        city: 'Seattle',
        state: 'WA',
        region: 'Puget Sound',
        openRequests: 12,
        dominantRole: 'RN / IV Therapy',
        avgRate: 105,
        opportunityLevel: 'Low' as const,
        demandScore: 48,
        supplyScore: 68,
      },
    ]

    // Mock demand index data
    const demandIndex = {
      roles: [
        {
          role: 'NP',
          demandScore: 85,
          openRequests: 142,
          urgencyWeight: 1.5,
          trend: 'up' as const,
        },
        {
          role: 'RN',
          demandScore: 72,
          openRequests: 89,
          urgencyWeight: 1.3,
          trend: 'up' as const,
        },
        {
          role: 'PA',
          demandScore: 68,
          openRequests: 67,
          urgencyWeight: 1.4,
          trend: 'stable' as const,
        },
        {
          role: 'IV_Nurse',
          demandScore: 55,
          openRequests: 45,
          urgencyWeight: 1.2,
          trend: 'up' as const,
        },
        {
          role: 'MD',
          demandScore: 42,
          openRequests: 28,
          urgencyWeight: 2.0,
          trend: 'stable' as const,
        },
        {
          role: 'Tech',
          demandScore: 35,
          openRequests: 34,
          urgencyWeight: 1.1,
          trend: 'down' as const,
        },
      ],
    }

    // Mock supply index data
    const supplyIndex = {
      roles: [
        {
          role: 'NP',
          availableCount: 124,
          locationClusters: ['Los Angeles', 'Miami', 'Dallas', 'Phoenix'],
          underutilizedCount: 18,
          availabilityScore: 68,
          lastActiveDaysAgo: 5,
        },
        {
          role: 'RN',
          availableCount: 156,
          locationClusters: ['Los Angeles', 'Chicago', 'Denver', 'Seattle'],
          underutilizedCount: 32,
          availabilityScore: 72,
          lastActiveDaysAgo: 3,
        },
        {
          role: 'PA',
          availableCount: 89,
          locationClusters: ['Atlanta', 'Miami', 'Dallas'],
          underutilizedCount: 12,
          availabilityScore: 75,
          lastActiveDaysAgo: 4,
        },
        {
          role: 'IV_Nurse',
          availableCount: 67,
          locationClusters: ['Los Angeles', 'Phoenix', 'Dallas'],
          underutilizedCount: 15,
          availabilityScore: 65,
          lastActiveDaysAgo: 7,
        },
        {
          role: 'MD',
          availableCount: 23,
          locationClusters: ['Los Angeles', 'Miami', 'Dallas'],
          underutilizedCount: 3,
          availabilityScore: 82,
          lastActiveDaysAgo: 2,
        },
        {
          role: 'Tech',
          availableCount: 98,
          locationClusters: ['Los Angeles', 'Chicago', 'Atlanta'],
          underutilizedCount: 24,
          availabilityScore: 58,
          lastActiveDaysAgo: 10,
        },
      ],
      totalAvailable: 557,
      totalUnderutilized: 104,
    }

    return NextResponse.json({
      heatmap: {
        regions,
        lastUpdated: new Date().toISOString(),
      },
      demandIndex,
      supplyIndex,
    })
  } catch (error: any) {
    console.error('Workforce intelligence overview API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

