/**
 * MCP Tool: vertex_workforce_brain
 * 
 * Combine all MCP outputs to determine:
 * - Opportunity score
 * - Which clinics are easiest to close
 * - Which nurses are best matches
 * - First outreach script to clinics
 * - First DM to nurses offering shifts
 */

import { VertexAI } from '@google-cloud/vertexai'
import { ClinicStaffingNeed } from './scan-clinic-staffing-needs'
import { TempShiftListing } from './scrape-temp-shift-listings'
import { HealthWorkforceData } from './query-bigquery-healthworkforce'
import { SocialStaffingSignal } from './extract-social-staffing-signals'

export interface WorkforceBrainInput {
  staffingNeeds?: ClinicStaffingNeed[]
  tempShifts?: TempShiftListing[]
  workforceData?: HealthWorkforceData[]
  socialSignals?: SocialStaffingSignal[]
  region?: string
  serviceLine?: string
}

export interface ClinicOpportunity {
  clinicName: string
  opportunityScore: number // 0-100
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
  closingEase: 'easy' | 'medium' | 'hard'
  reasoning: string
  outreachScript: {
    email?: {
      subjectLine: string
      body: string
    }
    linkedInDM?: string
    callOpener?: string
  }
  recommendedOffer: string
}

export interface NurseMatch {
  nurseIdentifier: string // e.g., "RN in Dallas, TX" or platform username
  matchScore: number // 0-100
  source: string // e.g., 'temp_shift', 'social_signal'
  location: {
    city: string
    state: string
  }
  credentials: string[]
  availability?: string
  dmScript: string
  estimatedHourlyRate?: {
    min: number
    max: number
  }
}

export interface WorkforceBrainOutput {
  timestamp: string
  region?: string
  serviceLine?: string
  clinicOpportunities: ClinicOpportunity[]
  nurseMatches: NurseMatch[]
  summary: {
    totalOpportunities: number
    easyCloses: number
    highValueMatches: number
    avgOpportunityScore: number
  }
  strategicRecommendations: string[]
}

const DEFAULT_NOVALYTE_POSITIONING = `Novalyte™ AI Workforce Exchange connects healthcare practitioners with men's health clinics for PRN, locum, and contract opportunities. We specialize in TRT, GLP-1 weight loss, and IV therapy clinics. Our platform provides verified practitioners, flexible scheduling, and competitive rates.`

/**
 * Generate comprehensive workforce intelligence using Vertex AI
 */
