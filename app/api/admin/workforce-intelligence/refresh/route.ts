import { NextResponse } from 'next/server'

export async function POST() {
  // In real impl: trigger recompute pipeline (BigQuery + Vertex AI). Here we just return a timestamp.
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() })
}

