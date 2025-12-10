'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import ClinicPerformanceTable from '@/components/clinic-performance/ClinicPerformanceTable'
import TopPerformersChart from '@/components/clinic-performance/TopPerformersChart'
import NoShowHeatmap from '@/components/clinic-performance/NoShowHeatmap'
import ClinicAIInsights from '@/components/clinic-performance/ClinicAIInsights'
import { formatCurrency } from '@/lib/utils'
import { ClinicRecord, ClinicServiceLine, ClinicStatus } from '@/lib/types/clinics'

type ClinicPerformanceRow = {
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
  const [clinics, setClinics] = useState<ClinicRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [serviceLineFilter, setServiceLineFilter] = useState<'ALL' | ClinicServiceLine>('ALL')
  const [regionFilter, setRegionFilter] = useState<'ALL' | string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClinicStatus>('ALL')
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [showAiInsight, setShowAiInsight] = useState<string | null>(null)

  useEffect(() => {
    fetchClinics()
    const interval = setInterval(fetchClinics, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [serviceLineFilter, regionFilter, statusFilter])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (serviceLineFilter !== 'ALL') params.set('serviceLine', serviceLineFilter)
      if (regionFilter !== 'ALL') params.set('region', regionFilter)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await fetch(`/api/clinics?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load clinics')
      }
      setClinics(json.clinics || [])
    } catch (err: any) {
      console.error('Error fetching clinics:', err)
      setError(err.message || 'Failed to load clinics')
      setClinics([])
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (clinicId: string) => {
    setSelectedClinicId(clinicId)
  }

  const selectedClinic = useMemo(
    () => clinics.find((c) => c.id === selectedClinicId) || null,
    [clinics, selectedClinicId]
  )

  // Calculate network median
  const mappedPerformance: ClinicPerformanceRow[] = useMemo(() => {
    return clinics.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      state: c.state,
      matchScore: Math.round((c.capacityScore + c.demandScore) / 2),
      leadToConsultRate: c.capacityScore / 120, // mock mapping
      consultToProtocolRate: c.demandScore / 120, // mock mapping
      noShowRate: Math.max(0.05, (100 - c.capacityScore) / 400),
      revenue30d: c.avgLtvUsd ? c.avgLtvUsd * 20 : 75000,
      patientNPS: c.capacityScore > 50 ? Math.round(c.capacityScore / 2) : null,
      primaryFocus: c.serviceLines,
    }))
  }, [clinics])

  const networkMedian = {
    leadToConsult:
      mappedPerformance.reduce((sum, c) => sum + c.leadToConsultRate, 0) / (mappedPerformance.length || 1),
    consultToProtocol:
      mappedPerformance.reduce((sum, c) => sum + c.consultToProtocolRate, 0) / (mappedPerformance.length || 1),
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
          <div className="flex items-center gap-3">
            <button
              onClick={fetchClinics}
              disabled={loading}
              className="px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <StatusBadge status="live" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Service Line</label>
            <select
              value={serviceLineFilter}
              onChange={(e) => setServiceLineFilter(e.target.value as any)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="TRT">TRT</option>
              <option value="GLP1">GLP-1</option>
              <option value="IV_THERAPY">IV Therapy</option>
              <option value="PEPTIDES">Peptides</option>
              <option value="RECOVERY">Recovery</option>
              <option value="LONGEVITY">Longevity</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Region</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Regions</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
              <option value="NY">New York</option>
              <option value="IL">Illinois</option>
              <option value="CO">Colorado</option>
              <option value="AZ">Arizona</option>
              <option value="WA">Washington</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="pending">Pending</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
          <div className="flex items-end">
            {error && (
              <div className="w-full text-xs text-status-offline bg-status-offline/10 border border-status-offline/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* LEFT: Clinic Performance Table */}
        <div className="lg:col-span-2">
          <ClinicPerformanceTable
            clinics={mappedPerformance}
            onRowClick={handleRowClick}
            selectedId={selectedClinicId}
            isLoading={loading}
            error={error}
          />
        </div>

        {/* RIGHT: Benchmark Visuals */}
        <div className="space-y-6">
          {/* Top Performers Chart */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              Top Performers vs Network Median
            </h3>
            <TopPerformersChart clinics={mappedPerformance} networkMedian={networkMedian} />
          </div>

          {/* No-Show Heatmap */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-white mb-4">No-Show Heatmap</h3>
            <NoShowHeatmap data={noShowHeatmapData} />
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-lg p-6">
          {selectedClinic ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedClinic.name}</h3>
                  <p className="text-sm text-gray-400">
                    {selectedClinic.city}, {selectedClinic.state} • {selectedClinic.status.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/admin/dealflow?clinicId=${selectedClinic.id}`)}
                    className="px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-hover transition-colors"
                  >
                    View in Dealflow
                  </button>
                  <button
                    onClick={() => router.push(`/patients?clinicId=${selectedClinic.id}`)}
                    className="px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-hover transition-colors"
                  >
                    View Patients
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${selectedClinic.name} ${selectedClinic.city} ${selectedClinic.state}`
                        )}`,
                        '_blank'
                      )
                    }
                    className="px-3 py-2 bg-dark-accent border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-hover transition-colors"
                  >
                    Open in Maps
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Service Lines</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedClinic.serviceLines.map((s) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Capacity Score</p>
                  <p className="text-lg font-semibold text-white">{selectedClinic.capacityScore}</p>
                  <p className="text-xs text-gray-500">Higher = more open slots</p>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Demand Score</p>
                  <p className="text-lg font-semibold text-white">{selectedClinic.demandScore}</p>
                  <p className="text-xs text-gray-500">Higher = hotter market</p>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Avg LTV</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedClinic.avgLtvUsd ? formatCurrency(selectedClinic.avgLtvUsd) : '—'}
                  </p>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Patients</p>
                  <p className="text-lg font-semibold text-white">{selectedClinic.totalPatients ?? '—'}</p>
                </div>
                <div className="bg-dark-bg border border-dark-border rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Last Lead</p>
                  <p className="text-sm text-gray-300">
                    {selectedClinic.lastLeadAt ? new Date(selectedClinic.lastLeadAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
              <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">AI Insight</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-300">
                    {showAiInsight ||
                      `Clinic in ${selectedClinic.region || selectedClinic.state} with ${selectedClinic.serviceLines.join(
                        ', '
                      )} focus. Capacity ${selectedClinic.capacityScore}/100, demand ${selectedClinic.demandScore}/100.`}
                  </p>
                  <button
                    onClick={() =>
                      setShowAiInsight(
                        `This ${selectedClinic.serviceLines[0]}-heavy clinic in ${selectedClinic.state} has demand ${selectedClinic.demandScore}/100 and capacity ${selectedClinic.capacityScore}/100. Route additional leads here while capacity remains.`
                      )
                    }
                    className="ml-4 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs hover:bg-primary/20 transition-colors"
                  >
                    Generate AI Insight
                  </button>
                </div>
              </div>
              {selectedClinic.notes && (
                <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Notes</p>
                  <p className="text-sm text-gray-300">{selectedClinic.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">Select a clinic to view details</div>
          )}
        </div>

        {/* AI Insights Panel */}
        <ClinicAIInsights
          insights={aiInsights}
          onViewClinic={(clinicId) => setSelectedClinicId(clinicId)}
          onContactClinic={(clinicId) => router.push(`/admin/dealflow?clinicId=${clinicId}`)}
          onGenerateReport={(clinicId) => router.push(`/admin/dealflow?clinicId=${clinicId}&report=1`)}
        />
      </div>
    </div>
  )
}
