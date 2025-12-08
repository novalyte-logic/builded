import 'server-only'

import { BigQuery } from '@google-cloud/bigquery'
import { VertexAI } from '@google-cloud/vertexai'

const MODEL_NAME = process.env.VERTEX_MODEL || 'gemini-1.5-pro'
const DEFAULT_LOCATION = process.env.VERTEX_LOCATION || 'us-central1'

export interface RegionalSpikeInsight {
  spike_detected: boolean
  target_cities: string[]
  intensity_score: number
  summary_reason: string
}

export interface MacroTrendRow {
  dmaName: string
  averageScore: number
}

/**
 * Market Intelligence Service
 *
 * Uses Vertex AI (Gemini) with Google Search Grounding for real-time spikes,
 * and BigQuery public Google Trends data for macro insights.
 */
export class MarketIntelligenceService {
  private readonly bigquery: BigQuery
  private readonly spikeModel: any

  constructor() {
    const projectId = process.env.GCP_PROJECT_ID

    if (!projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is required')
    }

    this.bigquery = new BigQuery({ projectId })

    const vertexAI = new VertexAI({
      project: projectId,
      location: DEFAULT_LOCATION,
    })

    /**
     * googleSearchRetrieval enables Google Search Grounding, letting Gemini
     * send live search queries to the internet and ground its response with
     * current information instead of just model weights.
     */
    this.spikeModel = vertexAI.preview.getGenerativeModel({
      model: MODEL_NAME,
      tools: [{ googleSearchRetrieval: {} }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: {
        parts: [
          {
            text: `You are Novalyte AI's market intelligence engine.
Analyze live search trends and breaking news within the last 24 hours.
Always return compact JSON only with fields: spike_detected (boolean), target_cities (array of strings with city + state abbreviation), intensity_score (1-100), summary_reason (string).`,
          },
        ],
      },
    })
  }

  /**
   * Detect near real-time spikes for a given treatment keyword by grounding
   * the Gemini model with Google Search.
   */
  async detectRegionalSpikes(keyword: string): Promise<RegionalSpikeInsight> {
    try {
      const prompt = `Treatment keyword: ${keyword}
Use fresh search/news data from the last 24 hours to find regional spikes.
If no spike is detected, return spike_detected: false and empty target_cities.`

      const response = await this.spikeModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      })

      const textResponse =
        response.response?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || '')
          .join('')
          .trim() || ''

      if (!textResponse) {
        throw new Error('Vertex AI returned an empty response')
      }

      return JSON.parse(textResponse) as RegionalSpikeInsight
    } catch (error) {
      console.error('detectRegionalSpikes error:', error)
      throw error
    }
  }

  /**
   * Query macro trends from Google Trends public data (last 30 days),
   * grouped by Designated Market Area (DMA).
   */
  async getMacroTrends(terms: string[]): Promise<MacroTrendRow[]> {
    if (!terms || terms.length === 0) {
      return []
    }

    try {
      const query = `
        SELECT
          dma_name AS dmaName,
          AVG(score) AS averageScore
        FROM \`bigquery-public-data.google_trends.top_terms\`
        WHERE
          refresh_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
          AND term IN UNNEST(@terms)
        GROUP BY dmaName
        ORDER BY averageScore DESC
        LIMIT 10
      `

      const options = {
        query,
        params: { terms },
        // Dataset is in US multi-region.
        location: 'US',
      }

      const [rows] = await this.bigquery.query(options)

      return rows.map((row: any) => ({
        dmaName: row.dmaName as string,
        averageScore: Number(row.averageScore),
      }))
    } catch (error) {
      console.error('getMacroTrends error:', error)
      throw error
    }
  }
}
