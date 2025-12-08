/**
 * Novalyte Dealflow MCP Server
 * 
 * Mission: Give Superadmin REAL DEAL FLOW
 * - Identify men's clinics worth targeting
 * - Detect which ones run ads
 * - Enrich their clinic profiles
 * - Analyze their service lines + funnel gaps
 * - Generate full outreach strategy + first message
 * - Rank clinics by "money potential" (priority scoring)
 */

export * from './find-mens-clinics-by-region'
export * from './enrich-clinic-profile'
export * from './ads-presence-snapshot'
export * from './vertex-outreach-brain'
export * from './export-dealflow-batch'

export const MCP_SERVER_NAME = 'novalyte-dealflow-mcp'
export const MCP_SERVER_VERSION = '1.0.0'

/**
 * All available MCP tools
 */
export const MCP_TOOLS = [
  'find_mens_clinics_by_region',
  'enrich_clinic_profile',
  'ads_presence_snapshot',
  'vertex_outreach_brain',
  'export_dealflow_batch',
] as const

export type DealflowMCPTool = typeof MCP_TOOLS[number]

