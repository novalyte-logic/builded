import { NextRequest, NextResponse } from 'next/server'
import { getLeadById } from '@/app/api/admin/leads/data'
import { callGemini } from '@/lib/vertex-ai/service'
import { LeadAIReasoning } from '@/lib/types/leads'

interface LeadAIReasoningResponse {
  reasoning: LeadAIReasoning;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const lead = getLeadById(id)

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const systemPrompt = `You are an AI lead qualification analyst for Novalyte, a men’s health platform. Your job is to estimate how likely this lead is to convert within the given time horizon and explain your reasoning clearly. Use only the provided data—do not invent external facts.`

    const userPrompt = `
      Analyze the following lead and provide a detailed reasoning analysis.

      Lead Data:
      - ID: ${lead.id}
      - Type: ${lead.type}
      - Priority: ${lead.priority}
      - Status: ${lead.status}
      - Origin: ${lead.origin}
      - Region: ${lead.region || 'Unknown'}
      - Service Line: ${lead.serviceLine || 'Unknown'}
      - Attribution Channel: ${lead.attribution?.channel || 'Unknown'}
      - Attribution Campaign: ${lead.attribution?.campaign || 'Unknown'}
      - Created At: ${lead.createdAt}
      - AI Insight Summary: ${lead.aiInsight?.summary || 'N/A'}

      Respond in a strict JSON format matching the 'LeadAIReasoning' interface:
      {
        "leadId": "${lead.id}",
        "conversionProbability": <float between 0 and 1>,
        "horizonDays": <integer>,
        "confidence": <float between 0 and 1>,
        "rationale": "<string>",
        "keySignals": ["<string>"],
        "riskFactors": ["<string>"],
        "recommendedActions": ["<string>"]
      }
    `

    const result = await callGemini(systemPrompt, userPrompt, 'json')

    // Validate and sanitize the response from Vertex AI
    const conversionProbability = Math.max(0, Math.min(1, result.conversionProbability || 0))
    const horizonDays = Math.max(7, Math.min(90, result.horizonDays || 30))
    const confidence = Math.max(0, Math.min(1, result.confidence || 0))
    const rationale = result.rationale || 'No rationale provided.'
    const keySignals = result.keySignals || []
    const riskFactors = result.riskFactors || []
    const recommendedActions = result.recommendedActions || []

    const reasoning: LeadAIReasoning = {
      leadId: id,
      conversionProbability,
      horizonDays,
      confidence,
      rationale,
      keySignals,
      riskFactors,
      recommendedActions,
    }

    return NextResponse.json<LeadAIReasoningResponse>({
      reasoning,
    })
  } catch (error) {
    console.error(`AI reasoning failed for lead ${id}:`, error)
    return NextResponse.json(
      { error: 'AI reasoning failed. Please try again later.' },
      { status: 500 }
    )
  }
}
