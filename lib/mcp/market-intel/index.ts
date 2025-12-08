/**
 * Novalyte Market Intelligence MCP Server
 * 
 * Exposes four tools for market analysis:
 * 1. bigquery_region_demand - Query regional demand metrics
 * 2. bigquery_clinic_search - Search and filter clinics
 * 3. google_trends_service_line_interest - Fetch Google Trends data
 * 4. vertex_market_brain - AI-powered market intelligence analysis
 */

export * from './bigquery-region-demand'
export * from './bigquery-clinic-search'
export * from './google-trends-service-interest'
export * from './vertex-market-brain'
export * from './ads-intel-clinic-activity'
export * from './vertex-clinic-outreach-brain'

export const MCP_SERVER_NAME = 'novalyte-market-intel-mcp'
export const MCP_SERVER_VERSION = '1.1.0'

/**
 * All available MCP tools
 */
export const MCP_TOOLS = [
  'bigquery_region_demand',
  'bigquery_clinic_search',
  'google_trends_service_line_interest',
  'vertex_market_brain',
  'ads_intel_clinic_activity',
  'vertex_clinic_outreach_brain',
] as const

export type MCPTool = typeof MCP_TOOLS[number]

