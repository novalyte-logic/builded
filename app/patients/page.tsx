'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, MapPin, RefreshCw, Loader2 } from 'lucide-react'
import KPICardWithSparkline from '@/components/patient-intelligence/KPICardWithSparkline'
import PatientFunnel from '@/components/patient-intelligence/PatientFunnel'
import CohortsByGoal from '@/components/patient-intelligence/CohortsByGoal'
import AIInsightsStrip from '@/components/patient-intelligence/AIInsightsStrip'
import { formatNumber, formatCurrency } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

type DateRange = '7d' | '30d' | '90d' | 'custom'
type GeoMode = 'nationwide' | 'state' | 'city'

type PatientFunnelStep = {
  key: string
  label: string
  value: number
  conversionRate?: number
}

type CohortStat = {
  key: string
  label: string
  percentage: number
  topByVolume?: boolean
  topByRevenue?: boolean
  churnRiskPct?: number
}

type AiInsight = {
  id: string
  title: string
  body: string
}

type PatientsOverviewResponse = {
  filters: {
    dateRange: DateRange
    geoMode: GeoMode
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

function usePatientsOverview({ dateRange, geoMode }: { dateRange: DateRange; geoMode: GeoMode }) {
  const [state, setState] = useState<{
    data?: PatientsOverviewResponse
    error?: Error
    loading: boolean
  }>({ loading: true })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const params = new URLSearchParams({
          dateRange,
          geoMode,
        })
        const res = await fetch(`/api/patients/overview?${params.toString()}`)
        const json = (await res.json()) as PatientsOverviewResponse
        if (!cancelled) {
          setState({ data: json, error: undefined, loading: false })
        }
      } catch (err) {
        if (!cancelled) {
          setState({ data: undefined, error: err as Error, loading: false })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [dateRange, geoMode])

  const refetch = async () => {
    try {
      const params = new URLSearchParams({
        dateRange,
        geoMode,
      })
      const res = await fetch(`/api/patients/overview?${params.toString()}`)
      const json = (await res.json()) as PatientsOverviewResponse
      setState({ data: json, error: undefined, loading: false })
    } catch (err) {
      setState((prev) => ({ data: prev.data, error: err as Error, loading: false }))
    }
  }

  return {
    data: state.data,
    error: state.error,
    isLoading: state.loading,
    refetch,
  }
}

function SkeletonTopline() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4 animate-pulse">
      <div className="h-3 w-24 bg-dark-border rounded mb-2" />
      <div className="h-6 w-28 bg-dark-border rounded mb-3" />
      <div className="h-2 w-16 bg-dark-border rounded" />
    </div>
  )
}

