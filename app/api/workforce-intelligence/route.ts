import { NextRequest, NextResponse } from 'next/server'

type Role = 'RN' | 'NP' | 'PA' | 'LPN' | 'MA' | 'OTHER'
type EmploymentType = 'TEMP' | 'PER_DIEM' | 'CONTRACT' | 'FULL_TIME'
type ServiceLine = 'TRT' | 'GLP-1' | 'IV_THERAPY' | 'GENERAL'

export type WorkforceJob = {
  id: string
  clinicId: string
  state: string
  stateCode: string
  city: string
  role: Role
  employmentType: EmploymentType
  serviceLine: ServiceLine
  status: 'OPEN' | 'FILLED' | 'CLOSED'
  createdAt: string
  updatedAt: string
}

export type WorkforceCandidate = {
  id: string
  primaryState: string
  willingStates: string[]
  role: Role
  serviceLines: ServiceLine[]
  availabilityType: EmploymentType
  status: 'ACTIVE' | 'PLACED' | 'INACTIVE'
  lastActiveAt: string
}

export type WorkforceIntelligenceRequest = {
  role?: Role | 'ALL'
  employmentType?: EmploymentType | 'ALL'
  serviceLine?: ServiceLine | 'ALL'
  dateRange?: {
    from: string
    to: string
  }
}

export type RegionStats = {
  region: string
  stateCode: string
  openJobs: number
  activeCandidates: number
  jobToCandidateRatio: number
  totalJobDemandScore: number
  topServiceLines: {
    serviceLine: ServiceLine
    jobCount: number
  }[]
}

export type WorkforceIntelligenceResponse = {
  lastUpdated: string
  starvingRegions: RegionStats[]
  talentRichRegions: RegionStats[]
  bestLaunchRegions: RegionStats[]
}

const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString()

const jobs: WorkforceJob[] = [
  { id: 'j1', clinicId: 'c1', state: 'Texas', stateCode: 'TX', city: 'Dallas', role: 'RN', employmentType: 'TEMP', serviceLine: 'TRT', status: 'OPEN', createdAt: daysAgo(5), updatedAt: daysAgo(2) },
  { id: 'j2', clinicId: 'c2', state: 'Texas', stateCode: 'TX', city: 'Houston', role: 'RN', employmentType: 'TEMP', serviceLine: 'IV_THERAPY', status: 'OPEN', createdAt: daysAgo(8), updatedAt: daysAgo(3) },
  { id: 'j3', clinicId: 'c3', state: 'Texas', stateCode: 'TX', city: 'Austin', role: 'RN', employmentType: 'CONTRACT', serviceLine: 'TRT', status: 'OPEN', createdAt: daysAgo(12), updatedAt: daysAgo(1) },
  { id: 'j4', clinicId: 'c4', state: 'Florida', stateCode: 'FL', city: 'Miami', role: 'RN', employmentType: 'TEMP', serviceLine: 'GLP-1', status: 'OPEN', createdAt: daysAgo(6), updatedAt: daysAgo(2) },
  { id: 'j5', clinicId: 'c5', state: 'Florida', stateCode: 'FL', city: 'Orlando', role: 'LPN', employmentType: 'PER_DIEM', serviceLine: 'GENERAL', status: 'OPEN', createdAt: daysAgo(9), updatedAt: daysAgo(2) },
  { id: 'j6', clinicId: 'c6', state: 'California', stateCode: 'CA', city: 'San Diego', role: 'NP', employmentType: 'CONTRACT', serviceLine: 'TRT', status: 'OPEN', createdAt: daysAgo(14), updatedAt: daysAgo(4) },
  { id: 'j7', clinicId: 'c7', state: 'California', stateCode: 'CA', city: 'Los Angeles', role: 'RN', employmentType: 'FULL_TIME', serviceLine: 'GENERAL', status: 'OPEN', createdAt: daysAgo(10), updatedAt: daysAgo(2) },
  { id: 'j8', clinicId: 'c8', state: 'Arizona', stateCode: 'AZ', city: 'Phoenix', role: 'RN', employmentType: 'TEMP', serviceLine: 'IV_THERAPY', status: 'OPEN', createdAt: daysAgo(7), updatedAt: daysAgo(3) },
  { id: 'j9', clinicId: 'c9', state: 'Arizona', stateCode: 'AZ', city: 'Scottsdale', role: 'PA', employmentType: 'TEMP', serviceLine: 'TRT', status: 'OPEN', createdAt: daysAgo(11), updatedAt: daysAgo(5) },
  { id: 'j10', clinicId: 'c10', state: 'New York', stateCode: 'NY', city: 'New York', role: 'RN', employmentType: 'TEMP', serviceLine: 'GLP-1', status: 'OPEN', createdAt: daysAgo(4), updatedAt: daysAgo(1) },
  { id: 'j11', clinicId: 'c11', state: 'New York', stateCode: 'NY', city: 'Buffalo', role: 'MA', employmentType: 'TEMP', serviceLine: 'GENERAL', status: 'OPEN', createdAt: daysAgo(15), updatedAt: daysAgo(6) },
  { id: 'j12', clinicId: 'c12', state: 'Colorado', stateCode: 'CO', city: 'Denver', role: 'RN', employmentType: 'CONTRACT', serviceLine: 'TRT', status: 'OPEN', createdAt: daysAgo(3), updatedAt: daysAgo(1) },
]

