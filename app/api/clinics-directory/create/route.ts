import { NextRequest, NextResponse } from 'next/server'
import {
  ClinicDirectoryRecord,
  ClinicDirectoryStatus,
  ClinicLeadStatus,
  ClinicPriceBand,
  ClinicVisibility,
} from '@/lib/types/clinicDirectory'
import { mutateDirectoryStore, getDirectoryStore } from '../store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      city,
      state,
      serviceLines,
      status = 'pending',
      priceBand = '$$',
      leadStatus = 'pending_verification',
      visibility = 'shown',
    } = body as {
      name: string
      city: string
      state: string
      serviceLines: string[]
      status?: ClinicDirectoryStatus
      priceBand?: ClinicPriceBand
      leadStatus?: ClinicLeadStatus
      visibility?: ClinicVisibility
    }

    if (!name || !city || !state || !serviceLines?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const store = getDirectoryStore()

    const nextId = `CLINIC-${(store.length + 1).toString().padStart(4, '0')}`
    const newClinic: ClinicDirectoryRecord = {
      id: nextId,
      name,
      city,
      state,
      serviceLines,
      status,
      priceBand,
      leadStatus,
      visibility,
      updatedAt: new Date().toISOString(),
      revenuePerPatient: undefined,
      leadPriority: 'backup',
      focusServiceLines: serviceLines,
      marketplaceEmphasis: undefined,
    }

    mutateDirectoryStore([...store, newClinic])

    return NextResponse.json({ clinic: newClinic })
  } catch (error: any) {
    console.error('[CLINICS_DIRECTORY][CREATE] error', error)
    return NextResponse.json({ error: 'Failed to create clinic.' }, { status: 500 })
  }
}