export async function vertexWorkforceBrain(
  input: WorkforceBrainInput
): Promise<WorkforceBrainOutput> {
  const { staffingNeeds, tempShifts, workforceData, socialSignals, region, serviceLine } = input

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
    const systemPrompt = `You are an expert workforce intelligence strategist for Novalyte™ AI Workforce Exchange, a platform connecting healthcare practitioners with men's health clinics.

Your mission: Analyze staffing needs, temp shifts, workforce data, and social signals to identify:
1. Which clinics are easiest to close (highest opportunity score)
2. Which nurses/practitioners are best matches for available shifts
3. Personalized outreach scripts for clinics
4. Personalized DM scripts for nurses offering shifts

You will receive:
1. Clinic staffing needs (from job boards)
2. Temp shift listings (from marketplaces)
3. Workforce supply/demand data (from BigQuery)
4. Social media signals (nurses available, clinics hiring)

Your output MUST be valid JSON with this exact structure:
{
  "clinicOpportunities": [
    {
      "clinicName": "string",
      "opportunityScore": 0-100,
      "urgencyLevel": "critical" | "high" | "medium" | "low",
      "closingEase": "easy" | "medium" | "hard",
      "reasoning": "1-2 sentences explaining why this is a good opportunity",
      "outreachScript": {
        "email": {
          "subjectLine": "string",
          "body": "string (4-6 paragraphs, 200-300 words)"
        },
        "linkedInDM": "string (2-3 sentences)",
        "callOpener": "string (1-2 sentences)"
      },
      "recommendedOffer": "string (e.g., 'PRN shifts', 'Locum coverage', 'Full-time placement')"
    }
  ],
  "nurseMatches": [
    {
      "nurseIdentifier": "string (e.g., 'RN in Dallas, TX' or platform username)",
      "matchScore": 0-100,
      "source": "string",
      "location": { "city": "string", "state": "string" },
      "credentials": ["string"],
      "availability": "string (optional)",
      "dmScript": "string (2-3 sentences, personal and direct)",
      "estimatedHourlyRate": { "min": number, "max": number }
    }
  ],
  "strategicRecommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}

CRITICAL GUIDELINES:
- Opportunity score: High = urgent need + competitive pay + good location. Medium = some signals. Low = weak signals.
- Closing ease: Easy = urgent + no competition. Medium = some urgency. Hard = stable or competitive.
- Outreach scripts: Be specific, reference their actual need, position Novalyte as solution.
- Nurse DMs: Personal, direct, reference their availability/location, offer specific opportunity.
- Do NOT invent private data. Base everything on provided inputs only.

REVENUE FOCUS:
- This is about closing clinic partnerships and filling shifts
- Emphasize speed, quality practitioners, flexible scheduling
- Position Novalyte as the fastest way to fill staffing gaps`

    // Build user prompt with all data
    const userPrompt = `Region: ${region || 'Not specified'}
Service Line: ${serviceLine || 'Not specified'}

${staffingNeeds && staffingNeeds.length > 0 ? `
Clinic Staffing Needs (${staffingNeeds.length} found):
${staffingNeeds.map((need, idx) => `
${idx + 1}. ${need.clinicName} (${need.location.city}, ${need.location.state})
   - Role: ${need.role}
   - Urgency: ${need.urgencyLevel}
   - Service Lines: ${need.serviceLines.join(', ')}
   - Salary: ${need.salarySignals.range || 'Not disclosed'}
   - Source: ${need.source}
   - Posted: ${need.postedDate ? new Date(need.postedDate).toLocaleDateString() : 'Unknown'}
`).join('')}
` : 'No clinic staffing needs data provided.'}

${tempShifts && tempShifts.length > 0 ? `
Temp Shift Listings (${tempShifts.length} found):
${tempShifts.slice(0, 10).map((shift, idx) => `
${idx + 1}. ${shift.platform} - ${shift.shiftType}
   - Location: ${shift.location.city}, ${shift.location.state}
   - Rate: $${shift.hourlyRate.min}-${shift.hourlyRate.max}/hour
   - Clinic: ${shift.clinicName || 'Not specified'}
   - Credentials: ${shift.credentialReqs.join(', ')}
   - Start: ${new Date(shift.shiftDetails.startDate).toLocaleDateString()}
`).join('')}
` : 'No temp shift listings provided.'}

${workforceData && workforceData.length > 0 ? `
Workforce Supply/Demand Data:
${workforceData.map((data, idx) => `
${idx + 1}. ${data.region}
   - Supply/Demand Index: ${data.supplyDemandIndex}/100 (higher = more shortage)
   - Projected Shortages: ${data.projectedShortages.length} roles
   - Growth Rates: ${data.roleGrowthRate.map(r => `${r.role}: ${r.growthRate}% (${r.trend})`).join(', ')}
`).join('')}
` : 'No workforce data provided.'}

${socialSignals && socialSignals.length > 0 ? `
Social Media Signals (${socialSignals.length} found):
${socialSignals.slice(0, 10).map((signal, idx) => `
${idx + 1}. ${signal.signalType} (${signal.source})
   - ${signal.clinic ? `Clinic: ${signal.clinic}` : ''}
   - ${signal.role ? `Role: ${signal.role}` : ''}
   - Location: ${signal.location ? `${signal.location.city}, ${signal.location.state}` : 'Not specified'}
   - Credibility: ${signal.credibilityScore}/100
   - Content: "${signal.postContent.substring(0, 100)}..."
`).join('')}
` : 'No social signals provided.'}

Novalyte Positioning:
${DEFAULT_NOVALYTE_POSITIONING}

Generate the complete workforce intelligence analysis in the required JSON format.`

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
    const parsed = JSON.parse(responseText) as {
      clinicOpportunities: ClinicOpportunity[]
      nurseMatches: NurseMatch[]
      strategicRecommendations: string[]
    }

    // Validate and ensure required fields
    const clinicOpportunities: ClinicOpportunity[] = (parsed.clinicOpportunities || []).map(opp => ({
      clinicName: opp.clinicName || 'Unknown Clinic',
      opportunityScore: Math.max(0, Math.min(100, opp.opportunityScore || 50)),
      urgencyLevel: opp.urgencyLevel || 'medium',
      closingEase: opp.closingEase || 'medium',
      reasoning: opp.reasoning || 'Opportunity identified based on available data.',
      outreachScript: {
        email: opp.outreachScript?.email || {
          subjectLine: `Staffing Solution for ${opp.clinicName}`,
          body: `Hi,\n\nI noticed ${opp.clinicName} is hiring. Novalyte™ AI Workforce Exchange can help you fill positions quickly with verified practitioners.\n\nWould you be open to a brief conversation?\n\nBest regards,\nNovalyte™ AI Team`,
        },
        linkedInDM: opp.outreachScript?.linkedInDM || `Hi! I noticed ${opp.clinicName} is hiring. We help clinics fill staffing gaps quickly. Open to a quick chat?`,
        callOpener: opp.outreachScript?.callOpener || `Hi, this is [Name] from Novalyte™ AI. I noticed ${opp.clinicName} is hiring ${opp.clinicName.includes('IV') ? 'IV techs' : 'nurses'}. We can help fill those positions. Do you have 2 minutes?`,
      },
      recommendedOffer: opp.recommendedOffer || 'PRN shifts',
    }))

    const nurseMatches: NurseMatch[] = (parsed.nurseMatches || []).map(match => ({
      nurseIdentifier: match.nurseIdentifier || 'Unknown',
      matchScore: Math.max(0, Math.min(100, match.matchScore || 50)),
      source: match.source || 'unknown',
      location: match.location || { city: 'Unknown', state: 'Unknown' },
      credentials: match.credentials || [],
      availability: match.availability,
      dmScript: match.dmScript || `Hi! I saw you're available for shifts. We have opportunities in your area. Interested?`,
      estimatedHourlyRate: match.estimatedHourlyRate,
    }))

    const strategicRecommendations = parsed.strategicRecommendations || [
      'Focus on clinics with critical urgency levels',
      'Prioritize regions with high supply/demand index',
      'Target nurses with matching credentials and availability',
    ]

    // Calculate summary
    const easyCloses = clinicOpportunities.filter(o => o.closingEase === 'easy').length
    const highValueMatches = nurseMatches.filter(m => m.matchScore >= 75).length
    const avgOpportunityScore = clinicOpportunities.length > 0
      ? Math.round(clinicOpportunities.reduce((sum, o) => sum + o.opportunityScore, 0) / clinicOpportunities.length)
      : 0

    return {
      timestamp: new Date().toISOString(),
      region,
      serviceLine,
      clinicOpportunities: clinicOpportunities.sort((a, b) => b.opportunityScore - a.opportunityScore),
      nurseMatches: nurseMatches.sort((a, b) => b.matchScore - a.matchScore),
      summary: {
        totalOpportunities: clinicOpportunities.length,
        easyCloses,
        highValueMatches,
        avgOpportunityScore,
      },
      strategicRecommendations,
    }
  } catch (error) {
    console.error('Error generating workforce brain analysis:', error)
    
    // Fallback to rule-based analysis
    return generateFallbackWorkforceBrain(input)
  }
}

