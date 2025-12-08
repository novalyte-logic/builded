'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, RefreshCw } from 'lucide-react'
import KPICardWithSparkline from '@/components/patient-intelligence/KPICardWithSparkline'
import PatientFunnel from '@/components/patient-intelligence/PatientFunnel'
import CohortsByGoal from '@/components/patient-intelligence/CohortsByGoal'
import AIInsightsStrip from '@/components/patient-intelligence/AIInsightsStrip'
import { formatNumber, formatCurrency } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

interface SparklineDataPoint {
  date: string
  value: number
}

export default function PatientsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [geography, setGeography] = useState<'nationwide' | 'state' | 'city'>('nationwide')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Generate sparkline data (last 30 days) - will be replaced with real data from BigQuery
  const generateSparklineData = (baseValue: number, variance: number = 0.1): SparklineDataPoint[] => {
    const days = 30
    const data: SparklineDataPoint[] = []
    let currentValue = baseValue

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      currentValue = currentValue * (1 + (Math.random() - 0.5) * variance)
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, Math.round(currentValue)),
      })
    }
    return data
  }

  // Fetch patient intelligence data from API
  const fetchPatientData = async () => {
    setIsRefreshing(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/patient-intelligence?timeRange=${timeRange}&geography=${geography}&state=${selectedState}&city=${selectedCity}`)
      // const data = await response.json()
      
      // For now, use mock data (already set below)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPatientData()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchPatientData, 60000)
    return () => clearInterval(interval)
  }, [timeRange, geography, selectedState, selectedCity])

  // KPI Data - Will be replaced with BigQuery data
  const kpiData = {
    totalActivePatients: {
      value: formatNumber(47829),
      sparkline: generateSparklineData(47000, 0.02),
    },
    newAssessments: {
      value: formatNumber(1247),
      sparkline: generateSparklineData(1200, 0.15),
    },
    conversionRate: {
      value: '67.3%',
      sparkline: generateSparklineData(67, 0.05),
    },
    avgTimeToVisit: {
      value: '4.2 days',
      sparkline: generateSparklineData(4.2, 0.1),
    },
    protocolSplit: {
      value: 'TRT: 45% | GLP-1: 32% | Recovery: 23%',
      sparkline: generateSparklineData(45, 0.03),
    },
    avgLTV: {
      value: formatCurrency(3420),
      sparkline: generateSparklineData(3400, 0.02),
    },
  }

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
                onClick={fetchPatientData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
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
            <KPICardWithSparkline
              title="Total Active Patients (30d)"
              value={kpiData.totalActivePatients.value}
              sparklineData={kpiData.totalActivePatients.sparkline}
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
              value={kpiData.newAssessments.value}
              sparklineData={kpiData.newAssessments.sparkline}
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
              value={kpiData.conversionRate.value}
              sparklineData={kpiData.conversionRate.sparkline}
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
              value={kpiData.avgTimeToVisit.value}
              sparklineData={kpiData.avgTimeToVisit.sparkline}
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
              value={kpiData.protocolSplit.value}
              sparklineData={kpiData.protocolSplit.sparkline}
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
              value={kpiData.avgLTV.value}
              sparklineData={kpiData.avgLTV.sparkline}
              tooltipWhat="Projected lifetime value per patient based on protocol type, retention patterns, and historical data."
              tooltipWhy="Critical for CAC/LTV ratio. Higher LTV = more budget for acquisition = growth potential."
              tooltipHow={[
                'AI-modeled projection from historical data',
                'Includes all revenue streams',
                'Key for unit economics',
              ]}
            />
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
              <PatientFunnel data={funnelData} />
            </div>

            {/* Right: Cohorts by Primary Goal */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cohorts by Primary Goal</h3>
              <CohortsByGoal data={cohortData} />
            </div>
          </div>
        </div>

        {/* ROW 3: AI Insights Strip */}
        <div>
          <AIInsightsStrip
            insights={aiInsights}
            onViewAtRisk={() => {
              // TODO: Navigate to at-risk patients view
              console.log('View at-risk patients')
            }}
            onLaunchReactivation={() => {
              // TODO: Open reactivation campaign modal
              console.log('Launch reactivation sequence')
            }}
            onSuggestBlog={() => {
              // TODO: Generate blog topic suggestions
              console.log('Suggest blog topics')
            }}
          />
        </div>
      </div>
    </div>
  )
}
