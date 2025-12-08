/**
 * Admin Leads API Route
 * 
 * GET /api/admin/leads - List leads with filters
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock data (replace with DB)
const leads: any[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const origin = searchParams.get('origin')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const priority = searchParams.get('priority')

    let filteredLeads = [...leads]

    // Apply filters
    if (status) {
      filteredLeads = filteredLeads.filter((l) => l.status === status)
    }

    if (origin) {
      filteredLeads = filteredLeads.filter((l) => l.origin === origin)
    }

    if (priority) {
      filteredLeads = filteredLeads.filter((l) => l.priority === priority)
    }

    if (startDate && endDate) {
      filteredLeads = filteredLeads.filter((l) => {
        const createdAt = new Date(l.created_at)
        return createdAt >= new Date(startDate) && createdAt <= new Date(endDate)
      })
    }

    // Sort by created_at desc
    filteredLeads.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({
      leads: filteredLeads,
      total: filteredLeads.length,
    })
  } catch (error: any) {
    console.error('Leads API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads', details: error.message },
      { status: 500 }
    )
  }
}

