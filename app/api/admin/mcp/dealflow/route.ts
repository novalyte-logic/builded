/**
 * Novalyte Dealflow MCP Server API Route
 * 
 * Mission: Revenue generation and closing real clinics
 */

import { NextRequest, NextResponse } from 'next/server'
import { findMensClinicsByRegion } from '@/lib/mcp/dealflow/find-mens-clinics-by-region'
import { enrichClinicProfile } from '@/lib/mcp/dealflow/enrich-clinic-profile'
import { getAdsPresenceSnapshot } from '@/lib/mcp/dealflow/ads-presence-snapshot'
import { generateOutreachPack } from '@/lib/mcp/dealflow/vertex-outreach-brain'
import { exportDealflowBatch } from '@/lib/mcp/dealflow/export-dealflow-batch'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, params } = body

    if (!tool) {
      return NextResponse.json(
        { error: 'tool parameter is required' },
        { status: 400 }
      )
    }

    // Route to specific tool
    switch (tool) {
      case 'find_mens_clinics_by_region':
        return await handleFindClinics(params)
      
      case 'enrich_clinic_profile':
        return await handleEnrichProfile(params)
      
      case 'ads_presence_snapshot':
        return await handleAdsSnapshot(params)
      
      case 'vertex_outreach_brain':
        return await handleOutreachBrain(params)
      
      case 'export_dealflow_batch':
        return await handleBatchExport(params)
      
      default:
        return NextResponse.json(
          { 
            error: 'Invalid tool specified', 
            availableTools: [
              'find_mens_clinics_by_region',
              'enrich_clinic_profile',
              'ads_presence_snapshot',
              'vertex_outreach_brain',
              'export_dealflow_batch',
            ] 
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Dealflow MCP error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle find_mens_clinics_by_region tool call
 */
async function handleFindClinics(params: any) {
  const { region, serviceLine } = params

  if (!region) {
    return NextResponse.json(
      { error: 'region is required' },
      { status: 400 }
    )
  }

  const results = await findMensClinicsByRegion({
    region,
    serviceLine,
  })

  return NextResponse.json({
    tool: 'find_mens_clinics_by_region',
    results,
  })
}

/**
 * Handle enrich_clinic_profile tool call
 */
async function handleEnrichProfile(params: any) {
  const { websiteUrl } = params

  if (!websiteUrl) {
    return NextResponse.json(
      { error: 'websiteUrl is required' },
      { status: 400 }
    )
  }

  const results = await enrichClinicProfile({
    websiteUrl,
  })

  return NextResponse.json({
    tool: 'enrich_clinic_profile',
    results,
  })
}

/**
 * Handle ads_presence_snapshot tool call
 */
async function handleAdsSnapshot(params: any) {
  const { clinicName, websiteUrl, region } = params

  if (!clinicName) {
    return NextResponse.json(
      { error: 'clinicName is required' },
      { status: 400 }
    )
  }

  const results = await getAdsPresenceSnapshot({
    clinicName,
    websiteUrl,
    region,
  })

  return NextResponse.json({
    tool: 'ads_presence_snapshot',
    results,
  })
}

/**
 * Handle vertex_outreach_brain tool call
 */
async function handleOutreachBrain(params: any) {
  const { clinic, enrichedProfile, adsSnapshot, demandHints } = params

  if (!clinic || !adsSnapshot) {
    return NextResponse.json(
      { error: 'clinic and adsSnapshot are required' },
      { status: 400 }
    )
  }

  const results = await generateOutreachPack({
    clinic,
    enrichedProfile,
    adsSnapshot,
    demandHints,
  })

  return NextResponse.json({
    tool: 'vertex_outreach_brain',
    results,
  })
}

/**
 * Handle export_dealflow_batch tool call
 */
async function handleBatchExport(params: any) {
  const { region, serviceLine, maxClinics, includeEnrichment, demandHints } = params

  if (!region) {
    return NextResponse.json(
      { error: 'region is required' },
      { status: 400 }
    )
  }

  const results = await exportDealflowBatch({
    region,
    serviceLine,
    maxClinics,
    includeEnrichment,
    demandHints,
  })

  return NextResponse.json({
    tool: 'export_dealflow_batch',
    results,
  })
}

