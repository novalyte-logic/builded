/**
 * Smart Query Assistant - React Hooks
 * 
 * Custom hooks for managing query suggestions, history, and dataset catalog.
 */

'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  QuerySuggestion,
  DatasetSuggestion,
  QueryHistoryEntry,
  DatasetCatalogEntry,
  McpManifestData,
  IntentVector,
  SmartQueryEngineProps,
} from './types'
import {
  generateSuggestions,
  getRelevantDatasets,
  calculateIntentVector,
} from './suggestion-engine'
import { fetchAISuggestions, buildAISuggestionRequest } from './ai-prompting'
import { mcpRegistry, McpServerConfig } from '@/lib/mcp/registry'

// ============================================================================
// Local Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  QUERY_HISTORY: 'novalyte-query-history',
  DATASET_CATALOG: 'novalyte-dataset-catalog',
}

// ============================================================================
// Default Dataset Catalog
// ============================================================================

const DEFAULT_DATASET_CATALOG: DatasetCatalogEntry[] = [
  {
    id: 'demand-signals',
    name: 'demand_signals',
    displayName: 'Demand Signals',
    description: 'Real-time treatment demand and intent signals by region',
    domain: 'demandIntel',
    keywords: ['demand', 'spike', 'surge', 'trend', 'intent', 'signal'],
    tables: [
      {
        name: 'demand_signals',
        description: 'Treatment demand signals with regional breakdown',
        columns: [
          { name: 'region', type: 'STRING', description: 'Geographic region' },
          { name: 'treatment', type: 'STRING', description: 'Treatment type' },
          { name: 'demand_index', type: 'FLOAT64', description: 'Demand intensity 0-100' },
          { name: 'timestamp', type: 'TIMESTAMP', description: 'Signal timestamp' },
        ],
        sampleQueries: [
          'Show TRT demand signals in Texas',
          'Find demand spikes above 75 index',
        ],
      },
    ],
  },
  {
    id: 'clinic-pipeline',
    name: 'clinic_pipeline',
    displayName: 'Clinic Pipeline',
    description: 'Clinic lead pipeline and conversion funnel data',
    domain: 'dealflow',
    keywords: ['clinic', 'pipeline', 'lead', 'conversion', 'funnel', 'patient'],
    tables: [
      {
        name: 'clinic_pipeline',
        description: 'Pipeline stage data for clinics',
        columns: [
          { name: 'clinic_id', type: 'STRING', description: 'Clinic identifier' },
          { name: 'stage', type: 'STRING', description: 'Pipeline stage' },
          { name: 'count', type: 'INT64', description: 'Count at stage' },
          { name: 'conversion_rate', type: 'FLOAT64', description: 'Stage conversion rate' },
        ],
      },
    ],
  },
  {
    id: 'geo-trends',
    name: 'geo_trends',
    displayName: 'Geographic Trends',
    description: 'Regional and city-level trend data',
    domain: 'marketIntel',
    keywords: ['region', 'city', 'state', 'geo', 'geographic', 'metro', 'zip'],
    tables: [
      {
        name: 'geo_trends',
        description: 'Geographic trend data',
        columns: [
          { name: 'city', type: 'STRING' },
          { name: 'state', type: 'STRING' },
          { name: 'treatment', type: 'STRING' },
          { name: 'trend_score', type: 'FLOAT64' },
        ],
      },
    ],
  },
  {
    id: 'competitor-density',
    name: 'clinic_competition',
    displayName: 'Competitor Density',
    description: 'Clinic competition and market saturation data',
    domain: 'marketIntel',
    keywords: ['competitor', 'competition', 'density', 'saturation', 'market share'],
    tables: [
      {
        name: 'clinic_competition',
        description: 'Competitor density by region',
        columns: [
          { name: 'region', type: 'STRING' },
          { name: 'competitor_count', type: 'INT64' },
          { name: 'saturation_score', type: 'FLOAT64' },
        ],
      },
    ],
  },
  {
    id: 'staff-availability',
    name: 'staff_availability',
    displayName: 'Staff Availability',
    description: 'Workforce availability and credential data',
    domain: 'workforce',
    keywords: ['staff', 'nurse', 'provider', 'availability', 'credential', 'shift'],
    tables: [
      {
        name: 'staff_availability',
        description: 'Staff availability records',
        columns: [
          { name: 'staff_id', type: 'STRING' },
          { name: 'role', type: 'STRING' },
          { name: 'region', type: 'STRING' },
          { name: 'available_hours', type: 'INT64' },
        ],
      },
    ],
  },
  {
    id: 'treatment-trends',
    name: 'treatment_trends',
    displayName: 'Treatment Trends',
    description: 'Treatment category trends and performance',
    domain: 'marketIntel',
    keywords: ['treatment', 'trt', 'glp-1', 'peptide', 'therapy', 'trend'],
    tables: [
      {
        name: 'treatment_trends',
        description: 'Treatment trend time series',
        columns: [
          { name: 'treatment', type: 'STRING' },
          { name: 'date', type: 'DATE' },
          { name: 'volume', type: 'INT64' },
          { name: 'growth_rate', type: 'FLOAT64' },
        ],
      },
    ],
  },
  {
    id: 'ads-metrics',
    name: 'ads_metrics',
    displayName: 'Ads Performance',
    description: 'Advertising metrics and creative performance',
    domain: 'bigquery',
    keywords: ['ad', 'ads', 'campaign', 'creative', 'cpc', 'ctr', 'roas'],
    tables: [
      {
        name: 'ads_metrics',
        description: 'Ad campaign performance metrics',
        columns: [
          { name: 'campaign_id', type: 'STRING' },
          { name: 'impressions', type: 'INT64' },
          { name: 'clicks', type: 'INT64' },
          { name: 'ctr', type: 'FLOAT64' },
          { name: 'spend', type: 'FLOAT64' },
        ],
      },
    ],
  },
  {
    id: 'revenue-analytics',
    name: 'clinic_revenue_daily',
    displayName: 'Revenue Analytics',
    description: 'Clinic revenue and LTV data',
    domain: 'bigquery',
    keywords: ['revenue', 'ltv', 'arpu', 'profit', 'margin', 'earnings'],
    tables: [
      {
        name: 'clinic_revenue_daily',
        description: 'Daily clinic revenue data',
        columns: [
          { name: 'clinic_id', type: 'STRING' },
          { name: 'date', type: 'DATE' },
          { name: 'revenue', type: 'FLOAT64' },
          { name: 'patient_count', type: 'INT64' },
        ],
      },
    ],
  },
]

