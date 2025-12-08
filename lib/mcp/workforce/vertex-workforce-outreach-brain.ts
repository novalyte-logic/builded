/**
 * MCP Tool: vertex_workforce_outreach_brain
 * 
 * Turn job + candidate intel into outreach scripts for clinics AND talent
 * 
 * Uses Vertex AI with comprehensive prompt templates for professional,
 * opportunity-focused outreach generation.
 */

import { ClinicJobPosting } from './find-clinic-jobs-by-region'
import { NurseCandidate } from './find-nurses-seeking-temp-work'
import { 
  buildWorkforceOutreachPrompt, 
  parseWorkforceOutreachResponse,
  type WorkforceOutreachInput,
  type WorkforceOutreachOutput 
} from './vertex-workforce-prompts'

export type OutreachDirection = 'TO_CLINIC' | 'TO_CANDIDATE'
export type OutreachTone = 'professional' | 'concise' | 'opportunity-focused'

export interface WorkforceOutreachPack {
  emailSubject: string
  emailBody: string
  dmScript: string
  callOpener: string
  angleSummary?: string
  warningsOrCaveats?: string
}

export interface VertexWorkforceOutreachInput {
  clinicJob: ClinicJobPosting
  candidateProfile: NurseCandidate
  direction: OutreachDirection
  tone?: OutreachTone
  fitMetadata?: {
    fitScore?: number
    reason?: string
    shiftCompatibility?: 'good' | 'partial' | 'poor'
    serviceLineAlignment?: 'good' | 'partial' | 'poor'
  }
}

export interface VertexWorkforceOutreachOutput {
  pack: WorkforceOutreachPack
  direction: OutreachDirection
  generatedAt: string
}

/**
 * Generate outreach pack for workforce matching using Vertex AI
 */
