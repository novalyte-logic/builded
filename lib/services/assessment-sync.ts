/**
 * Assessment Sync Service
 * 
 * Handles synchronization between frontend assessments and admin dashboard.
 * Integrates with AI scoring for qualification and lead creation.
 */

import { PatientAssessment, LeadRecord, AssessmentStatus, RiskLevel, FlowType } from '@/lib/types/assessment'
import { scoreLeadQuality } from '@/lib/vertex-ai/service'

/**
 * AI Summary from Gemini
 * 
 * Structure returned by Gemini AI analysis
 */
interface GeminiAISummary {
  summary: string // Plain English summary
  keySymptoms: string[]
  riskFactors: string[]
  redFlags: string[]
  recommendedPath: FlowType
  riskLevel: RiskLevel
  predictedLTVBand: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high'
  highlights: string[]
}

/**
 * Process Assessment Completion
 * 
 * Called when a patient completes an assessment.
 * Steps:
 * 1. Update assessment status to "completed"
 * 2. Call Gemini AI to analyze and summarize
 * 3. Determine qualification status based on AI output
 * 4. Create/Update LeadRecord
 */
export async function processAssessmentCompletion(
  assessmentId: string,
  assessmentData: Partial<PatientAssessment>
): Promise<{
  assessment: PatientAssessment
  lead: LeadRecord | null
}> {
  // TODO: Fetch assessment from database
  // const assessment = await db.assessments.findById(assessmentId)

  // For now, assume we're creating/updating
  const assessment: PatientAssessment = {
    id: assessmentId,
    user_id: assessmentData.user_id || null,
    created_at: assessmentData.created_at || new Date(),
    updated_at: new Date(),
    status: 'completed',
    flow_type: assessmentData.flow_type || assessmentData.path || 'GENERAL',
    path: assessmentData.flow_type || assessmentData.path || 'GENERAL', // Legacy alias
    answers_json: assessmentData.answers_json || assessmentData.answers || {},
    ai_summary_json: null,
    risk_level: null,
    predicted_ltv_band: null,
    city: assessmentData.city || null,
    country: assessmentData.country || null,
    acquisition_channel: assessmentData.acquisition_channel || null,
  }

  // Step 2: Call Gemini AI for analysis
  const aiSummary = await callGeminiForAssessmentAnalysis(assessment)

  // Step 3: Update assessment with AI results
  assessment.ai_summary_json = {
    summary: aiSummary.summary,
    keySymptoms: aiSummary.keySymptoms,
    riskFactors: aiSummary.riskFactors,
    redFlags: aiSummary.redFlags,
    recommendedPath: aiSummary.recommendedPath,
    urgency: aiSummary.urgency,
    highlights: aiSummary.highlights,
  }
  assessment.risk_level = aiSummary.riskLevel
  assessment.predicted_ltv_band = aiSummary.predictedLTVBand

  // Determine qualification status based on AI output
  let qualifiedStatus: AssessmentStatus = 'needs_review'
  if (aiSummary.riskLevel === 'high' || aiSummary.predictedLTVBand === 'high') {
    qualifiedStatus = 'qualified'
  } else if (aiSummary.riskLevel === 'low' && aiSummary.predictedLTVBand === 'low') {
    qualifiedStatus = 'unqualified'
  } else {
    qualifiedStatus = 'needs_review'
  }

  assessment.status = qualifiedStatus

  // Step 4: Create/Update LeadRecord
  let lead: LeadRecord | null = null

  // Check if lead already exists for this assessment
  // TODO: Check database for existing lead with assessment_id
  // const existingLead = await db.leads.find({ assessment_id: assessmentId })

  // If qualified or needs_review, create/update lead
  if (qualifiedStatus === 'qualified' || qualifiedStatus === 'needs_review') {
    // Map risk_level + LTV band to priority
    const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'high_high': 'high',
      'high_medium': 'high',
      'moderate_high': 'high',
      'moderate_medium': 'medium',
      'moderate_low': 'medium',
      'low_medium': 'medium',
      'low_low': 'low',
    }
    const priorityKey = `${aiSummary.riskLevel}_${aiSummary.predictedLTVBand}` as keyof typeof priorityMap
    const priority = priorityMap[priorityKey] || 'medium'

    lead = {
      id: crypto.randomUUID(), // Or use existing lead ID if updating
      assessment_id: assessmentId,
      user_id: assessment.user_id,
      created_at: new Date(),
      updated_at: new Date(),
      lead_type: 'patient',
      origin: 'assessment',
      status: qualifiedStatus === 'qualified' ? 'new' : 'in_review',
      priority,
      tags: [assessment.flow_type, aiSummary.predictedLTVBand, aiSummary.riskLevel],
      notes: aiSummary.summary,
      assigned_to: null,
      converted_at: null,
    }

    // TODO: Save lead to database (create or update)
    // await db.leads.upsert(lead)
  }

  // TODO: Save updated assessment to database
  // await db.assessments.update(assessmentId, assessment)

  return {
    assessment,
    lead,
  }
}

