import { NextRequest, NextResponse } from 'next/server'
import { listLeads } from './data'

/**
 * Admin Leads API Route
 *
 * GET /api/admin/leads - List leads with filters
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = searchParams.get('q') || undefined
  const status = searchParams.get('status') || undefined
  const origin = searchParams.get('origin') || undefined
  const priority = searchParams.get('priority') || undefined
  const type = searchParams.get('type') || undefined
  const page = Number(searchParams.get('page') || '1')
  const pageSize = Number(searchParams.get('pageSize') || '50')

  const data = listLeads({
    q,
    status,
    origin,
    priority,
    type,
    page,
    pageSize,
  })

  return NextResponse.json({
    items: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  })
}

