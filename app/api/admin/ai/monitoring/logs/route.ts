import { NextRequest, NextResponse } from 'next/server'
import { InferenceLogResponse } from '@/lib/types/ai-monitoring'
import { baseLogs } from '@/lib/api-data/monitoring-data'

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

