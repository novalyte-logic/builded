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
import {
  cronDailyDealflowRun,
  cronSetDeliveryChannel,
  cronPushDailyResults,
  cronSimulate,
} from '@/lib/mcp/dealflow/cron-engine'
import {
  googleTrendsRegionScan,
  bigqueryDomainScan,
  clinicMarketStrengthScore,
  trendBasedDealflow,
} from '@/lib/mcp/dealflow/trend-insights-engine'
import {
  predictClinicCapacityGap,
  predictClinicGrowthCurve,
  clinicDemandOpportunityEngine,
  predictiveDealflow,
} from '@/lib/mcp/dealflow/clinic-demand-prediction-engine'
import {
  unifiedDealflowBrain,
  runDealflowBrain,
} from '@/lib/mcp/dealflow/dealflow-brain'

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
      
      case 'cron_daily_dealflow_run':
        return await handleCronDailyRun()
      
      case 'cron_set_delivery_channel':
        return await handleCronSetChannel(params)
      
      case 'cron_push_daily_results':
        return await handleCronPushResults(params)
      
      case 'cron_simulate':
        return await handleCronSimulate()
      
      case 'google_trends_region_scan':
        return await handleGoogleTrendsRegionScan(params)
      
      case 'bigquery_domain_scan':
        return await handleBigQueryDomainScan(params)
      
      case 'clinic_market_strength_score':
        return await handleClinicMarketStrengthScore(params)
      
      case 'trend_based_dealflow':
        return await handleTrendBasedDealflow(params)
      
      case 'predict_clinic_capacity_gap':
        return await handlePredictCapacityGap(params)
      
      case 'predict_clinic_growth_curve':
        return await handlePredictGrowthCurve(params)
      
      case 'clinic_demand_opportunity_engine':
        return await handleClinicDemandOpportunity(params)
      
      case 'predictive_dealflow':
        return await handlePredictiveDealflow(params)
      
      case 'unified_dealflow_brain':
        return await handleUnifiedDealflowBrain()
      
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
              'cron_daily_dealflow_run',
              'cron_set_delivery_channel',
              'cron_push_daily_results',
              'cron_simulate',
              'google_trends_region_scan',
              'bigquery_domain_scan',
              'clinic_market_strength_score',
              'trend_based_dealflow',
              'predict_clinic_capacity_gap',
              'predict_clinic_growth_curve',
              'clinic_demand_opportunity_engine',
              'predictive_dealflow',
              'unified_dealflow_brain',
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

/**
 * Handle cron_daily_dealflow_run tool call
 */
