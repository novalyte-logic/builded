/**
 * Novalyte Dealflow MCP - Clinic Demand Prediction Engine
 *
 * Purpose: Predict which clinics will NEED more patients soon — BEFORE they start spending heavily on ads.
 * This allows Novalyte to intercept clinics at the perfect moment when they're most vulnerable and ready to spend.
 */

import { ClinicBasic } from './find-mens-clinics-by-region'
import { EnrichedClinicProfile } from './enrich-clinic-profile'
import { AdsPresenceSnapshot } from './ads-presence-snapshot'
import { GoogleTrendsRegionScanOutput } from './trend-insights-engine'
import { BigQueryDomainScanOutput } from './trend-insights-engine'

/**
 * 1. predict_clinic_capacity_gap
 * Estimate when a clinic will run out of patient volume
 */
export interface PredictCapacityGapInput {
  clinicProfile: ClinicBasic
  adSpendSignals: AdsPresenceSnapshot
  websiteActivity?: {
    pageViews?: number
    bounceRate?: number
    avgTimeOnSite?: number
    conversionRate?: number
  }
  serviceLines: string[]
}

export interface PredictCapacityGapOutput {
  clinicName: string
  capacityStatus: 'Stable' | 'Mild Shortage' | 'Severe Shortage'
  weeksUntilCapacityGap: number | null // null if stable
  hiringLikelihood: number // 0-100
  demandUrgencyScore: number // 0-100
  signals: {
    adSpendIncreasing: boolean
    websiteTrafficDeclining: boolean
    conversionRateLow: boolean
    noActiveAds: boolean
  }
  reasoning: string
}

export async function predictClinicCapacityGap(
  input: PredictCapacityGapInput
): Promise<PredictCapacityGapOutput> {
  const { clinicProfile, adSpendSignals, websiteActivity, serviceLines } = input

  // Analyze signals
  const adSpendIncreasing = adSpendSignals.isRunningAds && 
    adSpendSignals.estimatedSpendBand === 'high'
  const websiteTrafficDeclining = websiteActivity?.pageViews !== undefined && 
    websiteActivity.pageViews < 1000 // Low traffic indicator
  const conversionRateLow = websiteActivity?.conversionRate !== undefined && 
    websiteActivity.conversionRate < 0.02 // Less than 2% conversion
  const noActiveAds = !adSpendSignals.isRunningAds

  // Calculate capacity status
  let capacityStatus: 'Stable' | 'Mild Shortage' | 'Severe Shortage' = 'Stable'
  let weeksUntilCapacityGap: number | null = null
  let demandUrgencyScore = 30 // Base score

  // High ad spend but low conversion = capacity gap coming
  if (adSpendIncreasing && conversionRateLow) {
    capacityStatus = 'Severe Shortage'
    weeksUntilCapacityGap = 4 // Urgent - they're spending but not converting
    demandUrgencyScore = 90
  } else if (adSpendIncreasing && !conversionRateLow) {
    capacityStatus = 'Mild Shortage'
    weeksUntilCapacityGap = 8 // They're scaling but may need more soon
    demandUrgencyScore = 65
  } else if (noActiveAds && websiteTrafficDeclining) {
    // No ads + declining traffic = they need patients but aren't getting them
    capacityStatus = 'Severe Shortage'
    weeksUntilCapacityGap = 6
    demandUrgencyScore = 85
  } else if (noActiveAds && !websiteTrafficDeclining) {
    // No ads but stable traffic = potential opportunity
    capacityStatus = 'Mild Shortage'
    weeksUntilCapacityGap = 12
    demandUrgencyScore = 55
  }

  // Calculate hiring likelihood (indicates growth/expansion plans)
  let hiringLikelihood = 20 // Base
  if (adSpendIncreasing) {
    hiringLikelihood += 30 // Spending = likely growing
  }
  if (capacityStatus === 'Severe Shortage') {
    hiringLikelihood += 25 // Urgent need = likely hiring
  }
  if (serviceLines.length > 1) {
    hiringLikelihood += 15 // Multi-service = more capacity needs
  }
  hiringLikelihood = Math.min(100, hiringLikelihood)

  // Generate reasoning
  let reasoning = `${clinicProfile.name} shows `
  if (capacityStatus === 'Severe Shortage') {
    reasoning += `severe capacity gap signals. `
    if (adSpendIncreasing && conversionRateLow) {
      reasoning += `High ad spend with low conversion suggests they're struggling to fill capacity despite spending. `
    } else if (noActiveAds && websiteTrafficDeclining) {
      reasoning += `No active ads and declining traffic indicate patient acquisition challenges. `
    }
    reasoning += `Expected capacity gap within ${weeksUntilCapacityGap} weeks.`
  } else if (capacityStatus === 'Mild Shortage') {
    reasoning += `mild capacity gap indicators. `
    if (adSpendIncreasing) {
      reasoning += `Active ad spend suggests growth plans, but may need additional patient volume soon. `
    } else {
      reasoning += `Stable operations but no active patient acquisition suggests potential need. `
    }
    reasoning += `Expected gap within ${weeksUntilCapacityGap} weeks.`
  } else {
    reasoning += `stable capacity with no immediate gaps detected.`
  }

  return {
    clinicName: clinicProfile.name,
    capacityStatus,
    weeksUntilCapacityGap,
    hiringLikelihood,
    demandUrgencyScore,
    signals: {
      adSpendIncreasing,
      websiteTrafficDeclining,
      conversionRateLow,
      noActiveAds,
    },
    reasoning,
  }
}

