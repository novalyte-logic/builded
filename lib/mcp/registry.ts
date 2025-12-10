/**
 * MCP Registry
 * 
 * Centralized registry of all MCP servers, tools, and their TypeScript types.
 * This serves as the single source of truth for MCP metadata across the Novalyte™ AI platform.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type McpToolConfig<TInput = unknown, TOutput = unknown> = {
  name: string
  description: string
  inputSchema: {
    // TypeScript-friendly schema representation
    [key: string]: {
      type: string
      required?: boolean
      description?: string
      default?: unknown
    }
  }
  outputSchema?: {
    // Optional output shape description
    [key: string]: {
      type: string
      description?: string
    }
  }
}

export type McpServerDomain = 
  | 'dealflow' 
  | 'marketIntel' 
  | 'workforce' 
  | 'demandIntel' 
  | 'infra'

export type McpServerConfig = {
  id: string // e.g. "novalyte-dealflow-mcp"
  label: string // Human-readable label
  domain: McpServerDomain
  description: string
  tools: Record<string, McpToolConfig>
}

// ============================================================================
// Dealflow MCP Tools
// ============================================================================

const dealflowTools: Record<string, McpToolConfig> = {
  get_clinic_pipeline: {
    name: 'get_clinic_pipeline',
    description: 'Get clinic pipeline data with opportunity scores and revenue potential',
    inputSchema: {
      region: {
        type: 'string',
        required: true,
        description: 'Region to analyze (e.g., "Texas", "Florida")',
      },
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to filter (e.g., ["TRT", "GLP-1"])',
      },
      lookback: {
        type: 'number',
        required: false,
        description: 'Lookback window in days',
        default: 30,
      },
      maxResults: {
        type: 'number',
        required: false,
        description: 'Maximum number of clinics to return',
        default: 25,
      },
    },
    outputSchema: {
      clinics: {
        type: 'array',
        description: 'Array of clinic objects with opportunity scores',
      },
      summary: {
        type: 'object',
        description: 'Summary statistics',
      },
    },
  },
  get_regional_demand_spikes: {
    name: 'get_regional_demand_spikes',
    description: 'Detect regional demand spikes for treatments',
    inputSchema: {
      region: {
        type: 'string',
        required: true,
        description: 'Region to analyze',
      },
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to filter',
      },
      days: {
        type: 'number',
        required: false,
        description: 'Lookback window in days',
        default: 30,
      },
      threshold: {
        type: 'number',
        required: false,
        description: 'Spike threshold multiplier',
        default: 1.5,
      },
    },
    outputSchema: {
      spikes: {
        type: 'array',
        description: 'Array of detected demand spikes',
      },
      summary: {
        type: 'object',
        description: 'Summary of spike detection',
      },
    },
  },
  rank_clinics_by_opportunity: {
    name: 'rank_clinics_by_opportunity',
    description: 'Rank clinics by opportunity score and revenue potential',
    inputSchema: {
      clinics: {
        type: 'array',
        required: true,
        description: 'Array of clinic objects to rank',
      },
      criteria: {
        type: 'object',
        required: false,
        description: 'Ranking criteria weights',
      },
    },
    outputSchema: {
      rankedClinics: {
        type: 'array',
        description: 'Clinics sorted by opportunity score',
      },
    },
  },
}

// ============================================================================
// Market Intelligence MCP Tools
// ============================================================================

const marketIntelTools: Record<string, McpToolConfig> = {
  get_treatment_trend_map: {
    name: 'get_treatment_trend_map',
    description: 'Get treatment trend map across regions with time-series data',
    inputSchema: {
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to analyze',
      },
      region: {
        type: 'string',
        required: false,
        description: 'Region filter (default: "ALL")',
        default: 'ALL',
      },
      days: {
        type: 'number',
        required: false,
        description: 'Lookback window in days',
        default: 90,
      },
      granularity: {
        type: 'string',
        required: false,
        description: 'Time granularity: "daily", "weekly", or "monthly"',
        default: 'weekly',
      },
    },
    outputSchema: {
      trendMap: {
        type: 'array',
        description: 'Time-series trend data points',
      },
      summary: {
        type: 'object',
        description: 'Summary statistics',
      },
    },
  },
  get_competitor_density: {
    name: 'get_competitor_density',
    description: 'Analyze competitor density and market saturation by region',
    inputSchema: {
      region: {
        type: 'string',
        required: true,
        description: 'Region to analyze',
      },
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to filter',
      },
      radius: {
        type: 'number',
        required: false,
        description: 'Search radius in miles',
        default: 50,
      },
    },
    outputSchema: {
      competitors: {
        type: 'array',
        description: 'List of competitors with market share data',
      },
      summary: {
        type: 'object',
        description: 'Market saturation summary',
      },
    },
  },
  list_high_performing_products: {
    name: 'list_high_performing_products',
    description: 'List high-performing products by conversion rate and revenue',
    inputSchema: {
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment categories to filter',
      },
      minConversionRate: {
        type: 'number',
        required: false,
        description: 'Minimum conversion rate threshold',
        default: 0.05,
      },
      timeWindow: {
        type: 'string',
        required: false,
        description: 'Time window (e.g., "30d", "90d")',
        default: '30d',
      },
    },
    outputSchema: {
      products: {
        type: 'array',
        description: 'High-performing products',
      },
      summary: {
        type: 'object',
        description: 'Performance summary',
      },
    },
  },
  market_spike_detector: {
    name: 'market-spike-detector',
    description: 'Detect early TRT demand spikes across U.S. cities using Google Trends, SERP analysis, CPC estimates, intent scoring, and clinic availability data',
    inputSchema: {
      maxCities: {
        type: 'number',
        required: false,
        description: 'Maximum number of cities to return (default: 10)',
        default: 10,
      },
      minTrendPercent: {
        type: 'number',
        required: false,
        description: 'Minimum trend increase percentage to consider (default: 20)',
        default: 20,
      },
    },
    outputSchema: {
      top_cities: {
        type: 'array',
        description: 'Array of cities with spike data including trend_percent, search_volume, cpc, ad_density, intent_score, and clinic_gap',
      },
      recommendation: {
        type: 'string',
        description: 'Strategic recommendation for targeting hot regions',
      },
    },
  },
  trt_spike_locator: {
    name: 'trt_spike_locator',
    description: 'Identify real-time TRT demand spikes across target U.S. regions (Texas, Florida, Arizona, Colorado, California), analyze competitor ad activity, and recommend the best city for immediate lead monetization within 7 days',
    inputSchema: {
      // No input parameters - tool analyzes all target regions automatically
    },
    outputSchema: {
      regions: {
        type: 'array',
        description: 'Array of region data with trend_24h, trend_7d, search_volume, ad_density, competitors_running_ads, cpc_estimate, intent_score, clinic_gap, lead_price_estimate, and why_this_city_is_hot',
      },
      best_region: {
        type: 'string',
        description: 'The top-ranked city/region for immediate targeting',
      },
      recommended_targeting: {
        type: 'string',
        description: 'Strategic recommendation for which city to target this week',
      },
      action_steps_for_next_7_days: {
        type: 'string',
        description: 'Specific actionable steps to start selling leads within 7 days',
      },
    },
  },
}

// ============================================================================
// Workforce MCP Tools
// ============================================================================

const workforceTools: Record<string, McpToolConfig> = {
  find_available_staff: {
    name: 'find_available_staff',
    description: 'Find available staff matching criteria',
    inputSchema: {
      region: {
        type: 'string',
        required: false,
        description: 'Region filter',
      },
      roleType: {
        type: 'string[]',
        required: false,
        description: 'Role types (e.g., ["RN", "NP", "PA"])',
      },
      serviceLine: {
        type: 'string[]',
        required: false,
        description: 'Service lines of interest',
      },
      minExperience: {
        type: 'number',
        required: false,
        description: 'Minimum years of experience',
        default: 0,
      },
    },
    outputSchema: {
      staff: {
        type: 'array',
        description: 'Available staff members',
      },
      summary: {
        type: 'object',
        description: 'Summary statistics',
      },
    },
  },
  match_shifts_to_staff: {
    name: 'match_shifts_to_staff',
    description: 'Match available shifts to qualified staff members',
    inputSchema: {
      shiftIds: {
        type: 'string[]',
        required: true,
        description: 'Array of shift IDs to match',
      },
      region: {
        type: 'string',
        required: false,
        description: 'Region filter for staff search',
      },
      minScore: {
        type: 'number',
        required: false,
        description: 'Minimum compatibility score (0-100)',
        default: 50,
      },
    },
    outputSchema: {
      matches: {
        type: 'array',
        description: 'Matched shifts and staff',
      },
      unmatchedShifts: {
        type: 'array',
        description: 'Shifts that could not be matched',
      },
      summary: {
        type: 'object',
        description: 'Matching summary',
      },
    },
  },
  alert_clinic_staffing_gap: {
    name: 'alert_clinic_staffing_gap',
    description: 'Alert on clinic staffing gaps and urgent needs',
    inputSchema: {
      clinicId: {
        type: 'string',
        required: false,
        description: 'Specific clinic ID (optional)',
      },
      region: {
        type: 'string',
        required: false,
        description: 'Region filter',
      },
      urgency: {
        type: 'string',
        required: false,
        description: 'Urgency level filter: "low", "medium", "high"',
      },
    },
    outputSchema: {
      alerts: {
        type: 'array',
        description: 'Staffing gap alerts',
      },
      summary: {
        type: 'object',
        description: 'Alert summary',
      },
    },
  },
}

// ============================================================================
// Demand Intelligence MCP Tools
// ============================================================================

const demandIntelTools: Record<string, McpToolConfig> = {
  get_treatment_trend_overview: {
    name: 'get_treatment_trend_overview',
    description: 'Get high-level treatment trend overview with projections',
    inputSchema: {
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to analyze',
      },
      region: {
        type: 'string',
        required: false,
        description: 'Region filter',
      },
      days: {
        type: 'number',
        required: false,
        description: 'Lookback window in days',
        default: 30,
      },
    },
    outputSchema: {
      overview: {
        type: 'array',
        description: 'Trend overview data points',
      },
      summary: {
        type: 'object',
        description: 'Summary statistics',
      },
    },
  },
  get_intent_signals: {
    name: 'get_intent_signals',
    description: 'Detect intent signals from search, social, and news trends',
    inputSchema: {
      region: {
        type: 'string',
        required: false,
        description: 'Region filter',
      },
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to filter',
      },
      days: {
        type: 'number',
        required: false,
        description: 'Lookback window in days',
        default: 30,
      },
      minSignalStrength: {
        type: 'number',
        required: false,
        description: 'Minimum signal strength (0-100)',
        default: 50,
      },
    },
    outputSchema: {
      signals: {
        type: 'array',
        description: 'Detected intent signals',
      },
      summary: {
        type: 'object',
        description: 'Signal summary',
      },
    },
  },
  get_regional_demand_spikes: {
    name: 'get_regional_demand_spikes',
    description: 'Detect regional demand spikes (demand-intel flavored version)',
    inputSchema: {
      region: {
        type: 'string',
        required: true,
        description: 'Region to analyze',
      },
      treatment: {
        type: 'string[]',
        required: false,
        description: 'Treatment types to filter',
      },
      days: {
        type: 'number',
        required: false,
        description: 'Lookback window in days',
        default: 30,
      },
      threshold: {
        type: 'number',
        required: false,
        description: 'Spike threshold multiplier',
        default: 1.5,
      },
    },
    outputSchema: {
      spikes: {
        type: 'array',
        description: 'Detected demand spikes',
      },
      summary: {
        type: 'object',
        description: 'Spike summary',
      },
    },
  },
}

// ============================================================================
// Infrastructure MCP Tools (Placeholders)
// ============================================================================

const infraTools: Record<string, McpToolConfig> = {
  // BigQuery MCP
  bigquery_query: {
    name: 'bigquery_query',
    description: 'Execute BigQuery SQL query',
    inputSchema: {
      query: {
        type: 'string',
        required: true,
        description: 'SQL query string',
      },
      dataset: {
        type: 'string',
        required: false,
        description: 'Dataset name',
      },
    },
  },
  // Gmail MCP
  gmail_send: {
    name: 'gmail_send',
    description: 'Send email via Gmail',
    inputSchema: {
      to: {
        type: 'string',
        required: true,
        description: 'Recipient email address',
      },
      subject: {
        type: 'string',
        required: true,
        description: 'Email subject',
      },
      body: {
        type: 'string',
        required: true,
        description: 'Email body',
      },
    },
  },
  // Slack MCP
  slack_send_message: {
    name: 'slack_send_message',
    description: 'Send message to Slack channel',
    inputSchema: {
      channel: {
        type: 'string',
        required: true,
        description: 'Slack channel ID or name',
      },
      message: {
        type: 'string',
        required: true,
        description: 'Message text',
      },
    },
  },
  // Web Search MCP
  web_search: {
    name: 'web_search',
    description: 'Perform web search',
    inputSchema: {
      query: {
        type: 'string',
        required: true,
        description: 'Search query',
      },
      maxResults: {
        type: 'number',
        required: false,
        description: 'Maximum results to return',
        default: 10,
      },
    },
  },
}

// ============================================================================
// MCP Registry
// ============================================================================

export const mcpRegistry: Record<string, McpServerConfig> = {
  'novalyte-dealflow-mcp': {
    id: 'novalyte-dealflow-mcp',
    label: 'Dealflow Intelligence',
    domain: 'dealflow',
    description: 'Clinic discovery, enrichment, and opportunity ranking for dealflow generation',
    tools: dealflowTools,
  },
  'novalyte-market-intel-mcp': {
    id: 'novalyte-market-intel-mcp',
    label: 'Market Intelligence',
    domain: 'marketIntel',
    description: 'Treatment trends, competitor analysis, and market saturation intelligence',
    tools: marketIntelTools,
  },
  'novalyte-workforce-mcp': {
    id: 'novalyte-workforce-mcp',
    label: 'Workforce Exchange',
    domain: 'workforce',
    description: 'Staff availability, shift matching, and staffing gap alerts',
    tools: workforceTools,
  },
  'novalyte-demand-intel-mcp': {
    id: 'novalyte-demand-intel-mcp',
    label: 'Demand Intelligence',
    domain: 'demandIntel',
    description: 'Demand forecasting, intent signals, and regional demand spike detection',
    tools: demandIntelTools,
  },
  // Infrastructure MCPs (shared)
  'bigquery-mcp': {
    id: 'bigquery-mcp',
    label: 'BigQuery',
    domain: 'infra',
    description: 'Google BigQuery data warehouse access',
    tools: {
      bigquery_query: infraTools.bigquery_query,
    },
  },
  'gmail-mcp': {
    id: 'gmail-mcp',
    label: 'Gmail',
    domain: 'infra',
    description: 'Gmail integration for email sending',
    tools: {
      gmail_send: infraTools.gmail_send,
    },
  },
  'slack-mcp': {
    id: 'slack-mcp',
    label: 'Slack',
    domain: 'infra',
    description: 'Slack integration for notifications',
    tools: {
      slack_send_message: infraTools.slack_send_message,
    },
  },
  'web-search-mcp': {
    id: 'web-search-mcp',
    label: 'Web Search',
    domain: 'infra',
    description: 'Web search capabilities',
    tools: {
      web_search: infraTools.web_search,
    },
  },
}

// ============================================================================
// String Literal Union Types
// ============================================================================

export type DealflowToolName = keyof typeof dealflowTools
export type MarketIntelToolName = keyof typeof marketIntelTools
export type WorkforceToolName = keyof typeof workforceTools
export type DemandIntelToolName = keyof typeof demandIntelTools

export type McpServerId = keyof typeof mcpRegistry

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all servers for a given domain
 */
