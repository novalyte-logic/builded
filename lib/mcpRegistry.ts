/**
 * MCP Registry Module
 * 
 * Central registry of MCP servers, tools, and prompt templates.
 * This serves as the single source of truth for MCP metadata.
 */

export type McpServer = {
  id: string
  label: string
  description: string
  region: string
  status: 'LIVE' | 'DEGRADED' | 'DOWN'
}

export type McpTool = {
  name: string
  description: string
  serverId: string
  scope: 'read' | 'write' | 'admin'
  typicalInputs?: string[]
  typicalOutputs?: string[]
}

export type McpPromptTemplate = {
  toolName: string
  label: string
  prompt: string
}

export const mcpServers: McpServer[] = [
  {
    id: 'dealflow-mcp',
    label: 'Dealflow Server',
    description: 'Pipeline, clinic ranking, dealflow intelligence',
    region: 'us-central1',
    status: 'LIVE',
  },
  {
    id: 'market-intel-mcp',
    label: 'Market Intelligence Server',
    description: 'Regional trends, competitor density, treatment heatmaps',
    region: 'us-central1',
    status: 'LIVE',
  },
  {
    id: 'workforce-mcp',
    label: 'Workforce Server',
    description: 'Staff availability, shift matching, credential matching',
    region: 'us-central1',
    status: 'LIVE',
  },
  {
    id: 'demand-intel-mcp',
    label: 'Demand Intelligence Server',
    description: 'Treatment demand surges, intent signals, category heat',
    region: 'us-central1',
    status: 'DEGRADED',
  },
  {
    id: 'bigquery-mcp',
    label: 'BigQuery Data Server',
    description: 'SQL access to Novalyte datasets',
    region: 'us-central1',
    status: 'LIVE',
  },
  {
    id: 'postgresql-mcp',
    label: 'PostgreSQL Data Server',
    description: 'Transactional DB access for clinic + patient ops',
    region: 'us-central1',
    status: 'LIVE',
  },
]

export const mcpTools: McpTool[] = [
  {
    name: 'get_clinic_pipeline',
    description: 'Retrieve clinic pipeline data with opportunity scoring',
    serverId: 'dealflow-mcp',
    scope: 'read',
  },
  {
    name: 'get_regional_demand_spikes',
    description: 'Detect demand spikes across regions & treatments',
    serverId: 'dealflow-mcp',
    scope: 'read',
  },
  {
    name: 'rank_clinics_by_opportunity',
    description: 'Rank clinics by revenue opportunity score',
    serverId: 'dealflow-mcp',
    scope: 'read',
  },
  {
    name: 'fetch_market_trends',
    description: 'Fetch macro trends for TRT, peptides, GLP-1',
    serverId: 'market-intel-mcp',
    scope: 'read',
  },
  {
    name: 'get_competitor_density',
    description: 'Analyze competitor saturation by city/region',
    serverId: 'market-intel-mcp',
    scope: 'read',
  },
  {
    name: 'find_available_staff',
    description: 'Find staff by availability and skill match',
    serverId: 'workforce-mcp',
    scope: 'read',
  },
  {
    name: 'match_shifts_to_staff',
    description: 'Assign staff to shifts',
    serverId: 'workforce-mcp',
    scope: 'write',
  },
  {
    name: 'get_treatment_trend_overview',
    description: 'High-level category demand trends',
    serverId: 'demand-intel-mcp',
    scope: 'read',
  },
  {
    name: 'get_intent_signals',
    description: 'Extract patient intent signals from behavior/search',
    serverId: 'demand-intel-mcp',
    scope: 'read',
  },
]

export const mcpPromptTemplates: McpPromptTemplate[] = [
  {
    toolName: 'get_regional_demand_spikes',
    label: 'TRT – Find hottest money cities',
    prompt:
      'Use `get_regional_demand_spikes` to fetch TRT demand surges in US metros. Return top cities, 7d growth, 24h spike, CPC estimates, and which cities are best for immediate lead reselling.',
  },
  {
    toolName: 'get_competitor_density',
    label: 'Blue-Ocean City Finder',
    prompt:
      'Use `get_competitor_density` to find US cities where TRT demand is high but clinic competitors are low. Return ranked table with density, opportunity label, and recommendation.',
  },
  {
    toolName: 'fetch_market_trends',
    label: "Men's Health Macro Trend Analyzer",
    prompt:
      'Use `fetch_market_trends` to analyze TRT, GLP-1, peptides over 7d, 30d, 90d. Return heatmap and recommended service to push for revenue.',
  },
  {
    toolName: 'get_clinic_pipeline',
    label: 'Pipeline Health Overview',
    prompt:
      'Use `get_clinic_pipeline` to pull all clinic pipelines and return the top 3 revenue opportunities.',
  },
]

/**
 * Helper functions to query the registry
 */
export function getServerById(serverId: string): McpServer | undefined {
  return mcpServers.find((s) => s.id === serverId)
}

export function getToolsByServer(serverId: string): McpTool[] {
  return mcpTools.filter((t) => t.serverId === serverId)
}

export function getToolByName(toolName: string): McpTool | undefined {
  return mcpTools.find((t) => t.name === toolName)
}

export function getPromptTemplatesByTool(toolName: string): McpPromptTemplate[] {
  return mcpPromptTemplates.filter((t) => t.toolName === toolName)
}

