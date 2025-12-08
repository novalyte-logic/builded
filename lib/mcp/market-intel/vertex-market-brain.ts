/**
 * MCP Tool: vertex_market_brain
 * 
 * Use Vertex AI (Gemini) to analyze market data and provide strategic recommendations
 */

import { VertexAI } from '@google-cloud/vertexai'
import { RegionDemand } from './bigquery-region-demand'
import { ClinicSearchResult } from './bigquery-clinic-search'
import { GoogleTrendsResult } from './google-trends-service-interest'

export interface TargetRegion {
  region: string
  reason: string
  suggestedBudgetShare: number // percentage
}

export interface TargetClinic {
  clinic_id: string
  name: string
  state: string
  why_target: string
}

export interface MarketBrainOutput {
  interpretedQuestion: string
  topRegions: TargetRegion[]
  targetClinics: TargetClinic[]
  primaryMove: string
  secondaryMoves: string[]
  trendSummary: string
  trendConfidence: number // 0-1
  firstMove: string
  firstMoveReason: string
}

export interface MarketBrainInput {
  question: string
  serviceLine?: string
  regionDemand: RegionDemand[]
  clinicMatches: ClinicSearchResult[]
  trendsData?: GoogleTrendsResult
}

/**
 * Call Vertex AI to analyze market data and generate strategic recommendations
 */
export async function analyzeMarket(input: MarketBrainInput): Promise<MarketBrainOutput> {
  const { question, serviceLine, regionDemand, clinicMatches, trendsData } = input

  try {
    // Initialize Vertex AI client
    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID || '',
      location: process.env.GCP_REGION || 'us-central1',
    })

    const model = 'gemini-1.5-flash'
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
    })

    // Build system prompt for market intelligence
    const systemPrompt = `You are Novalyte™ AI's Market Intelligence Brain. Your job is to analyze market data and provide actionable strategic recommendations for deploying ads and targeting clinics in the men's health space (TRT, Weight Loss, IV Therapy).

You will receive:
1. A natural language question from a Superadmin
2. Regional demand data showing which states/regions have high demand
3. A list of clinics that match the criteria
4. Google Trends data showing real-time search interest and momentum

Your response MUST be valid JSON with this exact structure:
{
  "interpretedQuestion": "Clear restatement of what the admin is asking",
  "topRegions": [
    {
      "region": "TX",
      "reason": "Why this region is a top target (cite demand_index, trend, Google Trends signals)",
      "suggestedBudgetShare": 40
    }
  ],
  "targetClinics": [
    {
      "clinic_id": "clinic-001",
      "name": "Clinic Name",
      "state": "TX",
      "why_target": "Why we should target this specific clinic"
    }
  ],
  "primaryMove": "The single most important action to take right now",
  "secondaryMoves": [
    "Additional strategic moves ranked by priority"
  ],
  "trendSummary": "A 2-3 sentence summary of Google Trends signals and how they align with BigQuery demand data",
  "trendConfidence": 0.85,
  "firstMove": "A single specific action the admin should take within the next 7 days based on trends + demand alignment",
  "firstMoveReason": "Why this is the recommended first move, citing trend momentum and demand data"
}

Guidelines:
- Be specific and actionable
- Cite actual numbers from the data (demand_index, trend, Google Trends interest)
- Interpret whether NOW is a good, neutral, or bad moment to deploy ads based on trend direction
- Budget shares should add up to 100% across top 3-5 regions
- Focus on ROI and strategic positioning
- Consider clinic capacity and price bands
- Prioritize "actively_accepting" clinics over "at_capacity"
- Match premium service demand with premium price_band clinics
- Use Google Trends risingQueries to suggest ad copy angles
- Identify trend + demand alignment (regions high in both signals)
- Set trendConfidence based on trend strength and alignment with demand data`

    // Build user prompt with data
    const trendsSection = trendsData
      ? `

Google Trends Data:
${JSON.stringify(trendsData, null, 2)}

Key Trends Insights:
- Trend Direction: ${trendsData.trendDirection}
- Trend Strength: ${trendsData.trendStrength}
- Top ${trendsData.topRegions.length} regions by search interest: ${trendsData.topRegions.slice(0, 3).map(r => r.region).join(', ')}
- Rising queries: ${trendsData.risingQueries.slice(0, 3).map(q => q.query).join(', ')}
`
      : ''

    const userPrompt = `Question: "${question}"

Service Line: ${serviceLine || 'Not specified'}

Regional Demand Data (from BigQuery):
${JSON.stringify(regionDemand, null, 2)}

Matching Clinics:
${JSON.stringify(clinicMatches.slice(0, 15), null, 2)}${trendsSection}

Provide your market intelligence analysis in the required JSON format. 
${trendsData ? 'Pay special attention to regions where BOTH BigQuery demand AND Google Trends interest are high - these are optimal deployment targets.' : ''}`

    // Call Gemini
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: userPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more factual, structured output
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    const response = result.response
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse JSON response
    // Try to extract JSON if it's wrapped in markdown code blocks
    let jsonText = text.trim()
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonText) as MarketBrainOutput

    // Validate structure
    if (!parsed.interpretedQuestion || !parsed.topRegions || !parsed.targetClinics || !parsed.primaryMove) {
      throw new Error('Invalid response structure from Vertex AI')
    }

    return parsed
  } catch (error) {
    console.error('Error calling Vertex AI market brain:', error)
    
    // Fallback to rule-based response if Vertex AI fails
    console.warn('Falling back to rule-based market intelligence')
    return generateFallbackAnalysis(input)
  }
}

