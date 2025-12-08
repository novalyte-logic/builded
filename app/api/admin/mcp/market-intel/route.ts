/**
 * MCP Market Intelligence API Route
 * 
 * Orchestrates the three market intelligence tools:
 * 1. bigquery_region_demand
 * 2. bigquery_clinic_search
 * 3. vertex_market_brain
 */

import { NextRequest, NextResponse } from 'next/server'
import { queryRegionDemand, ServiceLine as DemandServiceLine } from '@/lib/mcp/market-intel/bigquery-region-demand'
import { searchClinics } from '@/lib/mcp/market-intel/bigquery-clinic-search'
import { analyzeMarket } from '@/lib/mcp/market-intel/vertex-market-brain'
import { fetchGoogleTrends, TrendServiceLine } from '@/lib/mcp/market-intel/google-trends-service-interest'
import { fetchClinicAdsActivity } from '@/lib/mcp/market-intel/ads-intel-clinic-activity'
import { generateOutreachStrategy } from '@/lib/mcp/market-intel/vertex-clinic-outreach-brain'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, tool, params } = body

    // Route to specific tool
    switch (tool) {
      case 'bigquery_region_demand':
        return await handleRegionDemand(params)
      
      case 'bigquery_clinic_search':
        return await handleClinicSearch(params)
      
      case 'google_trends_service_line_interest':
        return await handleGoogleTrends(params)
      
      case 'ads_intel_clinic_activity':
        return await handleAdsIntel(params)
      
      case 'vertex_market_brain':
        return await handleMarketBrain(params)
      
      case 'vertex_clinic_outreach_brain':
        return await handleOutreachBrain(params)
      
      case 'orchestrate':
        // Full orchestration: run all tools including trends
        return await handleOrchestration(question, params)
      
      default:
        return NextResponse.json(
          { error: 'Invalid tool specified', availableTools: ['bigquery_region_demand', 'bigquery_clinic_search', 'google_trends_service_line_interest', 'ads_intel_clinic_activity', 'vertex_market_brain', 'vertex_clinic_outreach_brain', 'orchestrate'] },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('MCP Market Intel error:', error)
    return NextResponse.json(
      { error: 'Market intelligence request failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Handle bigquery_region_demand tool call
 */
async function handleRegionDemand(params: any) {
  const { serviceLine, startDate, endDate } = params

  if (!serviceLine) {
    return NextResponse.json(
      { error: 'serviceLine is required' },
      { status: 400 }
    )
  }

  const results = await queryRegionDemand({
    serviceLine: serviceLine as DemandServiceLine,
    startDate,
    endDate,
  })

  return NextResponse.json({
    tool: 'bigquery_region_demand',
    results,
  })
}

/**
 * Handle bigquery_clinic_search tool call
 */
async function handleClinicSearch(params: any) {
  const { query, serviceLine, region } = params

  const results = await searchClinics({
    query,
    serviceLine,
    region,
  })

  return NextResponse.json({
    tool: 'bigquery_clinic_search',
    results,
  })
}

/**
 * Handle google_trends_service_line_interest tool call
 */
async function handleGoogleTrends(params: any) {
  const { serviceLine, region, timeRange } = params

  if (!serviceLine) {
    return NextResponse.json(
      { error: 'serviceLine is required' },
      { status: 400 }
    )
  }

  const results = await fetchGoogleTrends({
    serviceLine: serviceLine as TrendServiceLine,
    region,
    timeRange,
  })

  return NextResponse.json({
    tool: 'google_trends_service_line_interest',
    results,
  })
}

/**
 * Handle ads_intel_clinic_activity tool call
 */
async function handleAdsIntel(params: any) {
  const { clinicName, domain, region, serviceLine } = params

  if (!clinicName) {
    return NextResponse.json(
      { error: 'clinicName is required' },
      { status: 400 }
    )
  }

  const results = await fetchClinicAdsActivity({
    clinicName,
    domain,
    region,
    serviceLine,
  })

  return NextResponse.json({
    tool: 'ads_intel_clinic_activity',
    results,
  })
}

/**
 * Handle vertex_market_brain tool call
 */
async function handleMarketBrain(params: any) {
  const { question, serviceLine, regionDemand, clinicMatches, trendsData } = params

  if (!question || !regionDemand || !clinicMatches) {
    return NextResponse.json(
      { error: 'question, regionDemand, and clinicMatches are required' },
      { status: 400 }
    )
  }

  const results = await analyzeMarket({
    question,
    serviceLine,
    regionDemand,
    clinicMatches,
    trendsData,
  })

  return NextResponse.json({
    tool: 'vertex_market_brain',
    results,
  })
}

/**
 * Handle vertex_clinic_outreach_brain tool call
 */
async function handleOutreachBrain(params: any) {
  const { clinicProfile, adsActivity, marketDemand, novalytePositioning } = params

  if (!clinicProfile || !adsActivity) {
    return NextResponse.json(
      { error: 'clinicProfile and adsActivity are required' },
      { status: 400 }
    )
  }

  const results = await generateOutreachStrategy({
    clinicProfile,
    adsActivity,
    marketDemand,
    novalytePositioning,
  })

  return NextResponse.json({
    tool: 'vertex_clinic_outreach_brain',
    results,
  })
}

/**
 * Orchestrate all tools in sequence
 * This is the main workflow for the Market Intelligence Console
 */
async function handleOrchestration(question: string, params: any) {
  const { serviceLine, region, timeRange } = params

  if (!question) {
    return NextResponse.json(
      { error: 'question is required for orchestration' },
      { status: 400 }
    )
  }

  // Infer service line from question if not provided
  let inferredServiceLine = serviceLine
  if (!inferredServiceLine) {
    const questionLower = question.toLowerCase()
    if (questionLower.includes('trt') || questionLower.includes('testosterone')) {
      inferredServiceLine = 'TRT'
    } else if (questionLower.includes('weight loss') || questionLower.includes('glp') || questionLower.includes('semaglutide')) {
      inferredServiceLine = 'WEIGHT_LOSS'
    } else if (questionLower.includes('iv therapy') || questionLower.includes('iv ')) {
      inferredServiceLine = 'IV_THERAPY'
    } else {
      // Default to TRT if can't infer
      inferredServiceLine = 'TRT'
    }
  }

  // Infer region for trends if not provided
  let trendsRegion = region
  if (!trendsRegion) {
    const questionLower = question.toLowerCase()
    if (questionLower.includes('texas') || questionLower.includes(' tx')) {
      trendsRegion = 'US-TX'
    } else if (questionLower.includes('florida') || questionLower.includes(' fl')) {
      trendsRegion = 'US-FL'
    } else if (questionLower.includes('california') || questionLower.includes(' ca')) {
      trendsRegion = 'US-CA'
    } else {
      trendsRegion = 'US' // Default to nationwide
    }
  }

  // Step 1: Query region demand
  console.log(`[MCP] Step 1: Querying region demand for ${inferredServiceLine}`)
  const regionDemand = await queryRegionDemand({
    serviceLine: inferredServiceLine as DemandServiceLine,
  })

  // Step 2: Search for clinics
  console.log(`[MCP] Step 2: Searching clinics for ${inferredServiceLine}${region ? ` in ${region}` : ''}`)
  const clinicMatches = await searchClinics({
    serviceLine: inferredServiceLine,
    region,
  })

  // Step 3: Fetch Google Trends data (gracefully handle failures)
  console.log(`[MCP] Step 3: Fetching Google Trends for ${inferredServiceLine} in ${trendsRegion}`)
  let trendsData = null
  let trendsError = null
  
  try {
    trendsData = await fetchGoogleTrends({
      serviceLine: inferredServiceLine as TrendServiceLine,
      region: trendsRegion,
      timeRange: timeRange || 'now 30-d',
    })
  } catch (error) {
    console.warn(`[MCP] Google Trends fetch failed (continuing without trends):`, error)
    trendsError = error instanceof Error ? error.message : 'Unknown error'
    // Continue without trends data - BigQuery demand and clinics still work
  }

  // Step 4: Analyze with Vertex AI (including trends if available)
  console.log(`[MCP] Step 4: Analyzing market data with Vertex AI ${trendsData ? '(including trends)' : '(trends unavailable)'}`)
  const analysis = await analyzeMarket({
    question,
    serviceLine: inferredServiceLine,
    regionDemand,
    clinicMatches,
    trendsData: trendsData || undefined,
  })

  // Return complete orchestrated response
  return NextResponse.json({
    tool: 'orchestrate',
    serviceLine: inferredServiceLine,
    regionDemand,
    clinicMatches,
    trendsData,
    trendsError,
    analysis,
  })
}

