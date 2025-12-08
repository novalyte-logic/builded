'use client'

import { useMemo } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { DateRangeOption, ServiceLineFilter } from '@/hooks/useRegionDemandAnalytics'
import { useRegionDemandAnalytics } from '@/hooks/useRegionDemandAnalytics'
import type { RegionDemandRow } from '@/lib/types/analytics'

interface DemandRadarPanelProps {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeOption
}

function formatConversionRate(value: number): { display: string; tone: 'good' | 'warn' | 'bad' } {
  const percent = value <= 1 ? value * 100 : value
  const display = `${percent.toFixed(1)}%`
  if (percent >= 60) return { display, tone: 'good' }
  if (percent >= 40) return { display, tone: 'warn' }
  return { display, tone: 'bad' }
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return '—'
  const date = new Date(ts)
  if (Number.isNaN(date.getTime())) return ts
  return date.toLocaleString()
}

export default function DemandRadarPanel({ serviceLine, dateRange }: DemandRadarPanelProps) {
  const { data, loading, error, refetch } = useRegionDemandAnalytics(serviceLine, dateRange)

  const rows = useMemo<RegionDemandRow[]>(() => data, [data])
  const maxLeadCount = useMemo(() => Math.max(...rows.map((r) => r.leadCount), 1), [rows])

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Demand Radar</h2>
          <p className="text-sm text-gray-400">
            Live regional demand signals by service line and state.
          </p>
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
            <p className="text-sm font-medium">Unable to load demand radar</p>
            <p className="text-xs text-gray-400">{error.message}</p>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-gray-400">No demand data available for this filter.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Service Line</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Lead Count</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Qualified</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Conversion Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Last Lead At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {rows.map((row, idx) => {
                const { display, tone } = formatConversionRate(row.conversionRate)
                const toneClass =
                  tone === 'good'
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : tone === 'warn'
                    ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
                    : 'bg-red-500/20 text-red-200 border-red-500/30'

                return (
                  <tr key={`${row.state}-${row.serviceLine}-${idx}`} className="hover:bg-dark-hover">
                    <td className="px-4 py-3 text-sm text-white">{row.state}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">{row.serviceLine.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-100">
                      <div className="flex items-center gap-2">
                        <span>{row.leadCount.toLocaleString()}</span>
                        <div className="flex-1 h-2 rounded-full bg-dark-accent overflow-hidden">
                          <div
                            className="h-2 bg-primary/70"
                            style={{ width: `${Math.min(100, (row.leadCount / maxLeadCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-100">{row.qualifiedCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${toneClass}`}>
                        {display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{formatTimestamp(row.lastLeadAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="p-4 flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Fetching the latest signals...
        </div>
      )}
    </div>
  )
}
