import { AICoreMetrics, AIModuleState, ReasoningChain } from '@/lib/types/ai-core'

const now = Date.now()
const isoAgo = (ms: number) => new Date(now - ms).toISOString()

export const metrics: AICoreMetrics = {
  totalQueries24h: 3421000,
  totalQueriesChangePct: 8.7,
  avgLatencyMs: 124,
  avgLatencyChangePct: -2.3,
  safetyFlags: 23,
  safetyFlagsChangePct: -5.2,
  manualOverrides: 2,
  manualOverridesChangePct: 0,
  activeModules: 12,
  activeModulesChangePct: 0,
  reasoningAccuracy: 96.8,
  reasoningAccuracyChangePct: 0.3,
  queryVolumeSeries: Array.from({ length: 24 }).map((_, i) => ({
    timestamp: isoAgo((24 - i) * 60 * 60 * 1000),
    value: 120000 + Math.round(Math.random() * 5000),
  })),
  latencySeries: Array.from({ length: 24 }).map((_, i) => ({
    timestamp: isoAgo((24 - i) * 60 * 60 * 1000),
    value: 90 + Math.round(Math.random() * 60),
  })),
}

export const modules: AIModuleState[] = [
  {
    key: 'patient-assessment',
    name: 'Patient Assessment Engine',
    enabled: true,
    queries24h: 124700,
    avgLatency: 98,
    safetyFlags: 5,
  },
  {
    key: 'treatment-recommendation',
    name: 'Treatment Recommendation',
    enabled: true,
    queries24h: 89200,
    avgLatency: 145,
    safetyFlags: 3,
  },
  {
    key: 'clinical-decision',
    name: 'Clinical Decision Support',
    enabled: true,
    queries24h: 67100,
    avgLatency: 178,
    safetyFlags: 8,
  },
  {
    key: 'nlp',
    name: 'Natural Language Processing',
    enabled: true,
    queries24h: 342100,
    avgLatency: 89,
    safetyFlags: 2,
  },
]

export const chains: ReasoningChain[] = [
  {
    id: 'chain-1',
    createdAt: isoAgo(2 * 60 * 1000),
    status: 'passed',
    confidence: 94,
    query: 'Patient age 45, symptoms suggest...',
    summary: 'Analyzed patient profile, cross-referenced with…',
    fullReasoning: 'Full reasoning chain text for chain-1...',
    inputs: { age: 45, symptoms: ['fatigue', 'low energy'] },
    outputs: { recommendation: 'Schedule labs and follow-up' },
    safetyFlags: { hasSafetyFlag: false, categories: [] },
    latencyMs: 120,
    modelName: 'vertex/gemini-pro',
  },
  {
    id: 'chain-2',
    createdAt: isoAgo(5 * 60 * 1000),
    status: 'passed',
    confidence: 87,
    query: 'Treatment protocol recommendation',
    summary: 'Considered contraindications, verified...',
    fullReasoning: 'Full reasoning chain text for chain-2...',
    inputs: { condition: 'TRT', labs: ['testosterone'] },
    outputs: { protocol: 'Adjust dosage after labs' },
    safetyFlags: { hasSafetyFlag: false, categories: [] },
    latencyMs: 160,
    modelName: 'vertex/gemini-pro',
  },
  {
    id: 'chain-3',
    createdAt: isoAgo(8 * 60 * 1000),
    status: 'flagged',
    confidence: 92,
    query: 'High-risk case evaluation',
    summary: 'Flagged potential interaction, escalated...',
    fullReasoning: 'Full reasoning chain text for chain-3...',
    inputs: { meds: ['drug-a', 'drug-b'] },
    outputs: { action: 'Escalate to clinician' },
    safetyFlags: { hasSafetyFlag: true, categories: ['interaction'], notes: 'Potential drug interaction detected' },
    latencyMs: 210,
    modelName: 'vertex/gemini-pro',
  },
]
