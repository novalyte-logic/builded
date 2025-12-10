/**
 * Smart Query Assistant - Suggestion Engine
 * 
 * Core logic for generating intelligent query suggestions based on:
 * - MCP server manifests
 * - Tool descriptions and schemas
 * - Query history
 * - Dataset catalogs
 * - Real-time query intent analysis
 */

import {
  QuerySuggestion,
  DatasetSuggestion,
  IntentVector,
  SmartQueryEngineProps,
  McpManifestData,
  McpManifestTool,
  QueryHistoryEntry,
  DatasetCatalogEntry,
  KeywordDatasetMap,
  QueryPatternTemplate,
  AISuggestionRequest,
} from './types'

// ============================================================================
// Intent Vector Calculation
// ============================================================================

const INTENT_KEYWORDS: Record<keyof IntentVector, string[]> = {
  region: [
    'region', 'city', 'state', 'area', 'location', 'zip', 'metro', 'market',
    'texas', 'florida', 'california', 'arizona', 'colorado', 'new york',
    'los angeles', 'miami', 'dallas', 'houston', 'austin', 'denver', 'phoenix',
    'where', 'which city', 'which state', 'geographic'
  ],
  treatment: [
    'trt', 'testosterone', 'glp-1', 'semaglutide', 'wegovy', 'ozempic',
    'peptide', 'iv therapy', 'weight loss', 'hormone', 'hrt', 'wellness',
    'treatment', 'therapy', 'procedure', 'service', 'offering'
  ],
  time: [
    'last', 'days', 'weeks', 'months', 'year', 'today', 'yesterday', 'week',
    'month', 'quarter', 'ytd', 'mtd', 'wtd', 'period', 'since', 'before',
    'after', 'between', 'from', 'to', 'recent', 'historical', 'trending'
  ],
  comparison: [
    'vs', 'versus', 'compare', 'comparison', 'difference', 'against',
    'better', 'worse', 'higher', 'lower', 'more', 'less', 'between'
  ],
  ranking: [
    'top', 'best', 'worst', 'highest', 'lowest', 'rank', 'ranking',
    'leading', 'trailing', 'first', 'last', 'most', 'least', 'greatest',
    'minimum', 'maximum', 'hottest', 'coldest'
  ],
  trend: [
    'trend', 'trending', 'growth', 'decline', 'spike', 'surge', 'drop',
    'increase', 'decrease', 'change', 'movement', 'direction', 'momentum',
    'velocity', 'acceleration', 'pattern', 'trajectory'
  ],
  alert: [
    'alert', 'warning', 'critical', 'urgent', 'gap', 'shortage', 'issue',
    'problem', 'concern', 'risk', 'opportunity', 'signal', 'anomaly',
    'deviation', 'exception', 'threshold', 'breach'
  ],
}

/**
 * Calculate intent vector from query text
 */
export function calculateIntentVector(query: string): IntentVector {
  const normalizedQuery = query.toLowerCase()
  const vector: IntentVector = {
    region: 0,
    treatment: 0,
    time: 0,
    comparison: 0,
    ranking: 0,
    trend: 0,
    alert: 0,
  }

  // Calculate raw scores
  const scores: Record<keyof IntentVector, number> = { ...vector }
  
  Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
    keywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) {
        scores[intent as keyof IntentVector] += 1
      }
    })
  })

  // Normalize scores to 0-1 range
  const maxScore = Math.max(...Object.values(scores), 1)
  Object.keys(scores).forEach(intent => {
    vector[intent as keyof IntentVector] = scores[intent as keyof IntentVector] / maxScore
  })

  return vector
}

// ============================================================================
// Keyword → Dataset Mapping
// ============================================================================

