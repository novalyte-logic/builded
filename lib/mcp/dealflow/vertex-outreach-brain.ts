/**
 * MCP Tool: vertex_outreach_brain
 * 
 * Generate comprehensive outreach strategy using Vertex AI
 */

import { VertexAI } from '@google-cloud/vertexai'
import { ClinicBasic } from './find-mens-clinics-by-region'
import { EnrichedClinicProfile } from './enrich-clinic-profile'
import { AdsPresenceSnapshot } from './ads-presence-snapshot'

export type PriorityScore = 'high' | 'medium' | 'low'

export interface RegionalDemandHint {
  region: string
  serviceLine: string
  demandIndex: number // 0-100
  trend: 'RISING' | 'STABLE' | 'FALLING'
}

export interface OutreachBrainInput {
  clinic: ClinicBasic
  enrichedProfile?: EnrichedClinicProfile
  adsSnapshot: AdsPresenceSnapshot
  demandHints?: RegionalDemandHint[]
}

export interface OutreachPack {
  priorityScore: PriorityScore
  priorityReason: string
  whyNow: string
  talkingPoints: string[] // Key points to mention in outreach
  firstEmail: {
    subjectLine: string
    body: string
  }
  firstLinkedInDM: string
  callScriptOpener: string
  estimatedValue: string // e.g., "High - $50K+ annual potential"
  nextSteps: string[] // Recommended follow-up actions
}

export interface OutreachBrainOutput {
  pack: OutreachPack
  confidence: number // 0-1
  generatedAt: string // ISO timestamp
}

const DEFAULT_NOVALYTE_POSITIONING = `Novalyte™ AI is a leading men's health marketplace and lead generation platform. We connect high-intent patients with verified clinics through AI-powered assessments, intelligent routing, and data-driven optimization. We help clinics reduce wasted ad spend, improve lead quality, and scale patient acquisition efficiently. Our platform is specifically designed for TRT, GLP-1 weight loss, and IV therapy clinics.`

/**
 * Generate comprehensive outreach pack using Vertex AI
 */
