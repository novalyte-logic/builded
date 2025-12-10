import { NextRequest, NextResponse } from 'next/server'
import { AIModuleKey } from '@/lib/types/ai-monitoring'
import { monitoringModules } from '@/lib/api-data/monitoring-data'

export async function GET() {
  return NextResponse.json({ modules: monitoringModules })
}

export async function POST(req: NextRequest) {
  const { key, action } = (await req.json()) as { key: AIModuleKey; action: 'RESTART' | 'CONFIGURE' }
  const found = monitoringModules.find((m) => m.key === key)
  if (!found) return NextResponse.json({ success: false, message: 'Module not found' }, { status: 404 })
  if (action === 'RESTART') {
    console.log(`Restart module ${key}`)
  }
  return NextResponse.json({ success: true })
}

