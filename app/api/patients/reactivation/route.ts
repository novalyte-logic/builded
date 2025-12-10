import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[PATIENTS][REACTIVATION] request', body)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      ok: true,
      message: 'Reactivation sequence drafted (mock). Wire to your marketing system next.',
      playbookId: 'mock-reactivation-001',
    })
  } catch (error: any) {
    console.error('[PATIENTS][REACTIVATION] error', error)
    return NextResponse.json(
      { ok: false, message: 'Failed to draft reactivation sequence' },
      { status: 500 }
    )
  }
}

