'use client'

import { Server } from 'lucide-react'
import McpServerCard from './McpServerCard'
import { McpServer } from '@/lib/mcp/types'

export interface McpServerGridProps {
  servers: McpServer[]
  onViewLogs?: (serverId: string) => void
  onRestart?: (serverId: string) => void
  restartingServers?: Set<string>
}

export default function McpServerGrid({
  servers,
  onViewLogs,
  onRestart,
  restartingServers = new Set(),
}: McpServerGridProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-lg">
      <div className="mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Server className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-white">MCP Servers</h2>
        </div>
        <p className="text-sm text-gray-400">
          Health, load, and uptime for every MCP server in the Novalyte network.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <McpServerCard
            key={server.id}
            server={server}
            onViewLogs={onViewLogs}
            onRestart={onRestart}
            isRestarting={restartingServers.has(server.id)}
          />
        ))}
      </div>
    </div>
  )
}

