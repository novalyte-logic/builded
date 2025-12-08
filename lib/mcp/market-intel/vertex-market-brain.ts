/**
 * MCP Tool: vertex_market_brain
 * 
 * Use Vertex AI (Gemini) to analyze market data and provide strategic recommendations
 */

import { VertexAI } from '@google-cloud/vertexai'
import { RegionDemand } from './bigquery-region-demand'
import { ClinicSearchResult } from './bigquery-clinic-search'

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
}

export interface MarketBrainInput {
  question: string
  serviceLine?: string
  regionDemand: RegionDemand[]
  clinicMatches: ClinicSearchResult[]
}

/**
 * Call Vertex AI to analyze market data and generate strategic recommendations
 */
export async function analyzeMarket(input: MarketBrainInput): Promise<MarketBrainOutput> {
  const { question, serviceLine, regionDemand, clinicMatches } = input

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

Your response MUST be valid JSON with this exact structure:
{
  "interpretedQuestion": "Clear restatement of what the admin is asking",
  "topRegions": [
    {
      "region": "TX",
      "reason": "Why this region is a top target (cite demand_index, trend, etc.)",
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
  ]
}

Guidelines:
- Be specific and actionable
- Cite actual numbers from the data (demand_index, trend)
- Budget shares should add up to 100% across top 3-5 regions
- Focus on ROI and strategic positioning
- Consider clinic capacity and price bands
- Prioritize "actively_accepting" clinics over "at_capacity"
- Match premium service demand with premium price_band clinics`

    // Build user prompt with data
    const userPrompt = `Question: "${question}"

Service Line: ${serviceLine || 'Not specified'}

Regional Demand Data:
${JSON.stringify(regionDemand, null, 2)}

Matching Clinics:
${JSON.stringify(clinicMatches.slice(0, 15), null, 2)}

Provide your market intelligence analysis in the required JSON format.`

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
  const { question, serviceLine, regionDemand, clinicMatches } = input

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

  return {
    interpretedQuestion: question,
    topRegions,
    targetClinics,
    primaryMove,
    secondaryMoves,
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