/**
 * Call Gemini AI for Assessment Analysis
 * 
 * Analyzes assessment answers and returns structured summary
 */
async function callGeminiForAssessmentAnalysis(
  assessment: PatientAssessment
): Promise<GeminiAISummary> {
  // Import Vertex AI service function
  const { callGemini } = await import('@/lib/vertex-ai/service')
  
  // Note: callGemini is not exported, so we'll use a placeholder approach
  // In production, this should call the actual Vertex AI service
  // For now, return a structured mock response based on assessment data

  const systemPrompt = `You are an AI medical assessment analyst for Novalyte™ AI men's health platform.
Analyze the assessment answers and provide a structured summary.
Return JSON with: summary (plain English paragraph), keySymptoms (array), riskFactors (array), 
redFlags (array), recommendedPath (TRT/GLP1/PEPTIDES/RECOVERY/LONGEVITY/GENERAL), riskLevel (low/moderate/high),
predictedLTVBand (low/medium/high), urgency (low/medium/high), highlights (array of key points).`

  const userPrompt = `Analyze this assessment:

Flow Type: ${assessment.flow_type}
Answers: ${JSON.stringify(assessment.answers_json, null, 2)}
Location: ${assessment.city || 'Unknown'}, ${assessment.country || 'Unknown'}
Channel: ${assessment.acquisition_channel || 'Unknown'}

Provide comprehensive analysis including summary, symptoms, risk factors, red flags, and recommendations.`

  // TODO: Replace with actual Vertex AI call
  // For now, use placeholder logic that simulates AI analysis
  // In production, uncomment and use:
  // const result = await callGemini(systemPrompt, userPrompt, 'json')
  
  // Placeholder: Generate mock analysis based on flow type
  const mockResult: any = {
    summary: `Patient completed ${assessment.flow_type} assessment. Review recommended for clinical evaluation.`,
    keySymptoms: ['Symptom A', 'Symptom B'],
    riskFactors: ['Risk factor 1'],
    redFlags: assessment.flow_type === 'TRT' ? ['Low testosterone indicators'] : [],
    recommendedPath: assessment.flow_type,
    riskLevel: 'moderate' as RiskLevel,
    predictedLTVBand: 'medium' as 'low' | 'medium' | 'high',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    highlights: [
      `Completed ${assessment.flow_type} assessment flow`,
      assessment.city ? `Located in ${assessment.city}` : 'Location unknown',
    ],
  }

  // Return structured AI summary
  return {
    summary: mockResult.summary,
    keySymptoms: mockResult.keySymptoms,
    riskFactors: mockResult.riskFactors,
    redFlags: mockResult.redFlags,
    recommendedPath: (mockResult.recommendedPath || assessment.flow_type) as FlowType,
    riskLevel: mockResult.riskLevel,
    predictedLTVBand: mockResult.predictedLTVBand,
    urgency: mockResult.urgency,
    highlights: mockResult.highlights,
  }
}

/**
 * Sync Assessment Progress
 * 
 * Called when patient progresses through assessment steps (in-progress state).
 * No lead creation, just progress tracking.
 */
export async function syncAssessmentProgress(
  assessmentId: string,
  progressData: {
    flow_type?: FlowType
    answers_json?: Record<string, any>
    answers?: Record<string, any> // Legacy alias
    currentStep?: number
    totalSteps?: number
    city?: string | null
    country?: string | null
    acquisition_channel?: string | null
  }
): Promise<PatientAssessment> {
  // TODO: Fetch assessment from database
  // const assessment = await db.assessments.findById(assessmentId)

  const assessment: PatientAssessment = {
    id: assessmentId,
    user_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    status: 'in_progress',
    flow_type: progressData.flow_type || 'GENERAL',
    path: progressData.flow_type || 'GENERAL', // Legacy alias
    answers_json: progressData.answers_json || progressData.answers || {},
    ai_summary_json: null,
    risk_level: null,
    predicted_ltv_band: null,
    city: progressData.city || null,
    country: progressData.country || null,
    acquisition_channel: progressData.acquisition_channel || null,
    metadata: {
      currentStep: progressData.currentStep,
      totalSteps: progressData.totalSteps,
    },
  }

  // TODO: Update assessment in database (upsert)
  // await db.assessments.upsert(assessment)

  return assessment
}

/**
 * Create Lead from Assessment (Manual)
 * 
 * Allows admin to manually create a lead from an unqualified assessment.
 */
export async function createLeadFromAssessment(
  assessmentId: string,
  adminNotes?: string
): Promise<LeadRecord> {
  // TODO: Fetch assessment
  // const assessment = await db.assessments.findById(assessmentId)

  const lead: LeadRecord = {
    id: crypto.randomUUID(),
    assessment_id: assessmentId,
    user_id: null,
    created_at: new Date(),
    updated_at: new Date(),
    lead_type: 'patient',
    origin: 'assessment',
    status: 'new',
    priority: 'medium',
    tags: [],
    notes: adminNotes || null,
    assigned_to: null,
    converted_at: null,
  }

  // TODO: Save lead to database
  // await db.leads.create(lead)

  return lead
}

