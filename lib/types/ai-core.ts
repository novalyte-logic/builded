export type ReasoningChainStatus = 'passed' | 'flagged'

export interface ReasoningChain {
  id: string
  createdAt: string
  status: ReasoningChainStatus
  confidence: number
  query: string
  summary: string
  fullReasoning: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  safetyFlags: {
    hasSafetyFlag: boolean
    categories: string[]
    notes?: string
  }
  latencyMs: number
  modelName: string
  metadata?: Record<string, unknown>
}

export type AICoreMetrics = {
  totalQueries24h: number
  totalQueriesChangePct: number
  avgLatencyMs: number
  avgLatencyChangePct: number
  safetyFlags: number
  safetyFlagsChangePct: number
  manualOverrides: number
  manualOverridesChangePct: number
  activeModules: number
  activeModulesChangePct: number
  reasoningAccuracy: number
  reasoningAccuracyChangePct: number
  queryVolumeSeries: Array<{ timestamp: string; value: number }>
  latencySeries: Array<{ timestamp: string; value: number }>
}

export type AIModuleKey = 'patient-assessment' | 'treatment-recommendation' | 'clinical-decision' | 'nlp'

export interface AIModuleState {
  key: AIModuleKey
  name: string
  enabled: boolean
  queries24h: number
  avgLatency: number
  safetyFlags: number
}

