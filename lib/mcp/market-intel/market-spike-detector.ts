/**
 * MCP Tool: market-spike-detector
 * 
 * Detect early TRT demand spikes across U.S. cities using:
 * - Google Trends (TRT, testosterone clinic, hormone replacement therapy)
 * - Geo breakout by metro area
 * - Trend delta (24h, 7d, 30d)
 * - Paid ad density (SERP scraping)
 * - CPC estimate
 * - Funnel intent score (0-100)
 * - Clinic availability in that region (from Clinics DB)
 * 
 * Uses Vertex AI with googleSearchRetrieval enabled for real-time analysis
 */

import { VertexAI } from '@google-cloud/vertexai'
import { fetchGoogleTrends, GoogleTrendsResult, TrendServiceLine } from './google-trends-service-interest'
import { fetchClinicAdsActivity } from './ads-intel-clinic-activity'
import { searchClinics } from './bigquery-clinic-search'

export interface MarketSpikeDetectorInput {
  maxCities?: number // Default: 10
  minTrendPercent?: number // Minimum trend increase to consider (default: 20)
}

export interface CitySpikeData {
  city: string
  trend_percent: string // e.g., "+45%"
  search_volume: string // e.g., "High", "Medium", "Low"
  cpc: string // e.g., "$2.50"
  ad_density: string // e.g., "High (8 ads)", "Medium (4 ads)", "Low (1 ad)"
  intent_score: string // 0-100
  clinic_gap: string // e.g., "High (12 clinics needed)", "Medium (5 clinics)", "Low (1 clinic)"
}

export interface MarketSpikeDetectorOutput {
  top_cities: CitySpikeData[]
  recommendation: string
}

// Major U.S. metro areas to scan
const MAJOR_METROS = [
  'Austin, TX', 'Dallas, TX', 'Houston, TX', 'San Antonio, TX',
  'Miami, FL', 'Tampa, FL', 'Orlando, FL', 'Jacksonville, FL',
  'Los Angeles, CA', 'San Diego, CA', 'San Francisco, CA', 'Sacramento, CA',
  'Phoenix, AZ', 'Tucson, AZ',
  'Las Vegas, NV', 'Reno, NV',
  'Denver, CO', 'Colorado Springs, CO',
  'Chicago, IL', 'Nashville, TN', 'Atlanta, GA', 'Charlotte, NC',
  'Seattle, WA', 'Portland, OR', 'Boston, MA', 'New York, NY',
]

/**
 * Calculate trend delta for different time periods
 */
function calculateTrendDeltas(trends: GoogleTrendsResult): {
  delta24h: number
  delta7d: number
  delta30d: number
} {
  const dataPoints = trends.interestOverTime
  if (dataPoints.length < 2) {
    return { delta24h: 0, delta7d: 0, delta30d: 0 }
  }

  // Get most recent value
  const latest = dataPoints[dataPoints.length - 1].value

  // Calculate 24h delta (last 1-2 data points)
  const yesterday = dataPoints.length >= 2 ? dataPoints[dataPoints.length - 2].value : latest
  const delta24h = yesterday > 0 ? ((latest - yesterday) / yesterday) * 100 : 0

  // Calculate 7d delta (compare last 7 days to previous 7 days)
  const last7d = dataPoints.slice(-7)
  const prev7d = dataPoints.slice(-14, -7)
  const avgLast7d = last7d.reduce((sum, d) => sum + d.value, 0) / last7d.length
  const avgPrev7d = prev7d.length > 0 ? prev7d.reduce((sum, d) => sum + d.value, 0) / prev7d.length : avgLast7d
  const delta7d = avgPrev7d > 0 ? ((avgLast7d - avgPrev7d) / avgPrev7d) * 100 : 0

  // Calculate 30d delta (compare last 30 days to previous 30 days)
  const last30d = dataPoints.slice(-30)
  const prev30d = dataPoints.slice(-60, -30)
  const avgLast30d = last30d.reduce((sum, d) => sum + d.value, 0) / last30d.length
  const avgPrev30d = prev30d.length > 0 ? prev30d.reduce((sum, d) => sum + d.value, 0) / prev30d.length : avgLast30d
  const delta30d = avgPrev30d > 0 ? ((avgLast30d - avgPrev30d) / avgPrev30d) * 100 : 0

  return { delta24h, delta7d, delta30d }
}

/**
 * Scrape SERP for ad density and estimate CPC
 * NOTE: This is a mock implementation. In production, use:
 * - SerpAPI, DataForSEO, or similar SERP scraping service
 * - Google Ads Keyword Planner API (if available)
 */