/**
 * 2. predict_clinic_growth_curve
 * Predict whether clinic is growing, plateauing, or shrinking
 */
export interface PredictGrowthCurveInput {
  historicalSearchInterest?: Array<{
    timestamp: string
    value: number
  }>
  domainAuthorityGrowth?: {
    current: number
    previous: number
    trend: 'RISING' | 'STABLE' | 'FALLING'
  }
  clinicFunnelData?: {
    funnelStyle: string
    conversionRate?: number
    avgTimeToConversion?: number
  }
}

export interface PredictGrowthCurveOutput {
  growthCurve: 'rising' | 'plateau' | 'declining'
  forecast30d: {
    predictedInterest: number
    confidence: number
    direction: 'up' | 'stable' | 'down'
  }
  forecast90d: {
    predictedInterest: number
    confidence: number
    direction: 'up' | 'stable' | 'down'
  }
  leadingIndicators: Array<{
    indicator: string
    signal: 'positive' | 'neutral' | 'negative'
    impact: 'high' | 'medium' | 'low'
  }>
  reasoning: string
}

export async function predictClinicGrowthCurve(
  input: PredictGrowthCurveInput
): Promise<PredictGrowthCurveOutput> {
  const { historicalSearchInterest, domainAuthorityGrowth, clinicFunnelData } = input

  // Analyze historical search interest
  let growthCurve: 'rising' | 'plateau' | 'declining' = 'plateau'
  let forecast30d: PredictGrowthCurveOutput['forecast30d']
  let forecast90d: PredictGrowthCurveOutput['forecast90d']
  const leadingIndicators: PredictGrowthCurveOutput['leadingIndicators'] = []

  if (historicalSearchInterest && historicalSearchInterest.length >= 7) {
    // Calculate trend from last 7 days vs previous 7 days
    const recent = historicalSearchInterest.slice(-7)
    const previous = historicalSearchInterest.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length
    const previousAvg = previous.reduce((sum, d) => sum + d.value, 0) / previous.length
    
    const changePercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

    if (changePercent > 10) {
      growthCurve = 'rising'
    } else if (changePercent < -10) {
      growthCurve = 'declining'
    }

    // Forecast 30 days
    const trendSlope = changePercent / 7 // Daily change
    const predicted30d = Math.max(0, Math.min(100, recentAvg + (trendSlope * 30)))
    forecast30d = {
      predictedInterest: Math.round(predicted30d),
      confidence: 0.7,
      direction: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
    }

    // Forecast 90 days (less confident)
    const predicted90d = Math.max(0, Math.min(100, recentAvg + (trendSlope * 90)))
    forecast90d = {
      predictedInterest: Math.round(predicted90d),
      confidence: 0.5,
      direction: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
    }

    leadingIndicators.push({
      indicator: 'Search Interest Trend',
      signal: changePercent > 10 ? 'positive' : changePercent < -10 ? 'negative' : 'neutral',
      impact: 'high',
    })
  } else {
    // Default forecasts if no historical data
    forecast30d = {
      predictedInterest: 50,
      confidence: 0.3,
      direction: 'stable',
    }
    forecast90d = {
      predictedInterest: 50,
      confidence: 0.2,
      direction: 'stable',
    }
  }

  // Analyze domain authority growth
  if (domainAuthorityGrowth) {
    if (domainAuthorityGrowth.trend === 'RISING') {
      leadingIndicators.push({
        indicator: 'Domain Authority Growth',
        signal: 'positive',
        impact: 'medium',
      })
      if (growthCurve === 'plateau') {
        growthCurve = 'rising'
      }
    } else if (domainAuthorityGrowth.trend === 'FALLING') {
      leadingIndicators.push({
        indicator: 'Domain Authority Decline',
        signal: 'negative',
        impact: 'medium',
      })
      if (growthCurve === 'plateau') {
        growthCurve = 'declining'
      }
    }
  }

  // Analyze funnel data
  if (clinicFunnelData) {
    if (clinicFunnelData.conversionRate && clinicFunnelData.conversionRate < 0.02) {
      leadingIndicators.push({
        indicator: 'Low Conversion Rate',
        signal: 'negative',
        impact: 'high',
      })
    } else if (clinicFunnelData.conversionRate && clinicFunnelData.conversionRate > 0.05) {
      leadingIndicators.push({
        indicator: 'Strong Conversion Rate',
        signal: 'positive',
        impact: 'high',
      })
    }

    if (['direct_booking', 'quiz_assessment'].includes(clinicFunnelData.funnelStyle)) {
      leadingIndicators.push({
        indicator: 'Modern Funnel',
        signal: 'positive',
        impact: 'medium',
      })
    }
  }

  // Generate reasoning
  let reasoning = `Growth curve analysis shows ${growthCurve} trajectory. `
  if (growthCurve === 'rising') {
    reasoning += `Positive indicators suggest growth momentum. `
  } else if (growthCurve === 'declining') {
    reasoning += `Negative signals indicate potential decline. `
  } else {
    reasoning += `Mixed signals suggest plateauing growth. `
  }
  if (leadingIndicators.length > 0) {
    const positive = leadingIndicators.filter(i => i.signal === 'positive').length
    const negative = leadingIndicators.filter(i => i.signal === 'negative').length
    reasoning += `${positive} positive and ${negative} negative leading indicators detected.`
  }

  return {
    growthCurve,
    forecast30d,
    forecast90d,
    leadingIndicators,
    reasoning,
  }
}