const KEYWORD_DATASET_MAPS: KeywordDatasetMap[] = [
  {
    keywords: ['region', 'city', 'state', 'metro', 'zip', 'geographic', 'where'],
    datasets: ['geo_trends', 'demand_by_zip', 'regional_demand', 'city_metrics'],
    intentType: 'region',
  },
  {
    keywords: ['competitor', 'competition', 'density', 'saturation', 'market share'],
    datasets: ['clinic_competition', 'vendor_density', 'competitor_analysis', 'market_saturation'],
    intentType: 'comparison',
  },
  {
    keywords: ['treatment', 'trt', 'glp-1', 'peptide', 'therapy', 'service'],
    datasets: ['treatment_trends', 'service_demand', 'procedure_analytics', 'treatment_funnel'],
    intentType: 'treatment',
  },
  {
    keywords: ['trend', 'spike', 'surge', 'growth', 'decline', 'momentum'],
    datasets: ['demand_signals', 'trend_analysis', 'spike_detection', 'momentum_tracker'],
    intentType: 'trend',
  },
  {
    keywords: ['clinic', 'pipeline', 'lead', 'patient', 'conversion', 'funnel'],
    datasets: ['clinic_pipeline', 'lead_funnel', 'patient_journey', 'conversion_metrics'],
    intentType: 'ranking',
  },
  {
    keywords: ['staff', 'workforce', 'nurse', 'provider', 'shift', 'schedule'],
    datasets: ['staff_availability', 'shift_matching', 'credential_registry', 'staffing_gaps'],
    intentType: 'alert',
  },
  {
    keywords: ['revenue', 'ltv', 'arpu', 'profit', 'margin', 'cost'],
    datasets: ['revenue_analytics', 'ltv_cohorts', 'clinic_revenue_daily', 'profitability'],
    intentType: 'ranking',
  },
  {
    keywords: ['ad', 'ads', 'creative', 'campaign', 'cpc', 'ctr', 'roas'],
    datasets: ['ads_metrics', 'creative_performance', 'campaign_analytics', 'ad_spend'],
    intentType: 'trend',
  },
]

/**
 * Get relevant datasets based on query content
 */