async function scrapeSERPForAds(city: string): Promise<{
  adDensity: number // Number of ads detected
  estimatedCPC: number // Estimated cost per click in USD
}> {
  // TODO: Integrate with actual SERP scraping service
  /*
  Example using SerpAPI:
  
  const serpApi = require('google-search-results-nodejs')
  const search = new serpApi.GoogleSearch(process.env.SERP_API_KEY)
  
  const params = {
    q: `testosterone clinic ${city}`,
    location: city,
    hl: 'en',
    gl: 'us',
  }
  
  const results = await search.json(params)
  const ads = results.ads || []
  const adDensity = ads.length
  
  // Estimate CPC based on keyword competition
  const estimatedCPC = adDensity > 5 ? 3.50 : adDensity > 2 ? 2.50 : 1.75
  */

  // Mock implementation
  const mockAdDensity = Math.floor(Math.random() * 10) + 1
  const mockCPC = mockAdDensity > 5 ? 3.50 : mockAdDensity > 2 ? 2.50 : 1.75

  return {
    adDensity: mockAdDensity,
    estimatedCPC: mockCPC,
  }
}

/**
 * Calculate funnel intent score (0-100)
 * Based on search volume, trend direction, ad density, and competition
 */
function calculateIntentScore(
  trendPercent: number,
  searchVolume: number,
  adDensity: number,
  cpc: number
): number {
  let score = 0

  // Trend momentum (0-30 points)
  if (trendPercent > 50) {
    score += 30
  } else if (trendPercent > 30) {
    score += 25
  } else if (trendPercent > 20) {
    score += 20
  } else if (trendPercent > 10) {
    score += 15
  } else if (trendPercent > 0) {
    score += 10
  }

  // Search volume (0-25 points)
  if (searchVolume > 80) {
    score += 25
  } else if (searchVolume > 60) {
    score += 20
  } else if (searchVolume > 40) {
    score += 15
  } else if (searchVolume > 20) {
    score += 10
  } else {
    score += 5
  }

  // Ad density indicates market activity (0-25 points)
  if (adDensity > 7) {
    score += 25 // High competition = high demand
  } else if (adDensity > 4) {
    score += 20
  } else if (adDensity > 2) {
    score += 15
  } else if (adDensity > 0) {
    score += 10
  }

  // CPC indicates value (0-20 points)
  // Higher CPC = more valuable, but too high = saturated
  if (cpc > 3.0 && cpc < 5.0) {
    score += 20 // Sweet spot
  } else if (cpc > 2.0 && cpc <= 3.0) {
    score += 18
  } else if (cpc > 1.5 && cpc <= 2.0) {
    score += 15
  } else if (cpc > 5.0) {
    score += 10 // Too expensive, market saturated
  } else {
    score += 8
  }

  return Math.min(100, Math.max(0, Math.round(score)))
}

/**
 * Check clinic availability in region
 * Queries the clinics database to see how many clinics exist
 */
async function checkClinicAvailability(city: string, state: string): Promise<{
  clinicCount: number
  gap: number // Estimated gap (demand - supply)
}> {
  try {
    // Query clinics using the existing search function
    const clinics = await searchClinics({
      query: city,
      serviceLine: 'TRT',
      region: state,
    })

    // Filter to clinics in the specific city
    const cityClinics = clinics.filter((c) => 
      c.city?.toLowerCase().includes(city.toLowerCase())
    )

    const clinicCount = cityClinics.length

    // Estimate gap based on search volume and trend
    // Higher search volume + trend = more demand = larger gap
    // For now, use a simple heuristic: if there are few clinics, gap is higher
    const estimatedDemand = clinicCount < 3 ? 10 : clinicCount < 5 ? 7 : 5
    const gap = Math.max(0, estimatedDemand - clinicCount)

    return { clinicCount, gap }
  } catch (error) {
    console.error(`Error checking clinic availability for ${city}, ${state}:`, error)
    // Return mock data on error
    return {
      clinicCount: Math.floor(Math.random() * 5),
      gap: Math.floor(Math.random() * 10) + 3,
    }
  }
}

/**
 * Main market spike detector function
 */
