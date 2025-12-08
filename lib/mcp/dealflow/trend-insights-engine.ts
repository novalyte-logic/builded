/**
 * Novalyte Dealflow MCP - Trend Insights Engine
 *
 * Purpose: Real-time market intelligence layer that identifies:
 * - Where demand is rising
 * - What topics/keywords are trending
 * - Which states are heating up
 * - Early-warning signals for opportunity spikes
 */

import { fetchGoogleTrends, TrendServiceLine, GoogleTrendsResult } from '../market-intel/google-trends-service-interest'
import { findMensClinicsByRegion, ClinicBasic } from './find-mens-clinics-by-region'
import { enrichClinicProfile, EnrichedClinicProfile } from './enrich-clinic-profile'
import { getAdsPresenceSnapshot, AdsPresenceSnapshot } from './ads-presence-snapshot'
import { BigQuery } from '@google-cloud/bigquery'

// Service line mapping
const SERVICE_LINE_MAP: Record<string, TrendServiceLine> = {
  'TRT': 'TRT',
  'Weight Loss': 'WEIGHT_LOSS',
  'IV Therapy': 'IV_THERAPY',
}

/**
 * 1. google_trends_region_scan
 * Pull Google Trends interest for service line topics by region
 */
export interface GoogleTrendsRegionScanInput {
  region: string // State code or name
  serviceLine: 'TRT' | 'Weight Loss' | 'IV Therapy'
}

export interface GoogleTrendsRegionScanOutput {
  region: string
  serviceLine: string
  interestScore: number // 0-100
  trendingQueries: Array<{
    query: string
    growthScore: number
  }>
  risingQueries: Array<{
    query: string
    growthScore: number
  }>
  volatility: number // 0-1, how much interest fluctuates
  trajectory7d: {
    direction: 'RISING' | 'STABLE' | 'FALLING'
    changePercent: number
  }
  trajectory30d: {
    direction: 'RISING' | 'STABLE' | 'FALLING'
    changePercent: number
  }
}

