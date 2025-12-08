import 'server-only'

import type {
  ClinicRevenueRow,
  RevenueIntelligenceResponse,
  RegionRevenueRow,
  ServiceLine,
} from '@/lib/types/analytics'
import { executeQuery } from '@/lib/bigquery/client'

const INTERNAL_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET ||
  process.env.BIGQUERY_DATASET_ID ||
  'novalyte_internal'

const LEADS_TABLE = process.env.BIGQUERY_LEADS_TABLE || `${INTERNAL_DATASET}.leads`
const CLINICS_TABLE = process.env.INTERNAL_CLINIC_TABLE || `${INTERNAL_DATASET}.clinics`
const SERVICE_LINE_CONFIG_TABLE =
  process.env.SERVICE_LINE_CONFIG_TABLE || `${INTERNAL_DATASET}.service_line_config`

type RevenueParams = {
  startDate: string
  endDate: string
  serviceLine?: ServiceLine
}

export async function getRevenueIntelligence(
  params: RevenueParams
): Promise<RevenueIntelligenceResponse> {
  const commonFilter = params.serviceLine ? 'AND l.service_line = @serviceLine' : ''

  const regionQuery = `
    WITH lead_base AS (
      SELECT
        l.state,
        l.service_line,
        COUNT(*) AS leadCount,
        COUNTIF(l.status IN ('QUALIFIED','BOOKED')) AS qualifiedLeadCount,
        COUNTIF(l.status = 'BOOKED') AS bookedLeadCount
      FROM \`${LEADS_TABLE}\` l
      WHERE DATE(l.created_at) BETWEEN @startDate AND @endDate
        ${commonFilter}
      GROUP BY state, service_line
    ),
    cfg AS (
      SELECT service_line, avg_revenue_per_patient, default_close_rate
      FROM \`${SERVICE_LINE_CONFIG_TABLE}\`
    )
    SELECT
      b.state,
      b.service_line AS serviceLine,
      b.leadCount,
      b.qualifiedLeadCount,
      b.bookedLeadCount,
      SAFE_DIVIDE(b.bookedLeadCount, NULLIF(b.qualifiedLeadCount, 0)) AS observedCloseRate,
      IFNULL(
        NULLIF(SAFE_DIVIDE(b.bookedLeadCount, NULLIF(b.qualifiedLeadCount, 0)), 0),
        IFNULL(c.default_close_rate, 0)
      ) AS effectiveCloseRate,
      IFNULL(c.avg_revenue_per_patient, 0) AS avgRevenuePerPatient,
      b.bookedLeadCount * IFNULL(c.avg_revenue_per_patient, 0) AS estimatedRevenue,
      b.qualifiedLeadCount * IFNULL(c.avg_revenue_per_patient, 0) *
        IFNULL(
          NULLIF(SAFE_DIVIDE(b.bookedLeadCount, NULLIF(b.qualifiedLeadCount, 0)), 0),
          IFNULL(c.default_close_rate, 0)
        ) AS estimatedRevenuePotential
    FROM lead_base b
    LEFT JOIN cfg c ON b.service_line = c.service_line
    ORDER BY estimatedRevenuePotential DESC
  `

  const clinicQuery = `
    WITH active_clinics AS (
      SELECT id, name, state, city, service_line
      FROM \`${CLINICS_TABLE}\`
      WHERE status = 'ACTIVE'
        ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
    ),
    lead_base AS (
      SELECT
        l.clinic_id,
        COUNT(*) AS leadCount,
        COUNTIF(l.status IN ('QUALIFIED','BOOKED')) AS qualifiedLeadCount,
        COUNTIF(l.status = 'BOOKED') AS bookedLeadCount
      FROM \`${LEADS_TABLE}\` l
      WHERE DATE(l.created_at) BETWEEN @startDate AND @endDate
        ${params.serviceLine ? 'AND l.service_line = @serviceLine' : ''}
      GROUP BY clinic_id
    ),
    cfg AS (
      SELECT service_line, avg_revenue_per_patient, default_close_rate
      FROM \`${SERVICE_LINE_CONFIG_TABLE}\`
    )
    SELECT
      c.id AS clinicId,
      c.name AS clinicName,
      c.state,
      c.city,
      c.service_line AS serviceLine,
      IFNULL(l.leadCount, 0) AS leadCount,
      IFNULL(l.qualifiedLeadCount, 0) AS qualifiedLeadCount,
      IFNULL(l.bookedLeadCount, 0) AS bookedLeadCount,
      SAFE_DIVIDE(l.bookedLeadCount, NULLIF(l.qualifiedLeadCount, 0)) AS observedCloseRate,
      IFNULL(
        NULLIF(SAFE_DIVIDE(l.bookedLeadCount, NULLIF(l.qualifiedLeadCount, 0)), 0),
        IFNULL(cfg.default_close_rate, 0)
      ) AS effectiveCloseRate,
      IFNULL(cfg.avg_revenue_per_patient, 0) AS avgRevenuePerPatient,
      IFNULL(l.bookedLeadCount, 0) * IFNULL(cfg.avg_revenue_per_patient, 0) AS estimatedRevenue,
      IFNULL(l.qualifiedLeadCount, 0) * IFNULL(cfg.avg_revenue_per_patient, 0) *
        IFNULL(
          NULLIF(SAFE_DIVIDE(l.bookedLeadCount, NULLIF(l.qualifiedLeadCount, 0)), 0),
          IFNULL(cfg.default_close_rate, 0)
        ) AS estimatedRevenuePotential
    FROM active_clinics c
    LEFT JOIN lead_base l ON c.id = l.clinic_id
    LEFT JOIN cfg ON c.service_line = cfg.service_line
    ORDER BY estimatedRevenuePotential DESC
  `

  const commonParams = {
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.serviceLine ? { serviceLine: params.serviceLine } : {}),
  }

  const [regionRows, clinicRows] = await Promise.all([
    executeQuery<any>(regionQuery, commonParams),
    executeQuery<any>(clinicQuery, commonParams),
  ])

  const regions: RegionRevenueRow[] = regionRows.map((row) => ({
    state: row.state || 'Unknown',
    serviceLine: row.serviceLine as ServiceLine,
    leadCount: Number(row.leadCount) || 0,
    qualifiedLeadCount: Number(row.qualifiedLeadCount) || 0,
    bookedLeadCount: Number(row.bookedLeadCount) || 0,
    observedCloseRate: row.observedCloseRate !== null ? Number(row.observedCloseRate) : null,
    effectiveCloseRate: Number(row.effectiveCloseRate) || 0,
    avgRevenuePerPatient: Number(row.avgRevenuePerPatient) || 0,
    estimatedRevenue: Number(row.estimatedRevenue) || 0,
    estimatedRevenuePotential: Number(row.estimatedRevenuePotential) || 0,
  }))

  const clinics: ClinicRevenueRow[] = clinicRows.map((row) => ({
    clinicId: row.clinicId || '',
    clinicName: row.clinicName || 'Unknown Clinic',
    state: row.state || 'Unknown',
    city: row.city || 'Unknown',
    serviceLine: row.serviceLine as ServiceLine,
    leadCount: Number(row.leadCount) || 0,
    qualifiedLeadCount: Number(row.qualifiedLeadCount) || 0,
    bookedLeadCount: Number(row.bookedLeadCount) || 0,
    observedCloseRate: row.observedCloseRate !== null ? Number(row.observedCloseRate) : null,
    effectiveCloseRate: Number(row.effectiveCloseRate) || 0,
    avgRevenuePerPatient: Number(row.avgRevenuePerPatient) || 0,
    estimatedRevenue: Number(row.estimatedRevenue) || 0,
    estimatedRevenuePotential: Number(row.estimatedRevenuePotential) || 0,
  }))

  return {
    regions,
    clinics,
    meta: {
      startDate: params.startDate,
      endDate: params.endDate,
      generatedAt: new Date().toISOString(),
    },
  }
}
