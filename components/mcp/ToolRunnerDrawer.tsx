'use client'

import { useState, useEffect } from 'react'
import { X, Play, Loader2, AlertCircle } from 'lucide-react'
import { McpTool } from '@/lib/mcp/types'
import { RunToolResponse } from '@/app/api/admin/mcp/run-tool/route'

export interface ToolRunnerDrawerProps {
  tool: McpTool | null
  serverName: string
  isOpen: boolean
  onClose: () => void
}

export default function ToolRunnerDrawer({
  tool,
  serverName,
  isOpen,
  onClose,
}: ToolRunnerDrawerProps) {
  const [inputPayload, setInputPayload] = useState('{ "example": true }')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<RunToolResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !tool) return null

  const handleRun = async () => {
    if (!tool) return

    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      // Parse input payload
      let payload
      try {
        payload = JSON.parse(inputPayload)
      } catch (e) {
        throw new Error('Invalid JSON in input payload')
      }

      // Call the API
      const response = await fetch('/api/admin/mcp/run-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverId: tool.serverId,
          toolName: tool.name,
          payload,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to run tool')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsRunning(false)
    }
  }

  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  // Reset input when tool changes
  useEffect(() => {
    if (tool) {
      setInputPayload('{ "example": true }')
      setResult(null)
      setError(null)
    }
  }, [tool])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-dark-surface border border-dark-border rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div>
            <h2 className="text-2xl font-semibold text-white">{tool.name}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Server: {serverName} • Scope: {tool.scope}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-b border-dark-border">
          <p className="text-sm text-gray-300">{tool.description}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Input Payload (JSON)
            </label>
            <textarea
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              className="w-full h-32 font-mono text-sm bg-dark-accent border border-dark-border rounded-lg p-4 text-white focus:outline-none focus:border-primary resize-none"
              placeholder='{"key": "value"}'
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Tool
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

          {/* Result Display */}
          {result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Result
                </label>
              </div>
              <div className="bg-dark-accent border border-dark-border rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {formatJson(result.mockResult)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

