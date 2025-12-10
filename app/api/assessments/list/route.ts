import { NextRequest, NextResponse } from 'next/server'
import {
  AssessmentDetail,
  AssessmentStatus,
  FlowType,
  LtvBand,
  RiskLevel,
  MOCK_ASSESSMENTS,
} from '@/lib/assessments/mockData'

export type AssessmentListItem = {
  id: string
  createdAt: string
  flowType: FlowType
  status: AssessmentStatus
  riskLevel: RiskLevel
  ltvBand: LtvBand
  channel: string
}

export type AssessmentListResponse = {
  items: AssessmentListItem[]
  total: number
  filters: {
    status?: string
    flowType?: string
    riskLevel?: string
    ltvBand?: string
    startDate?: string
    endDate?: string
  }
  meta: {
    lastUpdated: string
  }
  error?: string
}

function normalizeRisk(value?: string | null): RiskLevel | undefined {
  if (!value) return undefined
  const v = value.toUpperCase()
  if (v === 'LOW' || v === 'MODERATE' || v === 'HIGH') return v as RiskLevel
  return undefined
}

function normalizeBand(value?: string | null): LtvBand | undefined {
  if (!value) return undefined
  const v = value.toUpperCase()
  if (v === 'LOW' || v === 'MEDIUM' || v === 'HIGH') return v as LtvBand
  return undefined
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const status = params.get('status') || ''
    const flowType = params.get('flowType') || ''
    const riskLevel = params.get('riskLevel') || ''
    const ltvBand = params.get('ltvBand') || ''
    const startDate = params.get('startDate') || ''
    const endDate = params.get('endDate') || ''
    const limit = parseInt(params.get('limit') || '50', 10)

    let filtered: AssessmentDetail[] = [...MOCK_ASSESSMENTS]

    if (status) {
      filtered = filtered.filter((a) => a.status === status)
    }
    if (flowType) {
      filtered = filtered.filter((a) => a.flowType === flowType)
    }
    if (riskLevel) {
      const norm = normalizeRisk(riskLevel)
      if (norm) filtered = filtered.filter((a) => a.riskLevel === norm)
    }
    if (ltvBand) {
      const norm = normalizeBand(ltvBand)
      if (norm) filtered = filtered.filter((a) => a.ltvBand === norm)
    }
    if (startDate) {
      const start = new Date(startDate).getTime()
      filtered = filtered.filter((a) => new Date(a.createdAt).getTime() >= start)
    }
    if (endDate) {
      const endTs = new Date(endDate).getTime()
      filtered = filtered.filter((a) => new Date(a.createdAt).getTime() <= endTs)
    }

    const items: AssessmentListItem[] = filtered.slice(0, Math.max(1, limit)).map((a) => ({
      id: a.id,
      createdAt: a.createdAt,
      flowType: a.flowType,
      status: a.status,
      riskLevel: a.riskLevel,
      ltvBand: a.ltvBand,
      channel: a.channel,
    }))

    const response: AssessmentListResponse = {
      items,
      total: filtered.length,
      filters: { status, flowType, riskLevel, ltvBand, startDate, endDate },
      meta: { lastUpdated: new Date().toISOString() },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[ASSESSMENTS][LIST] error', error)
    const fallback: AssessmentListResponse = {
      items: [],
      total: 0,
      filters: {},
      meta: { lastUpdated: new Date().toISOString() },
      error: 'Internal error',
    }
    return NextResponse.json(fallback, { status: 500 })
  }
}

