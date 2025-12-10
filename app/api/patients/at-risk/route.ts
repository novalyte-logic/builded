import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[PATIENTS][AT-RISK] request', body)

    const response = {
      ok: true,
      suggestedSegments: [
        { label: 'GLP-1 Patients 45–54 in Texas', count: 124 },
        { label: 'Low-libido + brain-fog cluster (nationwide)', count: 89 },
      ],
      message: 'At-risk cohort recommendations generated (mock).',
    }

    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[PATIENTS][AT-RISK] error', error)
    return NextResponse.json(
      { ok: false, message: 'Failed to generate at-risk cohorts' },
      { status: 500 }
    )
  }
}

