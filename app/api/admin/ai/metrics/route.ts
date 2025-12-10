import { NextResponse } from 'next/server'
import { metrics, modules, chains } from '@/lib/api-data/ai-data'

export async function GET() {
  return NextResponse.json({
    metrics,
    modules,
    chains,
    lastUpdated: new Date().toISOString(),
  })
}

