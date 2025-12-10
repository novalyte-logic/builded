import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[PATIENTS][BLOG-TOPICS] request', body)

    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      ok: true,
      topics: [
        'Why Men 35–44 Drop Out of Hormone Programs — And How to Keep Them',
        'The Hidden Link Between Brain Fog and Low Testosterone',
        'GLP-1 Retention: How to Keep Patients Past Week 8',
      ],
      message: 'Suggested blog topics (mock). Wire to your content engine later.',
    })
  } catch (error: any) {
    console.error('[PATIENTS][BLOG-TOPICS] error', error)
    return NextResponse.json(
      { ok: false, message: 'Failed to suggest topics' },
      { status: 500 }
    )
  }
}

