'use client'

import { useMemo, useState } from 'react'
import { Loader2, Play, Trash2 } from 'lucide-react'
import { useBigQueryConsole } from '@/hooks/useBigQueryConsole'
import { BIGQUERY_PRESETS } from '@/lib/console/presets'

const SAMPLE_SQL = `-- Example: Count TRT leads by state
SELECT state, COUNT(*) AS lead_count
FROM \`your_project.your_dataset.leads\`
WHERE service_line = 'TRT'
GROUP BY state
ORDER BY lead_count DESC
LIMIT 50;`

export default function BigQueryConsolePanel() {
  const projectId =
    process.env.NEXT_PUBLIC_BIGQUERY_PROJECT_ID ||
    process.env.NEXT_PUBLIC_GCP_PROJECT_ID ||
    'Server-configured'

  const [sql, setSql] = useState(SAMPLE_SQL)
  const [dataset, setDataset] = useState(
    process.env.NEXT_PUBLIC_BIGQUERY_DATASET || 'novalyte_core'
  )
  const [maxRows, setMaxRows] = useState<number>(200)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('none')

  const { data, loading, error, runQuery } = useBigQueryConsole()

  const hasResults = data && data.rows && data.rows.length > 0

  const stats = useMemo(() => {
    if (!data) return null
    return [
      `Rows: ${data.totalRows}`,
      data.executionMs ? `Time: ${data.executionMs} ms` : null,
      dataset ? `Dataset: ${dataset}` : null,
    ].filter(Boolean)
  }, [data, dataset])

  const selectedPreset = selectedPresetId === 'none' ? undefined : BIGQUERY_PRESETS.find((p) => p.id === selectedPresetId)

  const handlePresetChange = (id: string) => {
    setSelectedPresetId(id)
    const preset = BIGQUERY_PRESETS.find((p) => p.id === id)
    if (preset) {
      const template = preset.sqlTemplate
        .replace('{{dataset}}', dataset || 'novalyte_core')
        .replace('{{serviceLine}}', preset.defaultParams?.serviceLine || 'TRT')
        .replace('{{state}}', preset.defaultParams?.state || 'TX')
        .replace('{{dateRangeDays}}', preset.defaultParams?.dateRange === '90d' ? '90' : preset.defaultParams?.dateRange === '7d' ? '7' : '30')
        .replace('{{maxRows}}', String(preset.defaultParams?.maxRows || maxRows || 200))
      setSql(template)
      if (preset.defaultParams?.maxRows) {
        setMaxRows(preset.defaultParams.maxRows)
      }
    } else {
      setSql('')
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Query Preset</label>
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
          >
            <option value="none">None (blank)</option>
            {BIGQUERY_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          {selectedPreset && (
            <p className="text-xs text-gray-500">{selectedPreset.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase text-gray-500 tracking-wide">Project</span>
          <div className="text-sm text-white bg-dark-bg border border-dark-border rounded-lg px-3 py-2">
            {projectId}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Dataset</label>
          <input
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
            placeholder="novalyte_core"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Max rows</label>
          <select
            value={maxRows}
            onChange={(e) => setMaxRows(Number(e.target.value))}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
          >
            {[100, 200, 500, 1000].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => runQuery({ sql, maxRows, dataset })}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Query
          </button>
          <button
            onClick={() => setSql('')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-sm text-gray-300 hover:bg-dark-hover transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-gray-500 tracking-wide mb-2 block">SQL</label>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          rows={8}
          className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-gray-100 font-mono focus:border-primary focus:outline-none"
          placeholder={SAMPLE_SQL}
        />
      </div>

      {error && (
        <div className="border border-status-degraded/40 bg-status-degraded/10 text-status-degraded text-sm rounded-lg px-3 py-2">
          BigQuery error: {error}
        </div>
      )}

      <div className="border border-dark-border rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
          <div>
            <p className="text-sm font-semibold text-white">Results</p>
            <p className="text-xs text-gray-500">
              Query output will appear here. Columns adapt to the returned schema.
            </p>
          </div>
          {stats && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              {stats.map((stat) => (
                <span
                  key={stat as string}
                  className="px-2 py-1 rounded-full border border-dark-border bg-dark-bg"
                >
                  {stat}
                </span>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running query...
          </div>
        )}

        {!loading && !hasResults && (
          <div className="px-4 py-6 text-sm text-gray-500">
            No results yet. Write a query and run it to see output.
          </div>
        )}

        {!loading && hasResults && data && (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-dark-hover">
                <tr>
                  {data.columns.map((col) => (
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
                {data.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-dark-border hover:bg-dark-hover/60">
                    {data.columns.map((col) => (
                      <td key={col.name} className="px-3 py-2 text-gray-200">
                        {row[col.name] !== undefined && row[col.name] !== null
                          ? String(row[col.name])
                          : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

