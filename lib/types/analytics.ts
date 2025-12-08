export type ServiceLine = 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY'
export type TrendDirection = 'RISING' | 'FLAT' | 'FALLING'
export type IntentTier = 'HIGH_NEED' | 'MEDIUM_NEED' | 'STABLE' | 'LOW'
export type RevenueServiceLine = ServiceLine

export interface RegionDemandRow {
  state: string
  serviceLine: ServiceLine
  leadCount: number
  qualifiedCount: number
  conversionRate: number
  lastLeadAt: string | null
}

export interface DemandSupplyRow {
  state: string
  serviceLine: ServiceLine
  interestScore: number
  trendDirection: TrendDirection
  clinicCount: number
  novalyteClinicCount: number
  opportunityScore: number
}

export interface RegionDemandResponse {
  rows: RegionDemandRow[]
  meta: {
    startDate: string
    endDate: string
    generatedAt: string
  }
}

export interface RegionRevenueRow {
  state: string
  serviceLine: ServiceLine
  leadCount: number
  qualifiedLeadCount: number
  bookedLeadCount: number
  observedCloseRate: number | null
  effectiveCloseRate: number
  avgRevenuePerPatient: number
  estimatedRevenue: number
  estimatedRevenuePotential: number
}

export interface ClinicRevenueRow {
  clinicId: string
  clinicName: string
  state: string
  city: string
  serviceLine: ServiceLine
  leadCount: number
  qualifiedLeadCount: number
  bookedLeadCount: number
  observedCloseRate: number | null
  effectiveCloseRate: number
  avgRevenuePerPatient: number
  estimatedRevenue: number
  estimatedRevenuePotential: number
}

export interface RevenueIntelligenceResponse {
  regions: RegionRevenueRow[]
  clinics: ClinicRevenueRow[]
  meta: {
    startDate: string
    endDate: string
    generatedAt: string
  }
}

export interface AssessmentTriageResult {
  leadId: string
  clinicalRiskLevel: 'low' | 'moderate' | 'high'
  conversionPotentialLabel: 'low' | 'moderate' | 'high'
  conversionProbability: number
  rationale: string
  keyOpportunitySignals: string[]
  keyRiskSignals: string[]
  recommendedActions: string[]
}

export interface DemandSupplyResponse {
  rows: DemandSupplyRow[]
  meta: {
    startDate: string
    endDate: string
    generatedAt: string
  }
}

export interface ClinicIntentRow {
  clinicId: string
  clinicName: string
  state: string
  city: string
  serviceLine: ServiceLine
  leadCount: number
  qualifiedLeadCount: number
  profileViews: number
  pricingViews: number
  contactClicks: number
  engagementScore: number
  leadToViewRatio: number
  intentTier: IntentTier
  needsPatients: boolean
}

export interface ClinicIntentResponse {
  rows: ClinicIntentRow[]
  meta: {
    startDate: string
    endDate: string
    generatedAt: string
  }
}
