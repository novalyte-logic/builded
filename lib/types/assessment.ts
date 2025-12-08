/**
 * Patient Assessment Data Models
 * 
 * Core types for assessment and lead tracking in the Novalyte™ AI platform
 */

export type AssessmentStatus =
  | 'in_progress'
  | 'completed'
  | 'qualified'
  | 'unqualified'
  | 'needs_review'

export type FlowType =
  | 'TRT'
  | 'GLP1'
  | 'PEPTIDES'
  | 'RECOVERY'
  | 'LONGEVITY'
  | 'GENERAL'

// Legacy alias for backwards compatibility
export type AssessmentPath = FlowType

export type RiskLevel = 'low' | 'moderate' | 'high'

export type LeadType = 'patient' | 'mens_clinic' | 'vendor'

export type LeadOrigin =
  | 'assessment'
  | 'contact_form'
  | 'marketplace'
  | 'chat'
  | 'manual'

export type LeadStatus =
  | 'new'
  | 'in_review'
  | 'contacted'
  | 'converted'
  | 'closed'

export type Priority = 'low' | 'medium' | 'high'

/**
 * PatientAssessment Model
 * 
 * Represents a completed or in-progress men's health assessment.
 * 
 * Relationship to LeadRecord:
 * - A LeadRecord is created when an assessment is completed and qualified
 * - Multiple assessments can link to the same LeadRecord (if user retakes assessment)
 * - Assessment data is the source of truth; LeadRecord is for workflow management
 */
export interface PatientAssessment {
  id: string // UUID
  user_id: string | null // Nullable for anonymous assessments
  created_at: Date
  updated_at: Date
  status: AssessmentStatus
  flow_type: FlowType // Primary field name
  path: FlowType // Legacy alias for backwards compatibility
  answers_json: Record<string, any> // Full raw answer payload from frontend
  ai_summary_json: AISummaryJSON | null // Gemini analysis (short summary + flags)
  risk_level: RiskLevel | null
  predicted_ltv_band: 'low' | 'medium' | 'high' | null
  city: string | null
  country: string | null
  acquisition_channel: string | null // e.g., "google_ads", "organic", "referral"
  metadata?: Record<string, any> // Additional flexible data
}

/**
 * Legacy field aliases for backwards compatibility
 */
export interface PatientAssessmentLegacy extends PatientAssessment {
  answers?: Record<string, any> // Alias for answers_json
  summary?: AssessmentSummary | null // Alias for ai_summary_json
  predicted_LTV?: number | null // Legacy numeric LTV
  qualification_reason?: string | null // Legacy field
}

/**
 * AI Summary JSON Structure
 * 
 * Gemini analysis output stored in ai_summary_json
 */
export interface AISummaryJSON {
  summary: string // Plain English summary
  keySymptoms: string[]
  riskFactors: string[]
  redFlags: string[] // Critical warnings
  recommendedPath: string // Suggested flow_type
  urgency: 'low' | 'medium' | 'high'
  highlights: string[] // Key points from assessment
}

/**
 * Legacy Assessment Summary (for backwards compatibility)
 */
export interface AssessmentSummary {
  keySymptoms: string[]
  riskFactors: string[]
  recommendedPath: string
  urgency: 'low' | 'medium' | 'high'
  highlights: string[] // Key points from assessment
}

/**
 * LeadRecord Model
 * 
 * Represents a lead in the sales/clinical workflow.
 * 
 * Relationship to PatientAssessment:
 * - Created when an assessment is completed and qualified (or manually created)
 * - assessment_id links to source assessment (nullable for non-assessment leads)
 * - Used for CRM workflow: tracking status, priority, notes, follow-up
 */
export interface LeadRecord {
  id: string // UUID
  assessment_id: string | null // Links to PatientAssessment if from assessment
  user_id: string | null
  created_at: Date
  updated_at: Date
  lead_type: LeadType
  origin: LeadOrigin
  status: LeadStatus
  priority: Priority
  tags: string[] // Optional labels for organization
  notes: string | null // Admin notes
  assigned_to: string | null // Admin user ID (for future use)
  converted_at: Date | null // When lead converted to customer
  metadata?: Record<string, any>
}

/**
 * Assessment with Linked Lead
 * 
 * Combined view for admin dashboard
 */
export interface AssessmentWithLead extends PatientAssessment {
  lead: LeadRecord | null
}

