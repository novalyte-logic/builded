/**
 * Smart Query Assistant - Type Definitions
 * 
 * Core types for the universal Smart Query Suggestion Layer that works across ALL MCP servers.
 * Designed to be dynamic, extensible, and automatically adapt to new MCP servers.
 */

// ============================================================================
// Core Types
// ============================================================================

export interface QuerySuggestion {
  id: string
  text: string
  category: 'query' | 'dataset' | 'template' | 'autocomplete'
  confidence: number // 0-1 score
  source: 'ai' | 'history' | 'manifest' | 'pattern'
  metadata?: {
    toolName?: string
    datasetHint?: string
    intentVector?: IntentVector
    matchedKeywords?: string[]
  }
}

export interface DatasetSuggestion {
  id: string
  name: string
  description: string
  tables?: string[]
  relevanceScore: number
  matchedTerms: string[]
}

export interface IntentVector {
  region: number      // 0-1 weight for region-related queries
  treatment: number   // 0-1 weight for treatment-related queries
  time: number        // 0-1 weight for time-based queries
  comparison: number  // 0-1 weight for comparison queries
  ranking: number     // 0-1 weight for ranking/top-N queries
  trend: number       // 0-1 weight for trend analysis
  alert: number       // 0-1 weight for alert/monitoring queries
}

export interface QueryHistoryEntry {
  id: string
  query: string
  timestamp: Date
  serverId: string
  toolName: string
  success: boolean
  resultCount?: number
}

export interface DatasetCatalogEntry {
  id: string
  name: string
  displayName: string
  description: string
  domain: 'dealflow' | 'marketIntel' | 'workforce' | 'demandIntel' | 'infra' | 'bigquery'
  tables: DatasetTable[]
  keywords: string[]
}

export interface DatasetTable {
  name: string
  description: string
  columns: DatasetColumn[]
  sampleQueries?: string[]
}

export interface DatasetColumn {
  name: string
  type: string
  description?: string
  isSearchable?: boolean
}

// ============================================================================
// Engine Configuration
// ============================================================================

export interface SmartQueryEngineProps {
  selectedMcpServer: string | null
  selectedTool: string | null
  serverManifest: McpManifestData | null
  pastQueries: QueryHistoryEntry[]
  datasetCatalog: DatasetCatalogEntry[]
}

export interface McpManifestData {
  serverId: string
  serverName: string
  description: string
  tools: McpManifestTool[]
  domain?: string
}

export interface McpManifestTool {
  name: string
  description: string
  inputSchema: Record<string, McpInputParam>
  outputSchema?: Record<string, unknown>
  typicalInputs?: string[]
  sampleQueries?: string[]
}

export interface McpInputParam {
  type: string
  required?: boolean
  description?: string
  default?: unknown
  enum?: string[]
  examples?: string[]
}

// ============================================================================
// Suggestion Engine State
// ============================================================================

export interface SuggestionEngineState {
  querySuggestions: QuerySuggestion[]
  datasetSuggestions: DatasetSuggestion[]
  isLoading: boolean
  error: string | null
  lastQuery: string
  intentVector: IntentVector | null
}

// ============================================================================
// AI Prompt Configuration
// ============================================================================

export interface AISuggestionRequest {
  toolDescription: string
  serverMetadata: string
  partialQuery: string
  pastQueries: string[]
  availableDatasets: string[]
  maxSuggestions?: number
}

export interface AISuggestionResponse {
  querySuggestions: Array<{
    text: string
    confidence: number
    reasoning?: string
  }>
  datasetHints: Array<{
    name: string
    relevance: string
  }>
  intentAnalysis?: {
    primaryIntent: string
    secondaryIntents: string[]
  }
}

// ============================================================================
// Event Types
// ============================================================================

export interface SmartQueryEvents {
  onServerChange: (serverId: string) => void
  onToolChange: (toolName: string) => void
  onQueryInput: (query: string) => void
  onSelectSuggestion: (suggestion: QuerySuggestion) => void
  onSelectDataset: (dataset: DatasetSuggestion) => void
}

// ============================================================================
// Keyword Mapping Types
// ============================================================================

export interface KeywordDatasetMap {
  keywords: string[]
  datasets: string[]
  intentType: keyof IntentVector
}

export interface QueryPatternTemplate {
  pattern: RegExp
  template: string
  intentTypes: (keyof IntentVector)[]
  suggestedDatasets: string[]
}

// ============================================================================
// Component Props
// ============================================================================

export interface SmartQueryAssistantProps {
  // Core engine props
  engineProps: SmartQueryEngineProps
  
  // Current input state
  currentQuery: string
  onQueryChange: (query: string) => void
  
  // UI configuration
  maxSuggestions?: number
  maxDatasetSuggestions?: number
  showDatasets?: boolean
  showIntentAnalysis?: boolean
  
  // Styling
  className?: string
  dropdownPosition?: 'below' | 'above'
  
  // Event handlers
  onSuggestionSelect?: (suggestion: QuerySuggestion) => void
  onDatasetSelect?: (dataset: DatasetSuggestion) => void
  onFocus?: () => void
  onBlur?: () => void
}
