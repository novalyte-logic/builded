'use client'

import { Eye } from 'lucide-react'
import { McpTraceEvent } from '@/lib/mcp/types'

export interface McpTraceDetailsPanelProps {
  trace: McpTraceEvent | null
}

export default function McpTraceDetailsPanel({ trace }: McpTraceDetailsPanelProps) {
  if (!trace) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
        <div className="mb-6 pb-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Trace Details</h3>
        </div>
        <div className="text-center py-12 text-gray-400">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a trace to view details</p>
        </div>
      </div>
    )
  }

  const traceData = {
    traceId: trace.id,
    timestamp: trace.timestamp,
    agent: trace.agentName,
    tool: trace.toolName,
    server: trace.serverName,
    status: trace.status,
    duration: trace.durationMs,
    request: trace.requestPayload,
    response: trace.responsePayload,
    error: trace.errorMessage,
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
      <div className="mb-6 pb-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Trace Details</h3>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(trace.timestamp).toLocaleString()}
        </p>
      </div>
      <div className="bg-dark-accent rounded-lg p-4 border border-dark-border">
        <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
          {JSON.stringify(traceData, null, 2)}
        </pre>
      </div>
    </div>
  )
}

