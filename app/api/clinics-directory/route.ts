import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicDirectoryRecord,
  ClinicDirectoryStatus,
  ClinicPriceBand,
  ClinicVisibility,
} from '@/lib/types/clinicDirectory'
import { getDirectoryStore, mutateDirectoryStore } from './store'

const INITIAL_DIRECTORY: ClinicDirectoryRecord[] = [
  {
    id: 'CLINIC-0001',
    name: 'Miami Optimal Health',
    city: 'Miami',
    state: 'FL',
    serviceLines: ['TRT', 'GLP-1'],
    status: 'verified',
    priceBand: '$$$',
    leadStatus: 'actively_accepting',
    visibility: 'shown',
    updatedAt: '2024-05-15T10:00:00Z',
    isFeatured: true,
    revenuePerPatient: 820,
    leadPriority: 'primary',
    focusServiceLines: ['TRT', 'GLP1'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'high',
      peptides: 'high',
      equipment: 'medium',
      healthTech: 'medium',
    },
  },
  {
    id: 'CLINIC-0002',
    name: 'San Diego Wellness Group',
    city: 'San Diego',
    state: 'CA',
    serviceLines: ['TRT', 'IV Therapy', 'Peptides'],
    status: 'verified',
    priceBand: '$$',
    leadStatus: 'actively_accepting',
    visibility: 'shown',
    updatedAt: '2024-05-14T16:20:00Z',
    isFeatured: true,
    revenuePerPatient: 760,
    leadPriority: 'primary',
    focusServiceLines: ['TRT', 'IV Therapy', 'Peptides'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'medium',
      peptides: 'high',
      equipment: 'medium',
      healthTech: 'medium',
    },
  },
  {
    id: 'CLINIC-0003',
    name: 'Denver Peak Performance',
    city: 'Denver',
    state: 'CO',
    serviceLines: ['Recovery', 'IV Therapy'],
    status: 'pending',
    priceBand: '$$',
    leadStatus: 'pending_verification',
    visibility: 'shown',
    updatedAt: '2024-05-13T09:45:00Z',
    revenuePerPatient: 420,
    leadPriority: 'backup',
    focusServiceLines: ['Recovery', 'IV Therapy'],
    marketplaceEmphasis: {
      equipment: 'high',
      peptides: 'medium',
      supplements: 'medium',
      diagnostics: 'medium',
      healthTech: 'low',
    },
  },
  {
    id: 'CLINIC-0004',
    name: 'Austin Men’s Health Hub',
    city: 'Austin',
    state: 'TX',
    serviceLines: ['TRT', 'Longevity'],
    status: 'verified',
    priceBand: '$$$',
    leadStatus: 'actively_accepting',
    visibility: 'shown',
    updatedAt: '2024-05-15T08:15:00Z',
    revenuePerPatient: 690,
    leadPriority: 'primary',
    focusServiceLines: ['TRT', 'Longevity'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'high',
      equipment: 'medium',
      peptides: 'low',
      healthTech: 'medium',
    },
  },
  {
    id: 'CLINIC-0005',
    name: 'Seattle Longevity Clinic',
    city: 'Seattle',
    state: 'WA',
    serviceLines: ['Longevity', 'IV Therapy'],
    status: 'verified',
    priceBand: '$$$$',
    leadStatus: 'at_capacity',
    visibility: 'shown',
    updatedAt: '2024-05-12T12:00:00Z',
    revenuePerPatient: 880,
    leadPriority: 'overflow',
    focusServiceLines: ['Longevity', 'IV Therapy'],
    marketplaceEmphasis: {
      equipment: 'high',
      healthTech: 'high',
      supplements: 'medium',
      diagnostics: 'medium',
      peptides: 'low',
    },
  },
  {
    id: 'CLINIC-0006',
    name: 'Phoenix Performance Lab',
    city: 'Phoenix',
    state: 'AZ',
    serviceLines: ['TRT', 'GLP-1'],
    status: 'pending',
    priceBand: '$$',
    leadStatus: 'pending_verification',
    visibility: 'hidden',
    updatedAt: '2024-05-11T15:30:00Z',
    revenuePerPatient: 460,
    leadPriority: 'backup',
    focusServiceLines: ['TRT', 'GLP1'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'high',
      peptides: 'medium',
      equipment: 'low',
      healthTech: 'low',
    },
  },
  {
    id: 'CLINIC-0007',
    name: 'New York Premier Clinic',
    city: 'New York',
    state: 'NY',
    serviceLines: ['TRT', 'Recovery'],
    status: 'verified',
    priceBand: '$$$$',
    leadStatus: 'at_capacity',
    visibility: 'shown',
    updatedAt: '2024-05-15T07:50:00Z',
    isFeatured: true,
    revenuePerPatient: 950,
    leadPriority: 'primary',
    focusServiceLines: ['TRT', 'Recovery'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'medium',
      peptides: 'medium',
      equipment: 'high',
      healthTech: 'medium',
    },
  },
  {
    id: 'CLINIC-0008',
    name: 'Dallas Vitality Clinic',
    city: 'Dallas',
    state: 'TX',
    serviceLines: ['TRT', 'IV Therapy'],
    status: 'verified',
    priceBand: '$$',
    leadStatus: 'actively_accepting',
    visibility: 'shown',
    updatedAt: '2024-05-15T06:10:00Z',
    revenuePerPatient: 640,
    leadPriority: 'primary',
    focusServiceLines: ['TRT', 'IV Therapy'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'medium',
      equipment: 'medium',
      peptides: 'medium',
      healthTech: 'medium',
    },
  },
  {
    id: 'CLINIC-0009',
    name: 'Chicago Wellness Center',
    city: 'Chicago',
    state: 'IL',
    serviceLines: ['GLP-1', 'Recovery'],
    status: 'pending',
    priceBand: '$$',
    leadStatus: 'paused',
    visibility: 'hidden',
    updatedAt: '2024-05-10T14:00:00Z',
    revenuePerPatient: 310,
    leadPriority: 'overflow',
    focusServiceLines: ['GLP-1', 'Recovery'],
    marketplaceEmphasis: {
      supplements: 'medium',
      diagnostics: 'medium',
      peptides: 'low',
      equipment: 'medium',
      healthTech: 'low',
    },
  },
  {
    id: 'CLINIC-0010',
    name: 'Houston Men’s Vitality',
    city: 'Houston',
    state: 'TX',
    serviceLines: ['TRT', 'GLP-1'],
    status: 'verified',
    priceBand: '$$',
    leadStatus: 'actively_accepting',
    visibility: 'shown',
    updatedAt: '2024-05-15T05:40:00Z',
    revenuePerPatient: 720,
    leadPriority: 'primary',
    focusServiceLines: ['TRT', 'GLP1'],
    marketplaceEmphasis: {
      diagnostics: 'high',
      supplements: 'high',
      peptides: 'medium',
      equipment: 'medium',
      healthTech: 'medium',
    },
  },
]

