import { NextRequest, NextResponse } from 'next/server'
import { InferenceLogItem, InferenceLogResponse } from '@/lib/types/ai-monitoring'

export const baseLogs: InferenceLogItem[] = Array.from({ length: 25 }).map((_, idx) => {
  const now = Date.now()
  return {
    id: `log-${idx + 1}`,
    timestamp: new Date(now - idx * 60 * 1000).toISOString(),
    modelName: ['Symptom Classifier', 'Risk Engine', 'Provider Matching', 'Marketplace ROI'][idx % 4],
    latencyMs: 80 + (idx % 7) * 15,
    confidencePct: 80 + (idx % 6) * 3,
    inputPreview: 'Patient query or data input',
    outputPreview: 'Model prediction output',
    outputTag: idx % 5 === 0 ? 'High risk detected' : undefined,
    safetyFlags: idx % 6 === 0 ? ['High risk detected'] : [],
    relatedChainId: idx % 3 === 0 ? 'chain-1' : undefined,
  }
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  const limit = Number(searchParams.get('limit') || 10)

  const startIndex = cursor ? baseLogs.findIndex((l) => l.id === cursor) + 1 : 0
  const slice = baseLogs.slice(startIndex, startIndex + limit)
  const nextCursor = startIndex + limit < baseLogs.length ? baseLogs[startIndex + limit - 1].id : undefined
  const remainingCount = Math.max(baseLogs.length - (startIndex + slice.length), 0)

  const response: InferenceLogResponse = {
    items: slice,
    nextCursor,
    remainingCount,
  }

  return NextResponse.json(response)
}

