import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ASSESSMENTS } from '@/lib/assessments/mockData'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessment = MOCK_ASSESSMENTS.find((a) => a.id === params.id)
    if (!assessment) {
      return NextResponse.json({ assessment: undefined, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ assessment })
  } catch (error: any) {
    console.error('[ASSESSMENTS][DETAIL] error', error)
    return NextResponse.json({ assessment: undefined, error: 'Internal error' }, { status: 500 })
  }
}

