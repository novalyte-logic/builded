import { NextResponse } from 'next/server'
import {
  assertAdminAuth,
  enforceRateLimit,
  updateCategoryPriority,
  CategoryRecord,
} from '../../../store'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const body = await request.json()
    const priority = Number(body?.priority)
    if (!Number.isFinite(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }
    const updated = updateCategoryPriority(params.id, priority, request.headers.get('x-user-id') || 'superadmin')
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ category: updated })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error updating category priority', error)
    return NextResponse.json({ error: 'Failed to update priority' }, { status: 500 })
  }
}

export type UpdateCategoryPriorityResponse = {
  category: CategoryRecord
}

