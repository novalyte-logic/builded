/**
 * MCP Tool Page Wrapper
 * 
 * Universal wrapper component that auto-enables SmartQueryAssistant on all MCP tool pages.
 * Simply wrap any MCP-related page with this component to get smart query suggestions.
 */

'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Sparkles, Brain, Settings2 } from 'lucide-react'
import clsx from 'clsx'
import SmartQueryAssistant from './SmartQueryAssistant'
import { SmartQueryProvider, useSmartQueryContext } from '@/lib/smart-query/context'
import { useSmartQueryAssistant } from '@/lib/smart-query/hooks'
import { McpServerConfig, McpToolConfig, mcpRegistry } from '@/lib/mcp/registry'

// ============================================================================
// MCP Tool Page Wrapper Props
// ============================================================================

interface McpToolPageWrapperProps {
  children: React.ReactNode
  
  // Pre-selected server/tool (optional)
  defaultServerId?: string
  defaultToolName?: string
  
  // UI options
  showHeader?: boolean
  headerTitle?: string
  headerDescription?: string
  
  // Smart Query options
  enableSmartQuery?: boolean
  showDatasetSuggestions?: boolean
  showIntentAnalysis?: boolean
  
  // Event handlers
  onQuerySubmit?: (query: string, serverId: string, toolName: string) => void
  onServerChange?: (serverId: string) => void
  onToolChange?: (toolName: string) => void
  
  // Styling
  className?: string
}

// ============================================================================
// Inner Wrapper (uses context)
// ============================================================================

interface InnerWrapperProps extends Omit<McpToolPageWrapperProps, 'defaultServerId' | 'defaultToolName'> {
  // Render props pattern for flexibility
  renderContent?: (props: {
    query: string
    setQuery: (q: string) => void
    serverId: string | null
    toolName: string | null
    manifest: any
  }) => React.ReactNode
}

function InnerWrapper({
  children,
  showHeader = true,
  headerTitle = 'MCP Tool Console',
  headerDescription = 'Query MCP tools with intelligent suggestions',
  enableSmartQuery = true,
  showDatasetSuggestions = true,
  showIntentAnalysis = true,
  onQuerySubmit,
  onServerChange,
  onToolChange,
  className,
  renderContent,
}: InnerWrapperProps) {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  
  const {
    selectedServerId,
    selectedToolName,
    setSelectedServer,
    setSelectedTool,
    currentManifest,
    addQueryToHistory,
  } = useSmartQueryContext()

  const { engineProps, recordQuery } = useSmartQueryAssistant(selectedServerId, selectedToolName)

  // Handle server change
  const handleServerChange = useCallback((serverId: string) => {
    setSelectedServer(serverId)
    onServerChange?.(serverId)
  }, [setSelectedServer, onServerChange])

  // Handle tool change
  const handleToolChange = useCallback((toolName: string) => {
    setSelectedTool(toolName)
    onToolChange?.(toolName)
  }, [setSelectedTool, onToolChange])

  // Handle query submit
  const handleQuerySubmit = useCallback(() => {
    if (!query.trim() || !selectedServerId || !selectedToolName) return
    
    recordQuery(query, true)
    onQuerySubmit?.(query, selectedServerId, selectedToolName)
  }, [query, selectedServerId, selectedToolName, recordQuery, onQuerySubmit])

  // Get available servers and tools
  const servers = Object.values(mcpRegistry)
  const selectedServer = selectedServerId ? mcpRegistry[selectedServerId] : null
  const tools = selectedServer ? Object.values(selectedServer.tools) : []

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Terminal className="w-8 h-8 text-primary" />
                {headerTitle}
              </h1>
              <p className="text-gray-400/90 text-base mt-1">
                {headerDescription}
              </p>
            </div>
            
            {/* Smart Query Toggle */}
            {enableSmartQuery && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                  isExpanded 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Smart Query</span>
              </button>
            )}
          </div>
          <div className="h-px bg-white/10" />
        </div>
      )}

      {/* Smart Query Section */}
      {enableSmartQuery && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-dark-surface/80 border border-white/10 rounded-xl p-4 shadow-lg"
        >
          {/* Server/Tool Selectors */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-400/90 mb-2 block">
                MCP Server
              </label>
              <select
                value={selectedServerId || ''}
                onChange={(e) => handleServerChange(e.target.value)}
                className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">Select a server...</option>
                {servers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-400/90 mb-2 block">
                Tool
              </label>
              <select
                value={selectedToolName || ''}
                onChange={(e) => handleToolChange(e.target.value)}
                disabled={!selectedServerId}
                className="w-full px-3 py-2 bg-dark-accent/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              >
                <option value="">Select a tool...</option>
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart Query Input */}
          <SmartQueryAssistant
            engineProps={engineProps}
            currentQuery={query}
            onQueryChange={setQuery}
            showDatasets={showDatasetSuggestions}
            showIntentAnalysis={showIntentAnalysis}
            onSuggestionSelect={(suggestion) => {
              setQuery(suggestion.text)
            }}
          />

          {/* Submit Button */}
          {selectedServerId && selectedToolName && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleQuerySubmit}
                disabled={!query.trim()}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  query.trim()
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                )}
              >
                <Brain className="w-4 h-4" />
                Execute Query
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Render custom content or children */}
      {renderContent 
        ? renderContent({
            query,
            setQuery,
            serverId: selectedServerId,
            toolName: selectedToolName,
            manifest: currentManifest,
          })
        : children
      }
    </div>
  )
}

// ============================================================================
// Main Wrapper Component (with Provider)
// ============================================================================

export default function McpToolPageWrapper({
  defaultServerId,
  defaultToolName,
  ...props
}: McpToolPageWrapperProps) {
  return (
    <SmartQueryProvider
      initialServerId={defaultServerId}
      initialToolName={defaultToolName}
    >
      <InnerWrapper {...props} />
    </SmartQueryProvider>
  )
}

// ============================================================================
// HOC for wrapping existing pages
// ============================================================================

export function withSmartQuery<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Partial<McpToolPageWrapperProps> = {}
) {
  return function SmartQueryWrappedComponent(props: P) {
    return (
      <McpToolPageWrapper {...options}>
        <WrappedComponent {...props} />
      </McpToolPageWrapper>
    )
  }
}
