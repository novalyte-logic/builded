/**
 * MCP Dashboard React Hooks
 * 
 * Custom hooks for fetching MCP data with polling support.
 * Includes both dashboard monitoring hooks and MCP tool hooks.
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { callMcpTool } from './client'
import {
  McpServer,
  McpTool,
  McpTraceEvent,
  McpSecurityAlert,
  McpIntegrationStatus,
} from './types'

// ============================================================================
// Generic MCP Tool Hook (for dealflow, market-intel, workforce, etc.)
// ============================================================================

export interface UseMcpToolResult<TOutput> {
  data: TOutput | null
  error: Error | null
  isLoading: boolean
  refetch: () => Promise<void>
}

/**
 * Generic hook for calling MCP tools
 */
function useMcpTool<TInput, TOutput>(
  serverId: string,
  toolName: string,
  input: TInput | null,
  enabled: boolean = true
): UseMcpToolResult<TOutput> {
  const [data, setData] = useState<TOutput | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!enabled || !input) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await callMcpTool<TInput, TOutput>(serverId, toolName, input)
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [serverId, toolName, input, enabled])

  // Defer initial load slightly to avoid blocking navigation
  useEffect(() => {
    if (!enabled || !input) return
    
    // Use requestIdleCallback for non-blocking load, fallback to setTimeout
    const timeoutId = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(() => fetchData(), { timeout: 100 })
      : setTimeout(fetchData, 0)
    
    return () => {
      if (typeof timeoutId === 'number') {
        clearTimeout(timeoutId)
      } else if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(timeoutId)
      }
    }
  }, [fetchData, enabled, input])

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  }
}

// ============================================================================
// Dealflow Hooks
// ============================================================================

export interface GetClinicPipelineInput {
  region: string
  treatment?: string[]
  lookback?: number
  maxResults?: number
}

export interface GetClinicPipelineOutput {
  clinics: Array<{
    name: string
    region: string
    treatment: string[]
    opportunityScore: number
    revenuePotential: string
  }>
  summary: {
    total: number
    highOpportunity: number
    avgOpportunityScore: number
  }
}

export function useDealflowPipeline(
  params: GetClinicPipelineInput | null,
  enabled: boolean = true
): UseMcpToolResult<GetClinicPipelineOutput> {
  return useMcpTool<GetClinicPipelineInput, GetClinicPipelineOutput>(
    'novalyte-dealflow-mcp',
    'get_clinic_pipeline',
    params,
    enabled
  )
}

export interface GetRegionalDemandSpikesInput {
  region: string
  treatment?: string[]
  days?: number
  threshold?: number
}

export interface GetRegionalDemandSpikesOutput {
  spikes: Array<{
    treatment: string
    region: string
    spikeMagnitude: number
    currentValue: number
    baselineValue: number
    opportunityScore: number
    trend: 'spiking' | 'sustained_high' | 'rising'
  }>
}

export function useDealflowDemandSpikes(
  params: GetRegionalDemandSpikesInput | null,
  enabled: boolean = true
): UseMcpToolResult<GetRegionalDemandSpikesOutput> {
  return useMcpTool<GetRegionalDemandSpikesInput, GetRegionalDemandSpikesOutput>(
    'novalyte-dealflow-mcp',
    'get_regional_demand_spikes',
    params,
    enabled
  )
}

// ============================================================================
// Market Intel Hooks
// ============================================================================

export interface GetTreatmentTrendMapInput {
  treatment: string[]
  region?: string
  days?: number
  granularity?: 'daily' | 'weekly' | 'monthly'
}

export interface GetTreatmentTrendMapOutput {
  trends: Array<{
    date: string
    treatment: string
    region: string
    interest: number
  }>
}

export function useMarketIntelTrends(
  params: GetTreatmentTrendMapInput | null,
  enabled: boolean = true
): UseMcpToolResult<GetTreatmentTrendMapOutput> {
  return useMcpTool<GetTreatmentTrendMapInput, GetTreatmentTrendMapOutput>(
    'novalyte-market-intel-mcp',
    'get_treatment_trend_map',
    params,
    enabled
  )
}

