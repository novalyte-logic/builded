/**
 * React Hooks for MCP Tools
 * 
 * Type-safe React hooks that wrap MCP tool calls with loading states,
 * error handling, and refetch capabilities.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { callMcpTool } from './client'

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    error,
    isLoading,
    refetch: fetchData,
  }
}

// ============================================================================
// Dealflow MCP Hooks
// ============================================================================

export interface GetClinicPipelineInput {
  region?: string
  treatment?: string[]
  lookback?: number // days
  maxResults?: number
}

export interface GetClinicPipelineOutput {
  clinics: Array<{
    id: string
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
    region: string
    treatment: string
    spikeMagnitude: number
    baselineValue: number
    currentValue: number
    trend: 'spiking' | 'sustained_high' | 'rising'
    detectedAt: string
    opportunityScore: number
  }>
  summary: {
    totalSpikes: number
    region: string
    lookbackWindow: {
      days: number
      startDate: string
      endDate: string
    }
  }
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
// Market Intelligence MCP Hooks
// ============================================================================

export interface GetTreatmentTrendMapInput {
  treatment?: string[]
  region?: string
  days?: number
  granularity?: 'daily' | 'weekly' | 'monthly'
}

export interface GetTreatmentTrendMapOutput {
  trendMap: Array<{
    treatment: string
    region: string
    timePoint: string
    metrics: {
      searchVolume: number
      demandIndex: number
      growthRate: number
      trend: 'rising' | 'stable' | 'declining'
      marketShare: number
    }
    signals: string[]
  }>
  summary: {
    totalDataPoints: number
    treatmentsAnalyzed: string[]
    regionsAnalyzed: string[]
    timeWindow: {
      startDate: string
      endDate: string
      days: number
    }
  }
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
  radius?: number // miles
}

export interface GetCompetitorDensityOutput {
  competitors: Array<{
    name: string
    location: { city: string; state: string }
    adSpend: 'low' | 'medium' | 'high'
    marketShare: number
    threatLevel: 'low' | 'medium' | 'high'
  }>
  summary: {
    totalCompetitors: number
    avgAdSpend: string
    marketSaturation: number
  }
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
// Workforce MCP Hooks
// ============================================================================

export interface MatchShiftsToStaffInput {
  shiftIds: string[]
  region?: string
  minScore?: number
}

export interface MatchShiftsToStaffOutput {
  matches: Array<{
    shiftId: string
    staffId: string
    compatibilityScore: number
    scoreBreakdown: {
      roleMatch: number
      skillsMatch: number
      availabilityMatch: number
      locationMatch: number
    }
    shift: {
      shiftId: string
      clinicName: string
      startTime: string
      endTime: string
      treatmentType: string
    }
    staff: {
      staffId: string
      displayName: string
      roleType: string
      location: {
        city: string
        state: string
      }
    }
    recommendation: 'strong_match' | 'good_match' | 'acceptable_match'
    notes: string
  }>
  unmatchedShifts: Array<{
    shiftId: string
    clinicName: string
    reason: string
    suggestions: string[]
  }>
  summary: {
    totalShifts: number
    matchedShifts: number
    unmatchedShifts: number
    totalMatches: number
    averageCompatibilityScore: number
  }
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

export interface FindAvailableStaffInput {
  region?: string
  roleType?: string[]
  serviceLine?: string[]
  minExperience?: number
}

export interface FindAvailableStaffOutput {
  staff: Array<{
    id: string
    displayName: string
    roleType: string
    skills: string[]
    preferredRegions: string[]
    city: string
    state: string
    yearsExperience: number
    availabilityStatus: string
  }>
  summary: {
    total: number
    byRoleType: Record<string, number>
    byRegion: Record<string, number>
  }
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

// ============================================================================
// Demand Intelligence MCP Hooks
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
    trend: 'rising' | 'stable' | 'declining'
    projectedDemand: number
    confidence: number
  }>
  summary: {
    totalRegions: number
    avgDemandGrowth: number
    topGrowingRegions: string[]
  }
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
  region?: string
  treatment?: string[]
  days?: number
  minSignalStrength?: number
}

export interface GetIntentSignalsOutput {
  signals: Array<{
    type: 'search_spike' | 'social_mention' | 'news_trend' | 'competitor_activity'
    treatment: string
    region: string
    strength: number
    detectedAt: string
    source: string
    description: string
  }>
  summary: {
    totalSignals: number
    byType: Record<string, number>
    topRegions: string[]
  }
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

