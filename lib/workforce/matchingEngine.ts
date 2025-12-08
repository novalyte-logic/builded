import 'server-only'

import { randomUUID } from 'crypto'
import { bigquery } from '@/lib/bigquery/client'
import { executeQuery } from '@/lib/bigquery/client'
import type { ServiceLine } from '@/lib/types/analytics'

export interface WorkforceRequestRecord {
  id: string
  clinic_id: string
  clinic_name: string
  state: string
  city: string
  service_line: ServiceLine
  role: string
  shift_type: string
  min_experience_years: number
  start_date: string | null
  end_date: string | null
  employment_type: string
  budget_hourly_min: number
  budget_hourly_max: number
  status: string
}

export interface WorkforceCandidateRecord {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  service_lines: string[]
  license_state: string
  states_eligible: string[]
  experience_years: number
  employment_type: string[]
  preferred_shift_types: string[]
  hourly_rate_min: number
  hourly_rate_max: number
  active: boolean
}

export interface WorkforceMatchCandidate {
  candidateId: string
  fullName: string
  role: string
  serviceLines: string[]
  licenseState: string
  statesEligible: string[]
  experienceYears: number
  employmentType: string[]
  preferredShiftTypes: string[]
  hourlyRateMin: number
  hourlyRateMax: number
  matchScore: number
}

const INTERNAL_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET ||
  process.env.BIGQUERY_DATASET_ID ||
  'novalyte_internal'

const CANDIDATES_TABLE =
  process.env.WORKFORCE_CANDIDATES_TABLE || `${INTERNAL_DATASET}.workforce_candidates`
const REQUESTS_TABLE =
  process.env.WORKFORCE_REQUESTS_TABLE || `${INTERNAL_DATASET}.workforce_requests`
const MATCHES_TABLE =
  process.env.WORKFORCE_MATCHES_TABLE || `${INTERNAL_DATASET}.workforce_matches`

function scoreCandidate(candidate: WorkforceCandidateRecord, req: WorkforceRequestRecord): number {
  let score = 0
  if (candidate.role === req.role) score += 30
  if (candidate.service_lines?.includes(req.service_line)) score += 20
  if (
    candidate.license_state === req.state ||
    candidate.states_eligible?.includes(req.state)
  )
    score += 20
  if (candidate.experience_years >= (req.min_experience_years || 0)) score += 10
  if (candidate.preferred_shift_types?.includes(req.shift_type)) score += 10
  if (candidate.employment_type?.includes(req.employment_type)) score += 5

  const overlapsBudget =
    candidate.hourly_rate_min <= req.budget_hourly_max &&
    candidate.hourly_rate_max >= req.budget_hourly_min
  if (overlapsBudget) score += 5

  return Math.min(100, score)
}

export async function getTopMatchesForRequest(
  requestId: string
): Promise<WorkforceMatchCandidate[]> {
  const [request] = await executeQuery<WorkforceRequestRecord>(
    `
      SELECT * FROM \`${REQUESTS_TABLE}\`
      WHERE id = @requestId
      LIMIT 1
    `,
    { requestId }
  )

  if (!request) {
    throw new Error('Request not found')
  }

  const candidates = await executeQuery<WorkforceCandidateRecord>(
    `
      SELECT * FROM \`${CANDIDATES_TABLE}\`
      WHERE active = TRUE
    `
  )

  const scored = candidates
    .map((c) => ({
      candidateId: c.id,
      fullName: `${c.first_name} ${c.last_name}`.trim(),
      role: c.role,
      serviceLines: c.service_lines || [],
      licenseState: c.license_state,
      statesEligible: c.states_eligible || [],
      experienceYears: c.experience_years || 0,
      employmentType: c.employment_type || [],
      preferredShiftTypes: c.preferred_shift_types || [],
      hourlyRateMin: c.hourly_rate_min || 0,
      hourlyRateMax: c.hourly_rate_max || 0,
      matchScore: scoreCandidate(c, request),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)

  // persist matches
  if (scored.length > 0) {
    const table = bigquery.dataset(INTERNAL_DATASET).table(MATCHES_TABLE.split('.').pop() || '')
    const rows = scored.map((match, idx) => ({
      id: randomUUID(),
      created_at: new Date().toISOString(),
      request_id: requestId,
      candidate_id: match.candidateId,
      match_score: match.matchScore,
      rank: idx + 1,
      status: 'SUGGESTED',
    }))
    await table.insert(rows)
  }

  return scored
}