const candidates: WorkforceCandidate[] = [
  { id: 'cand1', primaryState: 'Texas', willingStates: ['TX', 'OK'], role: 'RN', serviceLines: ['TRT', 'IV_THERAPY'], availabilityType: 'TEMP', status: 'ACTIVE', lastActiveAt: daysAgo(2) },
  { id: 'cand2', primaryState: 'Texas', willingStates: ['TX'], role: 'RN', serviceLines: ['TRT', 'GENERAL'], availabilityType: 'CONTRACT', status: 'ACTIVE', lastActiveAt: daysAgo(5) },
  { id: 'cand3', primaryState: 'Florida', willingStates: ['FL', 'GA'], role: 'RN', serviceLines: ['GLP-1'], availabilityType: 'TEMP', status: 'ACTIVE', lastActiveAt: daysAgo(4) },
  { id: 'cand4', primaryState: 'Florida', willingStates: ['FL'], role: 'LPN', serviceLines: ['GENERAL'], availabilityType: 'PER_DIEM', status: 'ACTIVE', lastActiveAt: daysAgo(7) },
  { id: 'cand5', primaryState: 'California', willingStates: ['CA', 'NV'], role: 'NP', serviceLines: ['TRT', 'GENERAL'], availabilityType: 'CONTRACT', status: 'ACTIVE', lastActiveAt: daysAgo(6) },
  { id: 'cand6', primaryState: 'California', willingStates: ['CA'], role: 'RN', serviceLines: ['GENERAL'], availabilityType: 'FULL_TIME', status: 'ACTIVE', lastActiveAt: daysAgo(9) },
  { id: 'cand7', primaryState: 'Arizona', willingStates: ['AZ', 'NM'], role: 'RN', serviceLines: ['IV_THERAPY'], availabilityType: 'TEMP', status: 'ACTIVE', lastActiveAt: daysAgo(3) },
  { id: 'cand8', primaryState: 'Arizona', willingStates: ['AZ'], role: 'PA', serviceLines: ['TRT'], availabilityType: 'TEMP', status: 'ACTIVE', lastActiveAt: daysAgo(5) },
  { id: 'cand9', primaryState: 'New York', willingStates: ['NY', 'NJ'], role: 'RN', serviceLines: ['GLP-1'], availabilityType: 'TEMP', status: 'ACTIVE', lastActiveAt: daysAgo(4) },
  { id: 'cand10', primaryState: 'Colorado', willingStates: ['CO'], role: 'RN', serviceLines: ['TRT'], availabilityType: 'CONTRACT', status: 'ACTIVE', lastActiveAt: daysAgo(2) },
  { id: 'cand11', primaryState: 'Colorado', willingStates: ['CO', 'UT'], role: 'NP', serviceLines: ['GENERAL'], availabilityType: 'CONTRACT', status: 'ACTIVE', lastActiveAt: daysAgo(10) },
]

