'use client'

import { useCallback, useState } from 'react'

export interface BigQueryColumn {
  name: string
  type: string
}

export interface BigQueryRow {
  [key: string]: string | number | boolean | null
}

export interface BigQueryResult {
  columns: BigQueryColumn[]
  rows: BigQueryRow[]
  totalRows: number
  executionMs?: number
}

interface UseBigQueryConsoleOptions {
  sql?: string
  maxRows?: number
  dataset?: string
}

interface HookResult {
  data: BigQueryResult | null
  loading: boolean
  error: string | null
  runQuery: (override?: UseBigQueryConsoleOptions) => Promise<void>
}

export function useBigQueryConsole(initialOptions?: UseBigQueryConsoleOptions): HookResult {
  const [data, setData] = useState<BigQueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runQuery = useCallback(
    async (override?: UseBigQueryConsoleOptions) => {
      const payload: UseBigQueryConsoleOptions = {
        sql: override?.sql ?? initialOptions?.sql,
        maxRows: override?.maxRows ?? initialOptions?.maxRows ?? 200,
        dataset: override?.dataset ?? initialOptions?.dataset,
      }

      if (!payload.sql || !payload.sql.trim()) {
        setError('SQL is required')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/admin/ai-console/bigquery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          let message = `BigQuery request failed with status ${res.status}`
          try {
            const err = await res.json()
            if (err?.error) {
              message = err.error
            }
          } catch {
            // ignore parse errors
          }
          throw new Error(message)
        }

        const json = (await res.json()) as BigQueryResult
        setData(json)
      } catch (err) {
        setError((err as Error).message || 'Failed to run query')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [initialOptions?.dataset, initialOptions?.maxRows, initialOptions?.sql]
  )

  return { data, loading, error, runQuery }
}

