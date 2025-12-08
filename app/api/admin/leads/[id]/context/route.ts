/**
 * Lead Full Context API Route
 * 
 * GET /api/admin/leads/:id/context - Get full context for a lead
 * 
 * Returns: lead, assessments, threads, AI summary
 */

import { NextRequest, NextResponse } from 'next/server'
import { getLeadFullContext } from '@/lib/services/lead-context'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id

    const context = await getLeadFullContext(leadId)

    return NextResponse.json(context)
  } catch (error: any) {
    console.error('Lead context API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead context', details: error.message },
      { status: 500 }
    )
  }
}

