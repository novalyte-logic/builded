import { NextRequest, NextResponse } from 'next/server'

import { callGemini } from '@/lib/vertex-ai/service'

interface AssessmentRecord {
  id: string
  created_at: string
  status: string
  flow_type: string
  risk_level?: string | null
  predicted_ltv_band?: string | null
  patient?: {
    age?: number
    gender?: string
    bmi?: number
    state?: string
    serviceInterest?: string
  }
  symptoms?: string[]
  goals?: string[]
  symptom_duration?: string
  symptom_severity?: string
  lifestyle?: {
    sleepQuality?: string
    activityLevel?: string
    stressLevel?: string
    substanceUse?: string[]
  }
  redFlags?: string[]
  attribution?: {
    channel?: string
    campaign?: string
    funnelPath?: string
    geo?: string
  }
  qualificationScore?: number
}

interface TriageResult {
  assessmentId: string
  clinicalRiskLevel: 'low' | 'moderate' | 'high'
  conversionPotentialLabel: 'high' | 'medium' | 'low'
  conversionProbability: number
  horizonDays: number
  confidence: number
  rationale: string
  opportunitySignals: string[]
  riskSignals: string[]
  recommendedActions: string[]
  routingRecommendation: string
}

const MOCK_ASSESSMENTS: AssessmentRecord[] = [
  {
    id: 'ASMT-889',
    created_at: '2024-05-08T14:20:00Z',
    status: 'in_progress',
    flow_type: 'TRT',
    risk_level: 'moderate',
    predicted_ltv_band: 'high',
    patient: { age: 42, gender: 'Male', bmi: 29.5, state: 'TX', serviceInterest: 'TRT' },
    symptoms: ['Low energy', 'Low libido', 'Brain fog'],
    goals: ['Increase energy', 'Improve sleep'],
    symptom_duration: '6 months',
    symptom_severity: 'moderate',
    lifestyle: { sleepQuality: 'poor', activityLevel: 'moderate', stressLevel: 'medium' },
    redFlags: ['Possible sleep apnea'],
    attribution: {
      channel: 'Meta',
      campaign: 'TRT Prospecting Q2',
      funnelPath: 'Ad → Landing → Assessment',
      geo: 'Dallas, TX',
    },
    qualificationScore: 78,
  },
  {
    id: 'ASMT-102',
    created_at: '2024-05-06T10:05:00Z',
    status: 'completed',
    flow_type: 'GLP1',
    risk_level: 'low',
    predicted_ltv_band: 'medium',
    patient: { age: 38, gender: 'Female', bmi: 31.2, state: 'AZ', serviceInterest: 'GLP-1' },
    symptoms: ['Weight gain', 'Low energy'],
    goals: ['Lose 20 lbs', 'Improve activity'],
    lifestyle: { sleepQuality: 'fair', activityLevel: 'low', stressLevel: 'medium' },
    redFlags: [],
    attribution: {
      channel: 'Google',
      campaign: 'GLP-1 Weight Loss',
      funnelPath: 'Search → Landing → Assessment',
      geo: 'Phoenix, AZ',
    },
    qualificationScore: 64,
  },
  {
    id: 'ASMT-221',
    created_at: '2024-05-03T09:15:00Z',
    status: 'qualified',
    flow_type: 'PEPTIDES',
    risk_level: 'low',
    predicted_ltv_band: 'high',
    patient: { age: 29, gender: 'Male', bmi: 24.1, state: 'FL', serviceInterest: 'Peptides' },
    symptoms: ['Recovery soreness'],
    goals: ['Faster recovery'],
    lifestyle: { sleepQuality: 'good', activityLevel: 'high', stressLevel: 'low' },
    redFlags: [],
    attribution: {
      channel: 'TikTok',
      campaign: 'Recovery peptides',
      funnelPath: 'Video → Landing → Assessment',
      geo: 'Miami, FL',
    },
    qualificationScore: 82,
  },
  {
    id: 'ASMT-305',
    created_at: '2024-05-02T16:40:00Z',
    status: 'needs_review',
    flow_type: 'RECOVERY',
    risk_level: 'high',
    predicted_ltv_band: 'low',
    patient: { age: 51, gender: 'Male', bmi: 28.4, state: 'CO', serviceInterest: 'Recovery' },
    symptoms: ['Chest discomfort', 'Shortness of breath'],
    goals: ['Improve endurance'],
    lifestyle: { sleepQuality: 'fair', activityLevel: 'moderate', stressLevel: 'medium' },
    redFlags: ['Chest discomfort on exertion'],
    attribution: {
      channel: 'Referral',
      campaign: 'Referral - Friend',
      funnelPath: 'Referral → Assessment',
      geo: 'Denver, CO',
    },
    qualificationScore: 32,
  },
  {
    id: 'ASMT-412',
    created_at: '2024-05-01T11:00:00Z',
    status: 'completed',
    flow_type: 'GENERAL',
    risk_level: 'moderate',
    predicted_ltv_band: 'medium',
    patient: { age: 35, gender: 'Male', bmi: 26.0, state: 'TX', serviceInterest: 'General' },
    symptoms: ['Poor sleep', 'Stress'],
    goals: ['Improve sleep', 'Reduce stress'],
    lifestyle: { sleepQuality: 'poor', activityLevel: 'low', stressLevel: 'high' },
    redFlags: [],
    attribution: {
      channel: 'Direct',
      campaign: 'Inbound',
      funnelPath: 'Direct → Assessment',
      geo: 'Austin, TX',
    },
    qualificationScore: 55,
  },
]

