import { NextRequest, NextResponse } from 'next/server'

import { getLeadById } from '@/app/api/admin/leads/data'
import { callGemini } from '@/lib/vertex-ai/service'
import type { LeadAIReasoning } from '@/lib/types/leads'

interface LeadAIThoughtsResponse {
  thoughts: LeadAIReasoning
}

function sanitizeJsonText(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  return JSON.parse(cleaned)
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const lead = getLeadById(id)

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const activityLines =
      lead.activity?.map(
        (evt) =>
          `- [${evt.timestamp}] ${evt.type} (${evt.actor}): ${evt.label}${
            evt.details ? ` — ${evt.details}` : ''
          }`
      ) || []

    const instructionBlock = `
You are an AI lead qualification analyst for Novalyte™ (men's health platform).
Goal: predict conversion probability within a time horizon, provide confidence, rationale, key signals, risk factors, and recommended next actions.
Response: strict JSON ONLY, no markdown, no extra text, no trailing commas, no additional fields.`

    const dataBlock = `
lead_id: ${lead.id}
type: ${lead.type}
status: ${lead.status}
priority: ${lead.priority}
created_at: ${lead.createdAt}
service_line: ${lead.serviceLine || 'Unknown'}
region: ${lead.region || 'Unknown'}

attribution:
  channel: ${lead.attribution?.channel || 'Unknown'}
  campaign: ${lead.attribution?.campaign || 'Unknown'}
  ad_group: ${lead.attribution?.adGroup || 'Unknown'}
  geo: ${lead.attribution?.geo || 'Unknown'}

assessment:
  status: ${lead.assessment?.status || 'none'}
  primary_goals: ${(lead.assessment?.primaryGoals || []).join(', ') || 'None'}
  key_flags: ${(lead.assessment?.keyFlags || []).join(', ') || 'None'}

existing_ai_insight:
  summary: ${lead.aiInsight?.summary || 'None'}
  risk: ${lead.aiInsight?.riskLevel || 'None'}
  score: ${lead.aiInsight?.qualificationScore ?? 'None'}
  next_step: ${lead.aiInsight?.recommendedNextStep || 'None'}

recent_activity:
${activityLines.join('\n') || 'No recent activity'}

Return JSON only in this exact shape:
{
  "leadId": "${lead.id}",
  "conversionProbability": 0.0-1.0,
  "horizonDays": integer (suggest 30 or 60 based on data),
  "confidence": 0.0-1.0,
  "rationale": "1-3 paragraphs",
  "keySignals": ["string", "string"],
  "riskFactors": ["string", "string"],
  "recommendedActions": ["string", "string"]
}`

    const resultText = await callGemini(instructionBlock, dataBlock, 'text')

    let parsed: any
    try {
      parsed = sanitizeJsonText(resultText)
    } catch (parseErr) {
      console.error('AI thoughts parse error:', parseErr, 'raw:', resultText)
      throw new Error('parse_failed')
    }

    const reasoning: LeadAIReasoning = {
      leadId: lead.id,
      conversionProbability: Math.max(
        0,
        Math.min(1, Number(parsed.conversionProbability ?? parsed.conversion_probability) || 0)
      ),
      horizonDays: Math.min(
        120,
        Math.max(
          1,
          Number(parsed.horizonDays ?? parsed.horizon_days ?? 30)
        )
      ),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      rationale: parsed.rationale || 'No rationale provided.',
      keySignals: Array.isArray(parsed.keySignals ?? parsed.key_signals)
        ? parsed.keySignals ?? parsed.key_signals
        : [],
      riskFactors: Array.isArray(parsed.riskFactors ?? parsed.risk_factors)
        ? parsed.riskFactors ?? parsed.risk_factors
        : [],
      recommendedActions: Array.isArray(parsed.recommendedActions ?? parsed.recommended_actions)
        ? parsed.recommendedActions ?? parsed.recommended_actions
        : [],
    }

    return NextResponse.json<LeadAIThoughtsResponse>({ thoughts: reasoning })
  } catch (error) {
    console.error(`AI thoughts failed for lead ${id}:`, error)
    return NextResponse.json(
      { error: 'AI thoughts unavailable. Please try again.' },
      { status: 500 }
    )
  }
}
