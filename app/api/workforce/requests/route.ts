/**
 * Workforce Exchange Request API
 * 
 * POST /api/workforce/requests - Create new staffing request
 * GET /api/workforce/requests - List requests (filtered by clinic)
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackWorkforceEvent } from '@/lib/services/workforce-events'
import type { WorkforceRequest } from '@/lib/types/workforce'

// Mock data store (replace with database)
const requests: WorkforceRequest[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newRequest: WorkforceRequest = {
      id: `req-${Date.now()}`,
      clinicId: body.clinicId,
      clinicName: body.clinicName || 'Unknown Clinic',
      clinicLocation: body.clinicLocation,
      role: body.role,
      skills: body.skills,
      coverageType: body.coverageType,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      hoursNeeded: body.hoursNeeded,
      rateRange: body.rateRange,
      notes: body.notes,
      status: 'Matching',
      priority: body.priority || 'Standard',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    requests.push(newRequest)

    // Track event
    await trackWorkforceEvent({
      event_type: 'WORKFORCE_REQUEST_CREATED',
      entity_id: newRequest.id,
      entity_type: 'request',
      metadata: {
        clinicId: newRequest.clinicId,
        role: newRequest.role,
        priority: newRequest.priority,
      },
    })

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (error: any) {
    console.error('Workforce request API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clinicId = searchParams.get('clinicId')
    const status = searchParams.get('status')

    let filtered = [...requests]

    if (clinicId) {
      filtered = filtered.filter((r) => r.clinicId === clinicId)
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }

    return NextResponse.json({
      requests: filtered,
      total: filtered.length,
    })
  } catch (error: any) {
    console.error('Workforce requests API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

