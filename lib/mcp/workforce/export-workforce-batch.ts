/**
 * MCP Tool: export_workforce_batch
 * 
 * End-to-end pipeline for Workforce in a region
 */

import { findClinicJobsByRegion, RoleType, ServiceLineFilter, EmploymentType } from './find-clinic-jobs-by-region'
import { findNursesSeekingTempWork, NurseRoleType } from './find-nurses-seeking-temp-work'
import { generateWorkforceMatches, WorkforceMatch } from './generate-workforce-matches'
import { vertexWorkforceOutreachBrain } from './vertex-workforce-outreach-brain'
import { enrichClinicFromJob } from './enrich-clinic-from-job'

export interface WorkforceBatchOutput {
  workforceSummary: {
    totalJobs: number
    totalCandidates: number
    totalMatches: number
    highPriorityMatches: number
  }
  jobs: Array<{
    job: any
    enriched?: any
  }>
  candidates: any[]
  matches: Array<{
    match: WorkforceMatch
    outreachToClinic?: any
    outreachToCandidate?: any
  }>
  generatedAt: string
}

export interface ExportWorkforceBatchInput {
  region: string
  roleType: RoleType
  employmentType: EmploymentType
  serviceLineFilter?: ServiceLineFilter
  maxJobs?: number
}

/**
 * Export workforce batch - end-to-end pipeline
 */
export async function exportWorkforceBatch(
  input: ExportWorkforceBatchInput
): Promise<WorkforceBatchOutput> {
  const { region, roleType, employmentType, serviceLineFilter, maxJobs = 10 } = input

  try {
    // Step 1: Find clinic jobs
    const jobsResult = await findClinicJobsByRegion({
      region,
      roleType,
      employmentType,
      serviceLineFilter,
    })

    const jobs = jobsResult.jobs.slice(0, maxJobs)

    // Step 2: Enrich jobs
    const enrichedJobs = await Promise.all(
      jobs.map(job =>
        enrichClinicFromJob({
          jobId: job.jobId,
          postingUrl: job.postingUrl,
          clinicWebsite: job.clinicWebsite,
          jobPosting: job,
        })
      )
    )

    // Step 3: Find candidates
    const nurseRoleType: NurseRoleType = 
      roleType === 'NURSE' ? 'RN' :
      roleType === 'NP_PA' ? 'NP' :
      roleType === 'MA_TECH' ? 'MA' : 'OTHER'

    const candidatesResult = await findNursesSeekingTempWork({
      region,
      roleType: nurseRoleType,
      desiredEmploymentType: employmentType as any,
      serviceLineInterest: serviceLineFilter,
    })

    const candidates = candidatesResult.candidates

    // Step 4: Generate matches
    const matchesResult = await generateWorkforceMatches({
      region,
      roleType,
      serviceLineFilter,
      maxClinics: maxJobs,
      maxCandidates: 20,
    })

    // Step 5: Generate outreach packs for top matches
    const matchesWithOutreach = await Promise.all(
      matchesResult.matches.slice(0, 10).map(async (match) => {
        // Find the original job and candidate
        const job = jobs.find(j => j.clinicName === match.clinicJob.clinicName)
        const candidate = candidates.find(c => c.displayName === match.candidate.displayName)

        if (!job || !candidate) {
          return {
            match,
            outreachToClinic: null,
            outreachToCandidate: null,
          }
        }

        // Generate outreach to clinic
        const outreachToClinic = await vertexWorkforceOutreachBrain({
          clinicJob: job,
          candidateProfile: candidate,
          direction: 'TO_CLINIC',
        })

        // Generate outreach to candidate
        const outreachToCandidate = await vertexWorkforceOutreachBrain({
          clinicJob: job,
          candidateProfile: candidate,
          direction: 'TO_CANDIDATE',
        })

        return {
          match,
          outreachToClinic: outreachToClinic.pack,
          outreachToCandidate: outreachToCandidate.pack,
        }
      })
    )

    return {
      workforceSummary: {
        totalJobs: jobs.length,
        totalCandidates: candidates.length,
        totalMatches: matchesResult.matches.length,
        highPriorityMatches: matchesResult.summary.highPriorityMatches,
      },
      jobs: jobs.map((job, idx) => ({
        job,
        enriched: enrichedJobs[idx]?.enriched,
      })),
      candidates,
      matches: matchesWithOutreach,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error exporting workforce batch:', error)
    return {
      workforceSummary: {
        totalJobs: 0,
        totalCandidates: 0,
        totalMatches: 0,
        highPriorityMatches: 0,
      },
      jobs: [],
      candidates: [],
      matches: [],
      generatedAt: new Date().toISOString(),
    }
  }
}