async function handleCronDailyRun() {
  try {
    const results = await cronDailyDealflowRun()
    return NextResponse.json({
      tool: 'cron_daily_dealflow_run',
      results,
    })
  } catch (error) {
    console.error('Error running daily dealflow cron:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle cron_set_delivery_channel tool call
 */
async function handleCronSetChannel(params: any) {
  const { channel, userId } = params

  if (!channel) {
    return NextResponse.json(
      { error: 'channel is required' },
      { status: 400 }
    )
  }

  const validChannels = ['dashboard', 'email', 'slack', 'sms']
  if (!validChannels.includes(channel)) {
    return NextResponse.json(
      { error: `channel must be one of: ${validChannels.join(', ')}` },
      { status: 400 }
    )
  }

  const results = await cronSetDeliveryChannel(channel, userId)
  return NextResponse.json({
    tool: 'cron_set_delivery_channel',
    results,
  })
}

/**
 * Handle cron_push_daily_results tool call
 */
async function handleCronPushResults(params: any) {
  const { results, userId } = params

  if (!results) {
    return NextResponse.json(
      { error: 'results are required' },
      { status: 400 }
    )
  }

  try {
    const pushResult = await cronPushDailyResults(results, userId)
    return NextResponse.json({
      tool: 'cron_push_daily_results',
      results: pushResult,
    })
  } catch (error) {
    console.error('Error pushing daily results:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle cron_simulate tool call
 */
async function handleCronSimulate() {
  try {
    const results = await cronSimulate()
    return NextResponse.json({
      tool: 'cron_simulate',
      results,
    })
  } catch (error) {
    console.error('Error simulating cron:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle google_trends_region_scan tool call
 */
async function handleGoogleTrendsRegionScan(params: any) {
  const { region, serviceLine } = params

  if (!region || !serviceLine) {
    return NextResponse.json(
      { error: 'region and serviceLine are required' },
      { status: 400 }
    )
  }

  try {
    const results = await googleTrendsRegionScan({ region, serviceLine })
    return NextResponse.json({
      tool: 'google_trends_region_scan',
      results,
    })
  } catch (error) {
    console.error('Error scanning Google Trends:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle bigquery_domain_scan tool call
 */
async function handleBigQueryDomainScan(params: any) {
  const { domain } = params

  if (!domain) {
    return NextResponse.json(
      { error: 'domain is required' },
      { status: 400 }
    )
  }

  try {
    const results = await bigqueryDomainScan({ domain })
    return NextResponse.json({
      tool: 'bigquery_domain_scan',
      results,
    })
  } catch (error) {
    console.error('Error scanning domain:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle clinic_market_strength_score tool call
 */
async function handleClinicMarketStrengthScore(params: any) {
  const { clinic, enrichedProfile, adsSnapshot, trendsData, domainData } = params

  if (!clinic || !adsSnapshot) {
    return NextResponse.json(
      { error: 'clinic and adsSnapshot are required' },
      { status: 400 }
    )
  }

  try {
    const results = await clinicMarketStrengthScore({
      clinic,
      enrichedProfile,
      adsSnapshot,
      trendsData,
      domainData,
    })
    return NextResponse.json({
      tool: 'clinic_market_strength_score',
      results,
    })
  } catch (error) {
    console.error('Error calculating market strength:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle trend_based_dealflow tool call
 */
async function handleTrendBasedDealflow(params: any) {
  const { serviceLine, maxClinics } = params

  if (!serviceLine) {
    return NextResponse.json(
      { error: 'serviceLine is required' },
      { status: 400 }
    )
  }

  try {
    const results = await trendBasedDealflow({
      serviceLine,
      maxClinics,
    })
    return NextResponse.json({
      tool: 'trend_based_dealflow',
      results,
    })
  } catch (error) {
    console.error('Error generating trend-based dealflow:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle predict_clinic_capacity_gap tool call
 */
async function handlePredictCapacityGap(params: any) {
  const { clinicProfile, adSpendSignals, websiteActivity, serviceLines } = params

  if (!clinicProfile || !adSpendSignals || !serviceLines) {
    return NextResponse.json(
      { error: 'clinicProfile, adSpendSignals, and serviceLines are required' },
      { status: 400 }
    )
  }

  try {
    const results = await predictClinicCapacityGap({
      clinicProfile,
      adSpendSignals,
      websiteActivity,
      serviceLines,
    })
    return NextResponse.json({
      tool: 'predict_clinic_capacity_gap',
      results,
    })
  } catch (error) {
    console.error('Error predicting capacity gap:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle predict_clinic_growth_curve tool call
 */
async function handlePredictGrowthCurve(params: any) {
  const { historicalSearchInterest, domainAuthorityGrowth, clinicFunnelData } = params

  try {
    const results = await predictClinicGrowthCurve({
      historicalSearchInterest,
      domainAuthorityGrowth,
      clinicFunnelData,
    })
    return NextResponse.json({
      tool: 'predict_clinic_growth_curve',
      results,
    })
  } catch (error) {
    console.error('Error predicting growth curve:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle clinic_demand_opportunity_engine tool call
 */
async function handleClinicDemandOpportunity(params: any) {
  const { clinic, enrichedProfile, adsSnapshot, capacityGap, growthCurve, trendsData, domainData } = params

  if (!clinic || !adsSnapshot || !capacityGap || !growthCurve) {
    return NextResponse.json(
      { error: 'clinic, adsSnapshot, capacityGap, and growthCurve are required' },
      { status: 400 }
    )
  }

  try {
    const results = await clinicDemandOpportunityEngine({
      clinic,
      enrichedProfile,
      adsSnapshot,
      capacityGap,
      growthCurve,
      trendsData,
      domainData,
    })
    return NextResponse.json({
      tool: 'clinic_demand_opportunity_engine',
      results,
    })
  } catch (error) {
    console.error('Error calculating demand opportunity:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle predictive_dealflow tool call
 */
async function handlePredictiveDealflow(params: any) {
  const { region, serviceLine, maxClinics, minOpportunityRank } = params

  if (!region || !serviceLine) {
    return NextResponse.json(
      { error: 'region and serviceLine are required' },
      { status: 400 }
    )
  }

  try {
    const results = await predictiveDealflow({
      region,
      serviceLine,
      maxClinics,
      minOpportunityRank,
    })
    return NextResponse.json({
      tool: 'predictive_dealflow',
      results,
    })
  } catch (error) {
    console.error('Error generating predictive dealflow:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle unified_dealflow_brain tool call
 */
async function handleUnifiedDealflowBrain() {
  try {
    const results = await unifiedDealflowBrain()
    return NextResponse.json({
      tool: 'unified_dealflow_brain',
      results,
    })
  } catch (error) {
    console.error('Error running unified dealflow brain:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

