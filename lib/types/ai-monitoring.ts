export type AIMonitoringStatus = 'live' | 'degraded' | 'offline'

export interface AIMonitoringMetrics {
  totalInferences24h: number
  totalInferencesChangePct: number
  avgLatencyMs: number
  avgLatencyChangePct: number
  avgConfidencePct: number
  avgConfidenceChangePct: number
  safetyFlags: number
  safetyFlagsChangePct: number
  driftWarnings: number
  driftWarningsChangePct: number
  activeModels: number
  activeModelsChangePct: number
  cacheHitRatePct: number
  cacheHitRateChangePct: number
  dataFreshnessPct: number
  dataFreshnessChangePct: number
  latencySeries: Array<{ timestamp: string; value: number }>
  volatilitySeries: Array<{ timestamp: string; value: number }>
  inferenceVolumeSeries: Array<{ timestamp: string; value: number }>
  safetyExclusionSeries: Array<{ timestamp: string; value: number }>
  currentDriftPct: number
  driftThresholdPct: number
  driftStatus: 'WITHIN_RANGE' | 'AT_THRESHOLD' | 'EXCEEDED'
  ageBias: number
  genderBias: number
  geographicBias: number
  currentAccuracyPct: number
  baselineAccuracyPct: number
  datasetFreshness: {
    trainingDataPct: number
    validationDataPct: number
    syntheticValidationPct: number
  }
  dataFreshnessMeters: {
    patient: { lastUpdated: string; freshnessPct: number }
    clinic: { lastUpdated: string; freshnessPct: number }
    marketplace: { lastUpdated: string; freshnessPct: number }
    aiTraining: { lastUpdated: string; freshnessPct: number }
  }
  lastUpdated: string
}

export type AIModuleKey =
  | 'symptom-classifier'
  | 'hormone-risk-engine'
  | 'provider-matching'
  | 'marketplace-roi'
  | 'vendor-demand'
  | 'abuse-anomaly'
  | 'forecasting-neural'
  | 'model-drift-health'

export interface AIModuleStatus {
  key: AIModuleKey
  name: string
  status: AIMonitoringStatus
  queries24h: number
  avgLatencyMs: number
  accuracyPct: number
  driftScorePct: number
}

export interface ExplainabilityPayload {
  reasoningTree: {
    patientAssessmentDecisionPct: number
    symptomAnalysisPct: number
    fatigueScorePct: number
    libidoScorePct: number
    riskEvaluationPct: number
  }
  topInfluencingFactors: Array<{
    rank: number
    label: string
    value: string
    contributionPct: number
    sign: 'positive' | 'negative'
  }>
  decisionBreakdown: {
    finalDecision: string
    safetyGatesActivated: string
  }
  whatIfProjections: Array<{
    scenarioLabel: string
    riskScore: number
    deltaPct: number
  }>
  confidenceDistribution: Array<{
    rangeLabel: string
    count: number
  }>
}

export interface InferenceLogItem {
  id: string
  timestamp: string
  modelName: string
  latencyMs: number
  confidencePct: number
  inputPreview: string
  outputPreview: string
  outputTag?: string
  safetyFlags?: string[]
  relatedChainId?: string
}

export interface InferenceLogResponse {
  items: InferenceLogItem[]
  nextCursor?: string
  remainingCount?: number
}

export interface InferenceLogDetail extends InferenceLogItem {
  inputPayload: Record<string, unknown>
  outputPayload: Record<string, unknown>
  safety: {
    fallbacksUsed: boolean
    retries: number
    flags: string[]
  }
}

export type MonitoringControlAction =
  | 'CLEAR_CACHES'
  | 'RESTART_ALL_MODULES'
  | 'TOGGLE_FALLBACKS'
  | 'TRIGGER_RECALIBRATION'
  | 'EXPORT_REASONING'
  | 'REFRESH_DATA'

