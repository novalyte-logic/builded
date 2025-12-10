/**
 * Smart Query Assistant - Context Provider
 * 
 * Provides global state for the Smart Query system across all MCP tool pages.
 */

'use client'

import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import {
  QueryHistoryEntry,
  DatasetCatalogEntry,
  McpManifestData,
  SmartQueryEngineProps,
} from './types'
import { useQueryHistory, useDatasetCatalog, useMcpManifest } from './hooks'
import { mcpRegistry } from '@/lib/mcp/registry'

// ============================================================================
// Context Types
// ============================================================================

interface SmartQueryContextValue {
  // Query history
  queryHistory: QueryHistoryEntry[]
  addQueryToHistory: (entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>) => void
  clearQueryHistory: () => void
  getRecentQueriesForTool: (serverId: string, toolName: string, limit?: number) => QueryHistoryEntry[]
  
  // Dataset catalog
  datasetCatalog: DatasetCatalogEntry[]
  refreshDatasetCatalog: () => Promise<void>
  
  // Current selection
  selectedServerId: string | null
  selectedToolName: string | null
  setSelectedServer: (serverId: string | null) => void
  setSelectedTool: (toolName: string | null) => void
  
  // Manifest data
  currentManifest: McpManifestData | null
  getAllManifests: () => McpManifestData[]
  
  // Engine props builder
  buildEngineProps: () => SmartQueryEngineProps
}

// ============================================================================
// Context
// ============================================================================

const SmartQueryContext = createContext<SmartQueryContextValue | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

interface SmartQueryProviderProps {
  children: React.ReactNode
  initialServerId?: string
  initialToolName?: string
}

export function SmartQueryProvider({
  children,
  initialServerId,
  initialToolName,
}: SmartQueryProviderProps) {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(initialServerId || null)
  const [selectedToolName, setSelectedToolName] = useState<string | null>(initialToolName || null)
  
  const { history, addEntry, clearHistory, getRecentForTool } = useQueryHistory()
  const { catalog, refreshCatalog } = useDatasetCatalog()
  const manifest = useMcpManifest(selectedServerId)

  // Handle server change
  const handleServerChange = useCallback((serverId: string | null) => {
    setSelectedServerId(serverId)
    setSelectedToolName(null) // Reset tool when server changes
  }, [])

  // Get all manifests
  const getAllManifests = useCallback((): McpManifestData[] => {
    return Object.values(mcpRegistry).map(server => ({
      serverId: server.id,
      serverName: server.label,
      description: server.description,
      domain: server.domain,
      tools: Object.values(server.tools).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema as any,
        outputSchema: tool.outputSchema as any,
      })),
    }))
  }, [])

  // Build engine props
  const buildEngineProps = useCallback((): SmartQueryEngineProps => {
    const pastQueries = selectedServerId && selectedToolName
      ? getRecentForTool(selectedServerId, selectedToolName, 10)
      : history.slice(0, 10)

    return {
      selectedMcpServer: selectedServerId,
      selectedTool: selectedToolName,
      serverManifest: manifest,
      pastQueries,
      datasetCatalog: catalog,
    }
  }, [selectedServerId, selectedToolName, manifest, history, catalog, getRecentForTool])

  // Add query to history with context
  const addQueryToHistory = useCallback((entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>) => {
    addEntry(entry)
  }, [addEntry])

  const value = useMemo<SmartQueryContextValue>(() => ({
    queryHistory: history,
    addQueryToHistory,
    clearQueryHistory: clearHistory,
    getRecentQueriesForTool: getRecentForTool,
    datasetCatalog: catalog,
    refreshDatasetCatalog: refreshCatalog,
    selectedServerId,
    selectedToolName,
    setSelectedServer: handleServerChange,
    setSelectedTool: setSelectedToolName,
    currentManifest: manifest,
    getAllManifests,
    buildEngineProps,
  }), [
    history,
    addQueryToHistory,
    clearHistory,
    getRecentForTool,
    catalog,
    refreshCatalog,
    selectedServerId,
    selectedToolName,
    handleServerChange,
    manifest,
    getAllManifests,
    buildEngineProps,
  ])

  return (
    <SmartQueryContext.Provider value={value}>
      {children}
    </SmartQueryContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useSmartQueryContext() {
  const context = useContext(SmartQueryContext)
  if (!context) {
    throw new Error('useSmartQueryContext must be used within a SmartQueryProvider')
  }
  return context
}

// ============================================================================
// Auto-Discovery Hook
// ============================================================================

/**
 * Hook that auto-discovers MCP server capabilities from manifests
 * Designed to automatically include new MCP servers without manual updates
 */
export function useMcpAutoDiscovery() {
  const [discoveredServers, setDiscoveredServers] = useState<McpManifestData[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)

  useEffect(() => {
    const discoverServers = async () => {
      setIsDiscovering(true)
      
      try {
        // Get from registry
        const servers = Object.values(mcpRegistry).map(server => ({
          serverId: server.id,
          serverName: server.label,
          description: server.description,
          domain: server.domain,
          tools: Object.values(server.tools).map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema as any,
            outputSchema: tool.outputSchema as any,
            sampleQueries: [], // Could be populated from manifest files
          })),
        }))

        // In production, also fetch from API to get dynamically registered servers
        // const response = await fetch('/api/admin/mcp/discover')
        // const dynamicServers = await response.json()
        // servers.push(...dynamicServers)

        setDiscoveredServers(servers)
      } catch (error) {
        console.error('Failed to discover MCP servers:', error)
      } finally {
        setIsDiscovering(false)
      }
    }

    discoverServers()
  }, [])

  return {
    discoveredServers,
    isDiscovering,
    refreshDiscovery: () => {
      setDiscoveredServers([])
    },
  }
}
