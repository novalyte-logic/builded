/**
 * Patients Overview API (mocked)
 *
 * Filters: dateRange ("7d" | "30d" | "90d" | "custom"), geoMode ("nationwide" | "state" | "city")
 * Returns typed mock data that shifts slightly with filters so the UI feels live.
 */

import { NextRequest, NextResponse } from 'next/server'

export type PatientFunnelStep = {
  key: string
  label: string
  value: number
  conversionRate?: number
}

export type CohortStat = {
  key: string
  label: string
  percentage: number
  topByVolume?: boolean
  topByRevenue?: boolean
  churnRiskPct?: number
}

export type AiInsight = {
  id: string
  title: string
  body: string
}

export type PatientsOverviewResponse = {
  filters: {
    dateRange: '7d' | '30d' | '90d' | 'custom'
    geoMode: 'nationwide' | 'state' | 'city'
  }
  topline: {
    totalActivePatients: number
    newAssessments7d: number
    assessmentToConsultConversionPct: number
    avgTimeAssessmentToVisitDays: number
    trtSharePct: number
    glp1SharePct: number
    recoverySharePct: number
    avgPatientLtvUsd: number
  }
  funnel: {
    steps: PatientFunnelStep[]
  }
  cohorts: {
    byPrimaryGoal: CohortStat[]
  }
  aiInsights: AiInsight[]
  meta: {
    lastUpdated: string
  }
  error?: string
}

function adjustByFilters(
  base: number,
  dateRange: string,
  geoMode: string,
  boost: number = 0
): number {
  let val = base
  if (dateRange === '7d') val *= 0.35
  if (dateRange === '90d') val *= 3
  if (geoMode === 'state') val *= 0.42
  if (geoMode === 'city') val *= 0.2
  val *= 1 + boost
  return Math.round(val)
}

function generateFunnel(dateRange: string, geoMode: string): PatientFunnelStep[] {
  const base = 125000
  const visitor = adjustByFilters(base, dateRange, geoMode)
  const started = Math.round(visitor * 0.72)
  const completed = Math.round(started * 0.7)
  const qualified = Math.round(completed * 0.77)
  const booked = Math.round(qualified * 0.67)
  const showed = Math.round(booked * 0.9)
  const active = Math.round(showed * 0.91)

  return [
    { key: 'visitor', label: 'Page Visitor', value: visitor },
    { key: 'assessment_started', label: 'Assessment Started', value: started, conversionRate: (started / visitor) * 100 },
    { key: 'assessment_completed', label: 'Assessment Completed', value: completed, conversionRate: (completed / started) * 100 },
    { key: 'qualified', label: 'Qualified', value: qualified, conversionRate: (qualified / completed) * 100 },
    { key: 'booked', label: 'Booked', value: booked, conversionRate: (booked / qualified) * 100 },
    { key: 'showed', label: 'Showed', value: showed, conversionRate: (showed / booked) * 100 },
    { key: 'active_protocol', label: 'Active Protocol', value: active, conversionRate: (active / showed) * 100 },
  ]
}

function generateCohorts(): CohortStat[] {
  return [
    { key: 'hormones', label: 'Hormones', percentage: 45, topByVolume: true, topByRevenue: true },
    { key: 'weight_loss', label: 'Weight Loss', percentage: 34 },
    { key: 'recovery', label: 'Recovery', percentage: 13 },
    { key: 'brain', label: 'Brain', percentage: 8, churnRiskPct: 15.3 },
  ]
}

function generateInsights(): AiInsight[] {
  return [
    { id: 'insight-1', title: 'Higher GLP-1 completion in Texas', body: 'GLP-1 patients in Texas show 22% higher completion vs national baseline.' },
    { id: 'insight-2', title: 'Low libido + brain fog spike', body: 'Cluster up 18% WoW — recommend pushing hormone optimization content.' },
    { id: 'insight-3', title: 'Drop-off after step 4', body: 'Assessment drop-off increases 34% after symptom severity; simplify wording.' },
    { id: 'insight-4', title: 'Peptide recovery retention', body: 'Peptide recovery protocols show 15% higher retention vs baseline.' },
    { id: 'insight-5', title: 'Miami-Dade booking-to-show', body: 'Miami-Dade has 3.2x higher booking-to-show than other Florida regions.' },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateRange = (searchParams.get('dateRange') || '30d') as PatientsOverviewResponse['filters']['dateRange']
    const geoMode = (searchParams.get('geoMode') || 'nationwide') as PatientsOverviewResponse['filters']['geoMode']

    const topline = {
      totalActivePatients: adjustByFilters(47800, dateRange, geoMode),
      newAssessments7d: adjustByFilters(1200, dateRange, geoMode, dateRange === '7d' ? 0.05 : 0),
      assessmentToConsultConversionPct: 67.3 + (dateRange === '7d' ? 1.2 : dateRange === '90d' ? -0.8 : 0),
      avgTimeAssessmentToVisitDays: 4.2 + (geoMode === 'city' ? -0.2 : 0),
      trtSharePct: 45,
      glp1SharePct: 32,
      recoverySharePct: 23,
      avgPatientLtvUsd: adjustByFilters(3420, dateRange, geoMode, geoMode === 'city' ? 0.05 : 0),
    }

    const funnel = { steps: generateFunnel(dateRange, geoMode) }
    const cohorts = { byPrimaryGoal: generateCohorts() }
    const aiInsights = generateInsights()

    const response: PatientsOverviewResponse = {
      filters: { dateRange, geoMode },
      topline,
      funnel,
      cohorts,
      aiInsights,
      meta: { lastUpdated: new Date().toISOString() },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Patients overview error:', error)
    const fallback: PatientsOverviewResponse = {
      filters: { dateRange: '30d', geoMode: 'nationwide' },
      topline: {
        totalActivePatients: 0,
        newAssessments7d: 0,
        assessmentToConsultConversionPct: 0,
        avgTimeAssessmentToVisitDays: 0,
        trtSharePct: 0,
        glp1SharePct: 0,
        recoverySharePct: 0,
        avgPatientLtvUsd: 0,
      },
      funnel: { steps: [] },
      cohorts: { byPrimaryGoal: [] },
      aiInsights: [],
      meta: { lastUpdated: new Date().toISOString() },
      error: 'Internal error',
    }
    return NextResponse.json(fallback, { status: 500 })
  }
}

