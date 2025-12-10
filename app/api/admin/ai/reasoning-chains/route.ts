import { NextRequest, NextResponse } from 'next/server'
import { ReasoningChain } from '@/lib/types/ai-core'
import { chains } from '../metrics/route'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 20)
  const status = searchParams.get('status')

  let filtered = chains as ReasoningChain[]
  if (status === 'flagged') filtered = filtered.filter((c) => c.status === 'flagged')
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return NextResponse.json({
    items,
    total: filtered.length,
    page,
    pageSize,
  })
}