export default function PatientsPage() {
  const [timeRange, setTimeRange] = useState<DateRange>('30d')
  const [geography, setGeography] = useState<GeoMode>('nationwide')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const { data, error, isLoading, refetch } = usePatientsOverview({
    dateRange: timeRange,
    geoMode: geography,
  })
  const [toast, setToast] = useState<string | null>(null)
  const lastUpdated = data?.meta?.lastUpdated ? new Date(data.meta.lastUpdated) : null

  // Funnel Data - Matches event schema: Page Visitor → Assessment Started → Completed → Qualified → Booked → Showed → Active Protocol
  const funnelData = [
    {
      step: 'Page Visitor',
      count: 125000,
      dropoff: undefined,
      topReasons: undefined,
    },
    {
      step: 'Assessment Started',
      count: 89400,
      dropoff: 28.5,
      topReasons: [
        'Users browsing multiple treatment options before committing',
        'High form length perception barrier',
        'Privacy concerns about health data collection',
      ],
    },
    {
      step: 'Assessment Completed',
      count: 62300,
      dropoff: 30.3,
      topReasons: [
        'Complex questions causing abandonment',
        'Time constraints (assessment takes 8-12 minutes)',
        'Technical issues on mobile devices',
      ],
    },
    {
      step: 'Qualified',
      count: 47829,
      dropoff: 23.2,
      topReasons: [
        'AI scoring too conservative for edge cases',
        'Missing symptom data in incomplete assessments',
        'Geographic limitations (no clinic in area)',
      ],
    },
    {
      step: 'Booked',
      count: 32100,
      dropoff: 32.9,
      topReasons: [
        'Booking friction (calendar integration issues)',
        'Price concerns before consultation',
        'Competing priorities (work, family)',
      ],
    },
    {
      step: 'Showed',
      count: 28900,
      dropoff: 10.0,
      topReasons: [
        'Last-minute scheduling conflicts',
        'Travel distance to clinic',
        'Health insurance verification delays',
      ],
    },
    {
      step: 'Active Protocol',
      count: 26300,
      dropoff: 9.0,
      topReasons: [
        'Post-consultation pricing concerns',
        'Second thoughts about treatment commitment',
        'Medical clearance delays',
      ],
    },
  ]

  // Cohort Data - Segments: Hormones / Weight Loss / Recovery / Brain / Longevity
  const cohortData = [
    {
      name: 'Hormones',
      value: 11800,
      revenue: 4250000,
      churnRisk: 8.2,
    },
    {
      name: 'Weight Loss',
      value: 8900,
      revenue: 3120000,
      churnRisk: 12.5,
    },
    {
      name: 'Recovery',
      value: 3400,
      revenue: 1120000,
      churnRisk: 6.8,
    },
    {
      name: 'Brain',
      value: 2100,
      revenue: 890000,
      churnRisk: 15.3,
    },
    {
      name: 'Longevity',
      value: 100,
      revenue: 45000,
      churnRisk: 3.2,
    },
  ]

  // AI Insights - Gemini-powered insights (Last 7 Days)
  const aiInsights = [
    {
      text: 'Men 35–44 in Texas starting GLP-1 have 22% higher completion rates than national average.',
      type: 'positive' as const,
    },
    {
      text: 'Low libido + brain fog cluster is spiking (+18% week-over-week) – recommend pushing hormone optimization content.',
      type: 'warning' as const,
    },
    {
      text: 'Assessment drop-off increases 34% after step 4 (symptom severity) – consider simplifying question structure.',
      type: 'neutral' as const,
    },
    {
      text: 'Peptide recovery protocols showing 15% higher retention vs. baseline – consider featuring more prominently.',
      type: 'positive' as const,
    },
    {
      text: 'Miami-Dade County has 3.2x higher booking-to-show rate compared to other Florida regions.',
      type: 'neutral' as const,
    },
  ]

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      {/* Main Card Container */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-dark-border pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Patient Intelligence — Men&apos;s Health Cohorts
              </h1>
              <p className="text-sm text-gray-400">
                What is happening with patients across the entire Novalyte ecosystem right now
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status="live" />
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-dark-accent border border-dark-border rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <select
                value={geography}
                onChange={(e) => setGeography(e.target.value as any)}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="nationwide">Nationwide</option>
                <option value="state">By State</option>
                <option value="city">By City</option>
              </select>
            </div>
            {geography === 'state' && (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select State</option>
                <option value="TX">Texas</option>
                <option value="CA">California</option>
                <option value="FL">Florida</option>
                <option value="NY">New York</option>
              </select>
            )}
            {geography === 'city' && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select City</option>
                <option value="austin">Austin</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="miami">Miami</option>
                <option value="new-york">New York</option>
              </select>
            )}
          </div>
        </div>

        {/* ROW 1: Topline KPIs */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Topline Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading || !data ? (
              <>
                <SkeletonTopline />
                <SkeletonTopline />
                <SkeletonTopline />
                <SkeletonTopline />
                <SkeletonTopline />
                <SkeletonTopline />
              </>
            ) : (
              <>
                <KPICardWithSparkline
                  title="Total Active Patients (30d)"
                  value={formatNumber(data.topline.totalActivePatients)}
                  sparklineData={[]}
                  tooltipWhat="Number of unique patients who have interacted with Novalyte in the last 30 days (assessments, bookings, active protocols)."
                  tooltipWhy="Shows overall patient engagement and platform health. Growth here indicates expanding user base."
                  tooltipHow={[
                    'Active = any interaction in last 30 days',
                    'Includes all patient types',
                    'Core metric for platform scale',
                  ]}
                />
                <KPICardWithSparkline
                  title="New Assessments (7d)"
                  value={formatNumber(data.topline.newAssessments7d)}
                  sparklineData={[]}
                  tooltipWhat="Count of new Men&apos;s Health Assessments started in the last 7 days."
                  tooltipWhy="Leading indicator of pipeline health. More assessments = more potential patients = more revenue."
                  tooltipHow={[
                    'Tracks patient.assessment_start events',
                    '7-day window for recent trends',
                    'Filters out repeat assessments',
                  ]}
                />
                <KPICardWithSparkline
                  title="Assessment → Consult Conversion Rate"
                  value={`${data.topline.assessmentToConsultConversionPct.toFixed(1)}%`}
                  sparklineData={[]}
                  tooltipWhat="Percentage of completed assessments that result in a booked consultation."
                  tooltipWhy="Higher conversion = better qualification process = more efficient revenue generation."
                  tooltipHow={[
                    'Calculated: Booked / Completed Assessments',
                    'Excludes unqualified assessments',
                    'Key funnel metric',
                  ]}
                />
                <KPICardWithSparkline
                  title="Avg Time From Assessment → First Visit"
                  value={`${data.topline.avgTimeAssessmentToVisitDays.toFixed(1)} days`}
                  sparklineData={[]}
                  tooltipWhat="Average number of days between assessment completion and first clinic visit."
                  tooltipWhy="Shorter time = faster revenue realization. Long delays indicate friction in booking process."
                  tooltipHow={[
                    'Days between assessment_completed and visit_date',
                    'Includes all qualified patients',
                    'Lower is better',
                  ]}
                />
                <KPICardWithSparkline
                  title="TRT vs GLP-1 vs Recovery Split (%)"
                  value={`TRT: ${data.topline.trtSharePct}% | GLP-1: ${data.topline.glp1SharePct}% | Recovery: ${data.topline.recoverySharePct}%`}
                  sparklineData={[]}
                  tooltipWhat="Distribution of patients across primary treatment protocols: Hormones (TRT), Weight Loss (GLP-1), Recovery."
                  tooltipWhy="Shows market demand trends. Helps optimize content, inventory, and clinic capacity planning."
                  tooltipHow={[
                    'Based on recommended_path from assessments',
                    'Shows protocol preference',
                    'Helps resource allocation',
                  ]}
                />
                <KPICardWithSparkline
                  title="Avg Patient LTV (Projected)"
                  value={formatCurrency(data.topline.avgPatientLtvUsd)}
                  sparklineData={[]}
                  tooltipWhat="Projected lifetime value per patient based on protocol type, retention patterns, and historical data."
                  tooltipWhy="Critical for CAC/LTV ratio. Higher LTV = more budget for acquisition = growth potential."
                  tooltipHow={[
                    'AI-modeled projection from historical data',
                    'Includes all revenue streams',
                    'Key for unit economics',
                  ]}
                />
              </>
            )}
          </div>
        </div>

        {/* ROW 2: Cohort & Funnel Visuals */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Funnel Analysis & Cohort Breakdown
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Patient Funnel */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Patient Funnel — From Interest to Treatment
              </h3>
              {isLoading || !data ? (
                <div className="h-64 bg-dark-surface/60 border border-dark-border rounded-lg animate-pulse" />
              ) : (
                <PatientFunnel
                  data={data.funnel.steps.map((step) => ({
                    step: step.label,
                    count: step.value,
                    dropoff: step.conversionRate ? 100 - step.conversionRate : undefined,
                    topReasons: undefined,
                  }))}
                />
              )}
            </div>

            {/* Right: Cohorts by Primary Goal */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cohorts by Primary Goal</h3>
              {isLoading || !data ? (
                <div className="h-64 bg-dark-surface/60 border border-dark-border rounded-lg animate-pulse" />
              ) : (
                <CohortsByGoal
                  data={data.cohorts.byPrimaryGoal.map((c) => ({
                    name: c.label,
                    value: Math.round((data.topline.totalActivePatients * c.percentage) / 100),
                    revenue: Math.round((data.topline.avgPatientLtvUsd * (c.percentage / 100)) * 1200),
                    churnRisk: c.churnRiskPct || 0,
                  }))}
                />
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: AI Insights Strip */}
        <div>
          {isLoading || !data ? (
            <div className="h-40 bg-dark-surface/60 border border-dark-border rounded-lg animate-pulse" />
          ) : (
            <AIInsightsStrip
              insights={data.aiInsights.map((insight) => ({
                text: `${insight.title} — ${insight.body}`,
                type: insight.body.toLowerCase().includes('spike') || insight.body.toLowerCase().includes('latency')
                  ? 'warning'
                  : insight.body.toLowerCase().includes('higher') || insight.body.toLowerCase().includes('retention')
                  ? 'positive'
                  : 'neutral',
              }))}
              onViewAtRisk={async () => {
                const res = await fetch('/api/patients/at-risk', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ dateRange: timeRange, geoMode: geography }),
                })
                const json = await res.json()
                if (json?.suggestedSegments) {
                  setToast(`At-risk segments: ${json.suggestedSegments.length}`)
                } else {
                  setToast('Failed to fetch at-risk patients')
                }
              }}
              onLaunchReactivation={async () => {
                const res = await fetch('/api/patients/reactivation', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ segmentKey: 'at_risk_default' }),
                })
                const json = await res.json()
                setToast(json?.message || 'Reactivation triggered (mock)')
              }}
              onSuggestBlog={async () => {
                const res = await fetch('/api/patients/blog-topics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ focus: 'patient_activity_last_7_days' }),
                })
                const json = await res.json()
                if (json?.topics) {
                  setToast(`Suggested topics: ${json.topics.length}`)
                } else {
                  setToast('Failed to suggest topics')
                }
              }}
            />
          )}
        </div>
        {toast && (
          <div className="fixed bottom-4 right-4 bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-sm text-gray-200 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