export function getRelevantDatasets(
  query: string,
  catalog: DatasetCatalogEntry[]
): DatasetSuggestion[] {
  const normalizedQuery = query.toLowerCase()
  const suggestions: DatasetSuggestion[] = []

  // First, check keyword maps
  KEYWORD_DATASET_MAPS.forEach(map => {
    const matchedKeywords = map.keywords.filter(kw => normalizedQuery.includes(kw))
    if (matchedKeywords.length > 0) {
      map.datasets.forEach(datasetName => {
        const catalogEntry = catalog.find(
          c => c.name === datasetName || c.tables.some(t => t.name === datasetName)
        )
        
        if (catalogEntry) {
          const existing = suggestions.find(s => s.id === catalogEntry.id)
          if (existing) {
            existing.relevanceScore += matchedKeywords.length * 0.2
            existing.matchedTerms.push(...matchedKeywords)
          } else {
            suggestions.push({
              id: catalogEntry.id,
              name: catalogEntry.name,
              description: catalogEntry.description,
              tables: catalogEntry.tables.map(t => t.name),
              relevanceScore: matchedKeywords.length * 0.3,
              matchedTerms: matchedKeywords,
            })
          }
        }
      })
    }
  })

  // Also check catalog keywords directly
  catalog.forEach(entry => {
    const matchedKeywords = entry.keywords.filter(kw => normalizedQuery.includes(kw.toLowerCase()))
    if (matchedKeywords.length > 0) {
      const existing = suggestions.find(s => s.id === entry.id)
      if (existing) {
        existing.relevanceScore += matchedKeywords.length * 0.15
        existing.matchedTerms = [...new Set([...existing.matchedTerms, ...matchedKeywords])]
      } else {
        suggestions.push({
          id: entry.id,
          name: entry.name,
          description: entry.description,
          tables: entry.tables.map(t => t.name),
          relevanceScore: matchedKeywords.length * 0.25,
          matchedTerms: matchedKeywords,
        })
      }
    }
  })

  // Sort by relevance and dedupe matched terms
  return suggestions
    .map(s => ({ ...s, matchedTerms: [...new Set(s.matchedTerms)] }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
}

// ============================================================================
// Query Pattern Templates
// ============================================================================

const QUERY_PATTERNS: QueryPatternTemplate[] = [
  {
    pattern: /^(find|show|get|list)\s*(top|best|highest)/i,
    template: 'Find top {N} {entity} by {metric}',
    intentTypes: ['ranking'],
    suggestedDatasets: ['clinic_pipeline', 'treatment_trends'],
  },
  {
    pattern: /\b(trend|trending)\b/i,
    template: 'Show {treatment} trends in {region} last {N} days',
    intentTypes: ['trend', 'treatment', 'time'],
    suggestedDatasets: ['demand_signals', 'treatment_trends'],
  },
  {
    pattern: /\b(spike|surge)\b/i,
    template: 'Detect {treatment} demand spikes in {region}',
    intentTypes: ['trend', 'alert', 'region'],
    suggestedDatasets: ['spike_detection', 'demand_signals'],
  },
  {
    pattern: /\b(competitor|competition)\b/i,
    template: 'Analyze competitor density in {region}',
    intentTypes: ['comparison', 'region'],
    suggestedDatasets: ['clinic_competition', 'vendor_density'],
  },
  {
    pattern: /\b(staff|workforce|nurse)\b/i,
    template: 'Find available {role} staff in {region}',
    intentTypes: ['alert', 'region'],
    suggestedDatasets: ['staff_availability', 'credential_registry'],
  },
]

/**
 * Get matching query patterns for the current input
 */
export function getMatchingPatterns(query: string): QueryPatternTemplate[] {
  return QUERY_PATTERNS.filter(p => p.pattern.test(query))
}

// ============================================================================
// Manifest Parsing
// ============================================================================

/**
 * Parse MCP manifest to extract suggestion-relevant data
 */
export function parseManifestForSuggestions(manifest: McpManifestData): {
  toolSuggestions: string[]
  inputHints: string[]
  outputDescriptions: string[]
} {
  const toolSuggestions: string[] = []
  const inputHints: string[] = []
  const outputDescriptions: string[] = []

  manifest.tools.forEach(tool => {
    // Add tool description as potential suggestion basis
    toolSuggestions.push(tool.description)

    // Extract input parameter hints
    Object.entries(tool.inputSchema || {}).forEach(([key, param]) => {
      if (param.description) {
        inputHints.push(`${key}: ${param.description}`)
      }
      if (param.examples) {
        inputHints.push(...param.examples)
      }
      if (param.enum) {
        inputHints.push(...param.enum)
      }
    })

    // Add sample queries if available
    if (tool.sampleQueries) {
      toolSuggestions.push(...tool.sampleQueries)
    }
  })

  return { toolSuggestions, inputHints, outputDescriptions }
}

// ============================================================================
// Suggestion Generation
// ============================================================================

/**
 * Generate query suggestions based on all available context
 */
export function generateSuggestions(props: SmartQueryEngineProps, currentQuery: string): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = []
  const normalizedQuery = currentQuery.toLowerCase().trim()
  const intentVector = calculateIntentVector(currentQuery)

  // 1. History-based suggestions (most relevant first)
  const historyBasedSuggestions = generateHistorySuggestions(
    normalizedQuery,
    props.pastQueries,
    props.selectedMcpServer,
    props.selectedTool
  )
  suggestions.push(...historyBasedSuggestions)

  // 2. Manifest-based suggestions
  if (props.serverManifest && props.selectedTool) {
    const tool = props.serverManifest.tools.find(t => t.name === props.selectedTool)
    if (tool) {
      const manifestSuggestions = generateManifestSuggestions(tool, normalizedQuery, intentVector)
      suggestions.push(...manifestSuggestions)
    }
  }

  // 3. Pattern-based suggestions
  const patternSuggestions = generatePatternSuggestions(normalizedQuery, intentVector, props.selectedTool)
  suggestions.push(...patternSuggestions)

  // 4. Fallback suggestions (when no metadata available)
  if (suggestions.length < 3 && props.selectedTool) {
    const fallbackSuggestions = generateFallbackSuggestions(
      props.selectedTool,
      props.selectedMcpServer,
      normalizedQuery
    )
    suggestions.push(...fallbackSuggestions)
  }

  // Deduplicate and sort by confidence
  const uniqueSuggestions = deduplicateSuggestions(suggestions)
  return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 10)
}

/**
 * Generate suggestions from query history
 */
function generateHistorySuggestions(
  query: string,
  history: QueryHistoryEntry[],
  serverId: string | null,
  toolName: string | null
): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = []

  // Filter relevant history entries
  const relevantHistory = history.filter(entry => {
    // Prioritize same server/tool
    const serverMatch = !serverId || entry.serverId === serverId
    const toolMatch = !toolName || entry.toolName === toolName
    const queryMatch = !query || entry.query.toLowerCase().includes(query)
    return (serverMatch || toolMatch) && (queryMatch || entry.success)
  })

  // Take last 10 relevant entries
  relevantHistory.slice(0, 10).forEach((entry, index) => {
    const matchScore = query ? (entry.query.toLowerCase().includes(query) ? 0.3 : 0) : 0
    const recencyScore = (10 - index) / 10 * 0.3
    const successScore = entry.success ? 0.2 : 0
    const contextScore = (entry.serverId === serverId ? 0.1 : 0) + (entry.toolName === toolName ? 0.1 : 0)

    suggestions.push({
      id: `history-${entry.id}`,
      text: entry.query,
      category: 'query',
      confidence: Math.min(matchScore + recencyScore + successScore + contextScore, 1),
      source: 'history',
      metadata: {
        toolName: entry.toolName,
      },
    })
  })

  return suggestions
}