export interface GetCompetitorDensityInput {
  region: string
  treatment?: string[]
  radius?: number
}

export interface GetCompetitorDensityOutput {
  competitors: Array<{
    name: string
    location: { city: string; state: string }
    adSpend: 'high' | 'medium' | 'low'
    serviceLines: string[]
  }>
}

export function useMarketIntelCompetitors(
  params: GetCompetitorDensityInput | null,
  enabled: boolean = true
): UseMcpToolResult<GetCompetitorDensityOutput> {
  return useMcpTool<GetCompetitorDensityInput, GetCompetitorDensityOutput>(
    'novalyte-market-intel-mcp',
    'get_competitor_density',
    params,
    enabled
  )
}

// ============================================================================
// Workforce Hooks
// ============================================================================

export interface FindAvailableStaffInput {
  region: string
  roleType?: string[]
  serviceLine?: string
  minExperience?: number
}

export interface FindAvailableStaffOutput {
  staff: Array<{
    displayName: string
    roleType: string
    yearsExperience: number
    primarySkills: string[]
    preferredShifts: string[]
  }>
}

export function useWorkforceStaffAvailability(
  params: FindAvailableStaffInput | null,
  enabled: boolean = true
): UseMcpToolResult<FindAvailableStaffOutput> {
  return useMcpTool<FindAvailableStaffInput, FindAvailableStaffOutput>(
    'novalyte-workforce-mcp',
    'find_available_staff',
    params,
    enabled
  )
}

export interface MatchShiftsToStaffInput {
  shiftIds: string[]
  region: string
  minScore?: number
}

export interface MatchShiftsToStaffOutput {
  matches: Array<{
    shiftId: string
    staffId: string
    fitScore: number
  }>
}

export function useWorkforceMatches(
  params: MatchShiftsToStaffInput | null,
  enabled: boolean = true
): UseMcpToolResult<MatchShiftsToStaffOutput> {
  return useMcpTool<MatchShiftsToStaffInput, MatchShiftsToStaffOutput>(
    'novalyte-workforce-mcp',
    'match_shifts_to_staff',
    params,
    enabled
  )
}

// ============================================================================
// Demand Intel Hooks
// ============================================================================

export interface GetTreatmentTrendOverviewInput {
  treatment?: string[]
  region?: string
  days?: number
}

export interface GetTreatmentTrendOverviewOutput {
  overview: Array<{
    treatment: string
    region: string
    currentDemand: number
    projectedDemand: number
    trend: 'rising' | 'stable' | 'declining'
    confidence: number
  }>
}

export function useDemandIntelOverview(
  params: GetTreatmentTrendOverviewInput | null,
  enabled: boolean = true
): UseMcpToolResult<GetTreatmentTrendOverviewOutput> {
  return useMcpTool<GetTreatmentTrendOverviewInput, GetTreatmentTrendOverviewOutput>(
    'novalyte-demand-intel-mcp',
    'get_treatment_trend_overview',
    params,
    enabled
  )
}

export interface GetIntentSignalsInput {
  treatment?: string[]
  region?: string
  days?: number
}

export interface GetIntentSignalsOutput {
  signals: Array<{
    treatment: string
    region: string
    intentScore: number
    signalType: string
  }>
}

export function useIntentSignals(
  params: GetIntentSignalsInput | null,
  enabled: boolean = true
): UseMcpToolResult<GetIntentSignalsOutput> {
  return useMcpTool<GetIntentSignalsInput, GetIntentSignalsOutput>(
    'novalyte-demand-intel-mcp',
    'get_intent_signals',
    params,
    enabled
  )
}

// ============================================================================
// Dashboard Monitoring Hooks (with polling)
// ============================================================================

/**
 * Hook to check if document is visible
 */
function useIsVisible() {
  if (typeof window === 'undefined') return true
  
  const [isVisible, setIsVisible] = useState(!document.hidden)
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  return isVisible
}

/**
 * Generic polling hook
 */
