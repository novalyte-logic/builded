/**
 * Version History API Route
 * 
 * GET /api/admin/version-history - Get version history for an entity
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVersionHistory } from '@/lib/services/audit-service'
import { EntityType } from '@/lib/types/audit'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type') as EntityType
    const entityId = searchParams.get('entity_id')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required parameters: entity_type, entity_id' },
        { status: 400 }
      )
    }

    const versions = await getVersionHistory(entityType, entityId)

    return NextResponse.json({ versions })
  } catch (error: any) {
    console.error('Version history API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch version history', details: error.message },
      { status: 500 }
    )
  }
}

