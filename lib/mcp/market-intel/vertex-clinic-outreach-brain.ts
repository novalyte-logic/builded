/**
 * MCP Tool: vertex_clinic_outreach_brain
 * 
 * Generate outreach strategy and sample message for clinic partnerships
 */

import { VertexAI } from '@google-cloud/vertexai'
import { AdsActivityResult } from './ads-intel-clinic-activity'

export interface ClinicProfile {
  name: string
  location: {
    city?: string
    state: string
  }
  serviceLines: string[]
  priceBand: string // e.g., "$", "$$", "$$$", "$$$$"
  leadStatus: 'actively_accepting' | 'at_capacity' | 'paused'
}

export interface MarketDemand {
  region: string
  serviceLine: string
  demandIndex: number
  trend: 'RISING' | 'STABLE' | 'FALLING'
}

export interface OutreachStrategy {
  fitAssessment: string
  whyNow: string
  outreachSteps: string[]
  firstMessage: {
    channel: 'email' | 'linkedin' | 'generic'
    subjectLine: string
    body: string
  }
  alternateOpeners: string[]
}

export interface OutreachBrainInput {
  clinicProfile: ClinicProfile
  adsActivity: AdsActivityResult
  marketDemand?: MarketDemand
  novalytePositioning?: string
}

const DEFAULT_NOVALYTE_POSITIONING = `Novalyte™ AI is a leading men's health marketplace and lead generation platform. We connect high-intent patients with verified clinics through AI-powered assessments, intelligent routing, and data-driven optimization. We help clinics reduce wasted ad spend, improve lead quality, and scale patient acquisition efficiently.`

/**
 * Generate outreach strategy and message using Vertex AI
 */
export async function generateOutreachStrategy(input: OutreachBrainInput): Promise<OutreachStrategy> {
  const { clinicProfile, adsActivity, marketDemand, novalytePositioning = DEFAULT_NOVALYTE_POSITIONING } = input

  try {
    // Initialize Vertex AI client
    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID || '',
      location: process.env.GCP_REGION || 'us-central1',
    })

    const model = 'gemini-1.5-flash'
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
    })

    // Build system prompt
    const systemPrompt = `You are an expert B2B growth strategist for Novalyte™ AI, a leading men's health marketplace and lead generation platform.

Your job: Help Novalyte win this clinic as a partner by creating a respectful, professional, and data-driven outreach strategy.

You will receive:
1. Clinic profile (name, location, service lines, price band, lead status)
2. Their current ads activity (platforms, regions, creative themes, offers)
3. Market demand data for their region/service line (optional)
4. Novalyte's positioning

Your task:
1. Assess whether this is a good clinic to approach NOW (fit assessment)
2. Explain WHY NOW (cite specific signals: ads activity, demand, capacity)
3. Propose a simple, actionable outreach strategy (3-5 steps)
4. Draft a first outreach message that is:
   - Professional and respectful
   - References their current ads/positioning (if available)
   - Clearly explains Novalyte's value proposition
   - Includes a specific, low-friction next step
   - Avoids being pushy or salesy
5. Provide 2-3 alternate opening lines

CRITICAL CONSTRAINTS:
- Do NOT invent private data about the clinic
- Base all reasoning on the provided profile + ads summaries only
- If ads data is unavailable, focus on market demand and clinic profile
- Keep messages concise (150-250 words for email body)
- Use a consultative, partnership-oriented tone
- Never make claims about their current performance unless stated in the data

Your response MUST be valid JSON with this exact structure:
{
  "fitAssessment": "Short assessment (1-2 sentences)",
  "whyNow": "Why approach now (1-2 sentences citing specific signals)",
  "outreachSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "firstMessage": {
    "channel": "email" | "linkedin" | "generic",
    "subjectLine": "Subject line for email (or empty if not email)",
    "body": "Message body (multi-line, professional, concise)"
  },
  "alternateOpeners": [
    "Alternative opening line 1",
    "Alternative opening line 2",
    "Alternative opening line 3"
  ]
}`

    // Build user prompt with data
    const userPrompt = `Clinic Profile:
- Name: ${clinicProfile.name}
- Location: ${clinicProfile.location.city ? `${clinicProfile.location.city}, ` : ''}${clinicProfile.location.state}
- Service Lines: ${clinicProfile.serviceLines.join(', ')}
- Price Band: ${clinicProfile.priceBand}
- Lead Status: ${clinicProfile.leadStatus}

Ads Activity:
${adsActivity.isRunningAds ? `
- Running ads: Yes
- Platforms: ${adsActivity.platforms.map(p => p.platform).join(', ')}
- Regions targeted: ${adsActivity.regionsTargeted.map(r => r.region).join(', ')}
- Creative themes: ${adsActivity.creativesSummary.map(c => c.theme).join('; ')}
- Offers: ${adsActivity.creativesSummary.map(c => c.offerType).join('; ')}
- CTAs: ${adsActivity.creativesSummary.flatMap(c => c.ctaPatterns).join(', ')}
` : `
- Running ads: No active campaigns detected
`}

${marketDemand ? `
Market Demand:
- Region: ${marketDemand.region}
- Service Line: ${marketDemand.serviceLine}
- Demand Index: ${marketDemand.demandIndex}/100
- Trend: ${marketDemand.trend}
` : ''}

Novalyte Positioning:
${novalytePositioning}

Generate the outreach strategy and first message in the required JSON format.`

    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    })

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const parsed = JSON.parse(responseText) as OutreachStrategy

    // Validate and ensure required fields
    return {
      fitAssessment: parsed.fitAssessment || 'Clinic profile received. Assess fit based on service lines and capacity.',
      whyNow: parsed.whyNow || 'Market demand and clinic capacity suggest this is a viable partnership opportunity.',
      outreachSteps: parsed.outreachSteps || [
        '1) Research clinic website and confirm service offerings',
        '2) Connect with decision-maker on LinkedIn',
        '3) Send personalized outreach message',
      ],
      firstMessage: {
        channel: parsed.firstMessage?.channel || 'email',
        subjectLine: parsed.firstMessage?.subjectLine || `Partnership opportunity: ${clinicProfile.name} × Novalyte™ AI`,
        body: parsed.firstMessage?.body || `Hi,\n\nI noticed ${clinicProfile.name} and wanted to introduce Novalyte™ AI. We help men's health clinics reduce wasted ad spend and improve lead quality through AI-powered patient routing.\n\nWould you be open to a brief conversation?\n\nBest regards`,
      },
      alternateOpeners: parsed.alternateOpeners || [
        'I noticed your clinic focuses on ' + clinicProfile.serviceLines[0] + '...',
        'We help clinics like yours scale patient acquisition...',
        'Your region shows strong demand for ' + clinicProfile.serviceLines[0] + '...',
      ],
    }
  } catch (error) {
    console.error('Error generating outreach strategy:', error)
    
    // Fallback to rule-based strategy
    return generateFallbackStrategy(input)
  }
}

