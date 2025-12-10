/**
 * Smart Query Assistant - Main Exports
 * 
 * Universal, dynamic "Smart Query Suggestion Layer" for the Novalyte™ AI Admin Console.
 * Works across ALL MCP servers with automatic capability discovery.
 */

// Types
export * from './types'

// Suggestion Engine
export {
  calculateIntentVector,
  getRelevantDatasets,
  getMatchingPatterns,
  parseManifestForSuggestions,
  generateSuggestions,
} from './suggestion-engine'

// AI Prompting Layer
export {
  generateAIMetaPrompt,
  generateSystemPrompt,
  buildAISuggestionRequest,
  parseAISuggestionResponse,
  getToolSpecificPrompt,
  enhancePromptWithIntent,
  fetchAISuggestions,
  generateBatchPrompt,
} from './ai-prompting'

// Hooks
export {
  useQueryHistory,
  useDatasetCatalog,
  useMcpManifest,
  useSmartSuggestions,
  useSmartQueryAssistant,
} from './hooks'

// Context
export {
  SmartQueryProvider,
  useSmartQueryContext,
  useMcpAutoDiscovery,
} from './context'