/**
 * 3. clinic_demand_opportunity_engine
 * Combine capacity gap + growth curve + ads signals to identify perfect moment to close
 */
export interface ClinicDemandOpportunityInput {
  clinic: ClinicBasic
  enrichedProfile?: EnrichedClinicProfile
  adsSnapshot: AdsPresenceSnapshot
  capacityGap: PredictCapacityGapOutput
  growthCurve: PredictGrowthCurveOutput
  trendsData?: GoogleTrendsRegionScanOutput
  domainData?: BigQueryDomainScanOutput
}

export type RecommendedOffer = 'leads_package' | 'full_growth_system' | 'ads_takeover' | 'patient_engine_ramp'

export interface ClinicDemandOpportunityOutput {
  clinicName: string
  opportunityRank: number // 0-100
  perfectPitchAngle: string
  riskFactors: string[]
  recommendedOffer: RecommendedOffer
  offerReasoning: string
  urgencyWindow: {
    start: string // ISO date
    end: string // ISO date
    urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
  }
  closingProbability: number // 0-100
}

export async function clinicDemandOpportunityEngine(
  input: ClinicDemandOpportunityInput
): Promise<ClinicDemandOpportunityOutput> {
  const { clinic, enrichedProfile, adsSnapshot, capacityGap, growthCurve, trendsData, domainData } = input

  // Calculate opportunity rank (0-100)
  let opportunityRank = 50 // Base

  // Capacity gap urgency (0-30 points)
  if (capacityGap.capacityStatus === 'Severe Shortage') {
    opportunityRank += 30
  } else if (capacityGap.capacityStatus === 'Mild Shortage') {
    opportunityRank += 15
  }

  // Growth curve alignment (0-25 points)
  if (growthCurve.growthCurve === 'rising' && capacityGap.capacityStatus !== 'Stable') {
    opportunityRank += 25 // Growing + need = perfect
  } else if (growthCurve.growthCurve === 'plateau' && capacityGap.capacityStatus === 'Severe Shortage') {
    opportunityRank += 20 // Plateau + urgent need = opportunity
  } else if (growthCurve.growthCurve === 'declining') {
    opportunityRank -= 10 // Declining = risk
  }

  // Ad spend signals (0-20 points)
  if (adsSnapshot.isRunningAds && adsSnapshot.estimatedSpendBand === 'high') {
    opportunityRank += 20 // High spend = budget available
  } else if (!adsSnapshot.isRunningAds && capacityGap.capacityStatus === 'Severe Shortage') {
    opportunityRank += 15 // No ads + need = perfect entry point
  } else if (adsSnapshot.isRunningAds && adsSnapshot.estimatedSpendBand === 'low') {
    opportunityRank += 5 // Low spend = limited budget
  }

  // Demand urgency (0-15 points)
  opportunityRank += Math.floor(capacityGap.demandUrgencyScore / 6.67) // Scale 0-100 to 0-15

  // Funnel quality (0-10 points)
  if (enrichedProfile) {
    if (['direct_booking', 'quiz_assessment'].includes(enrichedProfile.funnelStyle)) {
      opportunityRank += 5 // Modern funnel = easier to improve
    } else if (enrichedProfile.funnelStyle === 'contact_form') {
      opportunityRank += 2 // Old funnel = opportunity to upgrade
    }
  }

  opportunityRank = Math.max(0, Math.min(100, opportunityRank))

  // Determine perfect pitch angle
  let perfectPitchAngle = ''
  if (capacityGap.capacityStatus === 'Severe Shortage' && !adsSnapshot.isRunningAds) {
    perfectPitchAngle = `"We noticed ${clinic.name} isn't running ads but has high patient demand in your region. We can help you capture that demand with qualified leads before your competition does."`
  } else if (adsSnapshot.isRunningAds && capacityGap.signals.conversionRateLow) {
    perfectPitchAngle = `"You're spending on ads but conversion is low. We can help optimize your funnel and improve ROI while filling your capacity gap."`
  } else if (growthCurve.growthCurve === 'rising' && capacityGap.capacityStatus === 'Mild Shortage') {
    perfectPitchAngle = `"Your clinic is growing, and you'll need more patients soon. Let's scale your patient acquisition before you hit capacity limits."`
  } else {
    perfectPitchAngle = `"We help ${clinic.serviceLines[0]} clinics scale patient acquisition efficiently. Based on your market signals, now is the perfect time to partner."`
  }

  // Identify risk factors
  const riskFactors: string[] = []
  if (growthCurve.growthCurve === 'declining') {
    riskFactors.push('Declining growth trajectory may indicate business challenges')
  }
  if (capacityGap.capacityStatus === 'Stable') {
    riskFactors.push('No immediate capacity gap - may not be urgent enough')
  }
  if (adsSnapshot.isRunningAds && adsSnapshot.estimatedSpendBand === 'low') {
    riskFactors.push('Limited ad budget may constrain partnership potential')
  }
  if (domainData && domainData.redFlags.length > 0) {
    riskFactors.push(...domainData.redFlags)
  }

  // Determine recommended offer
  let recommendedOffer: RecommendedOffer = 'leads_package'
  let offerReasoning = ''

  if (capacityGap.capacityStatus === 'Severe Shortage' && !adsSnapshot.isRunningAds) {
    recommendedOffer = 'patient_engine_ramp'
    offerReasoning = 'Urgent need + no ads = full patient acquisition system needed'
  } else if (adsSnapshot.isRunningAds && capacityGap.signals.conversionRateLow) {
    recommendedOffer = 'ads_takeover'
    offerReasoning = 'High spend + low conversion = optimization opportunity'
  } else if (growthCurve.growthCurve === 'rising' && capacityGap.capacityStatus === 'Mild Shortage') {
    recommendedOffer = 'full_growth_system'
    offerReasoning = 'Growing clinic needs comprehensive growth infrastructure'
  } else {
    recommendedOffer = 'leads_package'
    offerReasoning = 'Standard leads package for steady patient flow'
  }

  // Calculate urgency window
  const now = new Date()
  const weeksUntilGap = capacityGap.weeksUntilCapacityGap || 12
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 7) // Start 1 week ago
  const endDate = new Date(now)
  endDate.setDate(endDate.getDate() + (weeksUntilGap * 7))

  let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  if (capacityGap.capacityStatus === 'Severe Shortage' && weeksUntilGap <= 4) {
    urgencyLevel = 'critical'
  } else if (capacityGap.capacityStatus === 'Severe Shortage' || weeksUntilGap <= 8) {
    urgencyLevel = 'high'
  } else if (capacityGap.capacityStatus === 'Mild Shortage') {
    urgencyLevel = 'medium'
  } else {
    urgencyLevel = 'low'
  }

  // Calculate closing probability
  let closingProbability = 40 // Base
  if (opportunityRank >= 80) {
    closingProbability = 75
  } else if (opportunityRank >= 60) {
    closingProbability = 55
  } else if (opportunityRank >= 40) {
    closingProbability = 35
  }

  // Adjust based on signals
  if (capacityGap.capacityStatus === 'Severe Shortage') {
    closingProbability += 10
  }
  if (!adsSnapshot.isRunningAds && capacityGap.capacityStatus !== 'Stable') {
    closingProbability += 15 // No competition from their own ads
  }
  if (growthCurve.growthCurve === 'rising') {
    closingProbability += 5
  }

  closingProbability = Math.max(0, Math.min(100, closingProbability))

  return {
    clinicName: clinic.name,
    opportunityRank,
    perfectPitchAngle,
    riskFactors,
    recommendedOffer,
    offerReasoning,
    urgencyWindow: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      urgencyLevel,
    },
    closingProbability,
  }
}

