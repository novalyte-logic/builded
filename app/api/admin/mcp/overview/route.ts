/**
 * MCP Overview API Route
 * 
 * Returns comprehensive dashboard data for the MCP Orchestration page.
 * Currently returns mocked data, but structured for easy replacement with real data.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  McpServer,
  McpTool,
  McpTraceEvent,
  McpSecurityAlert,
  McpIntegrationStatus,
  McpKpiStats,
  McpSecurityMetrics,
} from '@/lib/mcp/types'
import {
  MCP_SERVERS,
  MCP_TOOLS,
  MCP_TRACES,
  MCP_SECURITY_ALERTS,
  MCP_INTEGRATIONS,
} from '@/lib/mcp/mock-data'
import { mcpServers as registryServers, mcpTools as registryTools } from '@/lib/mcpRegistry'

export interface McpOverviewResponse {
  env: string
  timeRange: string
  summary: McpKpiStats & { securityMetrics: McpSecurityMetrics }
  servers: McpServer[]
  tools: McpTool[]
  charts: {
    agentCallsOverTime: Array<{ timestamp: string; count: number }>
    errorRateByServer: Array<{ serverId: string; serverName: string; errorRate: number }>
    latencyDistribution: Array<{ range: string; count: number }>
  }
  liveAgentTraces: McpTraceEvent[]
  securityAlerts: McpSecurityAlert[]
  integrations: McpIntegrationStatus[]
}

/**
 * Generate chart data from traces
 */
function generateChartData(traces: McpTraceEvent[], servers: McpServer[]) {
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000

  // Agent calls over time (last 24h, hourly buckets)
  const agentCallsOverTime: Array<{ timestamp: string; count: number }> = []
  for (let i = 23; i >= 0; i--) {
    const hourStart = now - i * 60 * 60 * 1000
    const hourEnd = hourStart + 60 * 60 * 1000
    const count = traces.filter((t) => {
      const ts = new Date(t.timestamp).getTime()
      return ts >= hourStart && ts < hourEnd
    }).length
    agentCallsOverTime.push({
      timestamp: new Date(hourStart).toISOString(),
      count,
    })
  }

  // Error rate by server
  const errorRateByServer = servers.map((server) => {
    const serverTraces = traces.filter((t) => t.serverName === server.name)
    const errors = serverTraces.filter((t) => t.status === 'ERROR').length
    const errorRate = serverTraces.length > 0 ? (errors / serverTraces.length) * 100 : 0
    return {
      serverId: server.id,
      serverName: server.name,
      errorRate: Math.round(errorRate * 10) / 10,
    }
  })

  // Latency distribution
  const latencyRanges = [
    { range: '0-50ms', min: 0, max: 50 },
    { range: '50-100ms', min: 50, max: 100 },
    { range: '100-200ms', min: 100, max: 200 },
    { range: '200-500ms', min: 200, max: 500 },
    { range: '500ms+', min: 500, max: Infinity },
  ]
  const latencyDistribution = latencyRanges.map((range) => {
    const count = traces.filter((t) => {
      const latency = t.durationMs
      return latency >= range.min && latency < range.max
    }).length
    return { range: range.range, count }
  })

  return {
    agentCallsOverTime,
    errorRateByServer,
    latencyDistribution,
  }
}

/**
 * Compute KPI stats
 */
function computeKpiStats(
  servers: McpServer[],
  tools: McpTool[],
  traces: McpTraceEvent[],
  alerts: McpSecurityAlert[]
): McpKpiStats {
  const last24h = Date.now() - 24 * 60 * 60 * 1000
  const traces24h = traces.filter((t) => new Date(t.timestamp).getTime() >= last24h)
  const agentCalls24h = traces24h.length
  const failedCalls24h = traces24h.filter((t) => t.status === 'ERROR').length

  // Calculate P95 latency
  const latencies = traces24h.map((t) => t.durationMs).sort((a, b) => a - b)
  const p95Index = Math.floor(latencies.length * 0.95)
  const p95Latency = latencies[p95Index] || 0

  return {
    registeredServers: servers.length,
    activeTools: tools.filter((t) => t.status === 'ACTIVE').length,
    agentCalls24h,
    failedCalls24h,
    p95Latency,
    securityWarnings: alerts.filter((a) => a.severity !== 'LOW').length,
  }
}

/**
 * Compute security metrics
 */
function computeSecurityMetrics(alerts: McpSecurityAlert[]): McpSecurityMetrics {
  // Mock implementation - in production, query actual security data
  return {
    keysActive: 12,
    keysExpiring7d: 2,
    scopesInUse: 8,
    blockedTools: 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const env = searchParams.get('env') || 'Prod'
    const range = searchParams.get('range') || '24h'

    // For now, return the same data regardless of env/range
    // In production, filter/query based on these params
    // Merge registry data with runtime metrics
    const servers = MCP_SERVERS.map((server) => {
      const registryServer = registryServers.find((rs) => rs.id === server.id)
      return {
        ...server,
        // Keep runtime metrics, but ensure registry data is available
        label: registryServer?.label || server.name,
        description: registryServer?.description || '',
      }
    })
    
    // Merge registry tools with runtime tool metrics
    const tools: McpTool[] = registryTools.map((registryTool) => {
      const runtimeTool = MCP_TOOLS.find((rt) => rt.name === registryTool.name)
      return {
        id: registryTool.name,
        name: registryTool.name,
        description: registryTool.description,
        serverId: registryTool.serverId,
        scope: registryTool.scope as McpTool['scope'],
        calls24h: runtimeTool?.calls24h || 0,
        avgLatencyMs: runtimeTool?.avgLatencyMs || 0,
        errorRate: runtimeTool?.errorRate || 0,
        status: (runtimeTool?.status || 'ACTIVE') as McpTool['status'],
      }
    })
    
    const traces = MCP_TRACES
    const alerts = MCP_SECURITY_ALERTS
    const integrations = MCP_INTEGRATIONS

    // Generate chart data
    const charts = generateChartData(traces, servers)

    // Compute stats
    const kpiStats = computeKpiStats(servers, tools, traces, alerts)
    const securityMetrics = computeSecurityMetrics(alerts)

    const response: McpOverviewResponse = {
      env,
      timeRange: range,
      summary: {
        ...kpiStats,
        securityMetrics,
      },
      servers,
      tools,
      charts,
      liveAgentTraces: traces.slice(0, 50), // Return most recent 50 traces
      securityAlerts: alerts,
      integrations,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('MCP Overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MCP overview data', details: error.message },
      { status: 500 }
    )
  }
}

