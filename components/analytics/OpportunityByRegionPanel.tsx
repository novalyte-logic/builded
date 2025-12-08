'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, Loader2, X } from 'lucide-react'
import type { DateRangeOption, ServiceLineFilter } from '@/hooks/useRegionDemandAnalytics'
import { useDemandSupplyAnalytics } from '@/hooks/useDemandSupplyAnalytics'
import type { DemandSupplyRow } from '@/lib/types/analytics'

interface OpportunityByRegionPanelProps {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeOption
}

function trendIcon(direction: DemandSupplyRow['trendDirection']) {
  switch (direction) {
    case 'RISING':
      return <ArrowUp className="w-4 h-4 text-green-400" />
    case 'FALLING':
      return <ArrowDown className="w-4 h-4 text-red-400" />
    default:
      return <ArrowRight className="w-4 h-4 text-gray-300" />
  }
}

export default function OpportunityByRegionPanel({
  serviceLine,
  dateRange,
}: OpportunityByRegionPanelProps) {
  const { data, loading, error, refetch } = useDemandSupplyAnalytics(serviceLine, dateRange)
  const [selected, setSelected] = useState<DemandSupplyRow | null>(null)

  const sortedRows = useMemo(
    () =>
      [...data].sort((a, b) => {
        return b.opportunityScore - a.opportunityScore
      }),
    [data]
  )

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-white">Opportunity by Region</h2>
        <p className="text-sm text-gray-400">
          Ranks states by demand, supply, and Novalyte footprint to highlight where to go next.
        </p>
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
            <p className="text-sm font-medium">Unable to load opportunity table</p>
            <p className="text-xs text-gray-400">{error.message}</p>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No opportunity data available. Try a different filter or time window.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Service Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Interest Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Trend
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Clinic Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Novalyte Clinics
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Opportunity Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {sortedRows.map((row, idx) => (
                <tr
                  key={`${row.state}-${row.serviceLine}-${idx}`}
                  onClick={() => setSelected(row)}
                  className="hover:bg-dark-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">{row.state}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">
                    {row.serviceLine.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.interestScore.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      {trendIcon(row.trendDirection)}
                      <span>{row.trendDirection}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.clinicCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.novalyteClinicCount}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-semibold">
                      {row.opportunityScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="p-4 flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Calculating opportunity scores...
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-40">
          <div className="w-full max-w-md bg-dark-surface border-l border-dark-border h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Region</p>
                <h3 className="text-xl font-semibold text-white">
                  {selected.serviceLine.replace('_', ' ')} in {selected.state}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-dark-hover text-gray-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Interest Score" value={selected.interestScore.toFixed(1)} />
                <Stat label="Trend" value={selected.trendDirection} />
                <Stat label="Clinic Count" value={selected.clinicCount.toString()} />
                <Stat
                  label="Novalyte Clinics"
                  value={selected.novalyteClinicCount.toString()}
                />
                <Stat
                  label="Opportunity Score"
                  value={selected.opportunityScore.toFixed(1)}
                  highlight
                />
              </div>
              <div className="p-3 bg-dark-accent border border-dark-border rounded-lg">
                <p className="text-sm text-gray-200 font-semibold mb-1">Playbook</p>
                <p className="text-xs text-gray-400">
                  Prioritize outbound to high-interest, low-supply states. Pair clinics with lead
                  routing and paid search boosts to accelerate footprint.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-dark-border flex flex-col gap-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                View clinics in this region
              </button>
              <button className="w-full px-4 py-2 bg-dark-accent border border-dark-border text-gray-200 rounded-lg hover:bg-dark-hover transition">
                Open outbound playbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 bg-dark-accent border border-dark-border rounded-lg">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</p>
    </div>
  )
}