// ============================================================================
// useQueryHistory Hook
// ============================================================================

export function useQueryHistory(maxEntries: number = 50) {
  const [history, setHistory] = useState<QueryHistoryEntry[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUERY_HISTORY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })))
      }
    } catch (error) {
      console.error('Failed to load query history:', error)
    }
  }, [])

  // Save to localStorage when history changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to save query history:', error)
    }
  }, [history])

  const addEntry = useCallback((entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: QueryHistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    
    setHistory(prev => [newEntry, ...prev].slice(0, maxEntries))
  }, [maxEntries])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const getRecentForTool = useCallback((serverId: string, toolName: string, limit: number = 10) => {
    return history
      .filter(entry => entry.serverId === serverId && entry.toolName === toolName)
      .slice(0, limit)
  }, [history])

  return {
    history,
    addEntry,
    clearHistory,
    getRecentForTool,
  }
}

// ============================================================================
// useDatasetCatalog Hook
// ============================================================================

export function useDatasetCatalog() {
  const [catalog, setCatalog] = useState<DatasetCatalogEntry[]>(DEFAULT_DATASET_CATALOG)

  // In production, this would fetch from an API
  const refreshCatalog = useCallback(async () => {
    try {
      // TODO: Fetch from API
      // const response = await fetch('/api/admin/datasets/catalog')
      // const data = await response.json()
      // setCatalog(data)
      
      // For now, use defaults
      setCatalog(DEFAULT_DATASET_CATALOG)
    } catch (error) {
      console.error('Failed to refresh dataset catalog:', error)
    }
  }, [])

  return {
    catalog,
    refreshCatalog,
  }
}

// ============================================================================
// useMcpManifest Hook
// ============================================================================

export function useMcpManifest(serverId: string | null) {
  const [manifest, setManifest] = useState<McpManifestData | null>(null)

  useEffect(() => {
    if (!serverId) {
      setManifest(null)
      return
    }

    // Get manifest from registry
    const serverConfig = mcpRegistry[serverId]
    if (serverConfig) {
      setManifest({
        serverId: serverConfig.id,
        serverName: serverConfig.label,
        description: serverConfig.description,
        domain: serverConfig.domain,
        tools: Object.values(serverConfig.tools).map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema as any,
          outputSchema: tool.outputSchema as any,
        })),
      })
    }
  }, [serverId])

  return manifest
}