function sanitizeJsonText(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  return JSON.parse(cleaned)
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const assessment = MOCK_ASSESSMENTS.find((a) => a.id === id)
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const instructionBlock = `
You are an AI triage and lead-qualification engine for Novalyte™, a men's health platform.
Dual objective:
- Clinical triage: classify clinical risk as low / moderate / high based ONLY on provided data.
- Commercial potential: estimate conversion potential and probability to qualified patient for the indicated service line.
Constraints:
- Use ONLY the provided Data Block. Do not add external facts. No hallucinations.
- Output STRICT JSON, no markdown, no extra text, no trailing commas, no extra keys.
Schema to return:
{
  "assessmentId": "string",
  "clinicalRiskLevel": "low" | "moderate" | "high",
  "conversionPotentialLabel": "high" | "medium" | "low",
  "conversionProbability": number 0-1,
  "horizonDays": integer (1-90, suggest 30 or 60),
  "confidence": number 0-1,
  "rationale": "1-3 paragraphs explaining risk + conversion",
  "opportunitySignals": ["string"],
  "riskSignals": ["string"],
  "recommendedActions": ["string"],
  "routingRecommendation": "string"
}
Return ONLY that JSON.`

    const dataBlock = `
assessment_id: ${assessment.id}
created_at: ${assessment.created_at}
status: ${assessment.status}
flow_type: ${assessment.flow_type}
risk_level: ${assessment.risk_level || 'unknown'}
ltv_band: ${assessment.predicted_ltv_band || 'unknown'}
qualification_score: ${assessment.qualificationScore ?? 'unknown'}

patient:
  age: ${assessment.patient?.age ?? 'unknown'}
  gender: ${assessment.patient?.gender ?? 'unknown'}
  bmi: ${assessment.patient?.bmi ?? 'unknown'}
  state: ${assessment.patient?.state ?? 'unknown'}
  service_interest: ${assessment.patient?.serviceInterest ?? 'unknown'}

symptoms: ${(assessment.symptoms || []).join(', ') || 'none'}
goals: ${(assessment.goals || []).join(', ') || 'none'}
symptom_duration: ${assessment.symptom_duration || 'unknown'}
symptom_severity: ${assessment.symptom_severity || 'unknown'}

lifestyle:
  sleep_quality: ${assessment.lifestyle?.sleepQuality || 'unknown'}
  activity_level: ${assessment.lifestyle?.activityLevel || 'unknown'}
  stress_level: ${assessment.lifestyle?.stressLevel || 'unknown'}
  substance_use: ${(assessment.lifestyle?.substanceUse || []).join(', ') || 'none'}

clinical_red_flags: ${(assessment.redFlags || []).join(', ') || 'none'}

attribution:
  channel: ${assessment.attribution?.channel || 'unknown'}
  campaign: ${assessment.attribution?.campaign || 'unknown'}
  funnel: ${assessment.attribution?.funnelPath || 'unknown'}
  geo: ${assessment.attribution?.geo || 'unknown'}
`

    const vertexText = await callGemini(instructionBlock, dataBlock, 'text')

    let parsed: any
    try {
      parsed = sanitizeJsonText(vertexText)
    } catch (parseErr) {
      console.error('AI triage parse error:', parseErr, 'raw:', vertexText)
      throw new Error('parse_failed')
    }

    const clinicalRisk = (parsed.clinicalRiskLevel || '').toLowerCase()
    const conversionLabel = (parsed.conversionPotentialLabel || parsed.conversion_potential || '').toLowerCase()
    const withinRisk = ['low', 'moderate', 'high'].includes(clinicalRisk)
    const withinConversion = ['high', 'medium', 'low'].includes(conversionLabel)

    const triage: TriageResult = {
      assessmentId: assessment.id,
      clinicalRiskLevel: withinRisk ? (clinicalRisk as 'low' | 'moderate' | 'high') : 'moderate',
      conversionPotentialLabel: withinConversion ? (conversionLabel as 'high' | 'medium' | 'low') : 'medium',
      conversionProbability: Math.max(
        0,
        Math.min(1, Number(parsed.conversionProbability ?? parsed.conversion_probability) || 0)
      ),
      horizonDays: Math.min(90, Math.max(1, Number(parsed.horizonDays ?? parsed.horizon_days ?? 30))),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      rationale: parsed.rationale || 'No rationale provided.',
      opportunitySignals: Array.isArray(parsed.opportunitySignals ?? parsed.keyOpportunitySignals ?? parsed.key_opportunity_signals)
        ? (parsed.opportunitySignals ?? parsed.keyOpportunitySignals ?? parsed.key_opportunity_signals)
        : [],
      riskSignals: Array.isArray(parsed.riskSignals ?? parsed.keyRiskSignals ?? parsed.key_risk_signals)
        ? (parsed.riskSignals ?? parsed.keyRiskSignals ?? parsed.key_risk_signals)
        : [],
      recommendedActions: Array.isArray(parsed.recommendedActions ?? parsed.recommended_actions)
        ? parsed.recommendedActions ?? parsed.recommended_actions
        : [],
      routingRecommendation: parsed.routingRecommendation || 'Route to appropriate clinic for review.',
    }

    return NextResponse.json({ triage })
  } catch (error) {
    console.error(`AI triage failed for assessment ${params.id}:`, error)
    return NextResponse.json(
      { error: 'AI triage reasoning failed. Please try again later.' },
      { status: 500 }
    )
  }
}