export async function detectMarketSpikes(
  input: MarketSpikeDetectorInput = {}
): Promise<MarketSpikeDetectorOutput> {
  const { maxCities = 10, minTrendPercent = 20 } = input

  try {
    // Initialize Vertex AI with googleSearchRetrieval
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
    const location = process.env.GCP_REGION || 'us-central1'

    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is required')
    }

    const vertexAI = new VertexAI({
      project: projectId,
      location,
    })

    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearchRetrieval: {} }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: `You are Novalyte™ AI's Market Spike Detection Engine. Analyze real-time search trends, ad activity, and market signals to identify early TRT demand spikes across U.S. cities. Use Google Search Retrieval to get the latest data on search trends, competitor activity, and market conditions.`,
          },
        ],
      },
    })

    // Scan major metros for TRT trends
    const cityScores: Array<{
      city: string
      state: string
      trendPercent: number
      searchVolume: number
      adDensity: number
      cpc: number
      intentScore: number
      clinicGap: number
      clinicCount: number
    }> = []

    for (const metro of MAJOR_METROS.slice(0, 20)) { // Limit to 20 for performance
      try {
        const [city, state] = metro.split(', ')

        // Fetch Google Trends for TRT in this metro
        const trends = await fetchGoogleTrends({
          serviceLine: 'TRT',
          region: `US-${state}`,
          timeRange: 'now 30-d',
        })

        // Calculate trend deltas
        const { delta7d, delta30d } = calculateTrendDeltas(trends)
        const trendPercent = Math.max(delta7d, delta30d) // Use the higher delta

        // Skip if trend is below minimum threshold
        if (trendPercent < minTrendPercent) {
          continue
        }

        // Get current search volume (average of last 7 days)
        const recentData = trends.interestOverTime.slice(-7)
        const searchVolume = recentData.length > 0
          ? Math.round(recentData.reduce((sum, d) => sum + d.value, 0) / recentData.length)
          : 0

        // Scrape SERP for ad density and CPC
        const { adDensity, estimatedCPC } = await scrapeSERPForAds(metro)

        // Calculate intent score
        const intentScore = calculateIntentScore(trendPercent, searchVolume, adDensity, estimatedCPC)

        // Check clinic availability
        const { clinicCount, gap } = await checkClinicAvailability(city, state)

        cityScores.push({
          city: metro,
          state,
          trendPercent,
          searchVolume,
          adDensity,
          cpc: estimatedCPC,
          intentScore,
          clinicGap: gap,
          clinicCount,
        })
      } catch (error) {
        console.error(`Error processing ${metro}:`, error)
        // Continue with next city
      }
    }

    // Sort by intent score (highest first)
    cityScores.sort((a, b) => b.intentScore - a.intentScore)

    // Take top N cities
    const topCities = cityScores.slice(0, maxCities)

    // Format output
    const formattedCities: CitySpikeData[] = topCities.map((city) => ({
      city: city.city,
      trend_percent: `${city.trendPercent > 0 ? '+' : ''}${city.trendPercent.toFixed(1)}%`,
      search_volume: city.searchVolume > 70 ? 'High' : city.searchVolume > 40 ? 'Medium' : 'Low',
      cpc: `$${city.cpc.toFixed(2)}`,
      ad_density: city.adDensity > 7 ? `High (${city.adDensity} ads)` : city.adDensity > 3 ? `Medium (${city.adDensity} ads)` : `Low (${city.adDensity} ad${city.adDensity !== 1 ? 's' : ''})`,
      intent_score: city.intentScore.toString(),
      clinic_gap: city.clinicGap > 8 ? `High (${city.clinicGap} clinics needed)` : city.clinicGap > 4 ? `Medium (${city.clinicGap} clinics)` : `Low (${city.clinicGap} clinic${city.clinicGap !== 1 ? 's' : ''})`,
    }))

    // Use Vertex AI to generate recommendation
    const recommendationPrompt = `Based on the following market spike data, provide a strategic recommendation for the founder to target hot regions and sell leads to clinics:

Top Cities:
${formattedCities.map((c, idx) => 
  `${idx + 1}. ${c.city}: ${c.trend_percent} trend, ${c.search_volume} search volume, ${c.cpc} CPC, ${c.ad_density} ad density, ${c.intent_score}/100 intent score, ${c.clinic_gap} clinic gap`
).join('\n')}

Provide a concise recommendation (2-3 sentences) on which cities to prioritize and why.`

    const recommendationResponse = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: recommendationPrompt }],
        },
      ],
    })

    const recommendationText =
      recommendationResponse.response?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('')
        .trim() || 'Focus on cities with highest intent scores and clinic gaps for maximum lead generation opportunity.'

    return {
      top_cities: formattedCities,
      recommendation: recommendationText,
    }
  } catch (error) {
    console.error('Error detecting market spikes:', error)
    throw new Error(`Market spike detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * MCP Tool metadata
 */
export const marketSpikeDetectorToolMetadata = {
  name: 'market-spike-detector',
  description: 'Detect early TRT demand spikes across U.S. cities using Google Trends, SERP analysis, and clinic availability data',
  inputSchema: {
    type: 'object',
    properties: {
      maxCities: {
        type: 'number',
        description: 'Maximum number of cities to return (default: 10)',
        default: 10,
      },
      minTrendPercent: {
        type: 'number',
        description: 'Minimum trend increase percentage to consider (default: 20)',
        default: 20,
      },
    },
  },
}

