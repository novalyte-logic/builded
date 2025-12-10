'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Code2 } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import McpKpiStrip from '@/components/mcp/McpKpiStrip'
import McpServerGrid from '@/components/mcp/McpServerGrid'
import McpToolsRegistry from '@/components/mcp/McpToolsRegistry'
import McpAgentTraces from '@/components/mcp/McpAgentTraces'
import McpSecurityPanel from '@/components/mcp/McpSecurityPanel'
import McpIntegrationsGrid from '@/components/mcp/McpIntegrationsGrid'
import McpCharts from '@/components/mcp/McpCharts'
import BigQueryWorkbench from '@/components/mcp/BigQueryWorkbench'
import { McpOverviewResponse } from '@/app/api/admin/mcp/overview/route'
import Toast from '@/components/admin/Toast'

export default function MCPDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State from URL params or defaults
  const [environment, setEnvironment] = useState(
    searchParams.get('env') || 'Prod'
  )
  const [timeRange, setTimeRange] = useState(
    searchParams.get('range') || '24h'
  )

  // Data state
  const [data, setData] = useState<McpOverviewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // UI state
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<{
    start: string
    end: string
  } | null>(null)
  const [restartingServers, setRestartingServers] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Refs for scrolling
  const serversRef = useRef<HTMLDivElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const tracesRef = useRef<HTMLDivElement>(null)
  const securityRef = useRef<HTMLDivElement>(null)
  const chartsRef = useRef<HTMLDivElement>(null)

  // Fetch data from API
  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        env: environment,
        range: timeRange,
      })

      const response = await fetch(`/api/admin/mcp/overview?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const result: McpOverviewResponse = await response.json()
      setData(result)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Error fetching MCP overview:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchData()
  }, [environment, timeRange])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (environment !== 'Prod') params.set('env', environment)
    if (timeRange !== '24h') params.set('range', timeRange)
    
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    router.replace(newUrl, { scroll: false })
  }, [environment, timeRange, router])

  // Handle environment change
  const handleEnvironmentChange = (env: string) => {
    setEnvironment(env)
  }

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)
  }

  // Handle view logs
  // Uses server.name for URL to match expected format (e.g., "dealflow-mcp")
  const handleViewLogs = (serverId: string) => {
    const server = data?.servers.find((s) => s.id === serverId)
    const serverName = server?.name || serverId
    router.push(`/logs?server=${serverName}`)
  }

  // Handle restart server
  const handleRestart = async (serverId: string) => {
    if (restartingServers.has(serverId)) return

    setRestartingServers((prev) => new Set(prev).add(serverId))

    try {
      const response = await fetch('/api/admin/mcp/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverId }),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || result.message || 'Failed to restart server')
      }

      setToast({
        message: result.message || `Restart signal sent to ${serverId}`,
        type: 'success',
      })
      
      // Refetch data after a short delay
      setTimeout(() => {
        fetchData()
      }, 2000)
    } catch (err: any) {
      console.error('Error restarting server:', err)
      setToast({
        message: `Failed to restart ${serverId}. Try again.`,
        type: 'error',
      })
    } finally {
      setRestartingServers((prev) => {
        const next = new Set(prev)
        next.delete(serverId)
        return next
      })
    }
  }

  // Scroll helpers
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleServerClick = (serverId: string) => {
    setSelectedServerId(serverId)
    setTimeout(() => {
      scrollToSection(serversRef)
      setTimeout(() => setSelectedServerId(null), 2000)
    }, 100)
  }

  const handleTimeRangeClick = (startTime: string, endTime: string) => {
    setSelectedTimeRange({ start: startTime, end: endTime })
    setTimeout(() => {
      scrollToSection(tracesRef)
      setTimeout(() => setSelectedTimeRange(null), 5000)
    }, 100)
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-dark-bg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading MCP dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-dark-bg p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-status-offline mb-4">Error loading dashboard</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Filter traces by selected time range
  const filteredTraces = selectedTimeRange
    ? data.liveAgentTraces.filter((trace) => {
        const traceTime = new Date(trace.timestamp).getTime()
        const startTime = new Date(selectedTimeRange.start).getTime()
        const endTime = new Date(selectedTimeRange.end).getTime()
        return traceTime >= startTime && traceTime <= endTime
      })
    : data.liveAgentTraces

  // Filter servers by selected server
  const filteredServers = selectedServerId
    ? data.servers.filter((s) => s.id === selectedServerId)
    : data.servers

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
            onChange={(e) => handleEnvironmentChange(e.target.value)}
            className="bg-dark-surface border border-dark-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary"
          >
            <option value="Prod">Production</option>
            <option value="Staging">Staging</option>
            <option value="Dev">Development</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
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
      {error && (
        <div className="bg-status-offline/10 border border-status-offline/30 rounded-xl p-4">
          <p className="text-sm text-status-offline">
            {error} Showing cached data or retrying...
          </p>
        </div>
      )}

      {/* KPI Strip */}
      <McpKpiStrip
        stats={{
          registeredServers: data.summary.registeredServers,
          activeTools: data.summary.activeTools,
          agentCalls24h: data.summary.agentCalls24h,
          failedCalls24h: data.summary.failedCalls24h,
          p95Latency: data.summary.p95Latency,
          securityWarnings: data.summary.securityWarnings,
        }}
        onServersClick={() => scrollToSection(serversRef)}
        onToolsClick={() => scrollToSection(toolsRef)}
        onTracesClick={() => scrollToSection(tracesRef)}
        onSecurityClick={() => scrollToSection(securityRef)}
      />

      {/* Live Charts */}
      <div ref={chartsRef}>
        {data.liveAgentTraces.length > 0 ? (
          <McpCharts
            traces={data.liveAgentTraces}
            servers={data.servers}
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
          servers={filteredServers.length > 0 ? filteredServers : data.servers}
          onViewLogs={handleViewLogs}
          onRestart={handleRestart}
          restartingServers={restartingServers}
        />
      </div>

      {/* MCP Tools Registry */}
      <div ref={toolsRef}>
        <McpToolsRegistry
          tools={data.tools}
          servers={data.servers.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      {/* Real-Time Agent Traces */}
      <div ref={tracesRef}>
        <McpAgentTraces traces={filteredTraces} />
      </div>

      {/* Security & Credentials */}
      <div ref={securityRef}>
        <McpSecurityPanel
          alerts={data.securityAlerts}
          metrics={data.summary.securityMetrics}
        />
      </div>

      {/* Integrations & Quotas */}
      <McpIntegrationsGrid integrations={data.integrations} />

      {/* BigQuery Workbench */}
      <BigQueryWorkbench />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
