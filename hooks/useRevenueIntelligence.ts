'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  RevenueIntelligenceResponse,
  RegionRevenueRow,
  ClinicRevenueRow,
} from '@/lib/types/analytics'
import type { DateRangeOption, ServiceLineFilter } from './useRegionDemandAnalytics'

interface UseRevenueIntelligenceOptions {
  serviceLine?: ServiceLineFilter
  dateRange?: DateRangeOption
}

interface HookResult {
  data: RevenueIntelligenceResponse | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useRevenueIntelligence(options: UseRevenueIntelligenceOptions): HookResult {
  const serviceLine = options.serviceLine ?? 'ALL'
  const dateRange = options.dateRange ?? '30d'
  const [data, setData] = useState<RevenueIntelligenceResponse | null>(null)
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
      const res = await fetch(`/api/admin/analytics/revenue-intel${queryString}`)
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }
      const json = (await res.json()) as RevenueIntelligenceResponse | null
      setData(json)
    } catch (err) {
      setError(err as Error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
