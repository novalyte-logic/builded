import { NextRequest, NextResponse } from 'next/server'

type DemandEntry = {
  jobId: string
  jobTitle: string
  clinicName: string
  region: string
  employmentType: 'TEMP' | 'PER_DIEM' | 'CONTRACT'
  urgency: 'low' | 'medium' | 'high'
  serviceLine: string
  shifts: string
  payBand: string
  fillProbability: number
  context: string
}

type SupplyEntry = {
  candidateId: string
  displayName: string
  roleType: string
  yearsExperience: number
  serviceLineMatchPct: number
  distanceMiles: number
  availability: string
  reliabilityScore: number
  fitScore: number
  riskFlags: string[]
  action: 'SEND_OFFER' | 'HOLD' | 'VERIFY'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const region = body.region || 'Texas'
    const roleType = body.roleType || 'RN'
    const employmentType = (body.employmentType as DemandEntry['employmentType']) || 'TEMP'
    const serviceLine = body.serviceLine || 'TRT'

    const demand: DemandEntry[] = [
      {
        jobId: 'job_1',
        jobTitle: `${roleType} – TRT Program Lead`,
        clinicName: 'Lone Star Men’s Health',
        region: `${region} · Dallas`,
        employmentType,
        urgency: 'high',
        serviceLine,
        shifts: 'M-F 8a–4p + 1 Sat/mo',
        payBand: '$55–$62/hr est.',
        fillProbability: 78,
        context: 'high TRT volume, 3-chair capacity',
      },
      {
        jobId: 'job_2',
        jobTitle: `${roleType} – Hormone & IV Support`,
        clinicName: 'Gulf Coast Vitality',
        region: `${region} · Houston`,
        employmentType,
        urgency: 'medium',
        serviceLine,
        shifts: '4x10s, Wed–Sat',
        payBand: '$53–$60/hr est.',
        fillProbability: 72,
        context: 'IV + TRT ramp',
      },
      {
        jobId: 'job_3',
        jobTitle: `${roleType} – TRT Intake & Labs`,
        clinicName: 'Hill Country Clinics',
        region: `${region} · Austin`,
        employmentType,
        urgency: 'medium',
        serviceLine,
        shifts: 'M-F 10a–6p',
        payBand: '$50–$58/hr est.',
        fillProbability: 69,
        context: 'moderate volume',
      },
    ]

    const supply: SupplyEntry[] = [
      {
        candidateId: 'RN-4821',
        displayName: 'RN-4821',
        roleType,
        yearsExperience: 6,
        serviceLineMatchPct: 88,
        distanceMiles: 9,
        availability: 'M-F days',
        reliabilityScore: 94,
        fitScore: 92,
        riskFlags: [],
        action: 'SEND_OFFER',
      },
      {
        candidateId: 'RN-5377',
        displayName: 'RN-5377',
        roleType,
        yearsExperience: 8,
        serviceLineMatchPct: 81,
        distanceMiles: 12,
        availability: 'Wed–Sat',
        reliabilityScore: 91,
        fitScore: 89,
        riskFlags: [],
        action: 'SEND_OFFER',
      },
      {
        candidateId: 'RN-6043',
        displayName: 'RN-6043',
        roleType,
        yearsExperience: 4,
        serviceLineMatchPct: 76,
        distanceMiles: 7,
        availability: 'M-F 10a–6p',
        reliabilityScore: 88,
        fitScore: 84,
        riskFlags: ['verify IV cert'],
        action: 'VERIFY',
      },
      {
        candidateId: 'RN-5590',
        displayName: 'RN-5590',
        roleType,
        yearsExperience: 5,
        serviceLineMatchPct: 72,
        distanceMiles: 22,
        availability: 'Thu–Sun evenings',
        reliabilityScore: 86,
        fitScore: 78,
        riskFlags: ['shift mismatch'],
        action: 'HOLD',
      },
    ]

    const insights = [
      'Red zone: Dallas TRT Lead—send offers to RN-4821 immediately; backfill with RN-6043 if IV cert verified.',
      'Houston: RN-5377 matches Wed–Sat pattern; consider $1–$2/hr bump to secure weekend coverage.',
      'Austin: line up RN-6043 post-verification; if delayed, widen radius to 25 mi and allow 4x10s to raise fill probability ~8–10 pts.',
      'Risk: Evening-heavy availability (RN-5590) misaligned with day shifts—avoid until shift window flexes.',
    ]

    return NextResponse.json({ demand, supply, insights })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate workforce package' }, { status: 500 })
  }
}

