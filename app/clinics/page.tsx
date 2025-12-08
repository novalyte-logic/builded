'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import ClinicPerformanceTable from '@/components/clinic-performance/ClinicPerformanceTable'
import TopPerformersChart from '@/components/clinic-performance/TopPerformersChart'
import NoShowHeatmap from '@/components/clinic-performance/NoShowHeatmap'
import ClinicAIInsights from '@/components/clinic-performance/ClinicAIInsights'
import { formatCurrency } from '@/lib/utils'

interface ClinicPerformance {
  id: string
  name: string
  city: string
  state: string
  matchScore: number
  leadToConsultRate: number
  consultToProtocolRate: number
  noShowRate: number
  revenue30d: number
  patientNPS: number | null
  primaryFocus: string[]
}

export default function ClinicsPage() {
  const router = useRouter()
  const [clinics, setClinics] = useState<ClinicPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClinics()
    const interval = setInterval(fetchClinics, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call to fetch clinic performance data
      // const response = await fetch('/api/admin/clinics/performance')
      // const data = await response.json()

      // Mock data for now
      const mockClinics: ClinicPerformance[] = [
        {
          id: '1',
          name: 'Los Angeles Men\'s Health',
          city: 'Los Angeles',
          state: 'CA',
          matchScore: 92,
          leadToConsultRate: 0.68,
          consultToProtocolRate: 0.74,
          noShowRate: 0.08,
          revenue30d: 89200,
          patientNPS: 65,
          primaryFocus: ['TRT', 'GLP-1'],
        },
        {
          id: '2',
          name: 'New York Premier Clinic',
          city: 'New York',
          state: 'NY',
          matchScore: 88,
          leadToConsultRate: 0.72,
          consultToProtocolRate: 0.81,
          noShowRate: 0.12,
          revenue30d: 145600,
          patientNPS: 72,
          primaryFocus: ['TRT', 'Recovery'],
        },
        {
          id: '3',
          name: 'Chicago Wellness Center',
          city: 'Chicago',
          state: 'IL',
          matchScore: 85,
          leadToConsultRate: 0.61,
          consultToProtocolRate: 0.69,
          noShowRate: 0.15,
          revenue30d: 67200,
          patientNPS: 58,
          primaryFocus: ['GLP-1', 'Recovery'],
        },
        {
          id: '4',
          name: 'Miami Beach Clinic',
          city: 'Miami',
          state: 'FL',
          matchScore: 72,
          leadToConsultRate: 0.45,
          consultToProtocolRate: 0.52,
          noShowRate: 0.22,
          revenue30d: 48900,
          patientNPS: 42,
          primaryFocus: ['TRT'],
        },
        {
          id: '5',
          name: 'Austin Men\'s Health Hub',
          city: 'Austin',
          state: 'TX',
          matchScore: 90,
          leadToConsultRate: 0.71,
          consultToProtocolRate: 0.78,
          noShowRate: 0.09,
          revenue30d: 112300,
          patientNPS: 68,
          primaryFocus: ['TRT', 'Longevity'],
        },
        {
          id: '6',
          name: 'San Francisco Peak Performance',
          city: 'San Francisco',
          state: 'CA',
          matchScore: 79,
          leadToConsultRate: 0.54,
          consultToProtocolRate: 0.63,
          noShowRate: 0.18,
          revenue30d: 78400,
          patientNPS: 55,
          primaryFocus: ['GLP-1', 'Recovery'],
        },
      ]

      setClinics(mockClinics)
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (clinicId: string) => {
    router.push(`/clinics-control?id=${clinicId}`)
  }

  // Calculate network median
  const networkMedian = {
    leadToConsult:
      clinics.reduce((sum, c) => sum + c.leadToConsultRate, 0) / (clinics.length || 1),
    consultToProtocol:
      clinics.reduce((sum, c) => sum + c.consultToProtocolRate, 0) / (clinics.length || 1),
  }

  // No-show heatmap data (mock - would come from BigQuery)
  const noShowHeatmapData = [
    { dayOfWeek: 'Monday', noShowRate: 0.12, count: 234 },
    { dayOfWeek: 'Tuesday', noShowRate: 0.09, count: 198 },
    { dayOfWeek: 'Wednesday', noShowRate: 0.08, count: 187 },
    { dayOfWeek: 'Thursday', noShowRate: 0.11, count: 201 },
    { dayOfWeek: 'Friday', noShowRate: 0.15, count: 156 },
    { dayOfWeek: 'Saturday', noShowRate: 0.18, count: 89 },
    { dayOfWeek: 'Sunday', noShowRate: 0.22, count: 45 },
  ]

  // AI Insights (mock - would come from Gemini)
  const aiInsights = [
    {
      clinic_id: '4',
      clinic_name: 'Miami Beach Clinic',
      insight_type: 'underperforming' as const,
      message: 'No-show rate is 22% (network median: 12%). Lead conversion is 45% vs 65% network average.',
      suggestedAction: 'This clinic needs triage script optimization and booking reminder automation.',
    },
    {
      clinic_id: '6',
      clinic_name: 'San Francisco Peak Performance',
      insight_type: 'warning' as const,
      message: 'Consult → Protocol conversion at 63% is below network median (72%). Review consultation follow-up process.',
      suggestedAction: 'Offer additional marketplace exposure and improve post-consult communication.',
    },
    {
      clinic_id: '2',
      clinic_name: 'New York Premier Clinic',
      insight_type: 'opportunity' as const,
      message: 'Top performer with 81% consult-to-protocol rate. Consider routing more high-LTV leads here.',
      suggestedAction: 'Scale lead volume by 20% to maximize revenue opportunity.',
    },
  ]

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">Men&apos;s Clinic Performance Grid</h1>
            <p className="text-gray-400 mt-1">
              Which men&apos;s clinics are performing, which are lagging, and where is revenue leaking?
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* LEFT: Clinic Performance Table */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
              <p className="text-gray-400">Loading clinic performance data...</p>
            </div>
          ) : (
            <ClinicPerformanceTable clinics={clinics} onRowClick={handleRowClick} />
          )}
        </div>

        {/* RIGHT: Benchmark Visuals */}
        <div className="space-y-6">
          {/* Top Performers Chart */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              Top Performers vs Network Median
            </h3>
            <TopPerformersChart clinics={clinics} networkMedian={networkMedian} />
          </div>

          {/* No-Show Heatmap */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">No-Show Heatmap</h3>
            <NoShowHeatmap data={noShowHeatmapData} />
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <ClinicAIInsights
        insights={aiInsights}
        onViewClinic={(clinicId) => router.push(`/clinics-control?id=${clinicId}`)}
        onContactClinic={(clinicId) => {
          // TODO: Open contact modal or navigate to contact
          console.log('Contact clinic:', clinicId)
        }}
        onGenerateReport={(clinicId) => {
          // TODO: Generate PDF report
          console.log('Generate report for clinic:', clinicId)
        }}
      />
    </div>
  )
}
