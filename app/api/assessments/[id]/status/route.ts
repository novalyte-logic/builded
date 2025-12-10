import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body
    console.log('[ASSESSMENTS][STATUS]', { id: params.id, status })

    return NextResponse.json({ ok: true, status })
  } catch (error: any) {
    console.error('[ASSESSMENTS][STATUS] error', error)
    return NextResponse.json({ ok: false, error: 'Failed to update status' }, { status: 500 })
  }
}

