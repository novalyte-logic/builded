'use client'

import { useState } from 'react'
import { Loader2, Play } from 'lucide-react'

export default function PlaybooksPanel() {
  const [selectedPlaybook, setSelectedPlaybook] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    if (!selectedPlaybook) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/ai-console/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedPlaybook }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Request failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase text-gray-500 tracking-wide">Playbook</label>
        <select
          value={selectedPlaybook}
          onChange={(e) => setSelectedPlaybook(e.target.value)}
          className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
        >
          <option value="">None</option>
          <option value="trt_lead_quality_tx_30d">TRT Lead Quality Snapshot (TX) – 30d</option>
          <option value="service_line_radar_30d">Men's Health Service-Line Radar – 30d</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleRun}
          disabled={loading || !selectedPlaybook}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Playbook
        </button>
      </div>

      {error && (
        <div className="border border-status-degraded/40 bg-status-degraded/10 text-status-degraded text-sm rounded-lg px-3 py-2">
          Playbook error: {error}
        </div>
      )}

      <div className="border border-dark-border rounded-lg">
        <div className="px-4 py-3 border-b border-dark-border">
          <p className="text-sm font-semibold text-white">Results</p>
          <p className="text-xs text-gray-500">Playbook output will appear here.</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running playbook...
          </div>
        )}

        {!loading && !result && !error && (
          <div className="px-4 py-6 text-sm text-gray-500">
            No results yet. Select a playbook and run it to see output.
          </div>
        )}

        {!loading && result && (
          <div className="px-4 py-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">{result.title}</h4>
              <p className="text-sm text-gray-300 mb-4">{result.summary}</p>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                {result.insights.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
            {result.rawDataPreview && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-2">Data Preview</h5>
                <div className="max-h-32 overflow-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        {result.rawDataPreview.columns.slice(0, 5).map((col: any) => (
                          <th key={col.name} className="text-left px-2 py-1 text-gray-400">{col.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rawDataPreview.rows.slice(0, 3).map((row: any, idx: number) => (
                        <tr key={idx}>
                          {result.rawDataPreview.columns.slice(0, 5).map((col: any) => (
                            <td key={col.name} className="px-2 py-1 text-gray-200">{String(row[col.name] || '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

