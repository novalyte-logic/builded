'use client'

import { useMemo } from 'react'
import { Loader2, ArrowUpRight } from 'lucide-react'
import { PLAYBOOKS, findPlaybook } from '@/lib/console/playbooks'
import { usePlaybookRunner } from '@/hooks/usePlaybookRunner'

function DataTable({
  columns,
  rows,
}: {
  columns: Array<{ name: string; type: string }>
  rows: Array<Record<string, any>>
}) {
  if (!rows || rows.length === 0) {
    return <div className="px-4 py-4 text-sm text-gray-500">No data returned.</div>
  }
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-dark-hover">
          <tr>
            {columns.map((col) => (
              <th
                key={col.name}
                className="text-left px-3 py-2 text-xs font-semibold text-gray-400 border-b border-dark-border"
              >
                {col.name}
                <span className="ml-2 text-[10px] text-gray-500">{col.type}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-dark-border hover:bg-dark-hover/60">
              {columns.map((col) => (
                <td key={col.name} className="px-3 py-2 text-gray-200">
                  {row[col.name] !== undefined && row[col.name] !== null ? String(row[col.name]) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PlaybooksPanel() {
  const { loading, error, result, runPlaybook } = usePlaybookRunner()

  const playbookMeta = useMemo(() => {
    if (!result) return null
    return findPlaybook(result.playbookId)
  }, [result])

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLAYBOOKS.map((playbook) => (
          <button
            key={playbook.id}
            onClick={() => runPlaybook(playbook.id)}
            disabled={loading}
            className="bg-dark-surface border border-dark-border hover:border-primary/40 hover:bg-dark-hover transition-colors rounded-lg p-4 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{playbook.name}</p>
                <p className="text-xs text-gray-500 mt-1">{playbook.description}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500" />
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="border border-status-degraded/40 bg-status-degraded/10 text-status-degraded text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
              <div>
                <p className="text-sm font-semibold text-white">
                  Result: {playbookMeta?.name || result.playbookId}
                </p>
                <p className="text-xs text-gray-500">
                  Rows: {result.bigQuery.totalRows}
                  {result.bigQuery.executionMs ? ` • Time: ${result.bigQuery.executionMs} ms` : ''}
                </p>
              </div>
            </div>
            <DataTable columns={result.bigQuery.columns} rows={result.bigQuery.rows} />
          </div>

          <div className="bg-dark-surface border border-dark-border rounded-lg">
            <div className="px-4 py-3 border-b border-dark-border">
              <p className="text-sm font-semibold text-white">AI Summary</p>
              <p className="text-xs text-gray-500">
                Generated via Vertex AI using the playbook macro.
              </p>
            </div>
            <div className="px-4 py-4 text-sm text-gray-100 whitespace-pre-wrap">
              {result.aiSummary || 'No summary returned.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

