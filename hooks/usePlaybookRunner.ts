'use client'

import { useCallback, useState } from 'react'

export interface PlaybookRunResponse {
  playbookId: string
  bigQuery: {
    columns: Array<{ name: string; type: string }>
    rows: Array<Record<string, any>>
    totalRows: number
    executionMs?: number
  }
  aiSummary: string
}

export function usePlaybookRunner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PlaybookRunResponse | null>(null)

  const runPlaybook = useCallback(async (playbookId: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/mcp/playbooks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookId }),
      })

      if (!res.ok) {
        let message = `Playbook request failed with status ${res.status}`
        try {
          const err = await res.json()
          if (err?.error) message = err.error
        } catch {
          // ignore parse errors
        }
        throw new Error(message)
      }

      const json = (await res.json()) as PlaybookRunResponse
      setResult(json)
    } catch (err) {
      setError((err as Error).message || 'Failed to run playbook')
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, result, runPlaybook }
}

