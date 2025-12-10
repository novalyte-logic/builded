export type ClinicServiceLine = 'TRT' | 'GLP1' | 'IV_THERAPY' | 'PEPTIDES' | 'RECOVERY' | 'LONGEVITY'

export type ClinicStatus = 'active' | 'paused' | 'pending' | 'deactivated'

export interface ClinicRecord {
  id: string
  name: string
  city: string
  state: string
  region?: string
  status: ClinicStatus
  serviceLines: ClinicServiceLine[]
  capacityScore: number // 0–100
  demandScore: number // 0–100
  avgLtvUsd?: number
  lastLeadAt?: string
  totalPatients?: number
  notes?: string
}

