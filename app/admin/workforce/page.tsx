'use client'

import { useState } from 'react'
import WorkforceDemandPanel from '@/components/workforce/WorkforceDemandPanel'
import StatusBadge from '@/components/StatusBadge'

const serviceLineOptions = [
  { label: 'All Service Lines', value: '' },
  { label: 'TRT', value: 'TRT' },
  { label: 'Weight Loss', value: 'WEIGHT_LOSS' },
  { label: 'IV Therapy', value: 'IV_THERAPY' },
]

const statusOptions = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Filled', value: 'FILLED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function WorkforcePage() {
  const [serviceLine, setServiceLine] = useState<string>('')
  const [status, setStatus] = useState<string>('OPEN')
  const [stateFilter, setStateFilter] = useState<string>('')

  return (
    <div className="p-8 bg-dark-bg min-h-screen space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Workforce Exchange</h1>
          <p className="text-gray-400 mt-2">
            Connects clinics with vetted practitioners for TRT, weight loss, and IV therapy.
          </p>
        </div>
        <StatusBadge status="live" />
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Service Line</span>
          <select
            value={serviceLine}
            onChange={(e) => setServiceLine(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            {serviceLineOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">State</span>
          <input
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
            placeholder="e.g., CA"
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary w-24"
          />
        </div>
      </div>

      <WorkforceDemandPanel status={status} serviceLine={serviceLine || undefined} state={stateFilter || undefined} />
    </div>
  )
}
