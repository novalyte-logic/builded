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
export * from './cron-engine'
export * from './trend-insights-engine'
export * from './clinic-demand-prediction-engine'
export * from './dealflow-brain'

export const MCP_SERVER_NAME = 'novalyte-dealflow-mcp'
export const MCP_SERVER_VERSION = '1.4.0'

/**
 * All available MCP tools
 * 
 * See MCP_MANIFEST.md for complete tool specifications
 */
export const MCP_TOOLS = [
  // Clinic Discovery & Enrichment
  'find_mens_clinics_by_region',
  'enrich_clinic_profile',
  
  // Ads & Market Presence
  'ads_presence_snapshot',
  'market_trends_insights',
  
  // Predictive Demand & Forecasting
  'predict_clinic_demand',
  'predict_region_hotspots',
  
  // Outreach Brain (Vertex Integration)
  'vertex_outreach_brain',
  'vertex_dealflow_ranker',
  
  // Batch & Pipeline Tools
  'export_dealflow_batch',
  'generate_daily_dealflow_snapshot',
  
  // Legacy/Additional Tools (for backward compatibility)
  'cron_daily_dealflow_run',
  'cron_set_delivery_channel',
  'cron_push_daily_results',
  'cron_simulate',
  'google_trends_region_scan',
  'bigquery_domain_scan',
  'clinic_market_strength_score',
  'trend_based_dealflow',
  'predict_clinic_capacity_gap',
  'predict_clinic_growth_curve',
  'clinic_demand_opportunity_engine',
  'predictive_dealflow',
  'unified_dealflow_brain',
] as const

export type DealflowMCPTool = typeof MCP_TOOLS[number]

