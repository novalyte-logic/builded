/**
 * Admin Lead Detail API Route
 * 
 * GET /api/admin/leads/:id - Get single lead
 * PATCH /api/admin/leads/:id - Update lead (status, priority, notes)
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock data (replace with DB)
const leads: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id
    const lead = leads.find((l) => l.id === leadId)

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ lead })
  } catch (error: any) {
    console.error('Lead detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id
    const body = await request.json()

    // TODO: Replace with actual database update
    const leadIndex = leads.findIndex((l) => l.id === leadId)

    if (leadIndex === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const updatedLead = {
      ...leads[leadIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    leads[leadIndex] = updatedLead

    return NextResponse.json({ lead: updatedLead })
  } catch (error: any) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead', details: error.message },
      { status: 500 }
    )
  }
}

