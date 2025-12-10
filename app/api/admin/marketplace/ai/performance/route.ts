import { NextResponse } from 'next/server'
import { assertAdminAuth, enforceRateLimit } from '../../store'
import { getPerformance } from '../store'

export async function GET(request: Request) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const audience = searchParams.get('audience') || undefined
    const data = getPerformance({ category, audience })
    return NextResponse.json({ ...data })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error loading performance', error)
    return NextResponse.json({ error: 'Failed to load performance' }, { status: 500 })
  }
}

