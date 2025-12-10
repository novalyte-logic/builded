import { NextRequest, NextResponse } from 'next/server'
import { modules } from '@/lib/api-data/ai-data'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { moduleKey, enabled } = body as { moduleKey: string; enabled: boolean }
  const idx = modules.findIndex((m) => m.key === moduleKey)
  if (idx >= 0) {
    modules[idx].enabled = enabled
    return NextResponse.json({ success: true, module: modules[idx] })
  }
  return NextResponse.json({ success: false, message: 'Module not found' }, { status: 404 })
}

