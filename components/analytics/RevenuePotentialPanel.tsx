'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import type { DateRangeOption, ServiceLineFilter } from '@/hooks/useRegionDemandAnalytics'
import { useRevenueIntelligence } from '@/hooks/useRevenueIntelligence'
import type { ClinicRevenueRow, RegionRevenueRow } from '@/lib/types/analytics'
import { formatCurrency } from '@/lib/utils'

interface RevenuePotentialPanelProps {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeOption
}

type TabKey = 'region' | 'clinic'

export default function RevenuePotentialPanel({ serviceLine, dateRange }: RevenuePotentialPanelProps) {
  const { data, loading, error, refetch } = useRevenueIntelligence({ serviceLine, dateRange })
  const [activeTab, setActiveTab] = useState<TabKey>('region')
  const [selectedClinic, setSelectedClinic] = useState<ClinicRevenueRow | null>(null)

  const summary = useMemo(() => {
    if (!data) return { totalRevenue: 0, totalPotential: 0, topServiceLine: null, topState: null }
    const totalRevenue = data.regions.reduce((sum, r) => sum + r.estimatedRevenue, 0)
    const totalPotential = data.regions.reduce(
      (sum, r) => sum + r.estimatedRevenuePotential,
      0
    )
    const topState =
      data.regions
        .slice()
        .sort((a, b) => b.estimatedRevenuePotential - a.estimatedRevenuePotential)[0] || null
    const topServiceLine =
      data.regions
        .slice()
        .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)[0] || null

    return { totalRevenue, totalPotential, topServiceLine, topState }
  }, [data])

  const regionRows: RegionRevenueRow[] = useMemo(() => {
    if (!data) return []
    return [...data.regions].sort(
      (a, b) => b.estimatedRevenuePotential - a.estimatedRevenuePotential
    )
  }, [data])

  const clinicRows: ClinicRevenueRow[] = useMemo(() => {
    if (!data) return []
    return [...data.clinics].sort(
      (a, b) => b.estimatedRevenuePotential - a.estimatedRevenuePotential
    )
  }, [data])

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-dark-border flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Revenue Potential</h2>
          <p className="text-sm text-gray-400">
            Estimated realized and potential revenue by region and clinic.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-dark-accent border border-dark-border rounded-lg px-3 py-2">
          <button
            onClick={() => setActiveTab('region')}
            className={`text-sm px-3 py-1 rounded-md ${
              activeTab === 'region' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            By Region
          </button>
          <button
            onClick={() => setActiveTab('clinic')}
            className={`text-sm px-3 py-1 rounded-md ${
              activeTab === 'clinic' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            By Clinic
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-12 rounded-lg bg-dark-accent/60 border border-dark-border animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 flex items-center gap-3 text-yellow-300 bg-yellow-500/5 border border-yellow-500/30 rounded-lg mx-4 my-4">
          <AlertTriangle className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Unable to load revenue intelligence</p>
            <p className="text-xs text-gray-400">{error.message}</p>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      ) : !data || regionRows.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No revenue data in this time range yet.</div>
      ) : (
        <>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryCard label="Estimated Revenue" value={formatCurrency(summary.totalRevenue)} />
            <SummaryCard
              label="Revenue Potential"
              value={formatCurrency(summary.totalPotential)}
              accent
            />
            <div className="p-3 bg-dark-accent border border-dark-border rounded-lg">
              <p className="text-xs uppercase tracking-wide text-gray-500">Top Signal</p>
              <p className="text-sm text-gray-200">
                {summary.topState
                  ? `${summary.topState.state} • ${formatCurrency(
                      summary.topState.estimatedRevenuePotential
                    )} potential`
                  : '—'}
              </p>
            </div>
          </div>

          {activeTab === 'region' ? (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    {['State','Service Line','Leads','Qualified','Booked','Effective Close Rate','Est. Revenue','Est. Revenue Potential'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {regionRows.map((row, idx) => (
                    <tr key={`${row.state}-${row.serviceLine}-${idx}`} className="hover:bg-dark-hover">
                      <td className="px-4 py-3 text-sm text-white">{row.state}</td>
                      <td className="px-4 py-3 text-sm text-gray-200">{row.serviceLine.replace('_',' ')}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">{row.leadCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">{row.qualifiedLeadCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">{row.bookedLeadCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">
                        {(row.effectiveCloseRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-100">
                        {formatCurrency(row.estimatedRevenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-primary font-semibold">
                        {formatCurrency(row.estimatedRevenuePotential)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    {['Clinic','Location','Service Line','Leads','Qualified','Booked','Effective Close Rate','Est. Revenue','Est. Revenue Potential'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {clinicRows.map((row, idx) => (
                    <tr
                      key={`${row.clinicId}-${idx}`}
                      className="hover:bg-dark-hover cursor-pointer"
                      onClick={() => setSelectedClinic(row)}
                    >
                      <td className="px-4 py-3 text-sm text-white">{row.clinicName}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {row.city}, {row.state}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-200">{row.serviceLine.replace('_',' ')}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">{row.leadCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">{row.qualifiedLeadCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">{row.bookedLeadCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-100">
                        {(row.effectiveCloseRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-100">
                        {formatCurrency(row.estimatedRevenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-primary font-semibold">
                        {formatCurrency(row.estimatedRevenuePotential)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="p-4 flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Estimating revenue and upside...
        </div>
      )}

      {selectedClinic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-md bg-dark-surface border-l border-dark-border h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Clinic</p>
                <h3 className="text-xl font-semibold text-white">{selectedClinic.clinicName}</h3>
                <p className="text-sm text-gray-400">
                  {selectedClinic.city}, {selectedClinic.state} • {selectedClinic.serviceLine.replace('_',' ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedClinic(null)}
                className="p-2 rounded-lg hover:bg-dark-hover text-gray-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-auto">
              <Detail label="Leads" value={selectedClinic.leadCount.toString()} />
              <Detail label="Qualified" value={selectedClinic.qualifiedLeadCount.toString()} />
              <Detail label="Booked" value={selectedClinic.bookedLeadCount.toString()} />
              <Detail
                label="Effective Close Rate"
                value={`${(selectedClinic.effectiveCloseRate * 100).toFixed(1)}%`}
              />
              <Detail label="Avg Revenue / Patient" value={formatCurrency(selectedClinic.avgRevenuePerPatient)} />
              <Detail label="Estimated Revenue" value={formatCurrency(selectedClinic.estimatedRevenue)} />
              <Detail
                label="Revenue Potential"
                value={formatCurrency(selectedClinic.estimatedRevenuePotential)}
                highlight
              />
              <div className="p-3 bg-dark-accent border border-dark-border rounded-lg">
                <p className="text-sm text-gray-200 font-semibold mb-1">Narrative</p>
                <p className="text-xs text-gray-400">
                  This clinic has {formatCurrency(selectedClinic.estimatedRevenue)} realized revenue and
                  {` ${formatCurrency(selectedClinic.estimatedRevenuePotential)} `} potential in this window.
                  Prioritize retainer discussions or campaign boosts to unlock the upside.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-dark-border flex flex-col gap-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                Open Clinic Profile
              </button>
              <button className="w-full px-4 py-2 bg-dark-accent border border-dark-border text-gray-200 rounded-lg hover:bg-dark-hover transition">
                Propose Retainer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-3 border border-dark-border rounded-lg ${accent ? 'bg-primary/10' : 'bg-dark-accent'}`}>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-xl font-semibold ${accent ? 'text-primary' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function Detail({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 bg-dark-accent border border-dark-border rounded-lg flex items-center justify-between">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
    </div>
  )
}
