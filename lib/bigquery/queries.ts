/**
 * BigQuery Data Access Layer
 * 
 * Typed functions for querying analytics data.
 * All queries use parameterization to prevent SQL injection.
 * Results are cached where appropriate.
 */

// Mark this module as server-only
import 'server-only'

import { executeQuery, DATASET_ID } from './client'
import { getDateRange } from './utils'
export type {
  ServiceLine,
  RegionDemandRow,
  DemandSupplyRow,
  TrendDirection,
} from '@/lib/types/analytics'

const DEFAULT_ANALYTICS_DATASET =
  process.env.INTERNAL_ANALYTICS_DATASET || DATASET_ID || 'novalyte_internal'

const LEADS_TABLE =
  process.env.BIGQUERY_LEADS_TABLE || `${DEFAULT_ANALYTICS_DATASET}.leads`

const EXTERNAL_DATASET =
  process.env.EXTERNAL_ANALYTICS_DATASET || 'novalyte_external'

const SEARCH_TRENDS_TABLE =
  process.env.SEARCH_TRENDS_TABLE || `${EXTERNAL_DATASET}.search_trends`

const CLINIC_SUPPLY_TABLE =
  process.env.CLINIC_SUPPLY_TABLE || `${EXTERNAL_DATASET}.clinic_supply`

const NOVALYTE_CLINICS_TABLE =
  process.env.INTERNAL_CLINIC_TABLE || `${DEFAULT_ANALYTICS_DATASET}.clinics`

// ============================================================================ 
// TYPE DEFINITIONS
// ============================================================================

import type {
  DemandSupplyRow,
  RegionDemandRow,
  ServiceLine,
  TrendDirection,
} from '@/lib/types/analytics'

export interface AdminOverviewMetrics {
  totalRevenue: number
  newClinics: number
  assessmentStarts: number
  assessmentCompletions: number
  marketplaceRevenue: number
  marketplaceRevenueByCategory: Array<{
    category: string
    revenue: number
  }>
}

export interface FunnelMetrics {
  path: string
  step: string
  visitors: number
  completions: number
  dropOffRate: number
  completionRate: number
}

export interface ClinicCohort {
  mens_clinic_id: string
  clinic_name: string
  city: string
  state: string
  totalRevenue: number
  avgOrderValue: number
  newPatients: number
  returningPatients: number
  showRate: number
  cancelRate: number
}

export interface AdPerformanceByChannel {
  platform: string
  campaign_name: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  roas: number
  cpa: number
  ctr: number
}

export interface MarketplaceCategoryRevenue {
  category: string
  revenue: number
  orders: number
  avgOrderValue: number
  margin: number
  marginPercent: number
}

export interface CityPerformance {
  city: string
  state: string
  totalRevenue: number
  assessments: number
  completions: number
  conversionRate: number
  avgLTV: number
  topPath: string
  clinicCount: number
}

export interface TrendingProtocol {
  path: string
  assessmentCount: number
  completionRate: number
  revenue: number
  growthRate: number
  topCity: string
  avgLTV: number
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Lead demand by region and service line
 */
export async function getLeadDemandByRegion(params: {
  startDate: string
  endDate: string
  serviceLine?: ServiceLine
}): Promise<RegionDemandRow[]> {
  const query = `
    SELECT
      state,
      service_line AS serviceLine,
      COUNT(1) AS leadCount,
      COUNTIF(status IN ('QUALIFIED', 'BOOKED')) AS qualifiedCount,
      SAFE_DIVIDE(COUNTIF(status IN ('QUALIFIED', 'BOOKED')), COUNT(1)) AS conversionRate,
      CAST(MAX(created_at) AS STRING) AS lastLeadAt
    FROM \`${LEADS_TABLE}\`
    WHERE DATE(created_at) BETWEEN @startDate AND @endDate
      ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
    GROUP BY state, serviceLine
    ORDER BY leadCount DESC
  `

  const rows = await executeQuery<any>(query, {
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.serviceLine ? { serviceLine: params.serviceLine } : {}),
  })

  return rows.map((row) => ({
    state: row.state || 'Unknown',
    serviceLine: row.serviceLine as ServiceLine,
    leadCount: Number(row.leadCount) || 0,
    qualifiedCount: Number(row.qualifiedCount) || 0,
    conversionRate: Number(row.conversionRate) || 0,
    lastLeadAt: row.lastLeadAt || null,
  }))
}