function usePolling<T>(
  fetchFn: () => Promise<T>,
  refreshInterval: number = 0,
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(immediate)
  const isVisible = useIsVisible()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchFn()
      setData(result)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    // Initial fetch
    if (immediate) {
      fetchData()
    }

    // Set up polling if interval > 0 and document is visible
    if (refreshInterval > 0 && isVisible) {
      intervalRef.current = setInterval(fetchData, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData, refreshInterval, isVisible, immediate])

  const refetch = useCallback(() => {
    setIsLoading(true)
    return fetchData()
  }, [fetchData])

  return { data, error, isLoading, refetch }
}

/**
 * Fetch MCP servers with polling
 */
export function useMcpServers(refreshInterval: number = 30000) {
  const { data, error, isLoading, refetch } = usePolling(
    async () => {
      const response = await fetch('/api/mcp/servers')
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      const json = await response.json()
      return json.servers as McpServer[]
    },
    refreshInterval
  )

  return {
    servers: data || [],
    error,
    isLoading,
    refetch,
  }
}

/**
 * Fetch MCP tools
 */
export function useMcpTools(filters?: {
  serverId?: string
  scope?: 'read' | 'write' | 'admin'
  status?: 'ACTIVE' | 'DISABLED'
  search?: string
}) {
  const params = new URLSearchParams()
  if (filters?.serverId) params.append('serverId', filters.serverId)
  if (filters?.scope) params.append('scope', filters.scope)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.search) params.append('search', filters.search)

  const url = `/api/mcp/tools${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, refetch } = usePolling(
    async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      const json = await response.json()
      return json.tools as McpTool[]
    },
    0 // No polling for tools
  )

  return {
    tools: data || [],
    error,
    isLoading,
    refetch,
  }
}

/**
 * Fetch MCP traces with polling
 */
export function useMcpTraces(
  filters?: {
    limit?: number
    status?: 'SUCCESS' | 'ERROR'
    serverId?: string
    toolName?: string
    agentName?: string
    since?: string
  },
  refreshInterval: number = 15000
) {
  const params = new URLSearchParams()
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.status) params.append('status', filters.status)
  if (filters?.serverId) params.append('serverId', filters.serverId)
  if (filters?.toolName) params.append('toolName', filters.toolName)
  if (filters?.agentName) params.append('agentName', filters.agentName)
  if (filters?.since) params.append('since', filters.since)

  const url = `/api/mcp/traces${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, refetch } = usePolling(
    async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      const json = await response.json()
      return json.traces as McpTraceEvent[]
    },
    refreshInterval
  )

  return {
    traces: data || [],
    error,
    isLoading,
    refetch,
  }
}

/**
 * Fetch MCP security alerts
 */
export function useMcpSecurityAlerts(filters?: {
  severity?: 'LOW' | 'MEDIUM' | 'HIGH'
  serverId?: string
  toolId?: string
  since?: string
  limit?: number
}) {
  const params = new URLSearchParams()
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.serverId) params.append('serverId', filters.serverId)
  if (filters?.toolId) params.append('toolId', filters.toolId)
  if (filters?.since) params.append('since', filters.since)
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `/api/mcp/security-alerts${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, refetch } = usePolling(
    async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      const json = await response.json()
      return json.alerts as McpSecurityAlert[]
    },
    30000 // 30 seconds
  )

  return {
    alerts: data || [],
    error,
    isLoading,
    refetch,
  }
}

/**
 * Fetch MCP integrations
 */
export function useMcpIntegrations(filters?: {
  provider?: string
  status?: 'LIVE' | 'DEGRADED' | 'OFFLINE'
}) {
  const params = new URLSearchParams()
  if (filters?.provider) params.append('provider', filters.provider)
  if (filters?.status) params.append('status', filters.status)

  const url = `/api/mcp/integrations${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, refetch } = usePolling(
    async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      const json = await response.json()
      return json.integrations as McpIntegrationStatus[]
    },
    60000 // 1 minute
  )

  return {
    integrations: data || [],
    error,
    isLoading,
    refetch,
  }
}
