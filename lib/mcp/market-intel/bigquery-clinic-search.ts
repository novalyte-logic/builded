/**
 * MCP Tool: bigquery_clinic_search
 * 
 * Search clinics in BigQuery by service line, region, and text query
 */

import { BigQuery } from '@google-cloud/bigquery'
import { mockClinics } from '@/app/api/admin/clinics/mockData'

export type ClinicServiceLine = 'TRT' | 'GLP-1' | 'Peptides' | 'IV Therapy' | 'Recovery' | 'Longevity' | 'General'
export type LeadStatus = 'actively_accepting' | 'at_capacity' | 'paused'
export type VerificationStatus = 'verified' | 'pending' | 'rejected'

export interface ClinicSearchResult {
  clinic_id: string
  name: string
  city: string
  state: string
  service_lines: string[]
  status: VerificationStatus
  lead_status: LeadStatus
  price_band: string
}

export interface ClinicSearchInput {
  query?: string // free-text search
  serviceLine?: string // filter by service line
  region?: string // state code (e.g. "TX", "FL")
}

/**
 * Search clinics in BigQuery
 * 
 * For now, uses in-memory mock data.
 * Replace with actual BigQuery query when table is available.
 */
export async function searchClinics(input: ClinicSearchInput): Promise<ClinicSearchResult[]> {
  const { query, serviceLine, region } = input

  try {
    // Initialize BigQuery client
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })

    // TODO: Replace with actual table when available
    // Example query structure for future implementation:
    /*
    const sqlQuery = `
      SELECT
        id as clinic_id,
        name,
        city,
        state,
        service_lines,
        verification_status as status,
        lead_acceptance_status as lead_status,
        price_band
      FROM \`${process.env.GCP_PROJECT_ID}.novalyte.clinics\`
      WHERE 1=1
        ${query ? 'AND (LOWER(name) LIKE @query OR LOWER(city) LIKE @query)' : ''}
        ${serviceLine ? 'AND @serviceLine IN UNNEST(service_lines)' : ''}
        ${region ? 'AND state = @region' : ''}
        AND verification_status = 'verified'
      ORDER BY lead_acceptance_priority DESC
      LIMIT 50
    `

    const options = {
      query: sqlQuery,
      params: {
        query: query ? `%${query.toLowerCase()}%` : undefined,
        serviceLine,
        region,
      },
    }

    const [rows] = await bigquery.query(options)
    return rows as ClinicSearchResult[]
    */

    // Mock implementation using in-memory data
    return searchMockClinics(input)
  } catch (error) {
    console.error('Error searching clinics:', error)
    throw new Error(`BigQuery clinic search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search mock clinic data
 * This will be replaced with actual BigQuery results
 */
function searchMockClinics(input: ClinicSearchInput): ClinicSearchResult[] {
  const { query, serviceLine, region } = input
  
  // Convert mock clinics to search results
  let results = mockClinics
    .filter((clinic) => clinic.verification_status === 'verified' && clinic.show_in_directory)
    .map((clinic) => {
      // Determine lead status from notes
      const notes = (clinic.notes_internal || '').toLowerCase()
      let lead_status: LeadStatus = 'actively_accepting'
      if (notes.includes('at capacity') || notes.includes('paused')) {
        lead_status = 'at_capacity'
      } else if (notes.includes('actively accepting')) {
        lead_status = 'actively_accepting'
      } else if (clinic.verification_status === 'pending') {
        lead_status = 'paused'
      }

      return {
        clinic_id: clinic.id,
        name: clinic.name,
        city: clinic.city,
        state: clinic.state || '',
        service_lines: clinic.specialties,
        status: clinic.verification_status as VerificationStatus,
        lead_status,
        price_band: clinic.price_band,
      }
    })

  // Apply filters
  if (query) {
    const queryLower = query.toLowerCase()
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(queryLower) ||
        c.city.toLowerCase().includes(queryLower) ||
        c.state.toLowerCase().includes(queryLower)
    )
  }

  if (serviceLine) {
    results = results.filter((c) => c.service_lines.includes(serviceLine))
  }

  if (region) {
    results = results.filter((c) => c.state === region)
  }

  // Sort by lead status (actively accepting first)
  results.sort((a, b) => {
    const statusPriority = { actively_accepting: 0, paused: 1, at_capacity: 2 }
    return statusPriority[a.lead_status] - statusPriority[b.lead_status]
  })

  return results.slice(0, 50) // Limit to 50 results
}

/**
 * MCP Tool metadata
 */
export const clinicSearchToolMetadata = {
  name: 'bigquery_clinic_search',
  description: 'Search clinics in BigQuery by service line, region, and text query',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Free-text search (clinic name, city, or description)',
      },
      serviceLine: {
        type: 'string',
        description: 'Filter by service line (e.g., TRT, GLP-1, IV Therapy)',
      },
      region: {
        type: 'string',
        description: 'Filter by state code (e.g., TX, FL, CA)',
      },
    },
  },
}