/**
 * Generate fallback strategy using rule-based logic
 */
function generateFallbackStrategy(input: OutreachBrainInput): OutreachStrategy {
  const { clinicProfile, adsActivity, marketDemand } = input

  // Assess fit
  let fitAssessment = 'Moderate-priority clinic to approach.'
  if (clinicProfile.leadStatus === 'actively_accepting' && marketDemand && marketDemand.demandIndex > 75) {
    fitAssessment = 'High-priority clinic to approach in the next 7 days.'
  } else if (clinicProfile.leadStatus === 'at_capacity') {
    fitAssessment = 'Clinic is at capacity. Consider for future partnership when capacity opens.'
  }

  // Why now
  let whyNow = 'Clinic is actively accepting patients.'
  if (adsActivity.isRunningAds) {
    whyNow = `They're spending on ${clinicProfile.serviceLines[0]} ads in ${clinicProfile.location.state}, and demand data suggests strong market opportunity.`
  } else if (marketDemand) {
    whyNow = `High demand (${marketDemand.demandIndex}/100) in ${marketDemand.region} with ${marketDemand.trend.toLowerCase()} trend. Great opportunity to be their growth partner.`
  }

  // Outreach steps
  const outreachSteps = [
    `1) Visit ${clinicProfile.name}'s website and confirm their primary offer and positioning.`,
    '2) Connect with their marketing director or founder on LinkedIn.',
    '3) Send a short email referencing their current campaigns (if any) and how Novalyte can reduce wasted spend.',
    '4) Follow up after 3-5 days if no response.',
  ]

  // First message
  const serviceLineText = clinicProfile.serviceLines[0] || 'men\'s health services'
  const locationText = clinicProfile.location.city 
    ? `${clinicProfile.location.city}, ${clinicProfile.location.state}`
    : clinicProfile.location.state

  const subjectLine = `Partnership opportunity: ${clinicProfile.name} × Novalyte™ AI`
  
  const body = `Hi there,

I noticed ${clinicProfile.name} focuses on ${serviceLineText} in ${locationText}, and wanted to introduce Novalyte™ AI.

We help men's health clinics reduce wasted ad spend and improve lead quality through AI-powered patient routing. Our platform connects high-intent patients with verified clinics like yours.

${adsActivity.isRunningAds 
  ? `I see you're running ads on ${adsActivity.platforms.map(p => p.platform).join(' and ')}. We can help optimize your funnel and reduce cost per lead.`
  : marketDemand && marketDemand.demandIndex > 75
  ? `Your region shows strong demand for ${serviceLineText} (${marketDemand.demandIndex}/100). We can help you capture more of that demand efficiently.`
  : 'We work with clinics like yours to scale patient acquisition while maintaining quality.'
}

Would you be open to a brief 15-minute conversation to see if there's a fit?

Best regards,
Novalyte™ AI Team`

  return {
    fitAssessment,
    whyNow,
    outreachSteps,
    firstMessage: {
      channel: 'email',
      subjectLine,
      body,
    },
    alternateOpeners: [
      `I noticed ${clinicProfile.name} focuses on ${serviceLineText}...`,
      `We help clinics in ${locationText} scale patient acquisition...`,
      `Your region shows strong demand for ${serviceLineText}...`,
    ],
  }
}

/**
 * MCP Tool metadata
 */
export const outreachBrainToolMetadata = {
  name: 'vertex_clinic_outreach_brain',
  description: 'Generate outreach strategy and sample message for clinic partnerships',
  inputSchema: {
    type: 'object',
    properties: {
      clinicProfile: {
        type: 'object',
        description: 'Clinic profile with name, location, service lines, price band, lead status',
      },
      adsActivity: {
        type: 'object',
        description: 'Ads activity data from ads_intel_clinic_activity',
      },
      marketDemand: {
        type: 'object',
        description: 'Market demand snapshot (optional)',
      },
      novalytePositioning: {
        type: 'string',
        description: 'Novalyte positioning text (optional)',
      },
    },
    required: ['clinicProfile', 'adsActivity'],
  },
}

