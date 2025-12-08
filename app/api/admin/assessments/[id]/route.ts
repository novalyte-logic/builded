/**
 * Admin Assessment Detail API Route
 * 
 * GET /api/admin/assessments/:id - Get single assessment with linked lead
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock data (replace with DB)
const assessments: any[] = []
const leads: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id

    // TODO: Replace with actual database query
    const assessment = assessments.find((a) => a.id === assessmentId)

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Find linked lead
    const lead = leads.find((l) => l.assessment_id === assessmentId)

    return NextResponse.json({
      assessment: {
        ...assessment,
        lead: lead || null,
      },
    })
  } catch (error: any) {
    console.error('Assessment detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment', details: error.message },
      { status: 500 }
    )
  }
}

