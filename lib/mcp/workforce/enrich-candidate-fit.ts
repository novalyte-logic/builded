/**
 * MCP Tool: enrich_candidate_fit
 * 
 * Score a candidate vs a given clinic job
 */

import { ClinicJobPosting } from './find-clinic-jobs-by-region'
import { NurseCandidate } from './find-nurses-seeking-temp-work'
import { EnrichedClinicFromJob } from './enrich-clinic-from-job'

export interface CandidateFitScore {
  fitScore: number // 0-100
  reason: string
  shiftCompatibility: 'good' | 'partial' | 'poor'
  serviceLineAlignment: 'good' | 'partial' | 'poor'
}

export interface EnrichCandidateFitInput {
  candidateProfile: NurseCandidate
  jobPosting: ClinicJobPosting
  enrichedClinic?: EnrichedClinicFromJob
}

export interface EnrichCandidateFitOutput {
  fit: CandidateFitScore
  candidateId: string
  jobId: string
  scoredAt: string
}

/**
 * Score candidate fit for a job
 */
export async function enrichCandidateFit(
  input: EnrichCandidateFitInput
): Promise<EnrichCandidateFitOutput> {
  const { candidateProfile, jobPosting, enrichedClinic } = input

  try {
    // Calculate fit score based on multiple factors
    let score = 50 // Base score

    // Role type match (critical)
    const roleMatch = candidateProfile.roleType === 'RN' && jobPosting.roleType === 'NURSE' ||
                      candidateProfile.roleType === 'NP' && jobPosting.roleType === 'NP_PA' ||
                      candidateProfile.roleType === 'PA' && jobPosting.roleType === 'NP_PA' ||
                      candidateProfile.roleType === 'MA' && jobPosting.roleType === 'MA_TECH'
    
    if (roleMatch) {
      score += 30
    } else {
      score -= 20
    }

    // Employment type match
    const employmentMatch = 
      (jobPosting.employmentType === 'TEMP' && candidateProfile.preferredShifts.length > 0) ||
      (jobPosting.employmentType === 'PER_DIEM' && candidateProfile.preferredShifts.length > 0) ||
      (jobPosting.employmentType === 'CONTRACT' && candidateProfile.preferredShifts.length > 0)
    
    if (employmentMatch) {
      score += 10
    }

    // Region match
    const regionMatch = candidateProfile.preferredRegions.some(r => 
      r.toLowerCase().includes(jobPosting.location.state.toLowerCase()) ||
      r.toLowerCase().includes(jobPosting.location.city.toLowerCase())
    )
    
    if (regionMatch) {
      score += 10
    }

    // Service line alignment
    let serviceLineAlignment: 'good' | 'partial' | 'poor' = 'poor'
    if (enrichedClinic && candidateProfile.serviceLineInterest) {
      const clinicServiceLines = enrichedClinic.serviceLinesMentioned
      const candidateInterests = candidateProfile.serviceLineInterest
      
      const hasMatch = clinicServiceLines.some(sl => 
        candidateInterests.includes(sl as any) || candidateInterests.includes('GENERAL')
      )
      
      if (hasMatch) {
        serviceLineAlignment = 'good'
        score += 10
      } else if (candidateInterests.includes('GENERAL')) {
        serviceLineAlignment = 'partial'
        score += 5
      }
    } else {
      serviceLineAlignment = 'partial'
      score += 5
    }

    // Shift compatibility
    let shiftCompatibility: 'good' | 'partial' | 'poor' = 'poor'
    if (enrichedClinic && candidateProfile.preferredShifts.length > 0) {
      const clinicPatterns = enrichedClinic.schedulePatterns.map(p => p.toLowerCase())
      const candidateShifts = candidateProfile.preferredShifts.map(s => s.toLowerCase())
      
      const hasMatch = clinicPatterns.some(pattern => 
        candidateShifts.some(shift => 
          pattern.includes(shift) || shift.includes(pattern)
        )
      )
      
      if (hasMatch) {
        shiftCompatibility = 'good'
        score += 5
      } else {
        shiftCompatibility = 'partial'
        score += 2
      }
    } else {
      shiftCompatibility = 'partial'
      score += 2
    }

    // Experience level (bonus)
    if (candidateProfile.yearsExperience >= 3) {
      score += 5
    }

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score))

    // Build reason
    const reasons: string[] = []
    if (roleMatch) reasons.push('Role type match')
    if (regionMatch) reasons.push('Region preference aligned')
    if (serviceLineAlignment === 'good') reasons.push('Service line interest aligned')
    if (shiftCompatibility === 'good') reasons.push('Shift preferences compatible')
    if (candidateProfile.yearsExperience >= 3) reasons.push('Experienced candidate')

    const reason = reasons.length > 0 
      ? reasons.join(', ') 
      : 'Limited alignment - review manually'

    return {
      fit: {
        fitScore: score,
        reason,
        shiftCompatibility,
        serviceLineAlignment,
      },
      candidateId: candidateProfile.candidateId,
      jobId: jobPosting.jobId,
      scoredAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error scoring candidate fit:', error)
    return {
      fit: {
        fitScore: 0,
        reason: 'Error calculating fit score',
        shiftCompatibility: 'poor',
        serviceLineAlignment: 'poor',
      },
      candidateId: candidateProfile.candidateId,
      jobId: jobPosting.jobId,
      scoredAt: new Date().toISOString(),
    }
  }
}

