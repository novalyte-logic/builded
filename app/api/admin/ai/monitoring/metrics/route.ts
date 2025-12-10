import { NextResponse } from 'next/server'
import { AIMonitoringMetrics } from '@/lib/types/ai-monitoring'

const now = Date.now()
const isoAgoHours = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString()

function generateSeries(base: number, variance: number) {
  return Array.from({ length: 24 }).map((_, i) => ({
    timestamp: isoAgoHours(24 - i),
    value: Math.max(0, base + Math.round((Math.random() - 0.5) * variance)),
  }))
}

const metrics: AIMonitoringMetrics = {
  totalInferences24h: 3421000,
  totalInferencesChangePct: 8.7,
  avgLatencyMs: 124,
  avgLatencyChangePct: -2.3,
  avgConfidencePct: 92.1,
  avgConfidenceChangePct: 1.2,
  safetyFlags: 23,
  safetyFlagsChangePct: -5.2,
  driftWarnings: 2,
  driftWarningsChangePct: 0,
  activeModels: 8,
  activeModelsChangePct: 0,
  cacheHitRatePct: 87.2,
  cacheHitRateChangePct: 2.1,
  dataFreshnessPct: 96.4,
  dataFreshnessChangePct: 0.3,
  latencySeries: generateSeries(120, 40),
  volatilitySeries: generateSeries(5, 3).map((p) => ({ ...p, value: Math.max(0, p.value / 100) })),
  inferenceVolumeSeries: generateSeries(15000, 4000),
  safetyExclusionSeries: generateSeries(6, 4),
  currentDriftPct: 0.12,
  driftThresholdPct: 0.15,
  driftStatus: 'WITHIN_RANGE',
  ageBias: -0.003,
  genderBias: 0.001,
  geographicBias: 0.008,
  currentAccuracyPct: 92.4,
  baselineAccuracyPct: 93.1,
  datasetFreshness: {
    trainingDataPct: 96.2,
    validationDataPct: 94.8,
    syntheticValidationPct: 98.1,
  },
  dataFreshnessMeters: {
    patient: { lastUpdated: isoAgoHours(2), freshnessPct: 98 },
    clinic: { lastUpdated: isoAgoHours(4), freshnessPct: 95 },
    marketplace: { lastUpdated: isoAgoHours(1), freshnessPct: 97 },
    aiTraining: { lastUpdated: isoAgoHours(6), freshnessPct: 94 },
  },
  lastUpdated: new Date(now).toISOString(),
}

export async function GET() {
  return NextResponse.json(metrics)
}

