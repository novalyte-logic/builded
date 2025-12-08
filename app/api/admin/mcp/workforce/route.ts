/**
 * Novalyte Workforce MCP Server API Route
 * 
 * Mission: Turn staffing intelligence into a live revenue engine
 */

import { NextRequest, NextResponse } from 'next/server'
import { scanClinicStaffingNeeds } from '@/lib/mcp/workforce/scan-clinic-staffing-needs'
import { scrapeTempShiftListings } from '@/lib/mcp/workforce/scrape-temp-shift-listings'
import { queryBigQueryHealthWorkforce } from '@/lib/mcp/workforce/query-bigquery-healthworkforce'
import { extractSocialStaffingSignals } from '@/lib/mcp/workforce/extract-social-staffing-signals'
import { vertexWorkforceBrain } from '@/lib/mcp/workforce/vertex-workforce-brain'
// New Workforce Exchange tools
import { findClinicJobsByRegion } from '@/lib/mcp/workforce/find-clinic-jobs-by-region'
import { enrichClinicFromJob } from '@/lib/mcp/workforce/enrich-clinic-from-job'
import { findNursesSeekingTempWork } from '@/lib/mcp/workforce/find-nurses-seeking-temp-work'
import { enrichCandidateFit } from '@/lib/mcp/workforce/enrich-candidate-fit'
import { generateWorkforceMatches } from '@/lib/mcp/workforce/generate-workforce-matches'
import { vertexWorkforceOutreachBrain } from '@/lib/mcp/workforce/vertex-workforce-outreach-brain'
import { exportWorkforceBatch } from '@/lib/mcp/workforce/export-workforce-batch'

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
      case 'scan_clinic_staffing_needs':
        return await handleScanStaffingNeeds(params)
      
      case 'scrape_temp_shift_listings':
        return await handleScrapeTempShifts(params)
      
      case 'query_bigquery_healthworkforce':
        return await handleQueryHealthWorkforce(params)
      
      case 'extract_social_staffing_signals':
        return await handleExtractSocialSignals(params)
      
      case 'vertex_workforce_brain':
        return await handleVertexWorkforceBrain(params)
      
      case 'find_clinic_jobs_by_region':
        return await handleFindClinicJobs(params)
      
      case 'enrich_clinic_from_job':
        return await handleEnrichClinicFromJob(params)
      
      case 'find_nurses_seeking_temp_work':
        return await handleFindNurses(params)
      
      case 'enrich_candidate_fit':
        return await handleEnrichCandidateFit(params)
      
      case 'generate_workforce_matches':
        return await handleGenerateWorkforceMatches(params)
      
      case 'vertex_workforce_outreach_brain':
        return await handleVertexWorkforceOutreach(params)
      
      case 'export_workforce_batch':
        return await handleExportWorkforceBatch(params)
      
      default:
        return NextResponse.json(
          { 
            error: 'Invalid tool specified', 
            availableTools: [
              'scan_clinic_staffing_needs',
              'scrape_temp_shift_listings',
              'query_bigquery_healthworkforce',
              'extract_social_staffing_signals',
              'vertex_workforce_brain',
              'find_clinic_jobs_by_region',
              'enrich_clinic_from_job',
              'find_nurses_seeking_temp_work',
              'enrich_candidate_fit',
              'generate_workforce_matches',
              'vertex_workforce_outreach_brain',
              'export_workforce_batch',
            ] 
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Workforce MCP error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle scan_clinic_staffing_needs tool call
 */
async function handleScanStaffingNeeds(params: any) {
  try {
    const results = await scanClinicStaffingNeeds(params)
    return NextResponse.json({
      tool: 'scan_clinic_staffing_needs',
      results,
    })
  } catch (error) {
    console.error('Error scanning staffing needs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle scrape_temp_shift_listings tool call
 */
async function handleScrapeTempShifts(params: any) {
  try {
    const results = await scrapeTempShiftListings(params)
    return NextResponse.json({
      tool: 'scrape_temp_shift_listings',
      results,
    })
  } catch (error) {
    console.error('Error scraping temp shifts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle query_bigquery_healthworkforce tool call
 */
async function handleQueryHealthWorkforce(params: any) {
  try {
    const results = await queryBigQueryHealthWorkforce(params)
    return NextResponse.json({
      tool: 'query_bigquery_healthworkforce',
      results,
    })
  } catch (error) {
    console.error('Error querying health workforce:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle extract_social_staffing_signals tool call
 */
async function handleExtractSocialSignals(params: any) {
  try {
    const results = await extractSocialStaffingSignals(params)
    return NextResponse.json({
      tool: 'extract_social_staffing_signals',
      results,
    })
  } catch (error) {
    console.error('Error extracting social signals:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle vertex_workforce_brain tool call
 */
async function handleVertexWorkforceBrain(params: any) {
  const { staffingNeeds, tempShifts, workforceData, socialSignals, region, serviceLine } = params

  try {
    const results = await vertexWorkforceBrain({
      staffingNeeds,
      tempShifts,
      workforceData,
      socialSignals,
      region,
      serviceLine,
    })
    return NextResponse.json({
      tool: 'vertex_workforce_brain',
      results,
    })
  } catch (error) {
    console.error('Error generating workforce brain analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle find_clinic_jobs_by_region tool call
 */
async function handleFindClinicJobs(params: any) {
  try {
    const results = await findClinicJobsByRegion(params)
    return NextResponse.json({
      tool: 'find_clinic_jobs_by_region',
      results,
    })
  } catch (error) {
    console.error('Error finding clinic jobs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle enrich_clinic_from_job tool call
 */
async function handleEnrichClinicFromJob(params: any) {
  try {
    const results = await enrichClinicFromJob(params)
    return NextResponse.json({
      tool: 'enrich_clinic_from_job',
      results,
    })
  } catch (error) {
    console.error('Error enriching clinic from job:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle find_nurses_seeking_temp_work tool call
 */
async function handleFindNurses(params: any) {
  try {
    const results = await findNursesSeekingTempWork(params)
    return NextResponse.json({
      tool: 'find_nurses_seeking_temp_work',
      results,
    })
  } catch (error) {
    console.error('Error finding nurses:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle enrich_candidate_fit tool call
 */
async function handleEnrichCandidateFit(params: any) {
  try {
    const results = await enrichCandidateFit(params)
    return NextResponse.json({
      tool: 'enrich_candidate_fit',
      results,
    })
  } catch (error) {
    console.error('Error enriching candidate fit:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle generate_workforce_matches tool call
 */
async function handleGenerateWorkforceMatches(params: any) {
  try {
    const results = await generateWorkforceMatches(params)
    return NextResponse.json({
      tool: 'generate_workforce_matches',
      results,
    })
  } catch (error) {
    console.error('Error generating workforce matches:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle vertex_workforce_outreach_brain tool call
 */
async function handleVertexWorkforceOutreach(params: any) {
  try {
    const results = await vertexWorkforceOutreachBrain(params)
    return NextResponse.json({
      tool: 'vertex_workforce_outreach_brain',
      results,
    })
  } catch (error) {
    console.error('Error generating workforce outreach:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle export_workforce_batch tool call
 */
async function handleExportWorkforceBatch(params: any) {
  try {
    const results = await exportWorkforceBatch(params)
    return NextResponse.json({
      tool: 'export_workforce_batch',
      results,
    })
  } catch (error) {
    console.error('Error exporting workforce batch:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