/**
 * 4. predictive_dealflow
 * Run demand prediction across 30-50 clinics and return "Golden Window" clinics
 */
export interface PredictiveDealflowInput {
  region: string
  serviceLine: 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY' | 'GENERAL'
  maxClinics?: number // Default: 40
  minOpportunityRank?: number // Default: 60
}

export interface GoldenWindowClinic {
  clinic: ClinicBasic
  enrichedProfile?: EnrichedClinicProfile
  adsSnapshot: AdsPresenceSnapshot
  capacityGap: PredictCapacityGapOutput
  growthCurve: PredictGrowthCurveOutput
  opportunity: ClinicDemandOpportunityOutput
  trendsData?: GoogleTrendsRegionScanOutput
  domainData?: BigQueryDomainScanOutput
}

export interface PredictiveDealflowOutput {
  timestamp: string
  region: string
  serviceLine: string
  totalScanned: number
  goldenWindowClinics: GoldenWindowClinic[]
  summary: {
    criticalUrgency: number
    highUrgency: number
    mediumUrgency: number
    avgOpportunityRank: number
    avgClosingProbability: number
  }
}

export async function predictiveDealflow(
  input: PredictiveDealflowInput
): Promise<PredictiveDealflowOutput> {
  const { region, serviceLine, maxClinics = 40, minOpportunityRank = 60 } = input

  try {
    // Import functions
    const { findMensClinicsByRegion } = await import('./find-mens-clinics-by-region')
    const { enrichClinicProfile } = await import('./enrich-clinic-profile')
    const { getAdsPresenceSnapshot } = await import('./ads-presence-snapshot')
    const { googleTrendsRegionScan } = await import('./trend-insights-engine')
    const { bigqueryDomainScan } = await import('./trend-insights-engine')

    // Find clinics
    const findResult = await findMensClinicsByRegion({
      region,
      serviceLine,
    })

    const clinicsToProcess = findResult.clinics.slice(0, maxClinics)
    const allResults: GoldenWindowClinic[] = []

    // Get trends data for the region
    const serviceLineMap: Record<string, 'TRT' | 'Weight Loss' | 'IV Therapy'> = {
      'TRT': 'TRT',
      'WEIGHT_LOSS': 'Weight Loss',
      'IV_THERAPY': 'IV Therapy',
    }
    let trendsData: GoogleTrendsRegionScanOutput | undefined
    try {
      trendsData = await googleTrendsRegionScan({
        region,
        serviceLine: serviceLineMap[serviceLine] || 'TRT',
      })
    } catch (error) {
      console.error('Error fetching trends:', error)
    }

    // Process each clinic
    for (const clinic of clinicsToProcess) {
      try {
        // Enrich profile
        let enrichedProfile: EnrichedClinicProfile | undefined
        if (clinic.website) {
          try {
            const enrichResult = await enrichClinicProfile({ websiteUrl: clinic.website })
            enrichedProfile = enrichResult.profile
          } catch (error) {
            console.error(`Error enriching ${clinic.name}:`, error)
          }
        }

        // Get ads snapshot
        const adsSnapshotResult = await getAdsPresenceSnapshot({
          clinicName: clinic.name,
          websiteUrl: clinic.website || undefined,
          region,
        })
        const adsSnapshot = adsSnapshotResult.snapshot

        // Get domain data
        let domainData: BigQueryDomainScanOutput | undefined
        if (clinic.website) {
          try {
            const domain = clinic.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
            domainData = await bigqueryDomainScan({ domain })
          } catch (error) {
            console.error(`Error scanning domain for ${clinic.name}:`, error)
          }
        }

        // Predict capacity gap
        const capacityGap = await predictClinicCapacityGap({
          clinicProfile: clinic,
          adSpendSignals: adsSnapshot,
          websiteActivity: enrichedProfile ? {
            conversionRate: enrichedProfile.funnelStyle === 'direct_booking' ? 0.05 : 0.02,
          } : undefined,
          serviceLines: clinic.serviceLines,
        })

        // Predict growth curve
        const growthCurve = await predictClinicGrowthCurve({
          historicalSearchInterest: trendsData ? trendsData.trajectory30d.direction === 'RISING' 
            ? Array.from({ length: 30 }, (_, i) => ({
                timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
                value: 50 + (i * 0.5), // Simulated rising trend
              }))
            : Array.from({ length: 30 }, (_, i) => ({
                timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
                value: 50,
              }))
            : undefined,
          domainAuthorityGrowth: domainData ? {
            current: domainData.domainAuthorityBand === 'high' ? 70 : domainData.domainAuthorityBand === 'medium' ? 50 : 30,
            previous: domainData.domainAuthorityBand === 'high' ? 65 : domainData.domainAuthorityBand === 'medium' ? 45 : 25,
            trend: domainData.backlinkGrowth.trend,
          } : undefined,
          clinicFunnelData: enrichedProfile ? {
            funnelStyle: enrichedProfile.funnelStyle,
            conversionRate: enrichedProfile.funnelStyle === 'direct_booking' ? 0.05 : 0.02,
          } : undefined,
        })

        // Calculate opportunity
        const opportunity = await clinicDemandOpportunityEngine({
          clinic,
          enrichedProfile,
          adsSnapshot,
          capacityGap,
          growthCurve,
          trendsData,
          domainData,
        })

        // Only include if meets minimum opportunity rank
        if (opportunity.opportunityRank >= minOpportunityRank) {
          allResults.push({
            clinic,
            enrichedProfile,
            adsSnapshot,
            capacityGap,
            growthCurve,
            opportunity,
            trendsData,
            domainData,
          })
        }
      } catch (error) {
        console.error(`Error processing clinic ${clinic.name}:`, error)
        // Continue with next clinic
      }
    }

    // Sort by opportunity rank (highest first) and limit to 15
    const goldenWindowClinics = allResults
      .sort((a, b) => b.opportunity.opportunityRank - a.opportunity.opportunityRank)
      .slice(0, 15)

    // Calculate summary
    const criticalUrgency = goldenWindowClinics.filter(
      c => c.opportunity.urgencyWindow.urgencyLevel === 'critical'
    ).length
    const highUrgency = goldenWindowClinics.filter(
      c => c.opportunity.urgencyWindow.urgencyLevel === 'high'
    ).length
    const mediumUrgency = goldenWindowClinics.filter(
      c => c.opportunity.urgencyWindow.urgencyLevel === 'medium'
    ).length

    const avgOpportunityRank = goldenWindowClinics.length > 0
      ? Math.round(goldenWindowClinics.reduce((sum, c) => sum + c.opportunity.opportunityRank, 0) / goldenWindowClinics.length)
      : 0

    const avgClosingProbability = goldenWindowClinics.length > 0
      ? Math.round(goldenWindowClinics.reduce((sum, c) => sum + c.opportunity.closingProbability, 0) / goldenWindowClinics.length)
      : 0

    return {
      timestamp: new Date().toISOString(),
      region,
      serviceLine,
      totalScanned: clinicsToProcess.length,
      goldenWindowClinics,
      summary: {
        criticalUrgency,
        highUrgency,
        mediumUrgency,
        avgOpportunityRank,
        avgClosingProbability,
      },
    }
  } catch (error) {
    console.error('Error generating predictive dealflow:', error)
    throw new Error(`Predictive dealflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

