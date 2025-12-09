'use client'

import StatusBadge from '@/components/StatusBadge'
import { McpServer } from '@/lib/mcp/types'

export interface McpServerCardProps {
  server: McpServer
  onViewLogs?: (serverId: string) => void
  onRestart?: (serverId: string) => void
}

export default function McpServerCard({
  server,
  onViewLogs,
  onRestart,
}: McpServerCardProps) {
  const statusMap = {
    LIVE: 'live' as const,
    DEGRADED: 'degraded' as const,
    OFFLINE: 'offline' as const,
  }

  return (
    <div className="bg-dark-accent border border-dark-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-mono">{server.name}</h3>
        <StatusBadge status={statusMap[server.status]} />
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime</span>
          <span className="text-white font-medium">{server.uptimePercent}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Calls (15m)</span>
          <span className="text-white font-medium">{server.callsLast15m.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Error Rate</span>
          <span className="text-white font-medium">{server.errorRate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Avg Latency</span>
          <span className="text-white font-medium">{server.avgLatencyMs}ms</span>
        </div>
        {server.version && (
          <div className="flex justify-between">
            <span className="text-gray-400">Version</span>
            <span className="text-gray-300 text-xs font-mono">{server.version}</span>
          </div>
        )}
        {server.region && (
          <div className="flex justify-between">
            <span className="text-gray-400">Region</span>
            <span className="text-gray-300 text-xs">{server.region}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-dark-border">
        <button
          onClick={() => onViewLogs?.(server.id)}
          className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary transition-colors"
        >
          View Logs
        </button>
        <button
          onClick={() => onRestart?.(server.id)}
          className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary transition-colors"
        >
          Restart
        </button>
      </div>
    </div>
  )
}