/**
 * Demand & Supply by state and service line
 */
export async function getDemandSupplyByRegion(params: {
  startDate: string
  endDate: string
  serviceLine?: ServiceLine
}): Promise<DemandSupplyRow[]> {
  const query = `
    WITH trends AS (
      SELECT
        state,
        service_line AS serviceLine,
        AVG(interest_score) AS interestScore,
        ARRAY_AGG(trend_direction ORDER BY date DESC LIMIT 1)[SAFE_OFFSET(0)] AS trendDirection
      FROM \`${SEARCH_TRENDS_TABLE}\`
      WHERE date BETWEEN @startDate AND @endDate
        ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
      GROUP BY state, serviceLine
    ),
    supply AS (
      SELECT
        state,
        service_line AS serviceLine,
        SUM(clinic_count) AS clinicCount
      FROM \`${CLINIC_SUPPLY_TABLE}\`
      ${params.serviceLine ? 'WHERE service_line = @serviceLine' : ''}
      GROUP BY state, serviceLine
    ),
    footprint AS (
      SELECT
        state,
        service_line AS serviceLine,
        COUNT(*) AS novalyteClinicCount
      FROM \`${NOVALYTE_CLINICS_TABLE}\`
      WHERE status = 'ACTIVE'
        ${params.serviceLine ? 'AND service_line = @serviceLine' : ''}
      GROUP BY state, serviceLine
    ),
    combined AS (
      SELECT
        COALESCE(t.state, s.state, f.state) AS state,
        COALESCE(t.serviceLine, s.serviceLine, f.serviceLine) AS serviceLine,
        IFNULL(t.interestScore, 0) AS interestScore,
        IFNULL(t.trendDirection, 'FLAT') AS trendDirection,
        IFNULL(s.clinicCount, 0) AS clinicCount,
        IFNULL(f.novalyteClinicCount, 0) AS novalyteClinicCount
      FROM trends t
      FULL OUTER JOIN supply s
        ON t.state = s.state AND t.serviceLine = s.serviceLine
      FULL OUTER JOIN footprint f
        ON COALESCE(t.state, s.state) = f.state
        AND COALESCE(t.serviceLine, s.serviceLine) = f.serviceLine
    )
    SELECT
      state,
      serviceLine,
      interestScore,
      trendDirection,
      clinicCount,
      novalyteClinicCount,
      (interestScore - SAFE_DIVIDE(clinicCount, 2) - (novalyteClinicCount * 3)) AS opportunityScore
    FROM combined
    WHERE serviceLine IS NOT NULL
    ORDER BY opportunityScore DESC
  `

  const rows = await executeQuery<any>(query, {
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.serviceLine ? { serviceLine: params.serviceLine } : {}),
  })

  return rows.map((row) => ({
    state: row.state || 'Unknown',
    serviceLine: row.serviceLine as ServiceLine,
    interestScore: Number(row.interestScore) || 0,
    trendDirection: (row.trendDirection as TrendDirection) || 'FLAT',
    clinicCount: Number(row.clinicCount) || 0,
    novalyteClinicCount: Number(row.novalyteClinicCount) || 0,
    opportunityScore: Number(row.opportunityScore) || 0,
  }))
}

/**
 * Get Admin Overview Metrics
 * Used in: System Overview page
 */
export async function getAdminOverviewMetrics(
  dateRange: { startDate: string; endDate: string } = getDateRange(30)
): Promise<AdminOverviewMetrics> {
  const query = `
    WITH revenue AS (
      SELECT 
        SUM(total_revenue) as total_revenue
      FROM \`${DATASET_ID}.clinic_revenue_daily\`
      WHERE date BETWEEN @startDate AND @endDate
    ),
    clinics AS (
      SELECT COUNT(DISTINCT mens_clinic_id) as new_clinics
      FROM \`${DATASET_ID}.clinic_revenue_daily\`
      WHERE date = @endDate
    ),
    assessments AS (
      SELECT 
        COUNTIF(step_started >= 1) as starts,
        COUNTIF(completed_at IS NOT NULL) as completions
      FROM \`${DATASET_ID}.assessment_funnel\`
      WHERE DATE(created_at) BETWEEN @startDate AND @endDate
    ),
    marketplace AS (
      SELECT 
        SUM(line_revenue) as marketplace_revenue,
        ARRAY_AGG(STRUCT(category, SUM(line_revenue) as revenue) LIMIT 10) as by_category
      FROM \`${DATASET_ID}.marketplace_orders\`
      WHERE order_date BETWEEN @startDate AND @endDate
      GROUP BY category
    )
    SELECT 
      (SELECT total_revenue FROM revenue) as total_revenue,
      (SELECT new_clinics FROM clinics) as new_clinics,
      (SELECT starts FROM assessments) as assessment_starts,
      (SELECT completions FROM assessments) as assessment_completions,
      (SELECT marketplace_revenue FROM marketplace) as marketplace_revenue,
      (SELECT by_category FROM marketplace) as marketplace_revenue_by_category
  `

  const [result] = await executeQuery<any>(query, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  })

  return {
    totalRevenue: result.total_revenue || 0,
    newClinics: result.new_clinics || 0,
    assessmentStarts: result.assessment_starts || 0,
    assessmentCompletions: result.assessment_completions || 0,
    marketplaceRevenue: result.marketplace_revenue || 0,
    marketplaceRevenueByCategory: result.marketplace_revenue_by_category || [],
  }
}

