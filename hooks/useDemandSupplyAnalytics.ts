'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DemandSupplyResponse, DemandSupplyRow } from '@/lib/types/analytics'
import type { DateRangeOption, ServiceLineFilter } from './useRegionDemandAnalytics'

interface HookResult {
  data: DemandSupplyRow[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useDemandSupplyAnalytics(
  serviceLine: ServiceLineFilter,
  dateRange: DateRangeOption
): HookResult {
  const [data, setData] = useState<DemandSupplyRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const { startDate, endDate } = useMemo(() => {
    const end = new Date()
    const start = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30
    start.setDate(start.getDate() - days)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }, [dateRange])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (serviceLine && serviceLine !== 'ALL') {
      params.set('serviceLine', serviceLine)
    }
    params.set('startDate', startDate)
    params.set('endDate', endDate)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }, [serviceLine, startDate, endDate])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/analytics/demand-supply${queryString}`)
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }
      const json = (await res.json()) as DemandSupplyResponse | DemandSupplyRow[] | null
      if (json && Array.isArray((json as any).rows)) {
        setData((json as DemandSupplyResponse).rows)
      } else if (Array.isArray(json)) {
        setData(json as DemandSupplyRow[])
      } else {
        setData([])
      }
    } catch (err) {
      setError(err as Error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
