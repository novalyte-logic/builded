import { NextRequest, NextResponse } from 'next/server'
import { ClinicMarketIntelRequest, ClinicMarketIntelResponse } from '@/lib/types/clinicDirectory'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ClinicMarketIntelRequest
    const query = body.query?.trim() || ''
    if (!query) {
      return NextResponse.json({ error: 'Missing query', insights: [] }, { status: 400 })
    }

    const qLower = query.toLowerCase()
    const includesTRT = qLower.includes('trt') || qLower.includes('testosterone')
    const includesWeight = qLower.includes('weight') || qLower.includes('glp')
    const includesTexas = qLower.includes('texas') || qLower.includes('tx')
    const includesIV = qLower.includes('iv')

    const insights = [
      {
        id: 'intel-1',
        title: includesTRT ? 'TRT demand spike in Texas' : 'High-intent metro surge',
        summary: includesTexas
          ? 'Dallas and Austin clinics show rising TRT searches with available capacity.'
          : 'Top metros show rising searches; route more high-LTV leads to verified clinics.',
        regions: includesTexas ? ['Dallas, TX', 'Austin, TX'] : ['Miami, FL', 'San Diego, CA'],
        treatments: includesTRT ? ['TRT'] : includesWeight ? ['GLP-1'] : ['IV Therapy'],
        confidence: 0.72,
      },
      {
        id: 'intel-2',
        title: includesWeight ? 'Weight loss conversions holding' : 'Stable recovery demand',
        summary: includesWeight
          ? 'GLP-1 interest stable; focus on clinics with consult capacity and follow-up adherence.'
          : 'Recovery protocols performing best where no-show rates are below 12%.',
        regions: ['Houston, TX', 'Phoenix, AZ'],
        treatments: includesWeight ? ['GLP-1'] : ['Recovery', 'Peptides'],
        confidence: 0.63,
      },
      {
        id: 'intel-3',
        title: includesIV ? 'IV Therapy coastal lift' : 'Featured clinics to prioritize',
        summary: includesIV
          ? 'IV therapy ads gaining traction in coastal metros; test weekend promos.'
          : 'Featured, verified clinics convert 18-24% better; keep them shown and funded.',
        regions: includesIV ? ['San Diego, CA', 'Miami, FL'] : ['NYC, NY', 'Seattle, WA'],
        treatments: includesIV ? ['IV Therapy'] : ['TRT', 'GLP-1'],
        confidence: 0.58,
      },
    ]

    const response: ClinicMarketIntelResponse = {
      query,
      generatedAt: new Date().toISOString(),
      insights,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[CLINICS_DIRECTORY][MARKET_INTEL] error', error)
    return NextResponse.json(
      { query: '', generatedAt: new Date().toISOString(), insights: [], error: 'Failed to generate intel.' },
      { status: 500 }
    )
  }
}

