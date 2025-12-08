'use client'

import type { DateRangeOption, ServiceLineFilter } from '@/hooks/useRegionDemandAnalytics'
import { Filter } from 'lucide-react'

interface FilterBarProps {
  serviceLine: ServiceLineFilter
  dateRange: DateRangeOption
  onServiceLineChange: (value: ServiceLineFilter) => void
  onDateRangeChange: (value: DateRangeOption) => void
}

const serviceLineOptions: Array<{ label: string; value: ServiceLineFilter }> = [
  { label: 'All', value: 'ALL' },
  { label: 'TRT', value: 'TRT' },
  { label: 'Weight Loss', value: 'WEIGHT_LOSS' },
  { label: 'IV Therapy', value: 'IV_THERAPY' },
]

const dateRangeOptions: Array<{ label: string; value: DateRangeOption }> = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
]

export default function FilterBar({
  serviceLine,
  dateRange,
  onServiceLineChange,
  onDateRangeChange,
}: FilterBarProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Service Line</span>
          <select
            value={serviceLine}
            onChange={(e) => onServiceLineChange(e.target.value as ServiceLineFilter)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            {serviceLineOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Date Range</span>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangeOption)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
