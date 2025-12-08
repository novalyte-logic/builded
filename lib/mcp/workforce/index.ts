/**
 * Novalyte Workforce MCP Server
 * 
 * Mission: Turn staffing intelligence into a live revenue engine
 * - Find clinics hiring nurses, injectors, IV techs, or temp staff
 * - Discover nurses and clinicians looking for temp or flexible work
 * - Match both sides into Workforce Exchange inside the admin dashboard
 * - Generate AI-powered outreach and matching recommendations
 */

// Legacy tools (for backward compatibility)
export * from './scan-clinic-staffing-needs'
export * from './scrape-temp-shift-listings'
export * from './query-bigquery-healthworkforce'
export * from './extract-social-staffing-signals'
export * from './vertex-workforce-brain'

// New Workforce Exchange tools
export * from './find-clinic-jobs-by-region'
export * from './enrich-clinic-from-job'
export * from './find-nurses-seeking-temp-work'
export * from './enrich-candidate-fit'
export * from './generate-workforce-matches'
export * from './vertex-workforce-outreach-brain'
export * from './vertex-workforce-prompts'
export * from './export-workforce-batch'

export const MCP_SERVER_NAME = 'novalyte-workforce-mcp'
export const MCP_SERVER_VERSION = '2.0.0'

/**
 * All available MCP tools
 */
export const MCP_TOOLS = [
  // Legacy tools
  'scan_clinic_staffing_needs',
  'scrape_temp_shift_listings',
  'query_bigquery_healthworkforce',
  'extract_social_staffing_signals',
  'vertex_workforce_brain',
  // New Workforce Exchange tools
  'find_clinic_jobs_by_region',
  'enrich_clinic_from_job',
  'find_nurses_seeking_temp_work',
  'enrich_candidate_fit',
  'generate_workforce_matches',
  'vertex_workforce_outreach_brain',
  'export_workforce_batch',
] as const

export type WorkforceMCPTool = typeof MCP_TOOLS[number]

