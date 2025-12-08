import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { executeQuery } from '@/lib/bigquery/client'
import type { ServiceLine } from '@/lib/types/analytics'

const INTERNAL_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET ||
  process.env.BIGQUERY_DATASET_ID ||
  'novalyte_internal'

const CANDIDATES_TABLE =
  process.env.WORKFORCE_CANDIDATES_TABLE || `${INTERNAL_DATASET}.workforce_candidates`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = randomUUID()
    const first_name = body.first_name || body.firstName
    const last_name = body.last_name || body.lastName
    const email = body.email
    const phone = body.phone
    const role = body.role
    const service_lines: ServiceLine[] = body.service_lines || body.serviceLines || []
    const license_state = body.license_state || body.licenseState
    const experience_years = body.experience_years ?? body.experienceYears ?? 0

    if (!first_name || !last_name || !email || !role || !license_state || service_lines.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await executeQuery(
      `
        INSERT \`${CANDIDATES_TABLE}\` (
          id, created_at, updated_at, first_name, last_name, email, phone, role, service_lines,
          license_state, states_eligible, experience_years, employment_type, preferred_shift_types,
          hourly_rate_min, hourly_rate_max, active
        )
        VALUES (
          @id, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), @first_name, @last_name, @email, @phone, @role, @service_lines,
          @license_state, @states_eligible, @experience_years, @employment_type, @preferred_shift_types,
          @hourly_rate_min, @hourly_rate_max, TRUE
        )
      `,
      {
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        service_lines,
        license_state,
        states_eligible: body.states_eligible || body.statesEligible || [],
        experience_years,
        employment_type: body.employment_type || body.employmentType || [],
        preferred_shift_types: body.preferred_shift_types || body.preferredShiftTypes || [],
        hourly_rate_min: body.hourly_rate_min ?? body.hourlyRateMin ?? 0,
        hourly_rate_max: body.hourly_rate_max ?? body.hourlyRateMax ?? 0,
      }
    )

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('public workforce apply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
