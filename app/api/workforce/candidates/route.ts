import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { executeQuery, bigquery } from '@/lib/bigquery/client'
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
    const id: string = body.id || randomUUID()
    const first_name = body.first_name || body.firstName
    const last_name = body.last_name || body.lastName
    const email = body.email
    const phone = body.phone
    const role = body.role
    const service_lines: ServiceLine[] = body.service_lines || body.serviceLines || []
    const license_state = body.license_state || body.licenseState
    const states_eligible: string[] = body.states_eligible || body.statesEligible || []
    const experience_years = body.experience_years ?? body.experienceYears ?? 0
    const employment_type: string[] = body.employment_type || body.employmentType || []
    const preferred_shift_types: string[] =
      body.preferred_shift_types || body.preferredShiftTypes || []
    const hourly_rate_min = body.hourly_rate_min ?? body.hourlyRateMin ?? 0
    const hourly_rate_max = body.hourly_rate_max ?? body.hourlyRateMax ?? 0
    const active = body.active ?? true

    if (!first_name || !last_name || !email || !role || !license_state || service_lines.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await executeQuery(
      `
        MERGE \`${CANDIDATES_TABLE}\` T
        USING (
          SELECT
            @id AS id,
            CURRENT_TIMESTAMP() AS created_at,
            CURRENT_TIMESTAMP() AS updated_at,
            @first_name AS first_name,
            @last_name AS last_name,
            @email AS email,
            @phone AS phone,
            @role AS role,
            @service_lines AS service_lines,
            @license_state AS license_state,
            @states_eligible AS states_eligible,
            @experience_years AS experience_years,
            @employment_type AS employment_type,
            @preferred_shift_types AS preferred_shift_types,
            @hourly_rate_min AS hourly_rate_min,
            @hourly_rate_max AS hourly_rate_max,
            @active AS active
        ) S
        ON T.id = S.id
        WHEN MATCHED THEN
          UPDATE SET
            updated_at = CURRENT_TIMESTAMP(),
            first_name = S.first_name,
            last_name = S.last_name,
            email = S.email,
            phone = S.phone,
            role = S.role,
            service_lines = S.service_lines,
            license_state = S.license_state,
            states_eligible = S.states_eligible,
            experience_years = S.experience_years,
            employment_type = S.employment_type,
            preferred_shift_types = S.preferred_shift_types,
            hourly_rate_min = S.hourly_rate_min,
            hourly_rate_max = S.hourly_rate_max,
            active = S.active
        WHEN NOT MATCHED THEN
          INSERT ROW
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
        states_eligible,
        experience_years,
        employment_type,
        preferred_shift_types,
        hourly_rate_min,
        hourly_rate_max,
        active,
      }
    )

    return NextResponse.json({
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      service_lines,
      license_state,
      states_eligible,
      experience_years,
      employment_type,
      preferred_shift_types,
      hourly_rate_min,
      hourly_rate_max,
      active,
    })
  } catch (error) {
    console.error('workforce candidate POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
