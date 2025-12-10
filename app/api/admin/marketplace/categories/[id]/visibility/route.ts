import { NextResponse } from 'next/server'
import {
  assertAdminAuth,
  enforceRateLimit,
  updateCategoryVisibility,
  CategoryRecord,
} from '../../../store'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    assertAdminAuth(request)
    enforceRateLimit(request)
    const body = await request.json()
    const isVisible = Boolean(body?.isVisible)
    const updated = updateCategoryVisibility(
      params.id,
      isVisible,
      request.headers.get('x-user-id') || 'superadmin'
    )
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ category: updated })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Error updating category visibility', error)
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 })
  }
}

export type UpdateCategoryVisibilityResponse = {
  category: CategoryRecord
}

