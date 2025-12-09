'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'
import clsx from 'clsx'
import { McpTraceEvent } from '@/lib/mcp/types'
import McpTraceDetailsPanel from './McpTraceDetailsPanel'

export interface McpAgentTracesProps {
  traces: McpTraceEvent[]
}

export default function McpAgentTraces({ traces }: McpAgentTracesProps) {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null)
  const selectedTrace = traces.find((t) => t.id === selectedTraceId) || null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
        <div className="mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-white">Live Agent Traces</h2>
          </div>
          <p className="text-sm text-gray-400">
            Recent calls between agents, MCP servers, and tools.
          </p>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {traces.map((trace) => (
            <div
              key={trace.id}
              onClick={() => setSelectedTraceId(trace.id)}
              className={clsx(
                'p-4 rounded-lg border cursor-pointer transition-colors',
                selectedTraceId === trace.id
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-dark-accent border-dark-border hover:border-primary/30'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">
                  {new Date(trace.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    trace.status === 'SUCCESS'
                      ? 'bg-status-live/10 text-status-live border border-status-live/30'
                      : 'bg-status-offline/10 text-status-offline border border-status-offline/30'
                  )}
                >
                  {trace.status}
                </span>
              </div>
              <div className="font-mono text-sm text-white mb-1">{trace.agentName}</div>
              <div className="text-xs text-gray-400">{trace.toolName}</div>
              <div className="text-xs text-gray-500 mt-1">Latency: {trace.durationMs}ms</div>
            </div>
          ))}
        </div>
      </div>
      <McpTraceDetailsPanel trace={selectedTrace} />
    </div>
  )
}