/**
 * Generate suggestions from tool manifest
 */
function generateManifestSuggestions(
  tool: McpManifestTool,
  query: string,
  intentVector: IntentVector
): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = []
  const { toolSuggestions, inputHints } = parseManifestForSuggestions({
    serverId: '',
    serverName: '',
    description: '',
    tools: [tool],
  })

  // Generate suggestions based on input schema
  const inputParams = Object.entries(tool.inputSchema || {})
  
  // Create template suggestions
  const templates = generateTemplatesFromSchema(tool.name, inputParams, intentVector)
  templates.forEach((template, index) => {
    suggestions.push({
      id: `manifest-template-${index}`,
      text: template,
      category: 'template',
      confidence: 0.7 - (index * 0.05),
      source: 'manifest',
      metadata: {
        toolName: tool.name,
        intentVector,
      },
    })
  })

  return suggestions
}

/**
 * Generate template suggestions from input schema
 */
function generateTemplatesFromSchema(
  toolName: string,
  inputParams: [string, { type: string; description?: string; examples?: string[] }][],
  intentVector: IntentVector
): string[] {
  const templates: string[] = []
  
  // Tool-specific template generation
  const toolTemplates = TOOL_SUGGESTION_TEMPLATES[toolName] || []
  templates.push(...toolTemplates)

  // Dynamic templates based on intent
  const primaryIntent = Object.entries(intentVector)
    .sort(([, a], [, b]) => b - a)[0]?.[0]

  if (primaryIntent) {
    const intentTemplates = INTENT_BASED_TEMPLATES[primaryIntent as keyof IntentVector] || []
    templates.push(...intentTemplates)
  }

  return templates.slice(0, 5)
}

/**
 * Generate pattern-based suggestions
 */
function generatePatternSuggestions(
  query: string,
  intentVector: IntentVector,
  toolName: string | null
): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = []
  const matchingPatterns = getMatchingPatterns(query)

  matchingPatterns.forEach((pattern, index) => {
    suggestions.push({
      id: `pattern-${index}`,
      text: pattern.template,
      category: 'autocomplete',
      confidence: 0.6 - (index * 0.1),
      source: 'pattern',
      metadata: {
        intentVector,
        matchedKeywords: pattern.intentTypes,
        datasetHint: pattern.suggestedDatasets[0],
      },
    })
  })

  return suggestions
}

/**
 * Generate fallback suggestions when no metadata available
 */
function generateFallbackSuggestions(
  toolName: string,
  serverId: string | null,
  query: string
): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = []
  
  // Infer from tool name
  const toolWords = toolName.replace(/_/g, ' ').split(' ')
  const inferredCategory = toolWords.find(w => 
    ['get', 'find', 'list', 'rank', 'match', 'alert', 'detect'].includes(w)
  )
  const inferredEntity = toolWords.filter(w => 
    !['get', 'find', 'list', 'rank', 'match', 'alert', 'detect'].includes(w)
  ).join(' ')

  // Generate basic suggestions
  const basicTemplates = [
    `${inferredCategory || 'Get'} ${inferredEntity} for Texas`,
    `${inferredCategory || 'Show'} top 10 ${inferredEntity}`,
    `${inferredCategory || 'Find'} ${inferredEntity} last 30 days`,
    `${inferredCategory || 'Analyze'} ${inferredEntity} trends`,
    `${inferredCategory || 'List'} all ${inferredEntity} by region`,
  ]

  basicTemplates.forEach((template, index) => {
    suggestions.push({
      id: `fallback-${index}`,
      text: template,
      category: 'template',
      confidence: 0.4 - (index * 0.05),
      source: 'pattern',
      metadata: {
        toolName,
      },
    })
  })

  return suggestions
}

