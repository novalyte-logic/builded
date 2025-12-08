/**
 * Admin Clinic Detail API Route
 * 
 * GET /api/admin/clinics/:id - Get clinic by ID
 * PATCH /api/admin/clinics/:id - Update clinic
 * DELETE /api/admin/clinics/:id - Delete clinic (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ClinicProfile } from '@/lib/types/clinic'
import { createAuditLog, createVersionSnapshot } from '@/lib/services/audit-service'

// Mock data store (replace with database)
const clinics: ClinicProfile[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = clinics.find((c) => c.id === params.id)

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    return NextResponse.json({ clinic })
  } catch (error: any) {
    console.error('Clinic detail API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinic', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicId = params.id
    const clinicIndex = clinics.findIndex((c) => c.id === clinicId)

    if (clinicIndex === -1) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const oldClinic = { ...clinics[clinicIndex] }
    const updates = await request.json()

    // Update clinic
    const updatedClinic: ClinicProfile = {
      ...clinics[clinicIndex],
      ...updates,
      updated_at: new Date(),
    }

    clinics[clinicIndex] = updatedClinic

    // Determine action type
    const action = updates.verification_status !== oldClinic.verification_status
      ? 'verify'
      : updates.show_in_directory !== oldClinic.show_in_directory || updates.is_featured !== oldClinic.is_featured
      ? 'toggle_visibility'
      : 'update'

    // Create audit log
    await createAuditLog(
      'ClinicProfile',
      clinicId,
      action,
      oldClinic,
      updatedClinic,
      updates.reason || 'Clinic profile updated'
    )

    // Create version snapshot if requested
    if (updates.create_version_snapshot) {
      await createVersionSnapshot(
        'ClinicProfile',
        clinicId,
        updatedClinic,
        updates.version_label || 'Manual update'
      )
    }

    return NextResponse.json({ clinic: updatedClinic })
  } catch (error: any) {
    console.error('Update clinic error:', error)
    return NextResponse.json(
      { error: 'Failed to update clinic', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinicId = params.id
    const clinicIndex = clinics.findIndex((c) => c.id === clinicId)

    if (clinicIndex === -1) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const clinic = clinics[clinicIndex]

    // Soft delete: mark as hidden
    clinics[clinicIndex] = {
      ...clinic,
      show_in_directory: false,
      updated_at: new Date(),
    }

    // Create audit log
    await createAuditLog(
      'ClinicProfile',
      clinicId,
      'delete',
      clinic,
      clinics[clinicIndex],
      'Clinic soft-deleted (hidden from directory)'
    )

    return NextResponse.json({ message: 'Clinic deleted', clinic: clinics[clinicIndex] })
  } catch (error: any) {
    console.error('Delete clinic error:', error)
    return NextResponse.json(
      { error: 'Failed to delete clinic', details: error.message },
      { status: 500 }
    )
  }
}

