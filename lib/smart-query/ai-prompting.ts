/**
 * Smart Query Assistant - AI Prompting Layer
 * 
 * Meta-prompt system for Vertex AI / AI Studio to generate intelligent suggestions.
 * Provides context-aware query recommendations based on tool metadata and user context.
 */

import {
  AISuggestionRequest,
  AISuggestionResponse,
  McpManifestData,
  McpManifestTool,
  QueryHistoryEntry,
  IntentVector,
} from './types'
import { calculateIntentVector } from './suggestion-engine'

// ============================================================================
// Meta-Prompt Templates
// ============================================================================

/**
 * Generate the AI meta-prompt for query suggestions
 */
export function generateAIMetaPrompt(request: AISuggestionRequest): string {
  return `You are the Novalyte™ AI Query Assistant, an expert at helping administrators craft optimized queries for MCP (Model Context Protocol) tools.

## Context
**Tool Description:** ${request.toolDescription}

**Server Metadata:** ${request.serverMetadata}

**Partial Query (user is typing):** "${request.partialQuery}"

**Recent Admin Queries (for context):**
${request.pastQueries.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Available Datasets:**
${request.availableDatasets.map(d => `- ${d}`).join('\n')}

## Task
Analyze the tool description, server metadata, and partial query to generate ${request.maxSuggestions || 8} optimized admin query suggestions.

## Requirements
1. Each suggestion must be:
   - Short, actionable, and specific (max 80 characters)
   - Directly usable with the current MCP tool
   - Relevant to healthcare/wellness/clinic operations (Novalyte domain)
   
2. Consider:
   - What data the tool can access
   - Common admin use cases (demand analysis, clinic performance, staffing)
   - The user's apparent intent from the partial query
   - Patterns from their recent queries

3. For each suggestion, provide:
   - The query text
   - A confidence score (0-1) based on relevance
   - Brief reasoning (optional)

4. Also suggest 1-3 relevant datasets that would provide supporting data.

## Output Format (JSON)
{
  "querySuggestions": [
    { "text": "Find TRT demand spikes in Texas last 30 days", "confidence": 0.95, "reasoning": "Matches tool capability + partial query intent" },
    ...
  ],
  "datasetHints": [
    { "name": "demand_signals", "relevance": "Contains regional demand spike data" },
    ...
  ],
  "intentAnalysis": {
    "primaryIntent": "trend_detection",
    "secondaryIntents": ["regional_analysis", "treatment_focus"]
  }
}

Generate the suggestions now:`
}

/**
 * Generate context-aware system prompt for AI
 */
export function generateSystemPrompt(): string {
  return `You are an expert Novalyte™ AI Query Assistant embedded in the admin console.

Your role:
- Help administrators craft optimized queries for MCP tools
- Understand healthcare/wellness business context
- Suggest queries that maximize data insights
- Guide users toward actionable intelligence

Domain expertise:
- TRT (Testosterone Replacement Therapy) clinics
- GLP-1 / Semaglutide weight loss treatments
- Peptide therapies and IV therapy
- Clinic pipeline and lead generation
- Workforce scheduling and staff matching
- Regional market analysis and competitor intelligence

Always:
- Be concise and actionable
- Suggest queries the tool can actually execute
- Consider data freshness and availability
- Prioritize high-impact insights`
}

// ============================================================================
// AI Request Builder
// ============================================================================

/**
 * Build AI suggestion request from context
 */
export function buildAISuggestionRequest(
  tool: McpManifestTool | null,
  manifest: McpManifestData | null,
  partialQuery: string,
  pastQueries: QueryHistoryEntry[],
  datasets: string[]
): AISuggestionRequest {
  const toolDescription = tool?.description || 'Unknown MCP tool'
  
  const serverMetadata = manifest
    ? `Server: ${manifest.serverName}\nDomain: ${manifest.domain || 'general'}\nDescription: ${manifest.description}`
    : 'No server metadata available'

  return {
    toolDescription,
    serverMetadata,
    partialQuery,
    pastQueries: pastQueries.slice(0, 10).map(q => q.query),
    availableDatasets: datasets,
    maxSuggestions: 8,
  }
}

/**
 * Parse AI response into structured suggestions
 */
export function parseAISuggestionResponse(rawResponse: string): AISuggestionResponse | null {
  try {
    // Try to extract JSON from response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate structure
    if (!parsed.querySuggestions || !Array.isArray(parsed.querySuggestions)) {
      return null
    }

    return {
      querySuggestions: parsed.querySuggestions.map((s: any) => ({
        text: String(s.text || ''),
        confidence: Number(s.confidence) || 0.5,
        reasoning: s.reasoning,
      })),
      datasetHints: (parsed.datasetHints || []).map((d: any) => ({
        name: String(d.name || ''),
        relevance: String(d.relevance || ''),
      })),
      intentAnalysis: parsed.intentAnalysis,
    }
  } catch (error) {
    console.error('Failed to parse AI suggestion response:', error)
    return null
  }
}

// ============================================================================
// Tool-Specific AI Prompts
// ============================================================================

