'use client'

import { useState } from 'react'
import DemandRadarPanel from '@/components/analytics/DemandRadarPanel'
import OpportunityByRegionPanel from '@/components/analytics/OpportunityByRegionPanel'
import FilterBar from '@/components/analytics/FilterBar'
import ClinicIntentPanel from '@/components/analytics/ClinicIntentPanel'
import RevenuePotentialPanel from '@/components/analytics/RevenuePotentialPanel'
import type { DateRangeOption, ServiceLineFilter } from '@/hooks/useRegionDemandAnalytics'
import StatusBadge from '@/components/StatusBadge'

export default function DemandInsightsPage() {
  const [serviceLine, setServiceLine] = useState<ServiceLineFilter>('ALL')
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d')

  return (
    <div className="p-8 bg-dark-bg min-h-screen space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Demand &amp; Opportunities</h1>
          <p className="text-gray-400 mt-2">
            Real-time insight into regional TRT, Weight Loss, and IV Therapy demand across the U.S.
          </p>
        </div>
        <StatusBadge status="live" />
      </div>

      <FilterBar
        serviceLine={serviceLine}
        dateRange={dateRange}
        onServiceLineChange={setServiceLine}
        onDateRangeChange={setDateRange}
      />

      <div className="space-y-6">
        <DemandRadarPanel serviceLine={serviceLine} dateRange={dateRange} />
        <OpportunityByRegionPanel serviceLine={serviceLine} dateRange={dateRange} />
        <ClinicIntentPanel serviceLine={serviceLine} dateRange={dateRange} />
        <RevenuePotentialPanel serviceLine={serviceLine} dateRange={dateRange} />
      </div>
    </div>
  )
}
