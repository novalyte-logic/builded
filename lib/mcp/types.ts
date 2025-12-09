/**
 * MCP Dashboard Types
 * 
 * Core TypeScript interfaces for MCP server, tool, trace, and security data.
 */

export type McpServerStatus = 'LIVE' | 'DEGRADED' | 'OFFLINE'
export type McpToolScope = 'read' | 'write' | 'admin'
export type McpToolStatus = 'ACTIVE' | 'DISABLED'
export type McpTraceStatus = 'SUCCESS' | 'ERROR'
export type McpSecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH'
export type McpIntegrationStatusType = 'LIVE' | 'DEGRADED' | 'OFFLINE'

export interface McpServer {
  id: string
  name: string
  status: McpServerStatus
  uptimePercent: number
  callsLast15m: number
  errorRate: number
  avgLatencyMs: number
  region?: string
  version?: string
}

export interface McpTool {
  id: string
  name: string
  description: string
  serverId: string
  scope: McpToolScope
  calls24h: number
  avgLatencyMs: number
  errorRate: number
  status: McpToolStatus
}

export interface McpTraceEvent {
  id: string
  timestamp: string
  agentName: string
  toolName: string
  serverName: string
  status: McpTraceStatus
  durationMs: number
  requestPayload: any
  responsePayload: any
  errorMessage?: string
}

export interface McpSecurityAlert {
  id: string
  timestamp: string
  severity: McpSecuritySeverity
  message: string
  relatedToolId?: string
  relatedServerId?: string
}

export interface McpIntegrationStatus {
  id: string
  name: string
  provider: string
  status: McpIntegrationStatusType
  requests24h: number
  quotaUsedPercent: number
}

export interface McpKpiStats {
  registeredServers: number
  activeTools: number
  agentCalls24h: number
  failedCalls24h: number
  p95Latency: number
  securityWarnings: number
}

export interface McpSecurityMetrics {
  keysActive: number
  keysExpiring7d: number
  scopesInUse: number
  blockedTools: number
}