const TOOL_SPECIFIC_PROMPTS: Record<string, string> = {
  get_clinic_pipeline: `Focus on clinic performance queries:
- Pipeline stage analysis (leads → assessments → patients)
- Conversion rate optimization
- Regional clinic comparisons
- Revenue opportunity identification`,

  get_regional_demand_spikes: `Focus on demand detection queries:
- Regional spike identification
- Treatment-specific demand surges
- Temporal analysis (24h, 7d, 30d)
- Opportunity scoring and prioritization`,

  get_competitor_density: `Focus on competitive analysis queries:
- Market saturation assessment
- Blue-ocean opportunity finding
- Competitor positioning
- Regional competitive dynamics`,

  find_available_staff: `Focus on workforce queries:
- Staff availability by region
- Skill and certification matching
- Schedule optimization
- Coverage gap identification`,

  market_spike_detector: `Focus on market opportunity queries:
- Early demand signal detection
- Multi-city comparison
- CPC and ad density analysis
- Immediate monetization opportunities`,
}

/**
 * Get tool-specific prompt enhancement
 */
export function getToolSpecificPrompt(toolName: string): string {
  return TOOL_SPECIFIC_PROMPTS[toolName] || ''
}

// ============================================================================
// Intent-Based Prompt Enhancement
// ============================================================================

/**
 * Enhance prompt based on detected intent
 */
export function enhancePromptWithIntent(
  basePrompt: string,
  intentVector: IntentVector
): string {
  const topIntents = Object.entries(intentVector)
    .filter(([, score]) => score > 0.3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([intent]) => intent)

  if (topIntents.length === 0) {
    return basePrompt
  }

  const intentGuidance = topIntents.map(intent => {
    switch (intent) {
      case 'region':
        return 'User is focused on regional/geographic analysis. Suggest location-specific queries.'
      case 'treatment':
        return 'User is interested in treatment-specific data. Suggest treatment-focused queries.'
      case 'time':
        return 'User wants temporal analysis. Suggest time-based queries with lookback windows.'
      case 'comparison':
        return 'User wants comparative analysis. Suggest vs/comparison queries.'
      case 'ranking':
        return 'User wants ranked results. Suggest top-N and best/worst queries.'
      case 'trend':
        return 'User is tracking trends. Suggest trend and momentum queries.'
      case 'alert':
        return 'User needs alerts/gaps. Suggest threshold and anomaly queries.'
      default:
        return ''
    }
  }).filter(Boolean).join('\n')

  return `${basePrompt}

## Detected Intent
The user appears to be interested in: ${topIntents.join(', ')}

${intentGuidance}

Prioritize suggestions that align with these intents.`
}

// ============================================================================
// API Call Function (for Vertex AI)
// ============================================================================

/**
 * Call Vertex AI for intelligent suggestions
 */
export async function fetchAISuggestions(
  request: AISuggestionRequest,
  toolName?: string
): Promise<AISuggestionResponse | null> {
  try {
    const intentVector = calculateIntentVector(request.partialQuery)
    let prompt = generateAIMetaPrompt(request)
    
    // Add tool-specific guidance
    if (toolName) {
      const toolPrompt = getToolSpecificPrompt(toolName)
      if (toolPrompt) {
        prompt = `${prompt}\n\n## Tool-Specific Guidance\n${toolPrompt}`
      }
    }
    
    // Enhance with intent
    prompt = enhancePromptWithIntent(prompt, intentVector)

    const response = await fetch('/api/admin/mcp/vertex/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'DATA_ANALYST',
        messages: [
          { role: 'system', content: generateSystemPrompt() },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      console.error('AI suggestion request failed:', response.status)
      return null
    }

    const data = await response.json()
    return parseAISuggestionResponse(data.reply)
  } catch (error) {
    console.error('Failed to fetch AI suggestions:', error)
    return null
  }
}

// ============================================================================
// Batch Suggestion Generation
// ============================================================================

/**
 * Generate batch suggestions for a tool (for preloading)
 */
export function generateBatchPrompt(
  tool: McpManifestTool,
  manifest: McpManifestData
): string {
  return `Generate 20 diverse, high-quality query suggestions for the following MCP tool:

## Tool Details
**Name:** ${tool.name}
**Description:** ${tool.description}
**Server:** ${manifest.serverName}
**Domain:** ${manifest.domain || 'general'}

## Input Parameters
${Object.entries(tool.inputSchema || {}).map(([key, param]) => 
  `- **${key}** (${param.type}${param.required ? ', required' : ''}): ${param.description || 'No description'}`
).join('\n')}

## Requirements
Generate 20 suggestions across these categories:
1. **Basic queries** (5) - Simple, common use cases
2. **Advanced queries** (5) - Complex, multi-parameter queries
3. **Regional queries** (3) - Location-focused
4. **Treatment queries** (3) - Treatment-specific
5. **Time-based queries** (2) - Temporal analysis
6. **Ranking queries** (2) - Top-N, best/worst

Each suggestion should be immediately usable and relevant to healthcare/wellness operations.

Output as JSON array of { text, category, confidence } objects.`
}
