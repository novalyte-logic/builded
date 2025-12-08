/**
 * Admin Clinics API Route
 * 
 * GET /api/admin/clinics - List clinics with filters
 * POST /api/admin/clinics - Create new clinic
 */

import { NextRequest, NextResponse } from 'next/server'
import { ClinicProfile } from '@/lib/types/clinic'
import { createAuditLog, createVersionSnapshot } from '@/lib/services/audit-service'
import { mockClinics } from './mockData'

// Use shared mock data store (replace with database)
const clinics = mockClinics

/*
// Old inline mock data - now moved to mockData.ts
const clinics: ClinicProfile[] = [
  {
    id: 'clinic-001',
    name: 'Austin Men\'s Health Center',
    slug: 'austin-mens-health-center',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    specialties: ['TRT', 'GLP-1', 'Peptides'],
    programs: [
      { name: 'TRT', description: 'Comprehensive testosterone replacement therapy', featured: true },
      { name: 'GLP-1', description: 'Weight management with GLP-1 agonists' },
    ],
    price_band: '$$$',
    headline: 'Premier Men\'s Wellness in Central Texas',
    long_description: 'Full-service men\'s health clinic specializing in hormone optimization and metabolic health.',
    tags: ['telehealth', 'concierge', 'premium'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'verified',
    is_featured: true,
    show_in_directory: true,
    booking_url: 'https://example.com/book',
    phone: '512-555-0100',
    email: 'contact@austinmenshealth.com',
    seo_title: 'Austin Men\'s Health Center - TRT & Wellness',
    seo_meta_description: 'Expert TRT and men\'s wellness services in Austin, TX',
    match_score_override: null,
    notes_internal: 'Actively accepting new patients. High conversion rate.',
    performance_snapshot_json: {
      profile_views: 1243,
      profile_clicks: 456,
      assessment_starts_attributed: 89,
      assessment_completions_attributed: 67,
      matches_to_clinic: 124,
      clinic_acceptance_rate: 0.89,
      show_rate: 0.92,
      cancellation_rate: 0.08,
      repeat_visit_rate: 0.76,
      avg_predicted_ltv_band: 'high',
      last_updated: new Date().toISOString(),
    },
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-12-01'),
  },
  {
    id: 'clinic-002',
    name: 'Dallas Vitality Clinic',
    slug: 'dallas-vitality-clinic',
    city: 'Dallas',
    state: 'TX',
    country: 'USA',
    specialties: ['TRT', 'IV Therapy'],
    programs: [
      { name: 'TRT', description: 'Testosterone optimization', featured: true },
      { name: 'IV Therapy', description: 'Vitamin and hydration therapy' },
    ],
    price_band: '$$',
    headline: 'Affordable Men\'s Health Solutions',
    long_description: 'Accessible men\'s wellness with competitive pricing.',
    tags: ['budget-friendly', 'walk-in'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'verified',
    is_featured: false,
    show_in_directory: true,
    booking_url: 'https://example.com/dallas',
    phone: '214-555-0200',
    email: 'info@dallasvitality.com',
    seo_title: null,
    seo_meta_description: null,
    match_score_override: null,
    notes_internal: 'At capacity - paused new patient intake.',
    performance_snapshot_json: {
      profile_views: 876,
      profile_clicks: 234,
      assessment_starts_attributed: 45,
      assessment_completions_attributed: 32,
      matches_to_clinic: 67,
      clinic_acceptance_rate: 0.71,
      show_rate: 0.85,
      cancellation_rate: 0.12,
      repeat_visit_rate: 0.68,
      avg_predicted_ltv_band: 'medium',
      last_updated: new Date().toISOString(),
    },
    created_at: new Date('2024-02-20'),
    updated_at: new Date('2024-11-28'),
  },
  {
    id: 'clinic-003',
    name: 'Miami Optimal Health',
    slug: 'miami-optimal-health',
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    specialties: ['TRT', 'GLP-1', 'Peptides', 'IV Therapy'],
    programs: [
      { name: 'TRT', featured: true },
      { name: 'GLP-1', featured: true },
      { name: 'Peptides' },
      { name: 'IV Therapy' },
    ],
    price_band: '$$$$',
    headline: 'Luxury Longevity & Performance Medicine',
    long_description: 'High-end concierge clinic for executives and athletes.',
    tags: ['luxury', 'concierge', 'athletes'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'verified',
    is_featured: true,
    show_in_directory: true,
    booking_url: 'https://example.com/miami',
    phone: '305-555-0300',
    email: 'vip@miamioptimal.com',
    seo_title: 'Miami Optimal Health - Luxury Men\'s Wellness',
    seo_meta_description: 'Premier longevity and performance medicine in Miami',
    match_score_override: 95,
    notes_internal: 'VIP clientele. Actively accepting high-value patients.',
    performance_snapshot_json: {
      profile_views: 2134,
      profile_clicks: 789,
      assessment_starts_attributed: 156,
      assessment_completions_attributed: 134,
      matches_to_clinic: 201,
      clinic_acceptance_rate: 0.94,
      show_rate: 0.96,
      cancellation_rate: 0.04,
      repeat_visit_rate: 0.88,
      avg_predicted_ltv_band: 'high',
      last_updated: new Date().toISOString(),
    },
    created_at: new Date('2023-11-10'),
    updated_at: new Date('2024-12-05'),
  },
  {
    id: 'clinic-004',
    name: 'Phoenix Men\'s Clinic',
    slug: 'phoenix-mens-clinic',
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    specialties: ['TRT'],
    programs: [
      { name: 'TRT', description: 'Testosterone therapy only', featured: true },
    ],
    price_band: '$',
    headline: 'Simple, Affordable TRT',
    long_description: 'No-frills testosterone replacement therapy.',
    tags: ['budget', 'trt-only'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'pending',
    is_featured: false,
    show_in_directory: true,
    booking_url: null,
    phone: '602-555-0400',
    email: 'contact@phoenixmens.com',
    seo_title: null,
    seo_meta_description: null,
    match_score_override: null,
    notes_internal: 'New clinic - pending verification.',
    performance_snapshot_json: null,
    created_at: new Date('2024-11-01'),
    updated_at: new Date('2024-11-30'),
  },
  {
    id: 'clinic-005',
    name: 'Denver Peak Performance',
    slug: 'denver-peak-performance',
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    specialties: ['TRT', 'Peptides'],
    programs: [
      { name: 'TRT', featured: true },
      { name: 'Peptides', description: 'Performance peptides' },
    ],
    price_band: '$$',
    headline: 'Athlete-Focused Men\'s Wellness',
    long_description: 'Tailored for active individuals and competitive athletes.',
    tags: ['athletes', 'performance'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'verified',
    is_featured: false,
    show_in_directory: true,
    booking_url: 'https://example.com/denver',
    phone: '303-555-0500',
    email: 'team@denverpeakperf.com',
    seo_title: 'Denver Peak Performance - TRT for Athletes',
    seo_meta_description: 'TRT and peptide therapy for athletes in Denver',
    match_score_override: null,
    notes_internal: 'Strong with athletic demographic. Actively accepting patients.',
    performance_snapshot_json: {
      profile_views: 678,
      profile_clicks: 189,
      assessment_starts_attributed: 34,
      assessment_completions_attributed: 28,
      matches_to_clinic: 56,
      clinic_acceptance_rate: 0.82,
      show_rate: 0.88,
      cancellation_rate: 0.09,
      repeat_visit_rate: 0.74,
      avg_predicted_ltv_band: 'medium',
      last_updated: new Date().toISOString(),
    },
    created_at: new Date('2024-03-15'),
    updated_at: new Date('2024-12-03'),
  },
  {
    id: 'clinic-006',
    name: 'San Diego Wellness Group',
    slug: 'san-diego-wellness-group',
    city: 'San Diego',
    state: 'CA',
    country: 'USA',
    specialties: ['TRT', 'GLP-1'],
    programs: [
      { name: 'TRT', featured: true },
      { name: 'GLP-1', description: 'Weight loss program' },
    ],
    price_band: '$$$',
    headline: 'Integrated Men\'s Health & Weight Management',
    long_description: 'Comprehensive approach to metabolic and hormonal health.',
    tags: ['holistic', 'weight-loss'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'verified',
    is_featured: false,
    show_in_directory: true,
    booking_url: 'https://example.com/sd',
    phone: '619-555-0600',
    email: 'hello@sdwellness.com',
    seo_title: null,
    seo_meta_description: null,
    match_score_override: null,
    notes_internal: 'Actively accepting. Strong GLP-1 demand.',
    performance_snapshot_json: {
      profile_views: 1023,
      profile_clicks: 345,
      assessment_starts_attributed: 67,
      assessment_completions_attributed: 54,
      matches_to_clinic: 89,
      clinic_acceptance_rate: 0.86,
      show_rate: 0.90,
      cancellation_rate: 0.07,
      repeat_visit_rate: 0.79,
      avg_predicted_ltv_band: 'high',
      last_updated: new Date().toISOString(),
    },
    created_at: new Date('2024-04-10'),
    updated_at: new Date('2024-12-04'),
  },
  {
    id: 'clinic-007',
    name: 'Nashville Elite Wellness',
    slug: 'nashville-elite-wellness',
    city: 'Nashville',
    state: 'TN',
    country: 'USA',
    specialties: ['TRT', 'IV Therapy', 'Peptides'],
    programs: [
      { name: 'TRT', featured: true },
      { name: 'IV Therapy' },
      { name: 'Peptides' },
    ],
    price_band: '$$',
    headline: 'Modern Men\'s Health in Music City',
    long_description: 'Contemporary clinic with personalized care.',
    tags: ['modern', 'personalized'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'rejected',
    is_featured: false,
    show_in_directory: false,
    booking_url: null,
    phone: null,
    email: null,
    seo_title: null,
    seo_meta_description: null,
    match_score_override: null,
    notes_internal: 'Rejected - failed verification checks. Hidden from directory.',
    performance_snapshot_json: null,
    created_at: new Date('2024-05-20'),
    updated_at: new Date('2024-06-15'),
  },
  {
    id: 'clinic-008',
    name: 'Seattle Men\'s Optimization',
    slug: 'seattle-mens-optimization',
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    specialties: ['TRT', 'GLP-1', 'Peptides'],
    programs: [
      { name: 'TRT', featured: true },
      { name: 'GLP-1' },
      { name: 'Peptides' },
    ],
    price_band: '$$$',
    headline: 'Tech-Forward Men\'s Health',
    long_description: 'Data-driven approach to hormone optimization.',
    tags: ['tech-enabled', 'data-driven'],
    hero_image_url: null,
    gallery_image_urls: [],
    verification_status: 'verified',
    is_featured: false,
    show_in_directory: true,
    booking_url: 'https://example.com/seattle',
    phone: '206-555-0800',
    email: 'info@seattlemens.com',
    seo_title: 'Seattle Men\'s Optimization - Data-Driven TRT',
    seo_meta_description: 'Technology-powered men\'s health in Seattle',
    match_score_override: null,
    notes_internal: 'Tech-savvy clientele. Paused intake - at capacity.',
    performance_snapshot_json: {
      profile_views: 945,
      profile_clicks: 287,
      assessment_starts_attributed: 58,
      assessment_completions_attributed: 49,
      matches_to_clinic: 76,
      clinic_acceptance_rate: 0.84,
      show_rate: 0.91,
      cancellation_rate: 0.06,
      repeat_visit_rate: 0.81,
      avg_predicted_ltv_band: 'high',
      last_updated: new Date().toISOString(),
    },
    created_at: new Date('2024-06-01'),
    updated_at: new Date('2024-12-02'),
  },
]
*/

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

    // Serialize dates for JSON response
    const serializedClinics = filteredClinics.map((clinic) => ({
      ...clinic,
      created_at: clinic.created_at.toISOString(),
      updated_at: clinic.updated_at.toISOString(),
    }))

    return NextResponse.json({
      clinics: serializedClinics,
      total: serializedClinics.length,
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

    // Serialize dates for JSON response
    const serializedClinic = {
      ...clinic,
      created_at: clinic.created_at.toISOString(),
      updated_at: clinic.updated_at.toISOString(),
    }

    return NextResponse.json({ clinic: serializedClinic }, { status: 201 })
  } catch (error: any) {
    console.error('Create clinic error:', error)
    return NextResponse.json(
      { error: 'Failed to create clinic', details: error.message },
      { status: 500 }
    )
  }
}

