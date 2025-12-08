/**
 * Lead Full Context Service
 * 
 * Aggregates all related data for a lead:
 * - LeadRecord
 * - PatientAssessment
 * - MessageThreads + Messages
 * - AI-generated summary
 */

import { LeadRecord, PatientAssessment } from '@/lib/types/assessment'
import { MessageThread, ThreadWithMessages } from '@/lib/types/message'
import { getMockAssessments, getMockLeads } from './assessment-sync'
import { getMockMessageThreads } from './message-sync'

export interface LeadFullContext {
  lead: LeadRecord
  assessments: PatientAssessment[]
  threads: ThreadWithMessages[]
  aiSummary: string | null
}

/**
 * Get Full Context for a Lead
 * 
 * Aggregates all related data from assessments, messages, and generates AI summary.
 * Used in: Lead Detail View
 */
export async function getLeadFullContext(leadId: string): Promise<LeadFullContext> {
  // TODO: Replace with actual database queries
  
  // Mock data structure - replace with actual DB queries
  // const lead = await db.leads.findById(leadId)
  // const assessments = await db.assessments.find({ user_id: lead.user_id }) // or by assessment_id if linked
  // const threads = await db.messageThreads.find({ related_lead_id: leadId })
  // For each thread: const messages = await db.messages.find({ thread_id: thread.id })

  // For now, return empty structure
  const lead: LeadRecord = {
    id: leadId,
    assessment_id: null,
    user_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    lead_type: 'patient',
    origin: 'assessment',
    status: 'new',
    priority: 'medium',
    tags: [],
    notes: null,
    assigned_to: null,
    converted_at: null,
  }

  const assessments: PatientAssessment[] = []
  const threads: ThreadWithMessages[] = []

  // Generate AI summary
  const aiSummary = await generateLeadAISummary(lead, assessments, threads)

  return {
    lead,
    assessments,
    threads,
    aiSummary,
  }
}

/**
 * Generate AI Summary for Lead Context
 * 
 * Creates a narrative summary of the lead based on all available data.
 */
async function generateLeadAISummary(
  lead: LeadRecord,
  assessments: PatientAssessment[],
  threads: ThreadWithMessages[]
): Promise<string | null> {
  try {
    // Import Vertex AI service
    const { callGemini } = await import('@/lib/vertex-ai/service')

    const systemPrompt = `You are a lead intelligence analyst for Novalyte™ AI men's health platform.
Generate a concise, actionable summary of this lead in 2-3 sentences.
Focus on: intent level, key characteristics, treatment path, geographic location, and actionable insights.`

    const assessmentSummary = assessments.length > 0
      ? assessments.map((a) => {
          return `- Assessment: ${a.path}, Status: ${a.status}, Predicted LTV: ${a.predicted_LTV ? `$${a.predicted_LTV}` : 'N/A'}`
        }).join('\n')
      : 'No assessments'

    const threadSummary = threads.length > 0
      ? `- ${threads.length} message thread(s): ${threads.map((t) => t.channel).join(', ')}`
      : 'No messages'

    const userPrompt = `Lead Context:

Lead ID: ${lead.id}
Type: ${lead.lead_type}
Origin: ${lead.origin}
Status: ${lead.status}
Priority: ${lead.priority}
Created: ${lead.created_at}

Assessments:
${assessmentSummary}

Messages:
${threadSummary}

Generate a concise summary highlighting key insights and next actions.`

    // For now, return a placeholder - in production, call Gemini
    // const summary = await callGemini(systemPrompt, userPrompt, 'text')
    
    // Placeholder summary
    return `High-intent ${lead.lead_type} lead from ${lead.origin}. ${assessments.length > 0 ? `Completed ${assessments[0].path} assessment with ${assessments[0].predicted_LTV ? `predicted LTV of $${assessments[0].predicted_LTV}` : 'pending qualification'}.` : ''} ${threads.length > 0 ? `${threads.length} active conversation(s).` : ''} Priority: ${lead.priority}.`
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return null
  }
}

