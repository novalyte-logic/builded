export type ClinicDirectoryStatus = 'verified' | 'pending' | 'rejected'
export type ClinicPriceBand = '$' | '$$' | '$$$' | '$$$$'
export type ClinicLeadStatus = 'actively_accepting' | 'at_capacity' | 'paused' | 'pending_verification'
export type ClinicVisibility = 'shown' | 'hidden'
export type LeadPriority = 'primary' | 'backup' | 'overflow'
export type EmphasisLevel = 'high' | 'medium' | 'low'

export interface ClinicDirectoryRecord {
  id: string
  name: string
  city: string
  state: string
  serviceLines: string[]
  status: ClinicDirectoryStatus
  priceBand: ClinicPriceBand
  leadStatus: ClinicLeadStatus
  visibility: ClinicVisibility
  updatedAt: string
  isFeatured?: boolean
  revenuePerPatient?: number
  leadPriority?: LeadPriority
  focusServiceLines?: string[]
  marketplaceEmphasis?: {
    supplements?: EmphasisLevel
    diagnostics?: EmphasisLevel
    peptides?: EmphasisLevel
    equipment?: EmphasisLevel
    healthTech?: EmphasisLevel
  }
}

export interface ClinicMarketIntelRequest {
  query: string
}

export interface ClinicMarketIntelInsight {
  id: string
  title: string
  summary: string
  regions?: string[]
  treatments?: string[]
  confidence?: number
}

export interface ClinicMarketIntelResponse {
  query: string
  generatedAt: string
  insights: ClinicMarketIntelInsight[]
}

