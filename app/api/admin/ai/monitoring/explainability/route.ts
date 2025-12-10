import { NextResponse } from 'next/server'
import { ExplainabilityPayload } from '@/lib/types/ai-monitoring'

const payload: ExplainabilityPayload = {
  reasoningTree: {
    patientAssessmentDecisionPct: 87,
    symptomAnalysisPct: 92,
    fatigueScorePct: 85,
    libidoScorePct: 78,
    riskEvaluationPct: 81,
  },
  topInfluencingFactors: [
    { rank: 1, label: 'Age Factor', value: '45 years', contributionPct: 28, sign: 'positive' },
    { rank: 2, label: 'Symptom Severity', value: 'Moderate-High', contributionPct: 24, sign: 'positive' },
    { rank: 3, label: 'Testosterone Level', value: 'Low', contributionPct: 19, sign: 'negative' },
    { rank: 4, label: 'BMI Index', value: '32.1', contributionPct: 15, sign: 'positive' },
    { rank: 5, label: 'Activity Level', value: 'Sedentary', contributionPct: 12, sign: 'positive' },
    { rank: 6, label: 'Sleep Quality', value: 'Poor', contributionPct: 8, sign: 'negative' },
  ],
  decisionBreakdown: {
    finalDecision: 'High Risk Detected',
    safetyGatesActivated: '2 of 5',
  },
  whatIfProjections: [
    { scenarioLabel: 'If age = 35 (vs 45)', riskScore: 0.72, deltaPct: -15 },
    { scenarioLabel: 'If testosterone normal', riskScore: 0.61, deltaPct: -26 },
    { scenarioLabel: 'If BMI = 25 (vs 32)', riskScore: 0.79, deltaPct: -8 },
  ],
  confidenceDistribution: [
    { rangeLabel: '0-20%', count: 12 },
    { rangeLabel: '20-40%', count: 45 },
    { rangeLabel: '40-60%', count: 234 },
    { rangeLabel: '60-80%', count: 1247 },
    { rangeLabel: '80-90%', count: 3421 },
    { rangeLabel: '90-100%', count: 8924 },
  ],
}

export async function GET() {
  return NextResponse.json(payload)
}

