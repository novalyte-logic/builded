/**
 * Novalyte Market Intelligence MCP Server
 * 
 * Exposes three tools for market analysis:
 * 1. bigquery_region_demand - Query regional demand metrics
 * 2. bigquery_clinic_search - Search and filter clinics
 * 3. vertex_market_brain - AI-powered market intelligence analysis
 */

export * from './bigquery-region-demand'
export * from './bigquery-clinic-search'
export * from './vertex-market-brain'

export const MCP_SERVER_NAME = 'novalyte-market-intel-mcp'
export const MCP_SERVER_VERSION = '1.0.0'

/**
 * All available MCP tools
 */
export const MCP_TOOLS = [
  'bigquery_region_demand',
  'bigquery_clinic_search',
  'vertex_market_brain',
] as const

export type MCPTool = typeof MCP_TOOLS[number]

