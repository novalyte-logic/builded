'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useAdminWorkforceRequests, type WorkforceRequestWithMatches } from '@/hooks/useAdminWorkforceRequests'

interface WorkforceDemandPanelProps {
  status?: string
  serviceLine?: string
  state?: string
}

function scoreBadge(score: number) {
  if (score >= 80) return 'bg-green-500/20 text-green-200 border-green-500/30'
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
  if (score >= 40) return 'bg-orange-500/20 text-orange-200 border-orange-500/30'
  return 'bg-red-500/20 text-red-200 border-red-500/30'
}

function statusBadge(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'OPEN') return 'bg-green-500/20 text-green-200 border-green-500/30'
  if (normalized === 'IN_REVIEW') return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
  if (normalized === 'FILLED') return 'bg-blue-500/20 text-blue-200 border-blue-500/30'
  return 'bg-gray-500/20 text-gray-200 border-gray-500/30'
}

export default function WorkforceDemandPanel(props: WorkforceDemandPanelProps) {
  const { data, loading, error, refetch } = useAdminWorkforceRequests({
    status: props.status,
    serviceLine: props.serviceLine,
    state: props.state,
  })
  const [selected, setSelected] = useState<WorkforceRequestWithMatches | null>(null)

  const rows = useMemo(() => data, [data])

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Workforce Demand &amp; Matches</h2>
          <p className="text-sm text-gray-400">
            Clinics requesting staffing and top-matched practitioners for placement.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded-lg bg-dark-accent/60 border border-dark-border animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 flex items-center gap-3 text-yellow-300 bg-yellow-500/5 border border-yellow-500/30 rounded-lg mx-4 my-4">
          <AlertTriangle className="w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Unable to load workforce requests</p>
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
        <div className="p-6 text-center text-gray-400">No workforce requests match this filter.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-dark-accent border-b border-dark-border">
              <tr>
                {['Clinic','Location','Service Line','Role','Employment','Shift','Start','Status','Matches'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {rows.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-dark-hover cursor-pointer"
                  onClick={() => setSelected(req)}
                >
                  <td className="px-4 py-3 text-sm text-white">{req.clinicName}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{req.city}, {req.state}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{req.serviceLine?.replace('_',' ')}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{req.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{req.employmentType}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{req.shiftType}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{req.startDate || 'ASAP'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary font-semibold">
                    {req.matches?.length || 0}
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
          Fetching staffing demand and matches...
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-xl bg-dark-surface border-l border-dark-border h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Staffing Request</p>
                <h3 className="text-xl font-semibold text-white">{selected.clinicName}</h3>
                <p className="text-sm text-gray-400">
                  {selected.city}, {selected.state} • {selected.role} • {selected.serviceLine?.replace('_',' ')}
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

            <div className="p-4 space-y-3 flex-1 overflow-auto">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Employment Type" value={selected.employmentType} />
                <Info label="Shift Type" value={selected.shiftType} />
                <Info label="Start Date" value={selected.startDate || 'ASAP'} />
                <Info label="Status" value={selected.status} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-2">Top Candidates</p>
                <div className="space-y-2">
                  {(selected.matches || []).map((m) => (
                    <div
                      key={`${selected.id}-${m.candidateId}`}
                      className="p-3 bg-dark-accent border border-dark-border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-white font-semibold">{m.fullName || 'Candidate'}</p>
                        <p className="text-xs text-gray-400">
                          {m.role} • {m.licenseState} • {m.experienceYears} yrs exp
                        </p>
                        <p className="text-xs text-gray-400">
                          ${m.hourlyRateMin} - ${m.hourlyRateMax} / hr
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${scoreBadge(m.matchScore)}`}>
                          {Math.round(m.matchScore)}%
                        </span>
                        <div className="flex gap-1 mt-2">
                          <button className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary/90">
                            View Profile
                          </button>
                          <button className="px-3 py-1 text-xs bg-dark-bg border border-dark-border text-gray-200 rounded-md hover:bg-dark-hover">
                            Mark Contacted
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selected.matches || selected.matches.length === 0) && (
                    <p className="text-xs text-gray-500">No matches yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-dark-accent border border-dark-border rounded-lg">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  )
}
