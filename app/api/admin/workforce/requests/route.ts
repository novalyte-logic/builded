import { NextRequest, NextResponse } from 'next/server'

import { executeQuery } from '@/lib/bigquery/client'
import { getTopMatchesForRequest } from '@/lib/workforce/matchingEngine'
import type { ServiceLine } from '@/lib/types/analytics'

const INTERNAL_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET ||
  process.env.BIGQUERY_DATASET_ID ||
  'novalyte_internal'

const REQUESTS_TABLE =
  process.env.WORKFORCE_REQUESTS_TABLE || `${INTERNAL_DATASET}.workforce_requests`
const MATCHES_TABLE =
  process.env.WORKFORCE_MATCHES_TABLE || `${INTERNAL_DATASET}.workforce_matches`
const CANDIDATES_TABLE =
  process.env.WORKFORCE_CANDIDATES_TABLE || `${INTERNAL_DATASET}.workforce_candidates`

interface WorkforceRequestWithMatches {
  id: string
  created_at: string
  clinic_id: string
  clinic_name: string
  state: string
  city: string
  service_line: ServiceLine
  role: string
  shift_type: string
  employment_type: string
  start_date: string | null
  end_date: string | null
  status: string
  matches: any[]
}

function parseSearchParam(searchParams: URLSearchParams, key: string): string | null {
  const value = searchParams.get(key)
  return value && value.trim().length ? value : null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = parseSearchParam(searchParams, 'status') || 'OPEN'
    const serviceLineParam = parseSearchParam(searchParams, 'serviceLine')
    const stateParam = parseSearchParam(searchParams, 'state')

    const requests = await executeQuery<WorkforceRequestWithMatches>(
      `
        SELECT *
        FROM \`${REQUESTS_TABLE}\`
        WHERE (@status IS NULL OR status = @status)
          ${serviceLineParam ? 'AND service_line = @serviceLine' : ''}
          ${stateParam ? 'AND state = @state' : ''}
        ORDER BY created_at DESC
        LIMIT 200
      `,
      {
        status,
        serviceLine: serviceLineParam,
        state: stateParam,
      }
    )

    const requestIds = requests.map((r) => r.id)

    let matchesByRequest: Record<string, any[]> = {}
    if (requestIds.length > 0) {
      const matches = await executeQuery<any>(
        `
          WITH enriched AS (
            SELECT
              m.request_id,
              m.candidate_id,
              m.match_score,
              m.rank,
              m.status,
              c.first_name,
              c.last_name,
              c.role,
              c.license_state,
              c.experience_years,
              c.hourly_rate_min,
              c.hourly_rate_max
            FROM \`${MATCHES_TABLE}\` m
            LEFT JOIN \`${CANDIDATES_TABLE}\` c ON m.candidate_id = c.id
            WHERE m.request_id IN UNNEST(@requestIds)
            ORDER BY m.request_id, m.rank
          )
          SELECT * FROM enriched
        `,
        { requestIds }
      )

      matchesByRequest = matches.reduce((acc, m) => {
        if (!acc[m.request_id]) acc[m.request_id] = []
        acc[m.request_id].push({
          candidateId: m.candidate_id,
          fullName: `${m.first_name || ''} ${m.last_name || ''}`.trim(),
          role: m.role,
          licenseState: m.license_state,
          experienceYears: m.experience_years || 0,
          hourlyRateMin: m.hourly_rate_min || 0,
          hourlyRateMax: m.hourly_rate_max || 0,
          matchScore: m.match_score || 0,
          rank: m.rank || 0,
          status: m.status,
        })
        return acc
      }, {} as Record<string, any[]>)
    }

    const response = requests.map((req) => ({
      id: req.id,
      createdAt: req.created_at,
      clinicId: req.clinic_id,
      clinicName: req.clinic_name,
      state: req.state,
      city: req.city,
      serviceLine: req.service_line,
      role: req.role,
      shiftType: req.shift_type,
      employmentType: req.employment_type,
      startDate: req.start_date || null,
      endDate: req.end_date || null,
      status: req.status,
      matches: matchesByRequest[req.id] || [],
    }))

    return NextResponse.json({ rows: response })
  } catch (error) {
    console.error('admin workforce requests GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
