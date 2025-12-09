'use client'

import { useState } from 'react'
import { Check, X, Copy, Clock, Code2 } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '@/components/StatusBadge'

interface McpResponseViewerProps {
  request?: {
    serverId: string
    toolName: string
    input: Record<string, unknown>
  }
  response?: {
    data?: unknown
    error?: Error
    latency?: number
  }
  onCopyPrompt?: () => void
}

type TabType = 'formatted' | 'raw' | 'trace'

export default function McpResponseViewer({ request, response, onCopyPrompt }: McpResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('formatted')
  const [copied, setCopied] = useState(false)

  if (!request && !response) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500/60">
        <p className="text-sm">Execute a tool to see results</p>
      </div>
    )
  }

  const isSuccess = response && !response.error
  const hasData = response?.data !== undefined

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatJSON = (obj: unknown): string => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'formatted', label: 'Formatted' },
    { id: 'raw', label: 'Raw JSON' },
    { id: 'trace', label: 'Trace Metadata' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <StatusBadge status="live" label="SUCCESS" />
          ) : response?.error ? (
            <StatusBadge status="offline" label="ERROR" />
          ) : (
            <StatusBadge status="degraded" label="PENDING" />
          )}
          {response?.latency !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500/80">
              <Clock className="w-3.5 h-3.5" />
              <span>{response.latency}ms</span>
            </div>
          )}
        </div>
        {onCopyPrompt && (
          <button
            onClick={onCopyPrompt}
            className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" />
            Copy as Prompt
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 text-xs font-medium transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-gray-500/80 border-transparent hover:text-gray-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'formatted' && (
          <div className="space-y-4">
            {response?.error ? (
              <div className="bg-status-offline/10 border border-status-offline/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-status-offline" />
                  <h4 className="text-sm font-semibold text-status-offline">Error</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{response.error.message}</p>
                {response.error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500/80 cursor-pointer">Stack trace</summary>
                    <pre className="mt-2 text-xs text-gray-400 font-mono bg-black/20 rounded p-2 overflow-x-auto">
                      {response.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            ) : hasData ? (
              <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  {formatJSON(response.data)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500/60">
                <p className="text-sm">No response data</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-4">
            {/* Request */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider">Request</h4>
                <button
                  onClick={() => handleCopy(formatJSON(request))}
                  className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                  title="Copy request"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-status-live" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  {formatJSON(request)}
                </pre>
              </div>
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider">Response</h4>
                {response && (
                  <button
                    onClick={() => handleCopy(formatJSON(response))}
                    className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    title="Copy response"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-status-live" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4">
                <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  {response ? formatJSON(response) : 'No response yet'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trace' && (
          <div className="space-y-4">
            <div className="bg-dark-accent/40 border border-white/5 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider mb-2">Server</h4>
                <p className="text-sm text-gray-300 font-mono">{request?.serverId || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider mb-2">Tool</h4>
                <p className="text-sm text-gray-300 font-mono">{request?.toolName || 'N/A'}</p>
              </div>
              {response?.latency !== undefined && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider mb-2">Latency</h4>
                  <p className="text-sm text-gray-300">{response.latency}ms</p>
                </div>
              )}
              {response && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider mb-2">Status</h4>
                  <p className="text-sm text-gray-300">{response.error ? 'Error' : 'Success'}</p>
                </div>
              )}
              {request && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider mb-2">Input Size</h4>
                  <p className="text-sm text-gray-300">{JSON.stringify(request.input).length} bytes</p>
                </div>
              )}
              {response?.data && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400/90 uppercase tracking-wider mb-2">Output Size</h4>
                  <p className="text-sm text-gray-300">{JSON.stringify(response.data).length} bytes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

