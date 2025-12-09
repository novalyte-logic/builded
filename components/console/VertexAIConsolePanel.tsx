'use client'

import { useState } from 'react'
import { Loader2, RotateCw, Send } from 'lucide-react'

export default function VertexAIConsolePanel() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('gemini-1.5-pro')
  const [temperature, setTemperature] = useState(0.7)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/ai-console/vertex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, temperature }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Request failed')
      }
      const data = await res.json()
      setResult(data.outputText)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none"
          >
            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase text-gray-500 tracking-wide">Temperature</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-primary focus:outline-none w-20"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleRun}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Run
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-bg border border-dark-border text-sm text-gray-300 hover:bg-dark-hover transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-gray-500 tracking-wide mb-2 block">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-gray-100 focus:border-primary focus:outline-none"
          placeholder="Enter your prompt for Vertex AI..."
        />
      </div>

      {error && (
        <div className="border border-status-degraded/40 bg-status-degraded/10 text-status-degraded text-sm rounded-lg px-3 py-2">
          Vertex AI error: {error}
        </div>
      )}

      <div className="border border-dark-border rounded-lg">
        <div className="px-4 py-3 border-b border-dark-border">
          <p className="text-sm font-semibold text-white">Results</p>
          <p className="text-xs text-gray-500">Vertex AI response will appear here.</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running prompt...
          </div>
        )}

        {!loading && !result && !error && (
          <div className="px-4 py-6 text-sm text-gray-500">
            No results yet. Enter a prompt and run it to see output.
          </div>
        )}

        {!loading && result && (
          <div className="px-4 py-4 max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-100">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

