'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import type { DateRangeOption, ServiceLineFilter } from '@/hooks/useRegionDemandAnalytics'
import { useClinicIntentAnalytics } from '@/hooks/useClinicIntentAnalytics'
import type { ClinicIntentRow, IntentTier } from '@/lib/types/analytics'

const INTENT_ORDER: IntentTier[] = ['HIGH_NEED', 'MEDIUM_NEED', 'STABLE', 'LOW']

interface ClinicIntentPanelProps {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeOption
}

export default function ClinicIntentPanel({ serviceLine, dateRange }: ClinicIntentPanelProps) {
  const { data, loading, error, refetch } = useClinicIntentAnalytics({ serviceLine, dateRange })
  const [showOnlyNeeding, setShowOnlyNeeding] = useState(true)
  const [selected, setSelected] = useState<ClinicIntentRow | null>(null)

  const filtered = useMemo(() => {
    const base = showOnlyNeeding ? data.filter((row) => row.needsPatients) : data
    return [...base].sort((a, b) => {
      const tierDiff = INTENT_ORDER.indexOf(a.intentTier) - INTENT_ORDER.indexOf(b.intentTier)
      if (tierDiff !== 0) return tierDiff
      return b.engagementScore - a.engagementScore
    })
  }, [data, showOnlyNeeding])

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-dark-border flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Clinics Needing Patients</h2>
          <p className="text-sm text-gray-400">
            Clinics with high engagement but low lead volume. These are prime targets for patient acquisition campaigns.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showOnlyNeeding}
            onChange={(e) => setShowOnlyNeeding(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span>Only needing patients</span>
        </label>
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
            <p className="text-sm font-medium">Unable to load clinic intent</p>
            <p className="text-xs text-gray-400">{error.message}</p>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No clinics needing patients in this time range. Great job keeping the funnel healthy!
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Clinic
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Service Line
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Leads
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Qualified
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Profile Views
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Pricing Views
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Contact Clicks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Engagement
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Intent Tier
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((row, idx) => (
                <tr
                  key={`${row.clinicId}-${idx}`}
                  onClick={() => setSelected(row)}
                  className="hover:bg-dark-hover cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">{row.clinicName}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {row.city}, {row.state}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">{row.serviceLine.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.leadCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.qualifiedLeadCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.profileViews}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.pricingViews}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.contactClicks}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{row.engagementScore.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <IntentBadge tier={row.intentTier} />
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
          Surfacing clinics needing patient acquisition...
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-md bg-dark-surface border-l border-dark-border h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Clinic</p>
                <h3 className="text-xl font-semibold text-white">{selected.clinicName}</h3>
                <p className="text-sm text-gray-400">
                  {selected.city}, {selected.state} • {selected.serviceLine.replace('_', ' ')}
                </p>
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
                <Stat label="Leads" value={selected.leadCount.toString()} />
                <Stat label="Qualified" value={selected.qualifiedLeadCount.toString()} />
                <Stat label="Profile Views" value={selected.profileViews.toString()} />
                <Stat label="Pricing Views" value={selected.pricingViews.toString()} />
                <Stat label="Contact Clicks" value={selected.contactClicks.toString()} />
                <Stat label="Engagement Score" value={selected.engagementScore.toFixed(1)} highlight />
                <Stat label="Lead/View Ratio" value={selected.leadToViewRatio.toFixed(2)} />
                <Stat label="Intent Tier" value={selected.intentTier.replace('_', ' ')} />
              </div>
              <div className="p-3 bg-dark-accent border border-dark-border rounded-lg">
                <p className="text-sm text-gray-200 font-semibold mb-1">Narrative</p>
                <p className="text-xs text-gray-400">
                  {selected.intentTier === 'HIGH_NEED' || selected.intentTier === 'MEDIUM_NEED'
                    ? 'High engagement, low lead volume. Strong candidate for outbound support and campaign boosts.'
                    : selected.intentTier === 'STABLE'
                    ? 'Healthy balance of engagement and leads. Maintain steady support and monitor conversion.'
                    : 'Lower engagement and lead volume. Consider targeted awareness before heavier investment.'}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-dark-border flex flex-col gap-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                Open Clinic Profile
              </button>
              <button className="w-full px-4 py-2 bg-dark-accent border border-dark-border text-gray-200 rounded-lg hover:bg-dark-hover transition">
                Start Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IntentBadge({ tier }: { tier: IntentTier }) {
  const styles: Record<IntentTier, string> = {
    HIGH_NEED: 'bg-red-500/20 text-red-200 border-red-500/30',
    MEDIUM_NEED: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    STABLE: 'bg-green-500/20 text-green-200 border-green-500/30',
    LOW: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[tier]}`}>
      {tier.replace('_', ' ')}
    </span>
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
