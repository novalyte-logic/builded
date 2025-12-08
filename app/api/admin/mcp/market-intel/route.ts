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
      
      case 'vertex_market_brain':
        return await handleMarketBrain(params)
      
      case 'orchestrate':
        // Full orchestration: run all three tools
        return await handleOrchestration(question, params)
      
      default:
        return NextResponse.json(
          { error: 'Invalid tool specified', availableTools: ['bigquery_region_demand', 'bigquery_clinic_search', 'vertex_market_brain', 'orchestrate'] },
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
 * Handle vertex_market_brain tool call
 */
async function handleMarketBrain(params: any) {
  const { question, serviceLine, regionDemand, clinicMatches } = params

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
  })

  return NextResponse.json({
    tool: 'vertex_market_brain',
    results,
  })
}

/**
 * Orchestrate all three tools in sequence
 * This is the main workflow for the Market Intelligence Console
 */
async function handleOrchestration(question: string, params: any) {
  const { serviceLine, region } = params

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

  // Step 3: Analyze with Vertex AI
  console.log(`[MCP] Step 3: Analyzing market data with Vertex AI`)
  const analysis = await analyzeMarket({
    question,
    serviceLine: inferredServiceLine,
    regionDemand,
    clinicMatches,
  })

  // Return complete orchestrated response
  return NextResponse.json({
    tool: 'orchestrate',
    serviceLine: inferredServiceLine,
    regionDemand,
    clinicMatches,
    analysis,
  })
}