// ============================================================================
// useSmartSuggestions Hook
// ============================================================================

interface UseSmartSuggestionsOptions {
  debounceMs?: number
  enableAI?: boolean
  maxSuggestions?: number
}

export function useSmartSuggestions(
  engineProps: SmartQueryEngineProps,
  currentQuery: string,
  options: UseSmartSuggestionsOptions = {}
) {
  const {
    debounceMs = 150,
    enableAI = true,
    maxSuggestions = 10,
  } = options

  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([])
  const [datasetSuggestions, setDatasetSuggestions] = useState<DatasetSuggestion[]>([])
  const [intentVector, setIntentVector] = useState<IntentVector | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastQueryRef = useRef<string>('')

  // Generate suggestions when query changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      // Calculate intent vector
      const intent = calculateIntentVector(currentQuery)
      setIntentVector(intent)

      // Generate local suggestions
      const localSuggestions = generateSuggestions(engineProps, currentQuery)
      setSuggestions(localSuggestions.slice(0, maxSuggestions))

      // Generate dataset suggestions
      const datasets = getRelevantDatasets(currentQuery, engineProps.datasetCatalog)
      setDatasetSuggestions(datasets)

      // Fetch AI suggestions if enabled and query is substantial
      if (enableAI && currentQuery.length >= 3 && currentQuery !== lastQueryRef.current) {
        lastQueryRef.current = currentQuery
        setIsLoading(true)
        
        try {
          const tool = engineProps.serverManifest?.tools.find(
            t => t.name === engineProps.selectedTool
          )
          
          const request = buildAISuggestionRequest(
            tool || null,
            engineProps.serverManifest,
            currentQuery,
            engineProps.pastQueries,
            engineProps.datasetCatalog.map(d => d.name)
          )

          const aiResponse = await fetchAISuggestions(request, engineProps.selectedTool || undefined)
          
          if (aiResponse?.querySuggestions) {
            const aiSuggestions: QuerySuggestion[] = aiResponse.querySuggestions.map((s, i) => ({
              id: `ai-${i}`,
              text: s.text,
              category: 'query' as const,
              confidence: s.confidence,
              source: 'ai' as const,
              metadata: {
                toolName: engineProps.selectedTool || undefined,
              },
            }))

            // Merge with local suggestions, prioritizing AI
            setSuggestions(prev => {
              const merged = [...aiSuggestions, ...prev]
              const seen = new Set<string>()
              return merged.filter(s => {
                const key = s.text.toLowerCase()
                if (seen.has(key)) return false
                seen.add(key)
                return true
              }).slice(0, maxSuggestions)
            })
          }
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setIsLoading(false)
        }
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [currentQuery, engineProps, enableAI, maxSuggestions, debounceMs])

  // Regenerate when server/tool changes
  useEffect(() => {
    setSuggestions([])
    setDatasetSuggestions([])
    lastQueryRef.current = ''
  }, [engineProps.selectedMcpServer, engineProps.selectedTool])

  return {
    suggestions,
    datasetSuggestions,
    intentVector,
    isLoading,
    error,
  }
}

// ============================================================================
// useSmartQueryAssistant Hook (Combined)
// ============================================================================

export function useSmartQueryAssistant(
  serverId: string | null,
  toolName: string | null
) {
  const { history, addEntry, getRecentForTool } = useQueryHistory()
  const { catalog } = useDatasetCatalog()
  const manifest = useMcpManifest(serverId)

  const engineProps = useMemo<SmartQueryEngineProps>(() => ({
    selectedMcpServer: serverId,
    selectedTool: toolName,
    serverManifest: manifest,
    pastQueries: serverId && toolName 
      ? getRecentForTool(serverId, toolName, 10)
      : history.slice(0, 10),
    datasetCatalog: catalog,
  }), [serverId, toolName, manifest, history, catalog, getRecentForTool])

  const recordQuery = useCallback((query: string, success: boolean, resultCount?: number) => {
    if (!serverId || !toolName) return
    
    addEntry({
      query,
      serverId,
      toolName,
      success,
      resultCount,
    })
  }, [serverId, toolName, addEntry])

  return {
    engineProps,
    manifest,
    catalog,
    recordQuery,
  }
}
