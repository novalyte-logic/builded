import { NextResponse } from 'next/server'
import { assertAdminAuth, enforceRateLimit } from '../../../../store'
import { approveSuggestion, getEffects } from '../../../store'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const updated = approveSuggestion(params.id, request.headers.get('x-user-id') || 'superadmin')
    if (!updated) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }
    return NextResponse.json({ suggestion: updated, effects: getEffects() })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error approving suggestion', error)
    return NextResponse.json({ error: 'Failed to approve suggestion' }, { status: 500 })
  }
}

