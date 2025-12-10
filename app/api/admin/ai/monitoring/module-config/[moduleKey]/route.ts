import { NextRequest, NextResponse } from 'next/server'
import { AIModuleKey } from '@/lib/types/ai-monitoring'

const configs: Record<
  AIModuleKey,
  { latencyThresholdMs: number; driftThresholdPct: number; fallbacksEnabled: boolean }
> = {
  'symptom-classifier': { latencyThresholdMs: 180, driftThresholdPct: 0.15, fallbacksEnabled: true },
  'hormone-risk-engine': { latencyThresholdMs: 200, driftThresholdPct: 0.2, fallbacksEnabled: true },
  'provider-matching': { latencyThresholdMs: 150, driftThresholdPct: 0.1, fallbacksEnabled: true },
  'marketplace-roi': { latencyThresholdMs: 160, driftThresholdPct: 0.12, fallbacksEnabled: true },
  'vendor-demand': { latencyThresholdMs: 220, driftThresholdPct: 0.18, fallbacksEnabled: true },
  'abuse-anomaly': { latencyThresholdMs: 140, driftThresholdPct: 0.08, fallbacksEnabled: true },
  'forecasting-neural': { latencyThresholdMs: 260, driftThresholdPct: 0.22, fallbacksEnabled: false },
  'model-drift-health': { latencyThresholdMs: 120, driftThresholdPct: 0.05, fallbacksEnabled: true },
}

export async function GET(_req: NextRequest, { params }: { params: { moduleKey: AIModuleKey } }) {
  const config = configs[params.moduleKey]
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ moduleKey: params.moduleKey, ...config })
}

export async function PUT(req: NextRequest, { params }: { params: { moduleKey: AIModuleKey } }) {
  const body = (await req.json()) as Partial<(typeof configs)[AIModuleKey]>
  if (!configs[params.moduleKey]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  configs[params.moduleKey] = { ...configs[params.moduleKey], ...body }
  return NextResponse.json({ success: true, config: configs[params.moduleKey] })
}

