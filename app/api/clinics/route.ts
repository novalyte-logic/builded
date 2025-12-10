import { NextRequest, NextResponse } from 'next/server'
import { ClinicRecord, ClinicServiceLine, ClinicStatus } from '@/lib/types/clinics'

const MOCK_CLINICS: ClinicRecord[] = [
  {
    id: 'cln-001',
    name: "Los Angeles Men's Health",
    city: 'Los Angeles',
    state: 'CA',
    region: 'SoCal',
    status: 'active',
    serviceLines: ['TRT', 'GLP1', 'RECOVERY'],
    capacityScore: 72,
    demandScore: 88,
    avgLtvUsd: 4100,
    lastLeadAt: '2024-05-15T12:10:00Z',
    totalPatients: 1240,
    notes: 'High demand; some capacity available mid-week.',
  },
  {
    id: 'cln-002',
    name: 'Austin Men’s Health Hub',
    city: 'Austin',
    state: 'TX',
    region: 'Texas',
    status: 'active',
    serviceLines: ['TRT', 'LONGEVITY'],
    capacityScore: 81,
    demandScore: 79,
    avgLtvUsd: 3950,
    lastLeadAt: '2024-05-15T11:02:00Z',
    totalPatients: 980,
    notes: 'Strong TRT fit; can take more volume.',
  },
  {
    id: 'cln-003',
    name: 'Miami Beach Clinic',
    city: 'Miami',
    state: 'FL',
    region: 'Florida',
    status: 'paused',
    serviceLines: ['TRT'],
    capacityScore: 55,
    demandScore: 91,
    avgLtvUsd: 3600,
    lastLeadAt: '2024-05-14T15:45:00Z',
    totalPatients: 720,
    notes: 'Paused due to staffing; demand still high.',
  },
  {
    id: 'cln-004',
    name: 'NYC Premier Clinic',
    city: 'New York',
    state: 'NY',
    region: 'Northeast',
    status: 'active',
    serviceLines: ['TRT', 'RECOVERY', 'GLP1'],
    capacityScore: 64,
    demandScore: 95,
    avgLtvUsd: 4800,
    lastLeadAt: '2024-05-15T09:12:00Z',
    totalPatients: 1580,
    notes: 'High demand corridor; prioritize high LTV leads.',
  },
  {
    id: 'cln-005',
    name: 'Chicago Wellness Center',
    city: 'Chicago',
    state: 'IL',
    region: 'Midwest',
    status: 'active',
    serviceLines: ['GLP1', 'RECOVERY'],
    capacityScore: 69,
    demandScore: 77,
    avgLtvUsd: 3300,
    lastLeadAt: '2024-05-15T10:30:00Z',
    totalPatients: 860,
    notes: 'Balanced capacity; GLP-1 growth potential.',
  },
  {
    id: 'cln-006',
    name: 'San Francisco Peak Performance',
    city: 'San Francisco',
    state: 'CA',
    region: 'NorCal',
    status: 'active',
    serviceLines: ['GLP1', 'RECOVERY', 'PEPTIDES'],
    capacityScore: 58,
    demandScore: 82,
    avgLtvUsd: 4200,
    lastLeadAt: '2024-05-15T08:55:00Z',
    totalPatients: 1030,
    notes: 'Conversion coaching recommended.',
  },
  {
    id: 'cln-007',
    name: 'Dallas Vitality Clinic',
    city: 'Dallas',
    state: 'TX',
    region: 'Texas',
    status: 'active',
    serviceLines: ['TRT', 'IV_THERAPY'],
    capacityScore: 77,
    demandScore: 83,
    avgLtvUsd: 3750,
    lastLeadAt: '2024-05-15T07:40:00Z',
    totalPatients: 640,
    notes: 'Good IV upsell potential.',
  },
  {
    id: 'cln-008',
    name: 'Phoenix Performance Lab',
    city: 'Phoenix',
    state: 'AZ',
    region: 'Southwest',
    status: 'pending',
    serviceLines: ['GLP1', 'TRT'],
    capacityScore: 90,
    demandScore: 68,
    avgLtvUsd: 3100,
    lastLeadAt: '2024-05-13T16:00:00Z',
    totalPatients: 240,
    notes: 'Ready to launch; onboarding phase.',
  },
  {
    id: 'cln-009',
    name: 'Seattle Longevity Clinic',
    city: 'Seattle',
    state: 'WA',
    region: 'Pacific NW',
    status: 'active',
    serviceLines: ['LONGEVITY', 'IV_THERAPY', 'PEPTIDES'],
    capacityScore: 62,
    demandScore: 71,
    avgLtvUsd: 4500,
    lastLeadAt: '2024-05-14T18:10:00Z',
    totalPatients: 520,
    notes: 'Longevity focus; steady demand.',
  },
  {
    id: 'cln-010',
    name: 'Denver Recovery & Wellness',
    city: 'Denver',
    state: 'CO',
    region: 'Mountain',
    status: 'deactivated',
    serviceLines: ['RECOVERY'],
    capacityScore: 20,
    demandScore: 55,
    avgLtvUsd: 2500,
    lastLeadAt: '2024-05-01T12:00:00Z',
    totalPatients: 120,
    notes: 'Temporarily offline; regulatory review.',
  },
  {
    id: 'cln-011',
    name: 'San Diego Coastal Clinic',
    city: 'San Diego',
    state: 'CA',
    region: 'SoCal',
    status: 'active',
    serviceLines: ['TRT', 'IV_THERAPY'],
    capacityScore: 74,
    demandScore: 79,
    avgLtvUsd: 3400,
    lastLeadAt: '2024-05-15T06:50:00Z',
    totalPatients: 710,
    notes: 'Good coastal demand; consider more TRT routing.',
  },
  {
    id: 'cln-012',
    name: 'Houston Men’s Vitality',
    city: 'Houston',
    state: 'TX',
    region: 'Texas',
    status: 'active',
    serviceLines: ['TRT', 'GLP1'],
    capacityScore: 68,
    demandScore: 85,
    avgLtvUsd: 3550,
    lastLeadAt: '2024-05-15T05:30:00Z',
    totalPatients: 840,
    notes: 'High demand; watch capacity during weekends.',
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceLine = (searchParams.get('serviceLine') || '').toUpperCase() as ClinicServiceLine | 'ALL' | ''
    const region = searchParams.get('region') || ''
    const status = (searchParams.get('status') || '').toLowerCase() as ClinicStatus | 'ALL' | ''

    let clinics = [...MOCK_CLINICS]

    if (serviceLine && serviceLine !== 'ALL') {
      clinics = clinics.filter((c) => c.serviceLines.includes(serviceLine as ClinicServiceLine))
    }
    if (region && region !== 'ALL') {
      clinics = clinics.filter((c) => c.state === region || c.region?.toLowerCase() === region.toLowerCase())
    }
    if (status && status !== 'all') {
      clinics = clinics.filter((c) => c.status === status)
    }

    return NextResponse.json({ clinics })
  } catch (error: any) {
    console.error('[CLINICS][LIST] error', error)
    return NextResponse.json({ clinics: [], error: 'Failed to load clinics' }, { status: 500 })
  }
}

