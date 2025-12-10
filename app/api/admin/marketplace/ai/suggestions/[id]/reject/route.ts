import { NextResponse } from 'next/server'
import { assertAdminAuth, enforceRateLimit } from '../../../../store'
import { rejectSuggestion } from '../../../store'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const updated = rejectSuggestion(params.id, request.headers.get('x-user-id') || 'superadmin')
    if (!updated) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }
    return NextResponse.json({ suggestion: updated })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error rejecting suggestion', error)
    return NextResponse.json({ error: 'Failed to reject suggestion' }, { status: 500 })
  }
}

