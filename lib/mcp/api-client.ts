/**
 * MCP Dashboard API Client
 * 
 * Front-end client wrapper for MCP dashboard API calls.
 * Replace mock data with real API endpoints in production.
 */

import {
  McpServer,
  McpTool,
  McpTraceEvent,
  McpSecurityAlert,
  McpIntegrationStatus,
  McpKpiStats,
  McpSecurityMetrics,
} from './types'

/**
 * Fetch all MCP servers
 */
export async function fetchMcpServers(serverId?: string): Promise<McpServer[]> {
  try {
    const url = serverId ? `/api/mcp/servers?id=${serverId}` : '/api/mcp/servers'
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch servers: ${response.statusText}`)
    }
    const data = await response.json()
    return data.servers
  } catch (error) {
    console.error('Error fetching MCP servers:', error)
    // Fallback to mock data
    const { MCP_SERVERS } = await import('./mock-data')
    return serverId ? MCP_SERVERS.filter((s) => s.id === serverId) : MCP_SERVERS
  }
}

/**
 * Fetch all MCP tools
 */
export async function fetchMcpTools(filters?: {
  serverId?: string
  scope?: 'read' | 'write' | 'admin'
  status?: 'ACTIVE' | 'DISABLED'
  search?: string
}): Promise<McpTool[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.serverId) params.append('serverId', filters.serverId)
    if (filters?.scope) params.append('scope', filters.scope)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)

    const url = `/api/mcp/tools${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch tools: ${response.statusText}`)
    }
    const data = await response.json()
    return data.tools
  } catch (error) {
    console.error('Error fetching MCP tools:', error)
    // Fallback to mock data
    const { MCP_TOOLS } = await import('./mock-data')
    return MCP_TOOLS
  }
}

/**
 * Fetch recent MCP traces
 */
export async function fetchMcpTraces(filters?: {
  limit?: number
  status?: 'SUCCESS' | 'ERROR'
  serverId?: string
  toolName?: string
  agentName?: string
  since?: string
}): Promise<McpTraceEvent[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.serverId) params.append('serverId', filters.serverId)
    if (filters?.toolName) params.append('toolName', filters.toolName)
    if (filters?.agentName) params.append('agentName', filters.agentName)
    if (filters?.since) params.append('since', filters.since)

    const url = `/api/mcp/traces${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch traces: ${response.statusText}`)
    }
    const data = await response.json()
    return data.traces
  } catch (error) {
    console.error('Error fetching MCP traces:', error)
    // Fallback to mock data
    const { MCP_TRACES } = await import('./mock-data')
    return MCP_TRACES.slice(0, filters?.limit || 50)
  }
}

/**
 * Fetch security alerts
 */
export async function fetchMcpSecurityAlerts(filters?: {
  severity?: 'LOW' | 'MEDIUM' | 'HIGH'
  serverId?: string
  toolId?: string
  since?: string
  limit?: number
}): Promise<McpSecurityAlert[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.serverId) params.append('serverId', filters.serverId)
    if (filters?.toolId) params.append('toolId', filters.toolId)
    if (filters?.since) params.append('since', filters.since)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const url = `/api/mcp/security-alerts${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch security alerts: ${response.statusText}`)
    }
    const data = await response.json()
    return data.alerts
  } catch (error) {
    console.error('Error fetching MCP security alerts:', error)
    // Fallback to mock data
    const { MCP_SECURITY_ALERTS } = await import('./mock-data')
    return MCP_SECURITY_ALERTS
  }
}

/**
 * Fetch integration statuses
 */
export async function fetchMcpIntegrations(filters?: {
  provider?: string
  status?: 'LIVE' | 'DEGRADED' | 'OFFLINE'
}): Promise<McpIntegrationStatus[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.provider) params.append('provider', filters.provider)
    if (filters?.status) params.append('status', filters.status)

    const url = `/api/mcp/integrations${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch integrations: ${response.statusText}`)
    }
    const data = await response.json()
    return data.integrations
  } catch (error) {
    console.error('Error fetching MCP integrations:', error)
    // Fallback to mock data
    const { MCP_INTEGRATIONS } = await import('./mock-data')
    return MCP_INTEGRATIONS
  }
}

/**
 * Compute KPI stats from data
 */
export function computeKpiStats(
  servers: McpServer[],
  tools: McpTool[],
  traces: McpTraceEvent[],
  alerts: McpSecurityAlert[]
): McpKpiStats {
  const now = Date.now()
  const last24h = now - 24 * 60 * 60 * 1000
  
  const traces24h = traces.filter(
    (t) => new Date(t.timestamp).getTime() > last24h
  )
  
  const calls24h = traces24h.length
  const failedCalls24h = traces24h.filter((t) => t.status === 'ERROR').length
  
  const latencies = traces24h.map((t) => t.durationMs).sort((a, b) => a - b)
  const p95Index = Math.floor(latencies.length * 0.95)
  const p95Latency = latencies[p95Index] || 0
  
  return {
    registeredServers: servers.length,
    activeTools: tools.filter((t) => t.status === 'ACTIVE').length,
    agentCalls24h: calls24h,
    failedCalls24h: failedCalls24h,
    p95Latency: p95Latency,
    securityWarnings: alerts.length,
  }
}

/**
 * Compute security metrics
 */
export function computeSecurityMetrics(
  alerts: McpSecurityAlert[]
): McpSecurityMetrics {
  // TODO: Replace with real data from API
  return {
    keysActive: 24,
    keysExpiring7d: 3,
    scopesInUse: 12,
    blockedTools: 0,
  }
}

/**
 * Execute an MCP tool (stub for now)
 */
export async function executeMcpTool(
  toolName: string,
  serverId: string,
  payload: any
): Promise<any> {
  // TODO: Replace with real API call
  // const response = await fetch(`/api/mcp/tools/${toolName}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ serverId, payload }),
  // })
  // return response.json()
  
  // Mock response
  return {
    success: true,
    data: { mock: 'response', toolName, serverId, payload },
    timestamp: new Date().toISOString(),
  }
}

