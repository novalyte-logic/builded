import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { executeQuery } from '@/lib/bigquery/client'
import type { ServiceLine } from '@/lib/types/analytics'
import { getTopMatchesForRequest } from '@/lib/workforce/matchingEngine'

const INTERNAL_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET ||
  process.env.BIGQUERY_DATASET_ID ||
  'novalyte_internal'

const REQUESTS_TABLE =
  process.env.WORKFORCE_REQUESTS_TABLE || `${INTERNAL_DATASET}.workforce_requests`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id || randomUUID()
    const clinic_id = body.clinic_id || body.clinicId
    const clinic_name = body.clinic_name || body.clinicName
    const state = body.state
    const city = body.city
    const service_line: ServiceLine = body.service_line || body.serviceLine
    const role = body.role
    const shift_type = body.shift_type || body.shiftType
    const min_experience_years = body.min_experience_years ?? body.minExperienceYears ?? 0
    const start_date = body.start_date || body.startDate || null
    const end_date = body.end_date || body.endDate || null
    const employment_type = body.employment_type || body.employmentType
    const budget_hourly_min = body.budget_hourly_min ?? body.budgetHourlyMin ?? 0
    const budget_hourly_max = body.budget_hourly_max ?? body.budgetHourlyMax ?? 0
    const status = 'OPEN'

    if (!clinic_id || !clinic_name || !state || !city || !service_line || !role || !shift_type || !employment_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await executeQuery(
      `
        INSERT \`${REQUESTS_TABLE}\` (
          id, created_at, updated_at, clinic_id, clinic_name, state, city, service_line,
          role, shift_type, min_experience_years, start_date, end_date, employment_type,
          budget_hourly_min, budget_hourly_max, status
        )
        VALUES (
          @id, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), @clinic_id, @clinic_name, @state, @city, @service_line,
          @role, @shift_type, @min_experience_years, @start_date, @end_date, @employment_type,
          @budget_hourly_min, @budget_hourly_max, @status
        )
      `,
      {
        id,
        clinic_id,
        clinic_name,
        state,
        city,
        service_line,
        role,
        shift_type,
        min_experience_years,
        start_date,
        end_date,
        employment_type,
        budget_hourly_min,
        budget_hourly_max,
        status,
      }
    )

    // Trigger matching engine (best effort)
    let matches: any[] = []
    try {
      matches = await getTopMatchesForRequest(id)
    } catch (matchErr) {
      console.error('matching engine error:', matchErr)
    }

    return NextResponse.json({
      id,
      clinic_id,
      clinic_name,
      state,
      city,
      service_line,
      role,
      shift_type,
      min_experience_years,
      start_date,
      end_date,
      employment_type,
      budget_hourly_min,
      budget_hourly_max,
      status,
      matches,
    })
  } catch (error) {
    console.error('workforce request POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