function withinDate(date: string, from: Date, to: Date) {
  const d = new Date(date).getTime()
  return d >= from.getTime() && d <= to.getTime()
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roleParam = (searchParams.get('role') as Role | 'ALL' | null) || 'ALL'
    const employmentParam = (searchParams.get('employmentType') as EmploymentType | 'ALL' | null) || 'ALL'
    const serviceLineParam = (searchParams.get('serviceLine') as ServiceLine | 'ALL' | null) || 'ALL'
    const preset = searchParams.get('range') || '30d'

    const to = new Date()
    const from = new Date()
    if (preset === '7d') from.setDate(to.getDate() - 7)
    else if (preset === '90d') from.setDate(to.getDate() - 90)
    else from.setDate(to.getDate() - 30)

    const filteredJobs = jobs.filter((j) => {
      if (j.status !== 'OPEN') return false
      if (roleParam !== 'ALL' && j.role !== roleParam) return false
      if (employmentParam !== 'ALL' && j.employmentType !== employmentParam) return false
      if (serviceLineParam !== 'ALL' && j.serviceLine !== serviceLineParam) return false
      if (!withinDate(j.createdAt, from, to)) return false
      return true
    })

    const activeCutoff = new Date()
    activeCutoff.setDate(to.getDate() - 30)

    const filteredCandidates = candidates.filter((c) => {
      if (c.status !== 'ACTIVE') return false
      if (roleParam !== 'ALL' && c.role !== roleParam) return false
      if (serviceLineParam !== 'ALL' && !c.serviceLines.includes(serviceLineParam)) return false
      if (employmentParam !== 'ALL' && c.availabilityType !== employmentParam) return false
      if (!withinDate(c.lastActiveAt, activeCutoff, to)) return false
      return true
    })

    const regions = new Map<string, RegionStats>()

    const allStates = new Set<string>()
    filteredJobs.forEach((j) => allStates.add(`${j.state}|${j.stateCode}`))
    filteredCandidates.forEach((c) => {
      allStates.add(`${c.primaryState}|${c.primaryState.slice(0, 2).toUpperCase()}`)
      c.willingStates.forEach((s) => allStates.add(`${stateNameFromCode(s)}|${s}`))
    })

    allStates.forEach((entry) => {
      const [stateName, stateCode] = entry.split('|')
      if (!stateName || !stateCode) return
      const stateJobs = filteredJobs.filter((j) => j.state === stateName || j.stateCode === stateCode)
      const stateCandidates = filteredCandidates.filter(
        (c) => c.primaryState === stateName || c.willingStates.includes(stateCode)
      )
      const openJobs = stateJobs.length
      const activeCandidates = stateCandidates.length
      const ratio = openJobs / Math.max(activeCandidates, 1)

      const serviceLineCounts: Record<ServiceLine, number> = {
        TRT: 0,
        'GLP-1': 0,
        IV_THERAPY: 0,
        GENERAL: 0,
      }
      stateJobs.forEach((j) => {
        serviceLineCounts[j.serviceLine] = (serviceLineCounts[j.serviceLine] || 0) + 1
      })

      const topServiceLines = Object.entries(serviceLineCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([serviceLine, jobCount]) => ({ serviceLine: serviceLine as ServiceLine, jobCount }))

      const totalJobDemandScore = openJobs * 1.0 + Math.max(ratio - 1, 0) * 5.0

      regions.set(stateCode, {
        region: stateName,
        stateCode,
        openJobs,
        activeCandidates,
        jobToCandidateRatio: ratio,
        totalJobDemandScore,
        topServiceLines,
      })
    })

    const regionList = Array.from(regions.values())

    const starvingRegions = regionList
      .filter((r) => r.jobToCandidateRatio >= 2.0)
      .sort((a, b) => b.jobToCandidateRatio - a.jobToCandidateRatio || b.openJobs - a.openJobs)

    const talentRichRegions = regionList
      .filter((r) => r.jobToCandidateRatio <= 0.5)
      .sort((a, b) => a.jobToCandidateRatio - b.jobToCandidateRatio || b.activeCandidates - a.activeCandidates)

    const bestLaunchRegions = regionList
      .filter((r) => r.jobToCandidateRatio > 0.5 && r.jobToCandidateRatio < 2.5)
      .map((r) => {
        const launchScore = r.openJobs * 0.6 + r.activeCandidates * 0.4
        return { ...r, launchScore }
      })
      .sort((a, b) => b.launchScore - a.launchScore)
      .slice(0, 10)
      .map(({ launchScore, ...rest }) => rest)

    const response: WorkforceIntelligenceResponse = {
      lastUpdated: new Date().toISOString(),
      starvingRegions,
      talentRichRegions,
      bestLaunchRegions,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('workforce-intelligence error', error)
    return NextResponse.json(
      { lastUpdated: new Date().toISOString(), starvingRegions: [], talentRichRegions: [], bestLaunchRegions: [] },
      { status: 500 }
    )
  }
}

function stateNameFromCode(code: string) {
  const map: Record<string, string> = {
    TX: 'Texas',
    FL: 'Florida',
    CA: 'California',
    AZ: 'Arizona',
    NY: 'New York',
    CO: 'Colorado',
    NJ: 'New Jersey',
    GA: 'Georgia',
    NM: 'New Mexico',
    NV: 'Nevada',
    OK: 'Oklahoma',
    UT: 'Utah',
  }
  return map[code] || code
}