export async function vertexWorkforceOutreachBrain(
  input: VertexWorkforceOutreachInput
): Promise<VertexWorkforceOutreachOutput> {
  const { clinicJob, candidateProfile, direction, tone = 'professional', fitMetadata } = input

  try {
    // Build the prompt for Vertex AI
    const promptInput: WorkforceOutreachInput = {
      direction,
      clinicJob: {
        clinicName: clinicJob.clinicName,
        clinicWebsite: clinicJob.clinicWebsite,
        location: clinicJob.location,
        jobTitle: clinicJob.jobTitle,
        roleType: clinicJob.roleType as any,
        employmentType: clinicJob.employmentType as any,
        serviceLines: clinicJob.serviceLine ? [clinicJob.serviceLine] : [],
        summary: clinicJob.summary,
        hiringUrgencySignal: 'medium', // Could be enriched from job posting
      },
      candidateProfile: {
        displayName: candidateProfile.displayName,
        roleType: candidateProfile.roleType as any,
        yearsExperience: candidateProfile.yearsExperience,
        primarySkills: candidateProfile.primarySkills,
        preferredShifts: candidateProfile.preferredShifts,
        preferredRegions: candidateProfile.preferredRegions,
        serviceLineInterest: candidateProfile.serviceLineInterest,
        summary: candidateProfile.summary,
      },
      fitMetadata,
      tone,
    }

    const prompt = buildWorkforceOutreachPrompt(promptInput)

    // In production, call Vertex AI here
    // For now, use template-based fallback that follows the same structure
    // const vertexResponse = await callVertexAI(prompt)
    // const parsed = parseWorkforceOutreachResponse(vertexResponse)

    // Fallback to template-based generation (matches Vertex AI output structure)
    if (direction === 'TO_CLINIC') {
      // Outreach to clinic about the candidate
      const serviceLineText = clinicJob.serviceLine ? ` for ${clinicJob.serviceLine}` : ''
      const employmentTypeText = clinicJob.employmentType === 'TEMP' ? 'temporary' : 
                                  clinicJob.employmentType === 'PER_DIEM' ? 'per diem' : 
                                  'contract'
      
      const pack: WorkforceOutreachPack = {
        emailSubject: `Staffing support${serviceLineText ? ` for your ${clinicJob.serviceLine}` : ''} in ${clinicJob.location.city}`,
        emailBody: `Hi ${clinicJob.clinicName} Team,

I saw you're hiring for a ${clinicJob.jobTitle} position${serviceLineText} in ${clinicJob.location.city}, ${clinicJob.location.state}.

We work with men's health and performance clinics to match them with pre-screened clinical staff. We have a ${candidateProfile.roleType} candidate who aligns with your needs:

• ${candidateProfile.yearsExperience} years of experience
• Relevant skills: ${candidateProfile.primarySkills.slice(0, 3).join(', ')}
• Available for ${employmentTypeText} assignments
• Preferred shifts: ${candidateProfile.preferredShifts.join(', ')}

${candidateProfile.summary ? `${candidateProfile.summary}\n\n` : ''}If you're open, I can send over 1–2 profiles and walk through a simple process to fill your upcoming shifts. Would a brief call this week work?

Best regards,
Novalyte Workforce Exchange`,
        dmScript: `Hi ${clinicJob.clinicName}! We have a ${candidateProfile.roleType} with ${candidateProfile.yearsExperience} years experience who matches your ${clinicJob.jobTitle} opening${serviceLineText}. Open to a quick chat?`,
        callOpener: `Thanks for taking a minute — I saw you're hiring ${employmentTypeText} ${clinicJob.jobTitle.toLowerCase()}${serviceLineText} in ${clinicJob.location.city}, and we've been matching clinics like yours with ${candidateProfile.roleType}s who have relevant experience and can flex into your shift patterns. Would it be okay if I share how we approach that in a very simple way?`,
        angleSummary: `You're hiring ${employmentTypeText} ${clinicJob.jobTitle.toLowerCase()}${serviceLineText} in ${clinicJob.location.city}; Novalyte can bring pre-screened talent that matches your shifts and service lines.`,
        warningsOrCaveats: fitMetadata?.shiftCompatibility === 'partial' 
          ? 'Shift compatibility is partial; confirm exact shift requirements match candidate preferences.' 
          : fitMetadata?.serviceLineAlignment === 'partial' 
          ? 'Service line alignment is partial; verify candidate\'s specific experience matches clinic needs.' 
          : clinicJob.hiringUrgencySignal === 'high' 
          ? 'Clinic seems at high urgency, keep tone confident but not pushy.' 
          : '',
      }

      return {
        pack,
        direction,
        generatedAt: new Date().toISOString(),
      }
    } else {
      // Outreach to candidate about the job
      const employmentTypeText = clinicJob.employmentType === 'TEMP' ? 'temporary' : 
                                  clinicJob.employmentType === 'PER_DIEM' ? 'per diem' : 
                                  'contract'
      const serviceLineText = clinicJob.serviceLine ? ` (${clinicJob.serviceLine})` : ''
      const experienceText = candidateProfile.yearsExperience ? ` with ${candidateProfile.yearsExperience} years of experience` : ''
      
      const pack: WorkforceOutreachPack = {
        emailSubject: `${employmentTypeText.charAt(0).toUpperCase() + employmentTypeText.slice(1)} ${clinicJob.jobTitle}${serviceLineText} in ${clinicJob.location.city}`,
        emailBody: `Hi ${candidateProfile.displayName},

I work with men's health and performance clinics, and based on your background${experienceText}${candidateProfile.serviceLineInterest && candidateProfile.serviceLineInterest.length > 0 ? ` and interest in ${candidateProfile.serviceLineInterest.join(', ')}` : ''}, I think there's an opportunity that could fit you well.

${clinicJob.clinicName} in ${clinicJob.location.city}, ${clinicJob.location.state} is hiring for a ${clinicJob.jobTitle}${serviceLineText} position. ${clinicJob.summary ? `${clinicJob.summary}\n\n` : ''}This aligns with your experience in ${candidateProfile.primarySkills.slice(0, 2).join(' and ')}${candidateProfile.preferredShifts && candidateProfile.preferredShifts.length > 0 ? ` and your preference for ${candidateProfile.preferredShifts.join(', ')} shifts` : ''}.

If you're open, I can share details on the clinic, shift mix, and compensation structure so you can see if it fits what you're looking for. Would a brief call or message work?

Best regards,
Novalyte Workforce Exchange`,
        dmScript: `Hi ${candidateProfile.displayName}! We have a ${employmentTypeText} ${clinicJob.jobTitle}${serviceLineText} opportunity at ${clinicJob.clinicName} in ${clinicJob.location.city} that matches your profile${experienceText}. Interested in hearing more?`,
        callOpener: `Thanks for jumping on — I work with men's health and performance clinics, and based on your background${experienceText}${candidateProfile.serviceLineInterest && candidateProfile.serviceLineInterest.length > 0 ? ` in ${candidateProfile.serviceLineInterest.join(', ')}` : ''}${candidateProfile.preferredShifts && candidateProfile.preferredShifts.length > 0 ? ` and your preference for ${candidateProfile.preferredShifts.join(', ')} shifts` : ''}, I think there are a couple of roles that could fit you well. Would it be alright if I give you a quick overview and you can tell me what does or doesn't fit?`,
        angleSummary: `${candidateProfile.serviceLineInterest && candidateProfile.serviceLineInterest.length > 0 ? `Your ${candidateProfile.serviceLineInterest.join('/')} experience` : 'Your experience'}${candidateProfile.preferredShifts && candidateProfile.preferredShifts.length > 0 ? ` plus preference for ${candidateProfile.preferredShifts.join(', ')}` : ''} makes you a strong fit for a clinic actively${serviceLineText ? ` adding ${clinicJob.serviceLine} programs` : ' seeking clinical staff'}.`,
        warningsOrCaveats: fitMetadata?.shiftCompatibility === 'partial' ? 'Shift compatibility is partial; confirm exact shift requirements with candidate.' : 
                            fitMetadata?.serviceLineAlignment === 'partial' ? 'Service line alignment is partial; verify candidate\'s specific experience matches clinic needs.' : 
                            candidateProfile.preferredRegions && candidateProfile.preferredRegions.length > 0 && !candidateProfile.preferredRegions.some(r => r.toLowerCase().includes(clinicJob.location.state.toLowerCase())) ? `Candidate's preferred region only partially matches; confirm location flexibility.` : '',
      }

      return {
        pack,
        direction,
        generatedAt: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error('Error generating workforce outreach:', error)
    // Return fallback pack
    const fallbackPack: WorkforceOutreachPack = {
      emailSubject: direction === 'TO_CLINIC' 
        ? `Candidate Available for ${clinicJob.jobTitle}`
        : `Job Opportunity: ${clinicJob.jobTitle}`,
      emailBody: 'Please contact us for more information.',
      dmScript: 'Interested in learning more?',
      callOpener: 'Hi, I have an opportunity to discuss.',
    }

    return {
      pack: fallbackPack,
      direction,
      generatedAt: new Date().toISOString(),
    }
  }
}

