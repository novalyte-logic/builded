'use client'

import { Server, Code2, Activity, AlertTriangle, Clock, Shield } from 'lucide-react'
import CinematicKPICard from '@/components/admin/CinematicKPICard'
import { McpKpiStats } from '@/lib/mcp/types'

export interface McpKpiStripProps {
  stats: McpKpiStats
  onServersClick?: () => void
  onToolsClick?: () => void
  onTracesClick?: () => void
  onSecurityClick?: () => void
}

export default function McpKpiStrip({
  stats,
  onServersClick,
  onToolsClick,
  onTracesClick,
  onSecurityClick,
}: McpKpiStripProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div onClick={onServersClick} className="cursor-pointer">
        <CinematicKPICard
          label="Registered Servers"
          value={stats.registeredServers}
          icon={Server}
          subtitle="MCP servers"
        />
      </div>
      <div onClick={onToolsClick} className="cursor-pointer">
        <CinematicKPICard
          label="Active Tools"
          value={stats.activeTools}
          icon={Code2}
          subtitle="Exposed tools"
        />
      </div>
      <div onClick={onTracesClick} className="cursor-pointer">
        <CinematicKPICard
          label="Agent Calls (24h)"
          value={stats.agentCalls24h.toLocaleString()}
          icon={Activity}
          subtitle="Total calls"
          trend={{ value: 12, direction: 'up' }}
        />
      </div>
      <div onClick={onTracesClick} className="cursor-pointer">
        <CinematicKPICard
          label="Failed Calls (24h)"
          value={stats.failedCalls24h}
          icon={AlertTriangle}
          subtitle="Errors"
          trend={{ value: 5, direction: 'down' }}
        />
      </div>
      <CinematicKPICard
        label="p95 Latency"
        value={`${stats.p95Latency}ms`}
        icon={Clock}
        subtitle="Response time"
      />
      <div onClick={onSecurityClick} className="cursor-pointer">
        <CinematicKPICard
          label="Security Warnings"
          value={stats.securityWarnings}
          icon={Shield}
          subtitle="Active alerts"
        />
      </div>
    </div>
  )
}

