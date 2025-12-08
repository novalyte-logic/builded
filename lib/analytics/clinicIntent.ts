import 'server-only'

import type {
  ClinicIntentResponse,
  ClinicIntentRow,
  IntentTier,
  ServiceLine,
} from '@/lib/types/analytics'
import { executeQuery } from '@/lib/bigquery/client'

const INTERNAL_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET ||
  process.env.BIGQUERY_DATASET_ID ||
  'novalyte_internal'

const CLINICS_TABLE = process.env.INTERNAL_CLINIC_TABLE || `${INTERNAL_DATASET}.clinics`
const LEADS_TABLE = process.env.BIGQUERY_LEADS_TABLE || `${INTERNAL_DATASET}.leads`
const CLINIC_EVENTS_TABLE =
  process.env.CLINIC_EVENTS_TABLE || `${INTERNAL_DATASET}.clinic_events`

export async function getClinicIntentSignals(params: {
  startDate: string
  endDate: string
  serviceLine?: ServiceLine
}): Promise<ClinicIntentResponse> {
  const query = `
    WITH clinics AS (
      SELECT id, name, state, city, service_line
      FROM \`${CLINICS_TABLE}\`
      WHERE status = 'ACTIVE'
        ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
    ),
    leads AS (
      SELECT
        clinic_id,
        COUNT(*) AS leadCount,
        COUNTIF(status IN ('QUALIFIED', 'BOOKED')) AS qualifiedLeadCount
      FROM \`${LEADS_TABLE}\`
      WHERE DATE(created_at) BETWEEN @startDate AND @endDate
        ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
      GROUP BY clinic_id
    ),
    events AS (
      SELECT
        clinic_id,
        COUNTIF(event_type = 'PROFILE_VIEW') AS profileViews,
        COUNTIF(event_type = 'PRICING_VIEW') AS pricingViews,
        COUNTIF(event_type IN ('CONTACT_CLICK', 'BOOKING_CLICK')) AS contactClicks
      FROM \`${CLINIC_EVENTS_TABLE}\`
      WHERE DATE(created_at) BETWEEN @startDate AND @endDate
        ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
      GROUP BY clinic_id
    ),
    combined AS (
      SELECT
        c.id AS clinicId,
        c.name AS clinicName,
        c.state,
        c.city,
        c.service_line AS serviceLine,
        IFNULL(l.leadCount, 0) AS leadCount,
        IFNULL(l.qualifiedLeadCount, 0) AS qualifiedLeadCount,
        IFNULL(e.profileViews, 0) AS profileViews,
        IFNULL(e.pricingViews, 0) AS pricingViews,
        IFNULL(e.contactClicks, 0) AS contactClicks
      FROM clinics c
      LEFT JOIN leads l ON c.id = l.clinic_id
      LEFT JOIN events e ON c.id = e.clinic_id
    )
    SELECT
      clinicId,
      clinicName,
      state,
      city,
      serviceLine,
      leadCount,
      qualifiedLeadCount,
      profileViews,
      pricingViews,
      contactClicks,
      (profileViews * 1) + (pricingViews * 2) + (contactClicks * 3) AS engagementScore,
      SAFE_DIVIDE(leadCount, GREATEST(profileViews, 1)) AS leadToViewRatio,
      CASE
        WHEN ((profileViews * 1) + (pricingViews * 2) + (contactClicks * 3)) >= 30 AND leadCount < 3 THEN 'HIGH_NEED'
        WHEN ((profileViews * 1) + (pricingViews * 2) + (contactClicks * 3)) >= 10 AND leadCount < 3 THEN 'MEDIUM_NEED'
        WHEN leadCount >= 5 AND qualifiedLeadCount >= 3 THEN 'STABLE'
        ELSE 'LOW'
      END AS intentTier,
      CASE
        WHEN ((profileViews * 1) + (pricingViews * 2) + (contactClicks * 3)) >= 10 AND leadCount < 3 THEN TRUE
        ELSE FALSE
      END AS needsPatients
    FROM combined
    ORDER BY intentTier ASC, engagementScore DESC
  `

  const rows = await executeQuery<any>(query, {
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.serviceLine ? { serviceLine: params.serviceLine } : {}),
  })

  const mapped: ClinicIntentRow[] = rows.map((row) => ({
    clinicId: row.clinicId || '',
    clinicName: row.clinicName || 'Unknown Clinic',
    state: row.state || 'Unknown',
    city: row.city || 'Unknown',
    serviceLine: row.serviceLine as ServiceLine,
    leadCount: Number(row.leadCount) || 0,
    qualifiedLeadCount: Number(row.qualifiedLeadCount) || 0,
    profileViews: Number(row.profileViews) || 0,
    pricingViews: Number(row.pricingViews) || 0,
    contactClicks: Number(row.contactClicks) || 0,
    engagementScore: Number(row.engagementScore) || 0,
    leadToViewRatio: Number(row.leadToViewRatio) || 0,
    intentTier: (row.intentTier as IntentTier) || 'LOW',
    needsPatients: Boolean(row.needsPatients),
  }))

  return {
    rows: mapped,
    meta: {
      startDate: params.startDate,
      endDate: params.endDate,
      generatedAt: new Date().toISOString(),
    },
  }
}
