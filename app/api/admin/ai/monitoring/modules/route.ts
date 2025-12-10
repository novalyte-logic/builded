import { NextRequest, NextResponse } from 'next/server'
import { AIModuleKey, AIModuleStatus } from '@/lib/types/ai-monitoring'

export const modules: AIModuleStatus[] = [
  {
    key: 'symptom-classifier',
    name: "Men's Health Symptom Classifier",
    status: 'live',
    queries24h: 89200,
    avgLatencyMs: 98,
    accuracyPct: 94,
    driftScorePct: 3,
  },
  {
    key: 'hormone-risk-engine',
    name: 'Hormone Risk Engine',
    status: 'live',
    queries24h: 67100,
    avgLatencyMs: 145,
    accuracyPct: 91,
    driftScorePct: 5,
  },
  {
    key: 'provider-matching',
    name: 'Provider Matching AI',
    status: 'live',
    queries24h: 124700,
    avgLatencyMs: 112,
    accuracyPct: 96,
    driftScorePct: 2,
  },
  {
    key: 'marketplace-roi',
    name: 'Marketplace ROI AI',
    status: 'live',
    queries24h: 45600,
    avgLatencyMs: 89,
    accuracyPct: 88,
    driftScorePct: 8,
  },
  {
    key: 'vendor-demand',
    name: 'Vendor Demand Prediction',
    status: 'live',
    queries24h: 34200,
    avgLatencyMs: 156,
    accuracyPct: 87,
    driftScorePct: 12,
  },
  {
    key: 'abuse-anomaly',
    name: 'Abuse / Anomaly Detection',
    status: 'live',
    queries24h: 289000,
    avgLatencyMs: 67,
    accuracyPct: 93,
    driftScorePct: 4,
  },
  {
    key: 'forecasting-neural',
    name: 'Forecasting Neural Models',
    status: 'degraded',
    queries24h: 12400,
    avgLatencyMs: 234,
    accuracyPct: 82,
    driftScorePct: 18,
  },
  {
    key: 'model-drift-health',
    name: 'Model Drift & Health Checks',
    status: 'live',
    queries24h: 0,
    avgLatencyMs: 0,
    accuracyPct: 100,
    driftScorePct: 2,
  },
]

export async function GET() {
  return NextResponse.json({ modules })
}

export async function POST(req: NextRequest) {
  const { key, action } = (await req.json()) as { key: AIModuleKey; action: 'RESTART' | 'CONFIGURE' }
  const found = modules.find((m) => m.key === key)
  if (!found) return NextResponse.json({ success: false, message: 'Module not found' }, { status: 404 })
  if (action === 'RESTART') {
    console.log(`Restart module ${key}`)
  }
  return NextResponse.json({ success: true })
}