export async function generateOutreachPack(input: OutreachBrainInput): Promise<OutreachBrainOutput> {
  const { clinic, enrichedProfile, adsSnapshot, demandHints } = input

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
    const systemPrompt = `You are an expert B2B revenue strategist for Novalyte™ AI, a leading men's health marketplace and lead generation platform.

Your mission: Generate a complete, revenue-focused outreach pack that helps Novalyte close real clinic partnerships.

You will receive:
1. Clinic basic info (name, location, website, service lines)
2. Enriched profile (services, pricing, CTAs, funnel style) - optional
3. Ads snapshot (are they advertising, platforms, angles, offers, CTAs)
4. Regional demand hints (market opportunity data) - optional

Your output MUST be valid JSON with this exact structure:
{
  "priorityScore": "high" | "medium" | "low",
  "priorityReason": "1-2 sentence explanation of priority level",
  "whyNow": "2-3 sentences explaining why to approach NOW (cite specific signals)",
  "talkingPoints": [
    "Point 1: Reference their service line/region/ads",
    "Point 2: Novalyte value prop tailored to their gaps",
    "Point 3: Specific opportunity or pain point",
    "Point 4: Low-friction next step"
  ],
  "firstEmail": {
    "subjectLine": "Compelling subject line",
    "body": "Professional email body, 4-6 paragraphs, 200-300 words"
  },
  "firstLinkedInDM": "Short, punchy LinkedIn message, 2-3 sentences max",
  "callScriptOpener": "Opening line for a cold call, 1-2 sentences",
  "estimatedValue": "High/Medium/Low - $XK+ annual potential (be realistic)",
  "nextSteps": [
    "Step 1: Research action",
    "Step 2: Outreach action",
    "Step 3: Follow-up action"
  ]
}

CRITICAL GUIDELINES:
- Priority scoring: High = actively advertising + high demand + good fit. Medium = some signals. Low = weak signals.
- Why now: Cite SPECIFIC signals (ads activity, demand trends, funnel gaps, capacity)
- Talking points: Be specific, not generic. Reference their actual services/ads/region.
- Email: Professional but conversational. Reference their clinic name, service line, region. Include specific Novalyte value prop.
- LinkedIn DM: Very short, personal, direct. Reference something specific about them.
- Call script: Confident opener that gets attention. Reference a specific pain point or opportunity.
- Estimated value: Be realistic. High = $50K+ annual, Medium = $20-50K, Low = <$20K
- Do NOT invent private data. Base everything on provided inputs only.

REVENUE FOCUS:
- This is about closing deals, not just outreach
- Emphasize ROI, cost reduction, lead quality
- Position Novalyte as growth infrastructure, not just lead gen
- Make it easy for them to say yes (low-friction CTAs)`

    // Build user prompt
    const userPrompt = `Clinic:
- Name: ${clinic.name}
- Location: ${clinic.location.city}, ${clinic.location.state}
- Website: ${clinic.website || 'Not provided'}
- Service Lines: ${clinic.serviceLines.join(', ')}
- Category: ${clinic.category}

${enrichedProfile ? `
Enriched Profile:
- Services: ${enrichedProfile.servicesOffered.join(', ')}
- Pricing: ${enrichedProfile.pricingSignals.priceRange || 'Not disclosed'}
- Free Consult: ${enrichedProfile.pricingSignals.freeConsultOffered ? 'Yes' : 'No'}
- CTAs: ${enrichedProfile.ctas.join(', ')}
- Telehealth: ${enrichedProfile.telehealthAvailable ? 'Yes' : 'No'}
- Funnel Style: ${enrichedProfile.funnelStyle}
- Key Messaging: ${enrichedProfile.keyMessaging.join(', ')}
` : ''}

Ads Snapshot:
- Running Ads: ${adsSnapshot.isRunningAds ? 'Yes' : 'No'}
${adsSnapshot.isRunningAds ? `
- Platforms: ${adsSnapshot.platforms.map(p => p.platform).join(', ')}
- Creative Angles: ${adsSnapshot.creativeAngles.join(', ')}
- Offers: ${adsSnapshot.offers.join(', ')}
- CTAs: ${adsSnapshot.ctaPatterns.join(', ')}
- Estimated Spend: ${adsSnapshot.estimatedSpendBand}
` : ''}

${demandHints && demandHints.length > 0 ? `
Regional Demand:
${demandHints.map(h => `- ${h.serviceLine} in ${h.region}: ${h.demandIndex}/100 (${h.trend})`).join('\n')}
` : ''}

Novalyte Positioning:
${DEFAULT_NOVALYTE_POSITIONING}

Generate the complete outreach pack in the required JSON format.`

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
    const parsed = JSON.parse(responseText) as OutreachPack

    // Validate and ensure required fields
    const pack: OutreachPack = {
      priorityScore: parsed.priorityScore || 'medium',
      priorityReason: parsed.priorityReason || 'Clinic profile received. Assess based on service lines and location.',
      whyNow: parsed.whyNow || 'Market opportunity and clinic profile suggest viable partnership.',
      talkingPoints: parsed.talkingPoints || [
        `Reference ${clinic.name}'s focus on ${clinic.serviceLines[0]}`,
        'Novalyte helps clinics reduce wasted ad spend',
        'AI-powered patient routing improves lead quality',
      ],
      firstEmail: {
        subjectLine: parsed.firstEmail?.subjectLine || `Partnership opportunity: ${clinic.name} × Novalyte™ AI`,
        body: parsed.firstEmail?.body || `Hi,\n\nI noticed ${clinic.name} and wanted to introduce Novalyte™ AI.\n\nWe help men's health clinics reduce wasted ad spend and improve lead quality.\n\nWould you be open to a brief conversation?\n\nBest regards`,
      },
      firstLinkedInDM: parsed.firstLinkedInDM || `Hi! I noticed ${clinic.name} focuses on ${clinic.serviceLines[0]}. We help clinics like yours scale patient acquisition efficiently. Open to a quick chat?`,
      callScriptOpener: parsed.callScriptOpener || `Hi, this is [Name] from Novalyte™ AI. I noticed ${clinic.name} focuses on ${clinic.serviceLines[0]} in ${clinic.location.city}. We help clinics reduce ad waste and improve lead quality. Do you have 2 minutes?`,
      estimatedValue: parsed.estimatedValue || 'Medium - $25-50K annual potential',
      nextSteps: parsed.nextSteps || [
        'Research their website and current positioning',
        'Connect with decision-maker on LinkedIn',
        'Send personalized email with outreach pack',
      ],
    }

    return {
      pack,
      confidence: 0.8,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error generating outreach pack:', error)
    
    // Fallback to rule-based pack
    return generateFallbackPack(input)
  }
}

/**
 * Generate fallback outreach pack using rule-based logic
 */