/**
 * Get Funnel Metrics
 * Used in: Patients Intelligence page, Funnel visualization
 */
export async function getFunnelMetrics(
  dateRange: { startDate: string; endDate: string } = getDateRange(30),
  channel?: string,
  path?: string
): Promise<FunnelMetrics[]> {
  let whereClause = `DATE(created_at) BETWEEN @startDate AND @endDate`
  const params: any = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }

  if (channel) {
    whereClause += ` AND acquisition_channel = @channel`
    params.channel = channel
  }

  if (path) {
    whereClause += ` AND path = @path`
    params.path = path
  }

  const query = `
    SELECT 
      path,
      CASE 
        WHEN step_completed IS NULL THEN 'abandoned'
        WHEN step_completed = step_started THEN 'completed'
        ELSE CONCAT('step_', CAST(step_completed AS STRING))
      END as step,
      COUNT(*) as visitors,
      COUNTIF(completed_at IS NOT NULL) as completions,
      SAFE_DIVIDE(COUNT(*) - COUNTIF(completed_at IS NOT NULL), COUNT(*)) as drop_off_rate,
      SAFE_DIVIDE(COUNTIF(completed_at IS NOT NULL), COUNT(*)) as completion_rate
    FROM \`${DATASET_ID}.assessment_funnel\`
    WHERE ${whereClause}
    GROUP BY path, step
    ORDER BY path, step
  `

  const results = await executeQuery<any>(query, params)

  return results.map((row: any) => ({
    path: row.path,
    step: row.step,
    visitors: Number(row.visitors),
    completions: Number(row.completions),
    dropOffRate: Number(row.drop_off_rate) || 0,
    completionRate: Number(row.completion_rate) || 0,
  }))
}

/**
 * Get Clinic Cohorts
 * Used in: Clinics Intelligence page
 */
export async function getClinicCohorts(
  dateRange: { startDate: string; endDate: string } = getDateRange(30),
  clinicId?: string
): Promise<ClinicCohort[]> {
  let whereClause = `date BETWEEN @startDate AND @endDate`
  const params: any = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }

  if (clinicId) {
    whereClause += ` AND mens_clinic_id = @clinicId`
    params.clinicId = clinicId
  }

  const query = `
    SELECT 
      mens_clinic_id,
      MAX(clinic_name) as clinic_name,
      MAX(city) as city,
      MAX(state) as state,
      SUM(total_revenue) as total_revenue,
      AVG(avg_order_value) as avg_order_value,
      SUM(new_patients) as new_patients,
      SUM(returning_patients) as returning_patients,
      -- Show rate calculation (assuming we track no-shows in metadata)
      -- This is a placeholder - adjust based on actual no-show tracking
      0.85 as show_rate,
      0.12 as cancel_rate
    FROM \`${DATASET_ID}.clinic_revenue_daily\`
    WHERE ${whereClause}
    GROUP BY mens_clinic_id
    ORDER BY total_revenue DESC
  `

  const results = await executeQuery<any>(query, params)

  return results.map((row: any) => ({
    mens_clinic_id: row.mens_clinic_id,
    clinic_name: row.clinic_name,
    city: row.city || '',
    state: row.state || '',
    totalRevenue: Number(row.total_revenue) || 0,
    avgOrderValue: Number(row.avg_order_value) || 0,
    newPatients: Number(row.new_patients) || 0,
    returningPatients: Number(row.returning_patients) || 0,
    showRate: Number(row.show_rate),
    cancelRate: Number(row.cancel_rate),
  }))
}

