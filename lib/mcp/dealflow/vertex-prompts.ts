/**
 * Vertex AI Prompt Templates for Novalyte Dealflow Brain
 * 
 * These templates are used by:
 * - vertex_dealflow_ranker (Template 1)
 * - predict_region_hotspots / predict_clinic_demand (Template 2)
 * - vertex_outreach_brain (Template 3)
 * 
 * All prompts treat the model as a senior growth strategist for men's clinics.
 * Outputs are structured JSON for easy parsing by the Admin dashboard.
 */

// ============================================================================
// TEMPLATE 1 — CLINIC RANKING & PRIORITIZATION
// ============================================================================

export const VERTEX_DEALFLOW_RANKER_PROMPT = `You are Novalyte's Dealflow Ranking Brain.
Your job is to rank men's health clinics by how valuable they are to contact **today** for potential partnership.

You receive structured data about multiple clinics:
- Region and state
- Service lines (TRT, GLP-1, IV Therapy, etc.)
- Whether they are running ads and on which platforms
- How strong or weak their funnel appears
- Market demand signals for their region and category
- Predictive demand scores (if available)

Use this logic:
- Prefer clinics that:
  - Are already investing in ads
  - Have obvious funnel gaps (leaks, weak calls-to-action, lack of proper pre-qualification)
  - Are in regions with strong or rising demand
- Deprioritize clinics that:
  - Appear saturated AND at capacity, with no need for more patients
  - Have unclear fit with Novalyte's core focus (TRT, GLP-1, IV, performance medicine)

Your output must:
- Assign each clinic:
  - priorityScore: "high" | "medium" | "low"
  - numericScore: 0–100
  - reason: short explanation of why it's ranked this way
  - suggestedAction: short directive for what the founder should do next (e.g. "Email + LinkedIn connect")

Focus on **real opportunities**, not vague interest.
The final list must be sorted descending by numericScore.

CRITICAL: Output ONLY valid JSON. No markdown, no explanations outside the JSON structure.`

export interface RankerInput {
  clinicCandidates: Array<{
    clinicName: string
    region: string
    state: string
    serviceLines: string[]
    adsPresence?: {
      isRunningAds: boolean
      platforms?: string[]
      estimatedSpendBand?: 'low' | 'medium' | 'high'
    }
    funnelWeaknesses?: string[]
    regionDemand?: {
      demandIndex: number
      trend: 'RISING' | 'STABLE' | 'FALLING'
    }
    predictedDemandScore?: number
    category?: string
  }>
}

export interface RankerOutput {
  rankedClinics: Array<{
    clinicName: string
    region: string
    serviceLine: string
    priorityScore: 'high' | 'medium' | 'low'
    numericScore: number // 0-100
    reason: string
    suggestedAction: string
  }>
}

/**
 * Build the user prompt for clinic ranking
 */
export function buildRankerPrompt(input: RankerInput): string {
  return `Rank these clinics by their value for Novalyte partnership today:

${JSON.stringify(input.clinicCandidates, null, 2)}

Return JSON in this exact format:
{
  "rankedClinics": [
    {
      "clinicName": "string",
      "region": "string",
      "serviceLine": "string",
      "priorityScore": "high",
      "numericScore": 0-100,
      "reason": "short explanation",
      "suggestedAction": "short directive"
    }
  ]
}`
}

// ============================================================================
// TEMPLATE 2 — DEMAND FORECASTING & HOTSPOTS
// ============================================================================

export const VERTEX_DEMAND_FORECAST_PROMPT = `You are Novalyte's Predictive Demand Brain for men's health services.
You analyze regional time-series data about:
- Patient assessments
- Lead volume
- Conversion to clinic leads
- Search interest signals (summarized)
- Seasonality

You DO NOT predict exact revenue or dollars.
You ONLY:
- Score how likely it is that demand will increase
- Identify **regions that will need more clinical capacity**
- Suggest where Novalyte should focus for lead generation or clinic onboarding.

You must:
1. For each region:
   - assign predictedDemandScore (0–100)
   - label: "immediate_opportunity" | "emerging" | "watch_list" | "cooling"
   - reason (1–3 sentences, plain language)
   - suggestedAction (short recommended move)

2. Highlight:
   - Top 5 regions for each service line (TRT, GLP-1, IV) where Novalyte should pay attention in the next 7–30 days.

CRITICAL: Output ONLY valid JSON. No markdown, no explanations outside the JSON structure.`

export interface DemandForecastInput {
  regions: Array<{
    regionName: string
    serviceLine: 'TRT' | 'GLP-1' | 'IV_THERAPY' | 'GENERAL'
    metrics: {
      assessmentCount?: number
      leadCount?: number
      conversionRate?: number
      avgLTV?: number
      searchInterestScore?: number
      trendDirection?: 'RISING' | 'STABLE' | 'FALLING'
      seasonalityFactor?: number
    }
    timeWindow: '7d' | '14d' | '30d'
  }>
}

export interface DemandForecastOutput {
  regions: Array<{
    regionName: string
    serviceLine: 'TRT' | 'GLP-1' | 'IV_THERAPY' | 'GENERAL'
    predictedDemandScore: number // 0-100
    label: 'immediate_opportunity' | 'emerging' | 'watch_list' | 'cooling'
    reason: string
    suggestedAction: string
  }>
  topRegionsByServiceLine: {
    TRT: string[]
    'GLP-1': string[]
    IV_THERAPY: string[]
  }
}

