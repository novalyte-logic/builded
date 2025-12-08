'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface BigQueryMetricsProps {
  endpoint: string
  params?: Record<string, string>
  children: (data: any, loading: boolean, error: string | null) => React.ReactNode
}

/**
 * Client component for fetching BigQuery-powered metrics
 * Handles loading states and error handling
 */
export default function BigQueryMetrics({
  endpoint,
  params,
  children,
}: BigQueryMetricsProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams(params)
        const url = `/api/admin/metrics?type=${endpoint}&${queryParams.toString()}`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err.message || 'Failed to load metrics')
        console.error('BigQuery metrics error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [endpoint, JSON.stringify(params)])

  return <>{children(data, loading, error)}</>
}