/**
 * Get Ad Performance by Channel
 * Used in: Ads Intelligence page
 */
export async function getAdPerformanceByChannel(
  dateRange: { startDate: string; endDate: string } = getDateRange(30)
): Promise<AdPerformanceByChannel[]> {
  const query = `
    SELECT 
      platform,
      campaign_name,
      SUM(impressions) as impressions,
      SUM(clicks) as clicks,
      SUM(spend) as spend,
      SUM(conversions) as conversions,
      SUM(revenue_attributed) as revenue,
      SAFE_DIVIDE(SUM(revenue_attributed), SUM(spend)) as roas,
      SAFE_DIVIDE(SUM(spend), SUM(conversions)) as cpa,
      SAFE_DIVIDE(SUM(clicks), SUM(impressions)) as ctr
    FROM \`${DATASET_ID}.ads_metrics\`
    WHERE date BETWEEN @startDate AND @endDate
      AND impressions > 0
    GROUP BY platform, campaign_name
    ORDER BY revenue DESC
  `

  const results = await executeQuery<any>(query, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  })

  return results.map((row: any) => ({
    platform: row.platform,
    campaign_name: row.campaign_name || 'Unknown',
    impressions: Number(row.impressions) || 0,
    clicks: Number(row.clicks) || 0,
    spend: Number(row.spend) || 0,
    conversions: Number(row.conversions) || 0,
    revenue: Number(row.revenue) || 0,
    roas: Number(row.roas) || 0,
    cpa: Number(row.cpa) || 0,
    ctr: Number(row.ctr) || 0,
  }))
}

/**
 * Get Marketplace Category Revenue
 * Used in: Marketplace Intelligence page
 */
export async function getMarketplaceCategoryRevenue(
  dateRange: { startDate: string; endDate: string } = getDateRange(30),
  category?: string
): Promise<MarketplaceCategoryRevenue[]> {
  let whereClause = `order_date BETWEEN @startDate AND @endDate`
  const params: any = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }

  if (category) {
    whereClause += ` AND category = @category`
    params.category = category
  }

  const query = `
    SELECT 
      category,
      SUM(line_revenue) as revenue,
      COUNT(DISTINCT order_id) as orders,
      AVG(line_revenue / qty) as avg_order_value,
      SUM(margin) as margin,
      SAFE_DIVIDE(SUM(margin), SUM(line_revenue)) as margin_percent
    FROM \`${DATASET_ID}.marketplace_orders\`
    WHERE ${whereClause}
    GROUP BY category
    ORDER BY revenue DESC
  `

  const results = await executeQuery<any>(query, params)

  return results.map((row: any) => ({
    category: row.category,
    revenue: Number(row.revenue) || 0,
    orders: Number(row.orders) || 0,
    avgOrderValue: Number(row.avg_order_value) || 0,
    margin: Number(row.margin) || 0,
    marginPercent: Number(row.margin_percent) || 0,
  }))
}

/**
 * Get City Performance
 * Used in: Market Domination, System Overview
 */