/**
 * Generate fallback workforce brain using rule-based logic
 */
function generateFallbackWorkforceBrain(input: WorkforceBrainInput): WorkforceBrainOutput {
  const { staffingNeeds, tempShifts, workforceData, socialSignals, region, serviceLine } = input

  // Analyze clinic opportunities
  const clinicOpportunities: ClinicOpportunity[] = (staffingNeeds || []).map(need => {
    let opportunityScore = 50
    let closingEase: 'easy' | 'medium' | 'hard' = 'medium'

    if (need.urgencyLevel === 'critical') {
      opportunityScore += 30
      closingEase = 'easy'
    } else if (need.urgencyLevel === 'high') {
      opportunityScore += 20
      closingEase = 'medium'
    }

    if (need.salarySignals.competitive) {
      opportunityScore += 10
    }

    if (workforceData && workforceData.length > 0) {
      const regionData = workforceData.find(d => d.region === need.location.state)
      if (regionData && regionData.supplyDemandIndex >= 80) {
        opportunityScore += 10
      }
    }

    opportunityScore = Math.min(100, opportunityScore)

    return {
      clinicName: need.clinicName,
      opportunityScore,
      urgencyLevel: need.urgencyLevel,
      closingEase,
      reasoning: `${need.clinicName} has ${need.urgencyLevel} urgency for ${need.role} in ${need.location.city}, ${need.location.state}. ${need.salarySignals.competitive ? 'Competitive pay signals budget available.' : ''}`,
      outreachScript: {
        email: {
          subjectLine: `Staffing Solution: ${need.clinicName} × Novalyte™ AI`,
          body: `Hi there,\n\nI noticed ${need.clinicName} is hiring ${need.role} for ${need.serviceLines.join(' and ')} services in ${need.location.city}, ${need.location.state}.\n\nNovalyte™ AI Workforce Exchange can help you fill this position quickly with verified, qualified practitioners. We specialize in men's health clinics and understand the unique staffing needs for TRT, IV therapy, and weight loss services.\n\n${need.urgencyLevel === 'critical' ? 'Given the urgent need, we can provide immediate coverage while you find a permanent solution.' : 'We offer flexible PRN, locum, and contract options to match your needs.'}\n\nWould you be open to a brief 15-minute conversation?\n\nBest regards,\nNovalyte™ AI Workforce Exchange`,
        },
        linkedInDM: `Hi! I noticed ${need.clinicName} is hiring ${need.role} in ${need.location.city}. We help clinics fill staffing gaps quickly with verified practitioners. Open to a quick chat?`,
        callOpener: `Hi, this is [Name] from Novalyte™ AI Workforce Exchange. I noticed ${need.clinicName} is hiring ${need.role} for ${need.serviceLines[0]} services. We can help fill that position. Do you have 2 minutes?`,
      },
      recommendedOffer: need.urgencyLevel === 'critical' ? 'Immediate PRN coverage' : 'PRN shifts',
    }
  })

  // Analyze nurse matches from temp shifts and social signals
  const nurseMatches: NurseMatch[] = []

  // From temp shifts
  if (tempShifts) {
    tempShifts.forEach(shift => {
      nurseMatches.push({
        nurseIdentifier: `${shift.credentialReqs.join(', ')} in ${shift.location.city}, ${shift.location.state}`,
        matchScore: 70 + Math.floor(Math.random() * 20), // 70-90
        source: shift.platform,
        location: shift.location,
        credentials: shift.credentialReqs,
        availability: shift.shiftDetails.schedule,
        dmScript: `Hi! I saw ${shift.platform} has ${shift.shiftType} shifts available in ${shift.location.city}. We have additional opportunities at men's health clinics in your area. Interested in learning more?`,
        estimatedHourlyRate: shift.hourlyRate,
      })
    })
  }

  // From social signals
  if (socialSignals) {
    socialSignals
      .filter(s => s.signalType === 'nurse_available' || s.signalType === 'shift_available')
      .forEach(signal => {
        nurseMatches.push({
          nurseIdentifier: signal.role 
            ? `${signal.role} in ${signal.location?.city || 'Unknown'}, ${signal.location?.state || 'Unknown'}`
            : `Practitioner from ${signal.source}`,
          matchScore: signal.credibilityScore,
          source: signal.source,
          location: signal.location || { city: 'Unknown', state: 'Unknown' },
          credentials: signal.role ? [signal.role] : [],
          dmScript: `Hi! I saw your post about availability. We have ${signal.location ? `${signal.location.city}` : 'local'} men's health clinic opportunities. Flexible scheduling, competitive rates. Interested?`,
        })
      })
  }

  const strategicRecommendations: string[] = []
  if (workforceData && workforceData.some(d => d.supplyDemandIndex >= 80)) {
    strategicRecommendations.push('Focus on regions with supply/demand index ≥80 - highest shortage areas')
  }
  if (staffingNeeds && staffingNeeds.filter(n => n.urgencyLevel === 'critical').length > 0) {
    strategicRecommendations.push('Prioritize clinics with critical urgency - easiest to close')
  }
  if (nurseMatches.length > 0) {
    strategicRecommendations.push(`Engage ${nurseMatches.length} identified practitioners with personalized outreach`)
  }

  const easyCloses = clinicOpportunities.filter(o => o.closingEase === 'easy').length
  const highValueMatches = nurseMatches.filter(m => m.matchScore >= 75).length
  const avgOpportunityScore = clinicOpportunities.length > 0
    ? Math.round(clinicOpportunities.reduce((sum, o) => sum + o.opportunityScore, 0) / clinicOpportunities.length)
    : 0

  return {
    timestamp: new Date().toISOString(),
    region,
    serviceLine,
    clinicOpportunities: clinicOpportunities.sort((a, b) => b.opportunityScore - a.opportunityScore),
    nurseMatches: nurseMatches.sort((a, b) => b.matchScore - a.matchScore),
    summary: {
      totalOpportunities: clinicOpportunities.length,
      easyCloses,
      highValueMatches,
      avgOpportunityScore,
    },
    strategicRecommendations: strategicRecommendations.length > 0 
      ? strategicRecommendations 
      : ['Analyze staffing needs and workforce data to identify opportunities'],
  }
}

/**
 * MCP Tool metadata
 */
export const vertexWorkforceBrainToolMetadata = {
  name: 'vertex_workforce_brain',
  description: 'Combine all workforce MCP outputs to generate opportunity scores, clinic outreach scripts, and nurse match recommendations',
  inputSchema: {
    type: 'object',
    properties: {
      staffingNeeds: {
        type: 'array',
        description: 'Clinic staffing needs from scan_clinic_staffing_needs',
      },
      tempShifts: {
        type: 'array',
        description: 'Temp shift listings from scrape_temp_shift_listings',
      },
      workforceData: {
        type: 'array',
        description: 'Workforce data from query_bigquery_healthworkforce',
      },
      socialSignals: {
        type: 'array',
        description: 'Social signals from extract_social_staffing_signals',
      },
      region: {
        type: 'string',
        description: 'Region (optional)',
      },
      serviceLine: {
        type: 'string',
        description: 'Service line (optional)',
      },
    },
  },
}