/**
 * Deduplicate suggestions by text similarity
 */
function deduplicateSuggestions(suggestions: QuerySuggestion[]): QuerySuggestion[] {
  const seen = new Set<string>()
  return suggestions.filter(s => {
    const normalized = s.text.toLowerCase().trim()
    if (seen.has(normalized)) {
      return false
    }
    seen.add(normalized)
    return true
  })
}

// ============================================================================
// Tool-Specific Templates
// ============================================================================

const TOOL_SUGGESTION_TEMPLATES: Record<string, string[]> = {
  get_clinic_pipeline: [
    'Show clinic pipeline for Texas TRT clinics',
    'Get top 25 converting clinics in Florida',
    'Find GLP-1 clinic opportunities in California',
    'List clinics with assessment conversion > 50%',
    'Show pipeline stages for all Texas clinics last 30 days',
  ],
  get_regional_demand_spikes: [
    'Find TRT demand spikes in Texas last 30 days',
    'Detect GLP-1 surges in Florida metros',
    'Show treatment demand hotspots in Arizona',
    'Alert me to any demand spikes above 1.5x baseline',
    'Map semaglutide demand spikes across US',
  ],
  rank_clinics_by_opportunity: [
    'Rank clinics by revenue opportunity in Texas',
    'Find highest-potential TRT clinics',
    'Show top 10 GLP-1 clinic opportunities',
    'Rank all clinics by conversion potential',
    'List best clinics for lead reselling',
  ],
  get_treatment_trend_map: [
    'Show TRT trends across all regions last 90 days',
    'Map GLP-1 treatment growth by state',
    'Get weekly trend data for peptides',
    'Compare treatment trends Texas vs Florida',
    'Show monthly trend heatmap for all treatments',
  ],
  get_competitor_density: [
    'Show top 5 competitor density hotspots',
    'Find low-competition TRT markets',
    'Analyze competitor saturation in Miami',
    'Map competitor density for GLP-1 services',
    'Show blue-ocean opportunities by region',
  ],
  find_available_staff: [
    'Find available RNs in Texas',
    'Show NPs with TRT certification',
    'List staff available next week in Florida',
    'Find GLP-1 certified providers in California',
    'Show all available clinical staff by region',
  ],
  match_shifts_to_staff: [
    'Match open shifts to available staff',
    'Find best staff matches for weekend shifts',
    'Auto-assign TRT clinic shifts',
    'Match high-priority gaps to qualified staff',
    'Optimize shift coverage for next week',
  ],
  market_spike_detector: [
    'Find TRT demand spikes across US cities',
    'Show hottest markets for immediate targeting',
    'Detect early treatment demand surges',
    'Map spike intensity by metro area',
    'Alert on high-opportunity spikes',
  ],
  trt_spike_locator: [
    'Find hottest TRT cities this week',
    'Show best region for lead monetization',
    'Analyze competitor ad activity by region',
    'Get 7-day action plan for top market',
    'Compare TRT demand Texas vs Florida vs California',
  ],
}

const INTENT_BASED_TEMPLATES: Record<keyof IntentVector, string[]> = {
  region: [
    'Show data for {region}',
    'Compare {region_a} vs {region_b}',
    'Find opportunities in {metro_area}',
  ],
  treatment: [
    'Analyze {treatment} trends',
    'Show {treatment} demand by region',
    'Compare {treatment_a} vs {treatment_b} performance',
  ],
  time: [
    'Show data for last {N} days',
    'Compare this week vs last week',
    'Show monthly trend for last quarter',
  ],
  comparison: [
    'Compare {entity_a} vs {entity_b}',
    'Show side-by-side analysis',
    'Rank by {metric} difference',
  ],
  ranking: [
    'Show top {N} by {metric}',
    'Rank all {entities} by opportunity',
    'Find best performing {entity}',
  ],
  trend: [
    'Show {metric} trend over time',
    'Detect trend changes in {entity}',
    'Project future {metric} based on trend',
  ],
  alert: [
    'Alert on {metric} threshold breach',
    'Show all active {entity} gaps',
    'Find urgent {entity} issues',
  ],
}

// ============================================================================
// Export Utility Functions
// ============================================================================

export {
  calculateIntentVector,
  getRelevantDatasets,
  getMatchingPatterns,
  parseManifestForSuggestions,
  generateSuggestions,
}