export function getServerByDomain(
  domain: McpServerDomain
): McpServerConfig[] {
  return Object.values(mcpRegistry).filter((server) => server.domain === domain)
}

/**
 * Get server configuration by server ID
 */
export function getServerConfig(serverId: string): McpServerConfig | undefined {
  return mcpRegistry[serverId]
}

/**
 * Get tool configuration for a specific server and tool
 */
export function getToolConfig(
  serverId: string,
  toolName: string
): McpToolConfig | undefined {
  const server = getServerConfig(serverId)
  if (!server) return undefined
  return server.tools[toolName]
}

/**
 * Validate that a tool exists for a server
 */
export function validateTool(serverId: string, toolName: string): boolean {
  const tool = getToolConfig(serverId, toolName)
  return tool !== undefined
}

/**
 * Get all tool names for a server
 */
export function getToolNames(serverId: string): string[] {
  const server = getServerConfig(serverId)
  if (!server) return []
  return Object.keys(server.tools)
}

/**
 * Get all registered server IDs
 */
export function getAllServerIds(): string[] {
  return Object.keys(mcpRegistry)
}

/**
 * Get all servers in a domain as a map
 */
export function getServersByDomainMap(): Record<McpServerDomain, McpServerConfig[]> {
  const result: Record<string, McpServerConfig[]> = {
    dealflow: [],
    marketIntel: [],
    workforce: [],
    demandIntel: [],
    infra: [],
  }

  Object.values(mcpRegistry).forEach((server) => {
    result[server.domain].push(server)
  })

  return result as Record<McpServerDomain, McpServerConfig[]>
}

/**
 * Type-safe MCP tool call helper
 * 
 * @example
 * ```ts
 * const result = await callMcpToolTyped(
 *   'novalyte-dealflow-mcp',
 *   'get_clinic_pipeline',
 *   { region: 'Texas', treatment: ['TRT'] }
 * )
 * ```
 */
export async function callMcpToolTyped<TInput, TOutput>(
  serverId: McpServerId,
  toolName: string,
  input: TInput
): Promise<TOutput> {
  // Validate tool exists
  if (!validateTool(serverId, toolName)) {
    throw new Error(`Tool ${toolName} not found in server ${serverId}`)
  }

  // Import and call the actual MCP client
  const { callMcpTool } = await import('./client')
  return callMcpTool<TInput, TOutput>(serverId, toolName, input)
}

