import { NextResponse } from 'next/server'
import { InferenceLogDetail } from '@/lib/types/ai-monitoring'
import { baseLogs } from '../route'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = baseLogs.find((l) => l.id === params.id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const detail: InferenceLogDetail = {
    ...item,
    inputPayload: { patient: { age: 45, symptoms: ['fatigue', 'low libido'] } },
    outputPayload: { prediction: item.outputPreview, score: item.confidencePct / 100 },
    safety: { fallbacksUsed: false, retries: 0, flags: item.safetyFlags || [] },
  }
  return NextResponse.json(detail)
}