// Initialize store on first load
const currentStore = getDirectoryStore()
if (currentStore.length === 0) {
  mutateDirectoryStore(INITIAL_DIRECTORY)
}

function filterClinics(params: {
  search?: string
  status?: ClinicDirectoryStatus | 'ALL'
  priceBand?: ClinicPriceBand | 'ALL'
  visibility?: ClinicVisibility | 'ALL'
}) {
  const search = (params.search || '').toLowerCase()
  const status = params.status || 'ALL'
  const priceBand = params.priceBand || 'ALL'
  const visibility = params.visibility || 'ALL'

  const store = getDirectoryStore()
  return store.filter((clinic) => {
    if (search) {
      const match =
        clinic.name.toLowerCase().includes(search) ||
        clinic.city.toLowerCase().includes(search) ||
        clinic.state.toLowerCase().includes(search)
      if (!match) return false
    }
    if (status !== 'ALL' && clinic.status !== status) return false
    if (priceBand !== 'ALL' && clinic.priceBand !== priceBand) return false
    if (visibility !== 'ALL' && clinic.visibility !== visibility) return false
    return true
  })
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = (searchParams.get('status') || 'ALL') as ClinicDirectoryStatus | 'ALL'
    const priceBand = (searchParams.get('priceBand') || 'ALL') as ClinicPriceBand | 'ALL'
    const visibility = (searchParams.get('visibility') || 'ALL') as ClinicVisibility | 'ALL'
    const clinicId = searchParams.get('clinicId') || ''

    const clinics = filterClinics({ search, status, priceBand, visibility })
    if (clinicId) {
      const match = clinics.find((c) => c.id === clinicId)
      return NextResponse.json({ clinics: match ? [match] : [] })
    }
    return NextResponse.json({ clinics })
  } catch (error: any) {
    console.error('[CLINICS_DIRECTORY][GET] error', error)
    return NextResponse.json({ clinics: [], error: 'Failed to load clinics.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, updates } = (await req.json()) as { id: string; updates: Partial<ClinicDirectoryRecord> }
    if (!id || !updates) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const store = getDirectoryStore()
    const index = store.findIndex((c) => c.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const current = store[index]
    const updated: ClinicDirectoryRecord = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const newStore = [...store]
    newStore[index] = updated
    mutateDirectoryStore(newStore)
    return NextResponse.json({ clinic: updated })
  } catch (error: any) {
    console.error('[CLINICS_DIRECTORY][PATCH] error', error)
    return NextResponse.json({ error: 'Failed to update clinic.' }, { status: 500 })
  }
}