export async function googleTrendsRegionScan(
  input: GoogleTrendsRegionScanInput
): Promise<GoogleTrendsRegionScanOutput> {
  const { region, serviceLine } = input
  const mappedServiceLine = SERVICE_LINE_MAP[serviceLine]

  if (!mappedServiceLine) {
    throw new Error(`Invalid service line: ${serviceLine}`)
  }

  // Normalize region format (e.g., "Texas" -> "US-TX" or "TX" -> "US-TX")
  const normalizedRegion = normalizeRegion(region)

  try {
    // Fetch 7-day and 30-day trends
    const trends7d = await fetchGoogleTrends({
      serviceLine: mappedServiceLine,
      region: normalizedRegion,
      timeRange: 'now 7-d',
    })

    const trends30d = await fetchGoogleTrends({
      serviceLine: mappedServiceLine,
      region: normalizedRegion,
      timeRange: 'now 30-d',
    })

    // Calculate current interest score (average of last 7 days)
    const recentData = trends7d.interestOverTime.slice(-7)
    const interestScore = recentData.length > 0
      ? Math.round(recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length)
      : 0

    // Calculate volatility (standard deviation of interest over time)
    const values = trends30d.interestOverTime.map(d => d.value)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const volatility = Math.min(1, Math.sqrt(variance) / 100) // Normalize to 0-1

    // Calculate 7-day trajectory
    const first7d = trends7d.interestOverTime.slice(0, 3)
    const last7d = trends7d.interestOverTime.slice(-3)
    const avgFirst7d = first7d.reduce((sum, d) => sum + d.value, 0) / first7d.length
    const avgLast7d = last7d.reduce((sum, d) => sum + d.value, 0) / last7d.length
    const change7d = avgFirst7d > 0 ? ((avgLast7d - avgFirst7d) / avgFirst7d) * 100 : 0

    // Calculate 30-day trajectory
    const first30d = trends30d.interestOverTime.slice(0, 7)
    const last30d = trends30d.interestOverTime.slice(-7)
    const avgFirst30d = first30d.reduce((sum, d) => sum + d.value, 0) / first30d.length
    const avgLast30d = last30d.reduce((sum, d) => sum + d.value, 0) / last30d.length
    const change30d = avgFirst30d > 0 ? ((avgLast30d - avgFirst30d) / avgFirst30d) * 100 : 0

    // Separate trending vs rising queries (rising = higher growth)
    const allQueries = trends30d.risingQueries || []
    const trendingQueries = allQueries
      .filter(q => q.growthScore >= 300 && q.growthScore < 700)
      .slice(0, 5)
    const risingQueries = allQueries
      .filter(q => q.growthScore >= 700)
      .slice(0, 5)

    return {
      region,
      serviceLine,
      interestScore,
      trendingQueries,
      risingQueries,
      volatility,
      trajectory7d: {
        direction: change7d > 5 ? 'RISING' : change7d < -5 ? 'FALLING' : 'STABLE',
        changePercent: Math.round(change7d * 10) / 10,
      },
      trajectory30d: {
        direction: change30d > 5 ? 'RISING' : change30d < -5 ? 'FALLING' : 'STABLE',
        changePercent: Math.round(change30d * 10) / 10,
      },
    }
  } catch (error) {
    console.error('Error scanning Google Trends:', error)
    throw new Error(`Google Trends region scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 2. bigquery_domain_scan
 * Use BigQuery public datasets to evaluate domain authority and traffic
 */
export interface BigQueryDomainScanInput {
  domain: string // e.g., "example.com"
}

export interface BigQueryDomainScanOutput {
  domain: string
  domainAuthorityBand: 'low' | 'medium' | 'high'
  trafficEst: {
    band: 'low' | 'medium' | 'high'
    estimatedMonthlyVisits?: string
  }
  backlinkGrowth: {
    trend: 'RISING' | 'STABLE' | 'FALLING'
    growthPercent?: number
  }
  topKeywords: Array<{
    keyword: string
    estimatedTraffic: number
  }>
  redFlags: string[]
}

export async function bigqueryDomainScan(
  input: BigQueryDomainScanInput
): Promise<BigQueryDomainScanOutput> {
  const { domain } = input

  try {
    // Initialize BigQuery client
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })

    // TODO: Query actual domain data from BigQuery public datasets
    // For now, use mock data based on domain analysis patterns
    // In production, query:
    // - Google Trends domain data
    // - Backlink databases
    // - Traffic estimation APIs

    // Mock implementation with realistic patterns
    return generateMockDomainScan(domain)
  } catch (error) {
    console.error('Error scanning domain:', error)
    // Return conservative estimates on error
    return {
      domain,
      domainAuthorityBand: 'low',
      trafficEst: { band: 'low' },
      backlinkGrowth: { trend: 'STABLE' },
      topKeywords: [],
      redFlags: ['Unable to fetch domain data'],
    }
  }
}

/**
 * Generate mock domain scan data
 * In production, replace with actual BigQuery queries
 */
function generateMockDomainScan(domain: string): BigQueryDomainScanOutput {
  // Simulate domain authority based on domain characteristics
  const isEstablished = domain.length < 15 && !domain.includes('new') && !domain.includes('2024')
  const domainAuthorityBand: 'low' | 'medium' | 'high' = isEstablished ? 'medium' : 'low'

  // Simulate traffic estimation
  const trafficBand: 'low' | 'medium' | 'high' = isEstablished ? 'medium' : 'low'
  const estimatedMonthlyVisits = isEstablished
    ? `${Math.floor(Math.random() * 5000) + 1000}-${Math.floor(Math.random() * 10000) + 5000}`
    : `${Math.floor(Math.random() * 500) + 100}-${Math.floor(Math.random() * 1000) + 500}`

  // Simulate backlink growth
  const backlinkTrend: 'RISING' | 'STABLE' | 'FALLING' = Math.random() > 0.7 ? 'RISING' : 'STABLE'
  const backlinkGrowthPercent = backlinkTrend === 'RISING' ? Math.floor(Math.random() * 30) + 5 : undefined

  // Generate top keywords (mock)
  const keywordTemplates = [
    { keyword: 'mens health clinic', estimatedTraffic: Math.floor(Math.random() * 500) + 100 },
    { keyword: 'testosterone therapy', estimatedTraffic: Math.floor(Math.random() * 300) + 50 },
    { keyword: 'weight loss clinic', estimatedTraffic: Math.floor(Math.random() * 400) + 75 },
  ]
  const topKeywords = keywordTemplates.slice(0, Math.floor(Math.random() * 2) + 1)

  // Generate red flags
  const redFlags: string[] = []
  if (domain.includes('new') || domain.includes('2024')) {
    redFlags.push('Very new domain - may lack trust signals')
  }
  if (!isEstablished) {
    redFlags.push('Low domain authority - limited SEO presence')
  }
  if (topKeywords.length === 0) {
    redFlags.push('No significant keyword rankings detected')
  }

  return {
    domain,
    domainAuthorityBand,
    trafficEst: {
      band: trafficBand,
      estimatedMonthlyVisits,
    },
    backlinkGrowth: {
      trend: backlinkTrend,
      growthPercent: backlinkGrowthPercent,
    },
    topKeywords,
    redFlags: redFlags.length > 0 ? redFlags : [],
  }
}

/**
 * 3. clinic_market_strength_score
 * Combine multiple signals to score clinic market strength
 */
export interface ClinicMarketStrengthInput {
  clinic: ClinicBasic
  enrichedProfile?: EnrichedClinicProfile
  adsSnapshot: AdsPresenceSnapshot
  trendsData?: GoogleTrendsRegionScanOutput
  domainData?: BigQueryDomainScanOutput
}

export interface ClinicMarketStrengthOutput {
  clinicName: string
  marketStrengthScore: number // 0-100
  scoreBreakdown: {
    funnelStrength: number // 0-25
    demandInRegion: number // 0-25
    adAggression: number // 0-25
    seoAuthority: number // 0-25
  }
  recommendation: 'goStrong' | 'warmLead' | 'avoid'
  recommendationReason: string
}

export async function clinicMarketStrengthScore(
  input: ClinicMarketStrengthInput
): Promise<ClinicMarketStrengthOutput> {
  const { clinic, enrichedProfile, adsSnapshot, trendsData, domainData } = input

  // Calculate funnel strength (0-25)
  let funnelStrength = 12.5 // Base score
  if (enrichedProfile) {
    // Modern funnels score higher
    if (['direct_booking', 'quiz_assessment'].includes(enrichedProfile.funnelStyle)) {
      funnelStrength += 8
    } else if (enrichedProfile.funnelStyle === 'consultation_first') {
      funnelStrength += 5
    } else {
      funnelStrength -= 3 // Contact form or mixed = weaker
    }

    // Pricing transparency
    if (enrichedProfile.pricingSignals.hasPricingPage) {
      funnelStrength += 3
    }

    // Free consult lowers barrier
    if (enrichedProfile.pricingSignals.freeConsultOffered) {
      funnelStrength += 2
    }

    // Multiple CTAs = better conversion
    if (enrichedProfile.ctas.length >= 2) {
      funnelStrength += 2
    }
  }
  funnelStrength = Math.max(0, Math.min(25, funnelStrength))

  // Calculate demand in region (0-25)
  let demandInRegion = 12.5 // Base score
  if (trendsData) {
    // Interest score directly maps to demand
    demandInRegion = (trendsData.interestScore / 100) * 25

    // Rising trends boost score
    if (trendsData.trajectory30d.direction === 'RISING') {
      demandInRegion += 5
    } else if (trendsData.trajectory30d.direction === 'FALLING') {
      demandInRegion -= 5
    }
  }
  demandInRegion = Math.max(0, Math.min(25, demandInRegion))

  // Calculate ad aggression (0-25)
  let adAggression = 0
  if (adsSnapshot.isRunningAds) {
    adAggression = 15 // Base for running ads

    // Higher spend = more aggressive
    if (adsSnapshot.estimatedSpendBand === 'high') {
      adAggression += 8
    } else if (adsSnapshot.estimatedSpendBand === 'medium') {
      adAggression += 5
    }

    // Multiple platforms = serious investment
    if (adsSnapshot.platforms.length > 1) {
      adAggression += 2
    }
  } else {
    // No ads = opportunity, but lower score
    adAggression = 5
  }
  adAggression = Math.max(0, Math.min(25, adAggression))

  // Calculate SEO authority (0-25)
  let seoAuthority = 12.5 // Base score
  if (domainData) {
    if (domainData.domainAuthorityBand === 'high') {
      seoAuthority = 20
    } else if (domainData.domainAuthorityBand === 'medium') {
      seoAuthority = 15
    } else {
      seoAuthority = 8
    }

    // Rising backlinks = growing authority
    if (domainData.backlinkGrowth.trend === 'RISING') {
      seoAuthority += 3
    }

    // Top keywords indicate SEO success
    if (domainData.topKeywords.length >= 2) {
      seoAuthority += 2
    }

    // Red flags reduce score
    seoAuthority -= domainData.redFlags.length * 2
  }
  seoAuthority = Math.max(0, Math.min(25, seoAuthority))

  // Calculate total market strength score
  const marketStrengthScore = Math.round(
    funnelStrength + demandInRegion + adAggression + seoAuthority
  )

  // Generate recommendation
  let recommendation: 'goStrong' | 'warmLead' | 'avoid'
  let recommendationReason: string

  if (marketStrengthScore >= 75) {
    recommendation = 'goStrong'
    recommendationReason = `Strong market position with score of ${marketStrengthScore}/100. ${
      adsSnapshot.isRunningAds ? 'Active ad spend' : 'High regional demand'
    } combined with ${enrichedProfile ? 'modern funnel' : 'good fit'} makes this a high-priority target.`
  } else if (marketStrengthScore >= 50) {
    recommendation = 'warmLead'
    recommendationReason = `Moderate market strength (${marketStrengthScore}/100). ${
      trendsData?.trajectory30d.direction === 'RISING' 
        ? 'Rising demand trend' 
        : 'Some positive signals'
    } but needs careful qualification before aggressive pursuit.`
  } else {
    recommendation = 'avoid'
    recommendationReason = `Low market strength score (${marketStrengthScore}/100). ${
      !adsSnapshot.isRunningAds && trendsData && trendsData.interestScore < 50
        ? 'Low demand and no ad activity'
        : 'Multiple weak signals'
    } suggest limited partnership potential at this time.`
  }

  return {
    clinicName: clinic.name,
    marketStrengthScore,
    scoreBreakdown: {
      funnelStrength: Math.round(funnelStrength),
      demandInRegion: Math.round(demandInRegion),
      adAggression: Math.round(adAggression),
      seoAuthority: Math.round(seoAuthority),
    },
    recommendation,
    recommendationReason,
  }
}

/**
 * 4. trend_based_dealflow
 * Automatically select regions with highest rising demand and pull clinics
 */
export interface TrendBasedDealflowInput {
  serviceLine: 'TRT' | 'Weight Loss' | 'IV Therapy'
  maxClinics?: number // Default: 20
}

export interface TrendBasedDealflowClinic {
  clinic: ClinicBasic
  enrichedProfile?: EnrichedClinicProfile
  adsSnapshot: AdsPresenceSnapshot
  trendsData: GoogleTrendsRegionScanOutput
  domainData?: BigQueryDomainScanOutput
  marketStrength: ClinicMarketStrengthOutput
}

export interface TrendBasedDealflowOutput {
  serviceLine: string
  timestamp: string
  topRegions: Array<{
    region: string
    interestScore: number
    trajectory: 'RISING' | 'STABLE' | 'FALLING'
  }>
  clinics: TrendBasedDealflowClinic[]
  summary: {
    totalClinics: number
    goStrong: number
    warmLead: number
    avoid: number
  }
}

export async function trendBasedDealflow(
  input: TrendBasedDealflowInput
): Promise<TrendBasedDealflowOutput> {
  const { serviceLine, maxClinics = 20 } = input
  const mappedServiceLine = SERVICE_LINE_MAP[serviceLine]

  if (!mappedServiceLine) {
    throw new Error(`Invalid service line: ${serviceLine}`)
  }

  try {
    // Step 1: Get top 3 regions with highest rising demand
    const allStates = [
      'Texas', 'Florida', 'California', 'New York', 'Arizona', 'Nevada',
      'Colorado', 'Illinois', 'Georgia', 'North Carolina',
    ]

    const regionScores: Array<{ region: string; score: number; trends: GoogleTrendsRegionScanOutput }> = []

    // Scan top states for trends
    for (const state of allStates.slice(0, 8)) { // Limit to 8 for performance
      try {
        const trends = await googleTrendsRegionScan({ region: state, serviceLine })
        const score = trends.interestScore + (trends.trajectory30d.direction === 'RISING' ? 20 : 0)
        regionScores.push({ region: state, score, trends })
      } catch (error) {
        console.error(`Error scanning ${state}:`, error)
        // Continue with next region
      }
    }

    // Sort by score and take top 3
    const topRegions = regionScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => ({
        region: r.region,
        interestScore: r.trends.interestScore,
        trajectory: r.trends.trajectory30d.direction,
      }))

    // Step 2: For each top region, find and process clinics
    const allClinics: TrendBasedDealflowClinic[] = []

    for (const topRegion of topRegions) {
      try {
        // Find clinics in this region
        const serviceLineMap: Record<string, 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY' | 'GENERAL'> = {
          'TRT': 'TRT',
          'Weight Loss': 'WEIGHT_LOSS',
          'IV Therapy': 'IV_THERAPY',
        }

        const findResult = await findMensClinicsByRegion({
          region: topRegion.region,
          serviceLine: serviceLineMap[serviceLine] || 'GENERAL',
        })

        // Limit to 7 clinics per region (to get ~20 total)
        const clinicsToProcess = findResult.clinics.slice(0, 7)

        // Get trends data for this region
        const trendsData = regionScores.find(r => r.region === topRegion.region)?.trends
        if (!trendsData) continue

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
              region: topRegion.region,
            })
            const adsSnapshot = adsSnapshotResult.snapshot

            // Get domain data
            let domainData: BigQueryDomainScanOutput | undefined
            if (clinic.website) {
              try {
                const domain = extractDomain(clinic.website)
                domainData = await bigqueryDomainScan({ domain })
              } catch (error) {
                console.error(`Error scanning domain for ${clinic.name}:`, error)
              }
            }

            // Calculate market strength
            const marketStrength = await clinicMarketStrengthScore({
              clinic,
              enrichedProfile,
              adsSnapshot,
              trendsData,
              domainData,
            })

            allClinics.push({
              clinic,
              enrichedProfile,
              adsSnapshot,
              trendsData,
              domainData,
              marketStrength,
            })
          } catch (error) {
            console.error(`Error processing clinic ${clinic.name}:`, error)
            // Continue with next clinic
          }
        }
      } catch (error) {
        console.error(`Error processing region ${topRegion.region}:`, error)
        // Continue with next region
      }
    }

    // Sort by market strength score and limit
    const rankedClinics = allClinics
      .sort((a, b) => b.marketStrength.marketStrengthScore - a.marketStrength.marketStrengthScore)
      .slice(0, maxClinics)

    // Count recommendations
    const goStrong = rankedClinics.filter(c => c.marketStrength.recommendation === 'goStrong').length
    const warmLead = rankedClinics.filter(c => c.marketStrength.recommendation === 'warmLead').length
    const avoid = rankedClinics.filter(c => c.marketStrength.recommendation === 'avoid').length

    return {
      serviceLine,
      timestamp: new Date().toISOString(),
      topRegions,
      clinics: rankedClinics,
      summary: {
        totalClinics: rankedClinics.length,
        goStrong,
        warmLead,
        avoid,
      },
    }
  } catch (error) {
    console.error('Error generating trend-based dealflow:', error)
    throw new Error(`Trend-based dealflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Helper: Normalize region format
 */
function normalizeRegion(region: string): string {
  // If already in US-XX format, return as is
  if (region.match(/^US-[A-Z]{2}$/)) {
    return region
  }

  // Extract state code if present
  const stateCodeMatch = region.match(/\b([A-Z]{2})\b/)
  if (stateCodeMatch) {
    return `US-${stateCodeMatch[1]}`
  }

  // Map common state names to codes
  const stateMap: Record<string, string> = {
    'Texas': 'US-TX',
    'Florida': 'US-FL',
    'California': 'US-CA',
    'New York': 'US-NY',
    'Arizona': 'US-AZ',
    'Nevada': 'US-NV',
    'Colorado': 'US-CO',
    'Illinois': 'US-IL',
    'Georgia': 'US-GA',
    'North Carolina': 'US-NC',
  }

  for (const [name, code] of Object.entries(stateMap)) {
    if (region.includes(name)) {
      return code
    }
  }

  // Default to US
  return 'US'
}

/**
 * Helper: Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

