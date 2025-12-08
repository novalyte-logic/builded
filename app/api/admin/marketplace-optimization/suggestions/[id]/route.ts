/**
 * Marketplace Optimization Suggestion Detail API Route
 * 
 * PATCH /api/admin/marketplace-optimization/suggestions/[id] - Apply or dismiss suggestion
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  applyOptimizationSuggestion,
  dismissOptimizationSuggestion,
} from '@/lib/services/marketplace-optimization-engine'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = params.id
    const body = await request.json()
    const action = body.action // 'apply' | 'dismiss'

    if (action === 'apply') {
      await applyOptimizationSuggestion(suggestionId, 'superadmin') // TODO: Get from auth
      return NextResponse.json({
        message: 'Suggestion applied successfully',
        suggestion_id: suggestionId,
      })
    } else if (action === 'dismiss') {
      await dismissOptimizationSuggestion(suggestionId)
      return NextResponse.json({
        message: 'Suggestion dismissed',
        suggestion_id: suggestionId,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "apply" or "dismiss"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Suggestion action error:', error)
    return NextResponse.json(
      { error: 'Failed to process suggestion', details: error.message },
      { status: 500 }
    )
  }
}

