import { NextResponse } from 'next/server'
import { assertAdminAuth, enforceRateLimit } from '../../store'
import { getEffects } from '../store'

export async function GET(request: Request) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    return NextResponse.json(getEffects())
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error loading effects', error)
    return NextResponse.json({ error: 'Failed to load effects' }, { status: 500 })
  }
}

