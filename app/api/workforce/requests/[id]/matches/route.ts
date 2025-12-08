/**
 * Generate AI Matches for a Workforce Request
 * 
 * POST /api/workforce/requests/[id]/matches - Generate top 5 matches using AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateWorkforceMatches } from '@/lib/services/workforce-matching'
import { trackWorkforceEvent } from '@/lib/services/workforce-events'
import type { WorkforceRequest, PractitionerProfile } from '@/lib/types/workforce'

// Mock data (replace with database queries)
const mockPractitioners: PractitionerProfile[] = []

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Fetch request from database
    // const request = await getRequestById(params.id)

    // Mock request
    const mockRequest: WorkforceRequest = {
      id: params.id,
      clinicId: 'clinic-1',
      clinicName: 'Test Clinic',
      clinicLocation: {
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
      },
      role: 'NP',
      skills: ['TRT'],
      coverageType: 'Single_Shift',
      startDate: new Date(),
      endDate: new Date(),
      hoursNeeded: 8,
      status: 'Matching',
      priority: 'Standard',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // TODO: Fetch practitioners from database
    // const practitioners = await getAvailablePractitioners(mockRequest)

    // Generate matches
    const matches = await generateWorkforceMatches({
      request: mockRequest,
      practitioners: mockPractitioners,
    })

    // Track event
    await trackWorkforceEvent({
      event_type: 'WORKFORCE_MATCH_SENT',
      entity_id: mockRequest.id,
      entity_type: 'match',
      metadata: {
        matchCount: matches.length,
        requestId: mockRequest.id,
      },
    })

    return NextResponse.json({
      matches,
      requestId: mockRequest.id,
    })
  } catch (error: any) {
    console.error('Workforce matching API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

