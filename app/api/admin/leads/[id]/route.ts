import { NextRequest, NextResponse } from 'next/server'
import { getLeadById } from '../data'

/**
 * Admin Lead Detail API Route
 *
 * GET /api/admin/leads/:id - Get single lead
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lead = getLeadById(params.id)
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}

