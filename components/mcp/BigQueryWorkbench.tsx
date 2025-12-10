'use client'

import { useState } from 'react'
import { Database, Play, Loader2, AlertCircle } from 'lucide-react'

export default function BigQueryWorkbench() {
  const [dataset, setDataset] = useState('novalyte_core')
  const [maxRows, setMaxRows] = useState('100')
  const [sql, setSql] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{
    columns: string[]
    rows: any[][]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRunQuery = async () => {
    if (!sql.trim()) {
      setError('Please enter a SQL query')
      return
    }

    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/mcp/bigquery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql,
          dataset,
          maxRows: parseInt(maxRows),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
      <div className="mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-white">BigQuery Workbench</h2>
        </div>
        <p className="text-sm text-gray-400">
          Execute SQL queries against Novalyte BigQuery datasets.
        </p>
      </div>

      <div className="space-y-6">
        {/* Query Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dataset
            </label>
            <input
              type="text"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              placeholder="novalyte_core"
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Rows
            </label>
            <select
              value={maxRows}
              onChange={(e) => setMaxRows(e.target.value)}
              className="w-full px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            >
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </div>
        </div>

        {/* SQL Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SQL Query
          </label>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="w-full h-48 font-mono text-sm bg-dark-accent border border-dark-border rounded-lg p-4 text-white focus:outline-none focus:border-primary resize-none"
            placeholder="SELECT * FROM table_name LIMIT 10;"
          />
        </div>

        {/* Run Button */}
        <button
          onClick={handleRunQuery}
          disabled={isRunning}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Query...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Query
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-status-offline/10 border border-status-offline/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-status-offline flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-status-offline">Error</p>
              <p className="text-sm text-gray-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        {result && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Results ({result.rows.length} rows)
              </label>
            </div>
            <div className="bg-dark-accent border border-dark-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-surface border-b border-dark-border">
                    <tr>
                      {result.columns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/50">
                    {result.rows.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-dark-surface/50 transition-colors"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-3 text-sm text-gray-300 font-mono"
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

