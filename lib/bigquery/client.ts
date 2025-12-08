/**
 * BigQuery Client Configuration
 * 
 * Server-side only. Never expose credentials to client.
 * Uses environment variables for project ID and credentials.
 */

// Mark this module as server-only
import 'server-only'

import { BigQuery } from '@google-cloud/bigquery'

// Initialize BigQuery client
// Credentials should be loaded from:
// 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to service account key)
// 2. Workload identity / default credentials
const bigquery = new BigQuery({
  projectId:
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.BIGQUERY_PROJECT_ID ||
    'novalyte-analytics-project',
  location: process.env.BIGQUERY_REGION || 'us-west1',
})

const DATASET_ID =
  process.env.BIGQUERY_DATASET_ID ||
  process.env.INTERNAL_ANALYTICS_DATASET ||
  'novalyte_core'

export { bigquery, DATASET_ID }

/**
 * Helper function to execute parameterized queries safely
 */
export async function executeQuery<T = any>(
  query: string,
  parameters?: Record<string, any>
): Promise<T[]> {
  const options: any = {
    query,
    location: process.env.BIGQUERY_REGION || 'us-west1',
  }

  // Add parameters if provided (for parameterized queries)
  if (parameters) {
    options.params = parameters
  }

  const [job] = await bigquery.createQueryJob(options)
  const [rows] = await job.getQueryResults()

  return rows as T[]
}

// Date range helper moved to utils.ts for client-safe usage
// Re-export here for backward compatibility
export { getDateRange, type DateRange } from './utils'