function generateFallbackPack(input: OutreachBrainInput): OutreachBrainOutput {
  const { clinic, adsSnapshot, demandHints } = input

  // Calculate priority score
  let priorityScore: PriorityScore = 'medium'
  let priorityReason = 'Moderate partnership potential based on available data.'
  let estimatedValue = 'Medium - $25-50K annual potential'

  if (adsSnapshot.isRunningAds && adsSnapshot.estimatedSpendBand === 'high') {
    priorityScore = 'high'
    priorityReason = 'High ad spend detected. Strong partnership potential with optimization opportunity.'
    estimatedValue = 'High - $50K+ annual potential'
  } else if (!adsSnapshot.isRunningAds && demandHints && demandHints.some(h => h.demandIndex > 75)) {
    priorityScore = 'high'
    priorityReason = 'No ads detected but high regional demand. Perfect opportunity to be their growth partner.'
    estimatedValue = 'High - $50K+ annual potential'
  } else if (!adsSnapshot.isRunningAds) {
    priorityScore = 'low'
    priorityReason = 'No ad activity detected. Lower immediate partnership potential.'
    estimatedValue = 'Low - <$20K annual potential'
  }

  // Why now
  let whyNow = 'Clinic profile suggests viable partnership opportunity.'
  if (adsSnapshot.isRunningAds) {
    whyNow = `They're actively advertising on ${adsSnapshot.platforms.map(p => p.platform).join(' and ')}. Novalyte can help optimize their funnel and reduce cost per lead.`
  } else if (demandHints && demandHints.length > 0) {
    const highDemand = demandHints.find(h => h.demandIndex > 75 && h.trend === 'RISING')
    if (highDemand) {
      whyNow = `High demand (${highDemand.demandIndex}/100) for ${highDemand.serviceLine} in ${highDemand.region} with rising trend. Perfect time to introduce Novalyte.`
    }
  }

  // Talking points
  const talkingPoints = [
    `${clinic.name} focuses on ${clinic.serviceLines.join(' and ')} in ${clinic.location.city}, ${clinic.location.state}`,
    adsSnapshot.isRunningAds
      ? `They're running ads on ${adsSnapshot.platforms.map(p => p.platform).join(' and ')}. Novalyte can help optimize spend and improve ROI.`
      : 'Novalyte can help them scale patient acquisition efficiently.',
    'AI-powered patient routing ensures high-quality, pre-qualified leads',
    'Low-friction partnership with clear ROI metrics',
  ]

  // Email
  const emailSubject = `Partnership opportunity: ${clinic.name} × Novalyte™ AI`
  const emailBody = `Hi there,

I noticed ${clinic.name} focuses on ${clinic.serviceLines[0]} in ${clinic.location.city}, ${clinic.location.state}, and wanted to introduce Novalyte™ AI.

We help men's health clinics reduce wasted ad spend and improve lead quality through AI-powered patient routing. Our platform connects high-intent patients with verified clinics like yours.

${adsSnapshot.isRunningAds
  ? `I see you're running ads on ${adsSnapshot.platforms.map(p => p.platform).join(' and ')}. We can help optimize your funnel and reduce cost per lead.`
  : demandHints && demandHints.some(h => h.demandIndex > 75)
  ? `Your region shows strong demand for ${clinic.serviceLines[0]}. We can help you capture more of that demand efficiently.`
  : 'We work with clinics like yours to scale patient acquisition while maintaining quality.'}

Would you be open to a brief 15-minute conversation to see if there's a fit?

Best regards,
Novalyte™ AI Team`

  // LinkedIn DM
  const linkedInDM = `Hi! I noticed ${clinic.name} focuses on ${clinic.serviceLines[0]} in ${clinic.location.city}. We help clinics like yours scale patient acquisition efficiently. Open to a quick chat?`

  // Call script opener
  const callOpener = `Hi, this is [Name] from Novalyte™ AI. I noticed ${clinic.name} focuses on ${clinic.serviceLines[0]} in ${clinic.location.city}. We help clinics reduce ad waste and improve lead quality. Do you have 2 minutes?`

  // Next steps
  const nextSteps = [
    `Research ${clinic.name}'s website and current positioning`,
    'Connect with decision-maker on LinkedIn',
    'Send personalized email with outreach pack',
    'Follow up after 3-5 days if no response',
  ]

  return {
    pack: {
      priorityScore,
      priorityReason,
      whyNow,
      talkingPoints,
      firstEmail: {
        subjectLine: emailSubject,
        body: emailBody,
      },
      firstLinkedInDM: linkedInDM,
      callScriptOpener: callOpener,
      estimatedValue,
      nextSteps,
    },
    confidence: 0.7,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * MCP Tool metadata
 */
export const outreachBrainToolMetadata = {
  name: 'vertex_outreach_brain',
  description: 'Generate comprehensive outreach strategy with email, LinkedIn DM, and call script',
  inputSchema: {
    type: 'object',
    properties: {
      clinic: {
        type: 'object',
        description: 'Clinic basic info',
      },
      enrichedProfile: {
        type: 'object',
        description: 'Enriched clinic profile (optional)',
      },
      adsSnapshot: {
        type: 'object',
        description: 'Ads presence snapshot',
      },
      demandHints: {
        type: 'array',
        description: 'Regional demand hints (optional)',
      },
    },
    required: ['clinic', 'adsSnapshot'],
  },
}