/**
 * Generate fallback analysis using rule-based logic
 * Used when Vertex AI is unavailable
 */
function generateFallbackAnalysis(input: MarketBrainInput): MarketBrainOutput {
  const { question, serviceLine, regionDemand, clinicMatches, trendsData } = input

  // Sort regions by demand index
  const topRegionData = [...regionDemand]
    .sort((a, b) => b.demand_index - a.demand_index)
    .slice(0, 3)

  // Calculate budget shares
  const totalDemand = topRegionData.reduce((sum, r) => sum + r.demand_index, 0)
  const topRegions: TargetRegion[] = topRegionData.map((r) => ({
    region: r.region,
    reason: `High demand index (${r.demand_index}/100) with ${r.trend.toLowerCase()} trend. Sample size: ${r.sample_size} signals.`,
    suggestedBudgetShare: Math.round((r.demand_index / totalDemand) * 100),
  }))

  // Select top clinics (actively accepting first)
  const targetClinics: TargetClinic[] = clinicMatches
    .filter((c) => c.lead_status === 'actively_accepting')
    .slice(0, 5)
    .map((c) => ({
      clinic_id: c.clinic_id,
      name: c.name,
      state: c.state,
      why_target: `Actively accepting patients in ${c.state}. Offers ${c.service_lines.join(', ')}. Price band: ${c.price_band}.`,
    }))

  // Generate moves
  const serviceText = serviceLine || 'the target service'
  const primaryMove = `Deploy ${serviceText} ads in ${topRegions[0]?.region || 'top region'} with ${topRegions[0]?.suggestedBudgetShare || 40}% of budget targeting ${topRegions[0]?.reason.includes('rising') ? 'rising' : 'strong'} demand.`

  const secondaryMoves = [
    `Reach out to ${targetClinics[0]?.name || 'top clinic'} with lead partnership proposal`,
    `Launch retargeting campaign in ${topRegions[1]?.region || 'second region'} (${topRegions[1]?.suggestedBudgetShare || 30}% budget)`,
    `Test new creative angles emphasizing ${serviceLine === 'TRT' ? 'energy and vitality' : serviceLine === 'WEIGHT_LOSS' ? 'medical weight loss' : 'recovery and wellness'}`,
    `Monitor conversion rates and adjust budget allocation between regions after 2 weeks`,
  ]

  // Generate trend summary
  let trendSummary = 'Trend data not available.'
  let trendConfidence = 0.5
  let firstMove = primaryMove
  let firstMoveReason = 'Based on demand index and clinic capacity.'

  if (trendsData) {
    const trendText = trendsData.trendDirection === 'RISING' ? 'rising' : trendsData.trendDirection === 'FALLING' ? 'falling' : 'stable'
    const strengthText = trendsData.trendStrength > 0.7 ? 'strongly' : trendsData.trendStrength > 0.4 ? 'moderately' : 'slightly'
    
    trendSummary = `${serviceLine} interest is ${strengthText} ${trendText} with ${trendsData.timeRange}. ` +
      `Top search regions: ${trendsData.topRegions.slice(0, 3).map(r => r.region).join(', ')}. ` +
      `Rising queries include: ${trendsData.risingQueries.slice(0, 2).map(q => q.query).join(', ')}.`
    
    trendConfidence = trendsData.trendStrength * 0.8 + 0.2
    
    if (trendsData.trendDirection === 'RISING' && trendsData.trendStrength > 0.6) {
      firstMove = `Launch a 7-day test campaign in ${topRegions[0]?.region} for ${serviceText} while momentum is building.`
      firstMoveReason = `Google Trends shows ${strengthText} rising interest (${trendsData.trendStrength.toFixed(2)} strength) aligning with high BigQuery demand (${topRegionData[0]?.demand_index}/100). Strike while demand is climbing.`
    } else if (trendsData.trendDirection === 'FALLING') {
      firstMove = `Pause new ad spend and focus on converting existing ${serviceText} leads in pipeline.`
      firstMoveReason = `Google Trends shows falling interest. Prioritize lead nurturing and conversion over new acquisition until momentum shifts.`
    }
  }

  return {
    interpretedQuestion: question,
    topRegions,
    targetClinics,
    primaryMove,
    secondaryMoves,
    trendSummary,
    trendConfidence,
    firstMove,
    firstMoveReason,
  }
}

/**
 * MCP Tool metadata
 */
export const marketBrainToolMetadata = {
  name: 'vertex_market_brain',
  description: 'Use Vertex AI (Gemini) to analyze market data and provide strategic recommendations',
  inputSchema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'Natural language question from the admin (e.g., "Where should we deploy weight loss ads?")',
      },
      serviceLine: {
        type: 'string',
        description: 'Service line context (TRT, WEIGHT_LOSS, IV_THERAPY)',
      },
      regionDemand: {
        type: 'array',
        description: 'Array of region demand objects from bigquery_region_demand',
      },
      clinicMatches: {
        type: 'array',
        description: 'Array of clinic objects from bigquery_clinic_search',
      },
    },
    required: ['question', 'regionDemand', 'clinicMatches'],
  },
}

