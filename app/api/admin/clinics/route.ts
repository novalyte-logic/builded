/**
 * Admin Clinics API Route
 * 
 * GET /api/admin/clinics - List clinics with filters
 * POST /api/admin/clinics - Create new clinic
 */

import { NextRequest, NextResponse } from 'next/server'
import { ClinicProfile } from '@/lib/types/clinic'
import { createAuditLog, createVersionSnapshot } from '@/lib/services/audit-service'

// Mock data store (replace with database)
const clinics: ClinicProfile[] = []

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const verification_status = searchParams.get('verification_status')
    const show_in_directory = searchParams.get('show_in_directory')
    const specialty = searchParams.get('specialty')
    const price_band = searchParams.get('price_band')
    const search = searchParams.get('search')

    let filteredClinics = [...clinics]

    // Apply filters
    if (verification_status) {
      filteredClinics = filteredClinics.filter((c) => c.verification_status === verification_status)
    }

    if (show_in_directory !== null) {
      const show = show_in_directory === 'true'
      filteredClinics = filteredClinics.filter((c) => c.show_in_directory === show)
    }

    if (specialty) {
      filteredClinics = filteredClinics.filter((c) => c.specialties.includes(specialty))
    }

    if (price_band) {
      filteredClinics = filteredClinics.filter((c) => c.price_band === price_band)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredClinics = filteredClinics.filter((c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.city.toLowerCase().includes(searchLower) ||
        c.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      clinics: filteredClinics,
      total: filteredClinics.length,
    })
  } catch (error: any) {
    console.error('Clinics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinics', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const clinic: ClinicProfile = {
      id: crypto.randomUUID(),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      city: body.city,
      state: body.state || null,
      country: body.country || 'USA',
      specialties: body.specialties || [],
      programs: body.programs || [],
      price_band: body.price_band || '$$',
      headline: body.headline || '',
      long_description: body.long_description || '',
      tags: body.tags || [],
      hero_image_url: body.hero_image_url || null,
      gallery_image_urls: body.gallery_image_urls || [],
      verification_status: body.verification_status || 'pending',
      is_featured: body.is_featured || false,
      show_in_directory: body.show_in_directory ?? true,
      booking_url: body.booking_url || null,
      phone: body.phone || null,
      email: body.email || null,
      seo_title: body.seo_title || null,
      seo_meta_description: body.seo_meta_description || null,
      match_score_override: body.match_score_override || null,
      notes_internal: body.notes_internal || null,
      performance_snapshot_json: null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    clinics.push(clinic)

    // Create audit log
    await createAuditLog('ClinicProfile', clinic.id, 'create', undefined, clinic)

    // Create initial version snapshot
    await createVersionSnapshot('ClinicProfile', clinic.id, clinic, 'Initial creation')

    return NextResponse.json({ clinic }, { status: 201 })
  } catch (error: any) {
    console.error('Create clinic error:', error)
    return NextResponse.json(
      { error: 'Failed to create clinic', details: error.message },
      { status: 500 }
    )
  }
}

