/**
 * MCP Tool: generate_workforce_matches
 * 
 * For a given region + roleType, generate a match list between clinics and candidates
 */

import { findClinicJobsByRegion, ClinicJobPosting, RoleType, ServiceLineFilter } from './find-clinic-jobs-by-region'
import { findNursesSeekingTempWork, NurseCandidate, NurseRoleType } from './find-nurses-seeking-temp-work'
import { enrichCandidateFit } from './enrich-candidate-fit'
import { enrichClinicFromJob } from './enrich-clinic-from-job'

export interface WorkforceMatch {
  clinicJob: {
    clinicName: string
    jobTitle: string
    employmentType: string
    serviceLines: string[]
    location: { city: string; state: string }
  }
  candidate: {
    displayName: string
    roleType: string
    yearsExperience: number
  }
  fitScore: number
  priority: 'high' | 'medium' | 'low'
  notes: string
}

export interface GenerateWorkforceMatchesInput {
  region: string
  roleType: RoleType
  serviceLineFilter?: ServiceLineFilter
  maxClinics?: number
  maxCandidates?: number
}

export interface GenerateWorkforceMatchesOutput {
  matches: WorkforceMatch[]
  summary: {
    highPriorityMatches: number
    mediumPriorityMatches: number
    lowPriorityMatches: number
    strongestRegions: string[]
    strongestServiceLines: string[]
  }
  generatedAt: string
}

/**
 * Generate workforce matches between clinics and candidates
 */
export async function generateWorkforceMatches(
  input: GenerateWorkforceMatchesInput
): Promise<GenerateWorkforceMatchesOutput> {
  const { region, roleType, serviceLineFilter, maxClinics = 10, maxCandidates = 20 } = input

  try {
    // Map RoleType to NurseRoleType
    const nurseRoleType: NurseRoleType = 
      roleType === 'NURSE' ? 'RN' :
      roleType === 'NP_PA' ? 'NP' :
      roleType === 'MA_TECH' ? 'MA' : 'OTHER'

    // Find clinic jobs
    const jobsResult = await findClinicJobsByRegion({
      region,
      roleType,
      employmentType: 'TEMP', // Focus on temp/per diem/contract
      serviceLineFilter,
    })

    const jobs = jobsResult.jobs.slice(0, maxClinics)

    // Find candidates
    const candidatesResult = await findNursesSeekingTempWork({
      region,
      roleType: nurseRoleType,
      desiredEmploymentType: 'TEMP',
      serviceLineInterest: serviceLineFilter,
    })

    const candidates = candidatesResult.candidates.slice(0, maxCandidates)

    // Generate matches
    const matches: WorkforceMatch[] = []

    for (const job of jobs) {
      // Enrich clinic from job
      const enrichedClinic = await enrichClinicFromJob({
        jobId: job.jobId,
        postingUrl: job.postingUrl,
        clinicWebsite: job.clinicWebsite,
        jobPosting: job,
      })

      // Score each candidate against this job
      for (const candidate of candidates) {
        const fitResult = await enrichCandidateFit({
          candidateProfile: candidate,
          jobPosting: job,
          enrichedClinic: enrichedClinic.enriched,
        })

        const priority: 'high' | 'medium' | 'low' = 
          fitResult.fit.fitScore >= 75 ? 'high' :
          fitResult.fit.fitScore >= 50 ? 'medium' : 'low'

        matches.push({
          clinicJob: {
            clinicName: job.clinicName,
            jobTitle: job.jobTitle,
            employmentType: job.employmentType,
            serviceLines: enrichedClinic.enriched.serviceLinesMentioned,
            location: job.location,
          },
          candidate: {
            displayName: candidate.displayName,
            roleType: candidate.roleType,
            yearsExperience: candidate.yearsExperience,
          },
          fitScore: fitResult.fit.fitScore,
          priority,
          notes: fitResult.fit.reason,
        })
      }
    }

    // Sort by fit score descending
    matches.sort((a, b) => b.fitScore - a.fitScore)

    // Calculate summary
    const highPriority = matches.filter(m => m.priority === 'high').length
    const mediumPriority = matches.filter(m => m.priority === 'medium').length
    const lowPriority = matches.filter(m => m.priority === 'low').length

    // Extract regions and service lines
    const regions = [...new Set(matches.map(m => m.clinicJob.location.state))]
    const serviceLines = [...new Set(matches.flatMap(m => m.clinicJob.serviceLines))]

    return {
      matches,
      summary: {
        highPriorityMatches: highPriority,
        mediumPriorityMatches: mediumPriority,
        lowPriorityMatches: lowPriority,
        strongestRegions: regions.slice(0, 3),
        strongestServiceLines: serviceLines.slice(0, 3),
      },
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error generating workforce matches:', error)
    return {
      matches: [],
      summary: {
        highPriorityMatches: 0,
        mediumPriorityMatches: 0,
        lowPriorityMatches: 0,
        strongestRegions: [],
        strongestServiceLines: [],
      },
      generatedAt: new Date().toISOString(),
    }
  }
}

