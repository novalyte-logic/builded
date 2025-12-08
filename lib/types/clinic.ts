/**
 * Men's Clinic Profile Data Model
 * 
 * Represents a clinic in the Novalyte™ AI directory
 */

export type PriceBand = '$' | '$$' | '$$$' | '$$$$'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface ClinicProgram {
  name: string // e.g., "TRT", "GLP-1", "Peptides"
  description?: string
  priceRange?: string
  featured?: boolean
}

export interface ClinicPerformanceSnapshot {
  profile_views: number
  profile_clicks: number
  assessment_starts_attributed: number
  assessment_completions_attributed: number
  matches_to_clinic: number
  clinic_acceptance_rate: number | null
  show_rate: number | null
  cancellation_rate: number | null
  repeat_visit_rate: number | null
  avg_predicted_ltv_band: 'low' | 'medium' | 'high' | null
  last_updated: string
}

export interface ClinicProfile {
  id: string
  name: string
  slug: string
  city: string
  state?: string
  country: string
  specialties: string[] // e.g., ["TRT", "GLP-1", "Peptides"]
  programs: ClinicProgram[]
  price_band: PriceBand
  headline: string
  long_description: string // Rich text / markdown
  tags: string[]
  hero_image_url: string | null
  gallery_image_urls: string[]
  verification_status: VerificationStatus
  is_featured: boolean
  show_in_directory: boolean
  booking_url: string | null
  phone: string | null
  email: string | null
  seo_title: string | null
  seo_meta_description: string | null
  match_score_override: number | null
  notes_internal: string | null // Admin-only notes
  performance_snapshot_json: ClinicPerformanceSnapshot | null
  created_at: Date
  updated_at: Date
}