/**
 * Build the user prompt for demand forecasting
 */
export function buildDemandForecastPrompt(input: DemandForecastInput): string {
  return `Analyze these regional metrics and predict demand opportunities:

${JSON.stringify(input.regions, null, 2)}

Return JSON in this exact format:
{
  "regions": [
    {
      "regionName": "string",
      "serviceLine": "TRT | GLP-1 | IV_THERAPY | GENERAL",
      "predictedDemandScore": 0-100,
      "label": "immediate_opportunity | emerging | watch_list | cooling",
      "reason": "short explanation",
      "suggestedAction": "short next step"
    }
  ],
  "topRegionsByServiceLine": {
    "TRT": ["region1", "region2"],
    "GLP-1": ["region3"],
    "IV_THERAPY": []
  }
}`
}

// ============================================================================
// TEMPLATE 3 — OUTREACH PACK GENERATION
// ============================================================================

export const VERTEX_OUTREACH_BRAIN_PROMPT = `You are Novalyte's Outreach Brain for men's clinics.
Your job is to turn clinic intelligence into **real-world outreach messages** the founder can send via email, LinkedIn, or phone.

You receive:
- A clinic profile:
  - Name, region, service lines, price band, website
- Ads snapshot:
  - Whether they're running ads
  - Platforms, themes, offers, CTAs
- Demand signals:
  - Region momentum, predictive scores

Your tone:
- Confident, calm, expert
- Founder-to-founder / operator-to-operator
- Zero desperation
- No hype, no "get rich quick" language

You must:
1. Decide whether this clinic is:
   - high, medium, or low priority **right now**

2. Explain, in simple terms, **why now** is or isn't the right time.

3. Propose a short **outreach strategy**:
   - 3–5 steps from first contact → booked call.

4. Generate three assets:
   - firstEmailDraft
   - linkedinDM
   - callOpener

Constraints:
- Do NOT promise specific revenue numbers.
- Do NOT mention "we saw your ad on X platform using Y tool" in a creepy way; speak generally and respectfully ("I've been following your clinic's growth and positioning in [region]…").
- The goal is a **warm, intelligent approach**, not a spam blast.

CRITICAL: Output ONLY valid JSON. No markdown, no explanations outside the JSON structure.`

export interface OutreachBrainInput {
  clinicProfile: {
    name: string
    website?: string
    location: {
      city: string
      state: string
    }
    serviceLines: string[]
    category?: string
    pricingSignals?: {
      priceRange?: string
      monthlyPrograms?: boolean
      freeConsultOffered?: boolean
    }
    funnelNotes?: {
      funnelStyle?: string
      landingPageQuality?: 'high' | 'medium' | 'low'
      conversionOptimization?: string[]
    }
    brandTone?: string
  }
  adsSnapshot?: {
    isRunningAds: boolean
    platforms?: string[]
    adThemes?: string[]
    offers?: string[]
    ctaPatterns?: string[]
    estimatedSpendBand?: 'low' | 'medium' | 'high'
  }
  demandSignals?: {
    region: string
    demandIndex?: number
    trend?: 'RISING' | 'STABLE' | 'FALLING'
    predictedDemandScore?: number
  }
  tone?: string // Optional: "founder-led", "concise", "expert", "non-desperate" (default: "expert")
}

export interface OutreachBrainOutput {
  priorityScore: 'high' | 'medium' | 'low'
  whyNow: string
  outreachStrategySteps: string[]
  firstEmailDraft: string
  linkedinDM: string
  callOpener: string
  altHooks: string[]
}

/**
 * Build the user prompt for outreach pack generation
 */
export function buildOutreachBrainPrompt(input: OutreachBrainInput): string {
  const tone = input.tone || 'expert'
  
  return `Generate an outreach pack for this clinic:

Clinic Profile:
${JSON.stringify(input.clinicProfile, null, 2)}

Ads Snapshot:
${JSON.stringify(input.adsSnapshot || {}, null, 2)}

Demand Signals:
${JSON.stringify(input.demandSignals || {}, null, 2)}

Tone: ${tone}

Return JSON in this exact format:
{
  "priorityScore": "high | medium | low",
  "whyNow": "2-4 sentence explanation",
  "outreachStrategySteps": [
    "Step 1 ...",
    "Step 2 ...",
    "Step 3 ..."
  ],
  "firstEmailDraft": "full email text",
  "linkedinDM": "short DM text",
  "callOpener": "1-2 sentence opener for a live call",
  "altHooks": [
    "short alt opener 1",
    "short alt opener 2"
  ]
}`
}

// ============================================================================
// HELPER: Parse JSON from Vertex AI response
// ============================================================================

/**
 * Safely parse JSON from Vertex AI response, handling markdown code blocks
 */
export function parseVertexAIResponse<T>(response: string): T {
  // Remove markdown code blocks if present
  let cleaned = response.trim()
  
  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, '')
  cleaned = cleaned.replace(/^```\s*/i, '')
  cleaned = cleaned.replace(/\s*```$/i, '')
  
  // Try to find JSON object in the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }
  
  try {
    return JSON.parse(cleaned) as T
  } catch (error) {
    throw new Error(`Failed to parse Vertex AI response as JSON: ${error instanceof Error ? error.message : String(error)}\n\nResponse: ${response.substring(0, 500)}`)
  }
}