export async function getCityPerformance(
  dateRange: { startDate: string; endDate: string } = getDateRange(30)
): Promise<CityPerformance[]> {
  const query = `
    WITH city_revenue AS (
      SELECT 
        city,
        MAX(state) as state,
        SUM(total_revenue) as total_revenue,
        COUNT(DISTINCT mens_clinic_id) as clinic_count
      FROM \`${DATASET_ID}.clinic_revenue_daily\`
      WHERE date BETWEEN @startDate AND @endDate
        AND city IS NOT NULL
      GROUP BY city
    ),
    city_assessments AS (
      SELECT 
        city,
        COUNT(*) as assessment_count,
        COUNTIF(completed_at IS NOT NULL) as completions,
        SAFE_DIVIDE(COUNTIF(completed_at IS NOT NULL), COUNT(*)) as conversion_rate,
        AVG(predicted_LTV) as avg_ltv,
        ARRAY_AGG(path ORDER BY COUNT(*) DESC LIMIT 1)[OFFSET(0)] as top_path
      FROM \`${DATASET_ID}.assessment_funnel\`
      WHERE DATE(created_at) BETWEEN @startDate AND @endDate
        AND city IS NOT NULL
      GROUP BY city
    )
    SELECT 
      COALESCE(r.city, a.city) as city,
      COALESCE(r.state, '') as state,
      COALESCE(r.total_revenue, 0) as total_revenue,
      COALESCE(a.assessment_count, 0) as assessments,
      COALESCE(a.completions, 0) as completions,
      COALESCE(a.conversion_rate, 0) as conversion_rate,
      COALESCE(a.avg_ltv, 0) as avg_ltv,
      COALESCE(a.top_path, 'unknown') as top_path,
      COALESCE(r.clinic_count, 0) as clinic_count
    FROM city_revenue r
    FULL OUTER JOIN city_assessments a ON r.city = a.city
    WHERE COALESCE(r.city, a.city) IS NOT NULL
    ORDER BY total_revenue DESC
    LIMIT 50
  `

  const results = await executeQuery<any>(query, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  })

  return results.map((row: any) => ({
    city: row.city || '',
    state: row.state || '',
    totalRevenue: Number(row.total_revenue) || 0,
    assessments: Number(row.assessments) || 0,
    completions: Number(row.completions) || 0,
    conversionRate: Number(row.conversion_rate) || 0,
    avgLTV: Number(row.avg_ltv) || 0,
    topPath: row.top_path || 'unknown',
    clinicCount: Number(row.clinic_count) || 0,
  }))
}

/**
 * Get Trending Protocols
 * Used in: System Overview, Market Domination
 */
export async function getTrendingProtocols(
  dateRange: { startDate: string; endDate: string } = getDateRange(30)
): Promise<TrendingProtocol[]> {
  const currentPeriod = dateRange
  const previousPeriod = {
    startDate: new Date(
      new Date(dateRange.startDate).getTime() - 
      (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime())
    ).toISOString().split('T')[0],
    endDate: dateRange.startDate,
  }

  const query = `
    WITH current_period AS (
      SELECT 
        path,
        COUNT(*) as assessment_count,
        COUNTIF(completed_at IS NOT NULL) as completions,
        SAFE_DIVIDE(COUNTIF(completed_at IS NOT NULL), COUNT(*)) as completion_rate,
        AVG(predicted_LTV) as avg_ltv,
        ARRAY_AGG(city ORDER BY COUNT(*) DESC LIMIT 1)[OFFSET(0)] as top_city
      FROM \`${DATASET_ID}.assessment_funnel\`
      WHERE DATE(created_at) BETWEEN @currentStart AND @currentEnd
      GROUP BY path
    ),
    previous_period AS (
      SELECT 
        path,
        COUNT(*) as assessment_count
      FROM \`${DATASET_ID}.assessment_funnel\`
      WHERE DATE(created_at) BETWEEN @previousStart AND @previousEnd
      GROUP BY path
    ),
    path_revenue AS (
      SELECT 
        path,
        SUM(total_revenue) as revenue
      FROM \`${DATASET_ID}.assessment_funnel\` af
      JOIN \`${DATASET_ID}.clinic_revenue_daily\` crd
        ON DATE(af.created_at) = crd.date
      WHERE DATE(af.created_at) BETWEEN @currentStart AND @currentEnd
      GROUP BY path
    )
    SELECT 
      cp.path,
      cp.assessment_count,
      cp.completion_rate,
      COALESCE(pr.revenue, 0) as revenue,
      SAFE_DIVIDE(
        cp.assessment_count - COALESCE(pp.assessment_count, 0),
        COALESCE(pp.assessment_count, 1)
      ) as growth_rate,
      cp.top_city,
      cp.avg_ltv
    FROM current_period cp
    LEFT JOIN previous_period pp ON cp.path = pp.path
    LEFT JOIN path_revenue pr ON cp.path = pr.path
    ORDER BY cp.assessment_count DESC
  `

  const results = await executeQuery<any>(query, {
    currentStart: currentPeriod.startDate,
    currentEnd: currentPeriod.endDate,
    previousStart: previousPeriod.startDate,
    previousEnd: previousPeriod.endDate,
  })

  return results.map((row: any) => ({
    path: row.path || 'unknown',
    assessmentCount: Number(row.assessment_count) || 0,
    completionRate: Number(row.completion_rate) || 0,
    revenue: Number(row.revenue) || 0,
    growthRate: Number(row.growth_rate) || 0,
    topCity: row.top_city || 'unknown',
    avgLTV: Number(row.avg_ltv) || 0,
  }))
}
