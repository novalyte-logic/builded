'use client'

import { useState, useRef, useEffect } from 'react'
import { Code2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import McpKpiStrip from '@/components/mcp/McpKpiStrip'
import McpServerGrid from '@/components/mcp/McpServerGrid'
import McpToolsRegistry from '@/components/mcp/McpToolsRegistry'
import McpAgentTraces from '@/components/mcp/McpAgentTraces'
import McpSecurityPanel from '@/components/mcp/McpSecurityPanel'
import McpIntegrationsGrid from '@/components/mcp/McpIntegrationsGrid'
import McpCharts from '@/components/mcp/McpCharts'
import {
  useMcpServers,
  useMcpTools,
  useMcpTraces,
  useMcpSecurityAlerts,
  useMcpIntegrations,
} from '@/lib/mcp/hooks'
import { computeKpiStats, computeSecurityMetrics } from '@/lib/mcp/api-client'
import {
  McpServer,
  McpTool,
  McpTraceEvent,
  McpSecurityAlert,
  McpIntegrationStatus,
} from '@/lib/mcp/types'

export default function MCPDashboardPage() {
  const [environment, setEnvironment] = useState('Prod')
  const [timeRange, setTimeRange] = useState('24h')
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: string
    end: string
  } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const serversRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const tracesRef = useRef<HTMLDivElement>(null)
  const securityRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)

  // Fetch data with polling
  const {
    servers,
    error: serversError,
    isLoading: serversLoading,
  } = useMcpServers(30000) // 30 seconds

  const { tools, error: toolsError, isLoading: toolsLoading } = useMcpTools()

  const {
    traces,
    error: tracesError,
    isLoading: tracesLoading,
  } = useMcpTraces(
    {
      limit: 500, // Get more traces for charts
      since: selectedTimeRange?.start,
    },
    15000 // 15 seconds
  )

  const {
    alerts,
    error: alertsError,
    isLoading: alertsLoading,
  } = useMcpSecurityAlerts()

  const {
    integrations,
    error: integrationsError,
    isLoading: integrationsLoading,
  } = useMcpIntegrations()

  // Update last updated timestamp when data changes
  useEffect(() => {
    if (traces.length > 0 || servers.length > 0) {
      setLastUpdated(new Date())
    }
  }, [traces, servers])

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Compute KPI stats from live data
  const kpiStats = computeKpiStats(servers, tools, traces, alerts)
  const securityMetrics = computeSecurityMetrics(alerts)

  // Filter traces by selected time range
  const filteredTraces = selectedTimeRange
    ? traces.filter((trace) => {
        const traceTime = new Date(trace.timestamp).getTime()
        const startTime = new Date(selectedTimeRange.start).getTime()
        const endTime = new Date(selectedTimeRange.end).getTime()
        return traceTime >= startTime && traceTime <= endTime
      })
    : traces

  // Filter servers by selected server
  const filteredServers = selectedServerId
    ? servers.filter((s) => s.id === selectedServerId)
    : servers

  const handleViewLogs = (serverId: string) => {
    // TODO: Implement log viewer
    console.log('View logs for:', serverId)
  }

  const handleRestart = (serverId: string) => {
    // TODO: Implement restart functionality
    console.log('Restart server:', serverId)
  }

  const handleServerClick = (serverId: string) => {
    setSelectedServerId(serverId)
    setTimeout(() => {
      scrollToSection(serversRef)
      // Clear selection after scroll
      setTimeout(() => setSelectedServerId(null), 2000)
    }, 100)
  }

  const handleTimeRangeClick = (startTime: string, endTime: string) => {
    setSelectedTimeRange({ start: startTime, end: endTime })
    setTimeout(() => {
      scrollToSection(tracesRef)
      // Clear selection after scroll
      setTimeout(() => setSelectedTimeRange(null), 5000)
    }, 100)
  }

  const isLoading =
    serversLoading || toolsLoading || tracesLoading || alertsLoading || integrationsLoading
  const hasError =
    serversError || toolsError || tracesError || alertsError || integrationsError

  if (isLoading && servers.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading MCP dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8 space-y-8">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-white">MCP Orchestration</h1>
            <StatusBadge status="live" />
          </div>
          <p className="text-gray-400 text-lg">
            Mission Control for MCP servers, tools, and agent behavior.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="Prod">Production</option>
            <option value="Staging">Staging</option>
            <option value="Dev">Development</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="15m">Last 15m</option>
            <option value="1h">Last 1h</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="bg-status-offline/10 border border-status-offline/30 rounded-xl p-4">
          <p className="text-sm text-status-offline">
            Some data failed to load. Showing cached data or retrying...
          </p>
        </div>
      )}

      {/* KPI Strip */}
      <McpKpiStrip
        stats={kpiStats}
        onServersClick={() => scrollToSection(serversRef)}
        onToolsClick={() => scrollToSection(toolsRef)}
        onTracesClick={() => scrollToSection(tracesRef)}
        onSecurityClick={() => scrollToSection(securityRef)}
      />

      {/* Live Charts */}
      <div ref={chartsRef}>
        {traces.length > 0 ? (
          <McpCharts
            traces={traces}
            servers={servers}
            onServerClick={handleServerClick}
            onTimeRangeClick={handleTimeRangeClick}
            lastUpdated={lastUpdated}
          />
        ) : (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-12 text-center shadow-lg">
            <div className="text-gray-400 mb-2">No recent activity</div>
            <p className="text-sm text-gray-500">
              Agent traces will appear here once MCP tools are called.
            </p>
          </div>
        )}
      </div>

      {/* MCP Server Fleet */}
      <div ref={serversRef}>
        <McpServerGrid
          servers={filteredServers.length > 0 ? filteredServers : servers}
          onViewLogs={handleViewLogs}
          onRestart={handleRestart}
        />
      </div>

      {/* MCP Tools Registry */}
      <div ref={toolsRef}>
        <McpToolsRegistry
          tools={tools}
          servers={servers.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      {/* Real-Time Agent Traces */}
      <div ref={tracesRef}>
        <McpAgentTraces traces={filteredTraces} />
      </div>

      {/* Security & Credentials */}
      <div ref={securityRef}>
        <McpSecurityPanel alerts={alerts} metrics={securityMetrics} />
      </div>

      {/* Integrations & Quotas */}
      <McpIntegrationsGrid integrations={integrations} />
    </div>
  )
}
