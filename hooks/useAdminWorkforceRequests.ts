'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

interface UseAdminWorkforceRequestsOptions {
  status?: string
  serviceLine?: string
  state?: string
}

export interface WorkforceMatchCandidate {
  candidateId: string
  fullName: string
  role: string
  licenseState: string
  experienceYears: number
  hourlyRateMin: number
  hourlyRateMax: number
  matchScore: number
  rank?: number
  status?: string
}

export interface WorkforceRequestWithMatches {
  id: string
  createdAt: string
  clinicId: string
  clinicName: string
  state: string
  city: string
  serviceLine: string
  role: string
  shiftType: string
  employmentType: string
  startDate: string | null
  endDate: string | null
  status: string
  matches: WorkforceMatchCandidate[]
}

interface HookResult {
  data: WorkforceRequestWithMatches[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAdminWorkforceRequests(options: UseAdminWorkforceRequestsOptions = {}): HookResult {
  const [data, setData] = useState<WorkforceRequestWithMatches[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (options.status) params.set('status', options.status)
    if (options.serviceLine) params.set('serviceLine', options.serviceLine)
    if (options.state) params.set('state', options.state)
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }, [options.status, options.serviceLine, options.state])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/workforce/requests${queryString}`)
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }
      const json = (await res.json()) as { rows: WorkforceRequestWithMatches[] } | null
      setData(json?.rows || [])
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
