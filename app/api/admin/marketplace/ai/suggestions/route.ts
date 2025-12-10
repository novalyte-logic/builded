import { NextResponse } from 'next/server'
import { assertAdminAuth, enforceRateLimit } from '../../store'
import { getPerformance, listSuggestions, regenerateSuggestionsFromMCP } from '../store'

export async function GET(request: Request) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    return NextResponse.json({ suggestions: listSuggestions(), lastScan: getPerformance().lastScan })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error loading suggestions', error)
    return NextResponse.json({ error: 'Failed to load suggestions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const perf = getPerformance()
    const pending = regenerateSuggestionsFromMCP(perf)
    return NextResponse.json({ suggestions: pending, lastScan: perf.lastScan })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error generating suggestions', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}

