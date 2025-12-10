export type LeadType = 'patient' | 'mens_clinic' | 'vendor'
export type LeadStatus = 'new' | 'in_review' | 'contacted' | 'converted' | 'closed'
export type LeadPriority = 'high' | 'medium' | 'low'
export type LeadOrigin = 'assessment' | 'contact_form' | 'marketplace' | 'chat' | 'manual'
export type LeadRiskLevel = 'low' | 'medium' | 'high'

export interface LeadActivity {
  id: string
  timestamp: string // ISO
  kind: 'status_change' | 'message' | 'assessment_update' | 'system'
  summary: string
  actor: 'System' | 'Patient' | 'Clinic' | 'Vendor' | 'Agent'
}

export interface LeadRecord {
  id: string
  type: LeadType
  origin: LeadOrigin
  status: LeadStatus
  priority: LeadPriority
  createdAt: string
  name?: string
  email?: string
  phone?: string
  clinicOrVendorName?: string | null
  serviceLine?: 'TRT' | 'GLP1' | 'IV_THERAPY' | 'PEPTIDES' | 'RECOVERY' | 'LONGEVITY' | 'GENERAL'
  region?: string
  channel?: string
  campaign?: string
  adGroup?: string
  geo?: string
  sourceUrl?: string
  assessmentId?: string
  assessmentStatus?: 'in_progress' | 'completed' | 'qualified' | 'unqualified' | 'needs_review'
  assessmentUpdatedAt?: string
  primaryGoals?: string[]
  keyFlags?: string[]
  aiRiskLevel?: LeadRiskLevel
  aiInsightSummary?: string
  aiQualificationScore?: number
  activity: LeadActivity[]
  internalNotes?: string
}
export interface LeadAIReasoning {
  leadId: string;
  conversionProbability: number; // 0–1, e.g. 0.72
  horizonDays: number;           // e.g. 30
  confidence: number;            // 0–1, e.g. 0.88
  rationale: string;             // multi-paragraph explanation
  keySignals: string[];          // positive signals
  riskFactors: string[];         // negative / caution signals
  recommendedActions: string[];  // specific next steps
}
