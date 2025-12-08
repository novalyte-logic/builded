# Vertex AI Prompt Templates Guide

This document describes the three Vertex AI prompt templates used by the Novalyte Dealflow Brain.

## Overview

All prompts treat the model as a **senior growth strategist for men's clinics**. They output **clear, structured JSON** for easy parsing by the Admin dashboard.

**Key Principles:**
- No guarantees (no "you will make X dollars")
- Focus on probability, prioritization, and recommended moves
- Deterministic, reusable templates
- Strict JSON output format

---

## Template 1: Clinic Ranking & Prioritization

**File**: `vertex-prompts.ts`  
**Function**: `buildRankerPrompt()`  
**System Prompt**: `VERTEX_DEALFLOW_RANKER_PROMPT`  
**Used By**: `vertex_dealflow_ranker` tool

### Purpose
Rank men's health clinics by how valuable they are to contact **today** for potential partnership.

### Input Format
```typescript
{
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
```

### Output Format
```json
{
  "rankedClinics": [
    {
      "clinicName": "string",
      "region": "string",
      "serviceLine": "string",
      "priorityScore": "high" | "medium" | "low",
      "numericScore": 0-100,
      "reason": "short explanation",
      "suggestedAction": "short directive"
    }
  ]
}
```

### Ranking Logic
- **Prefer clinics that:**
  - Are already investing in ads
  - Have obvious funnel gaps (leaks, weak CTAs, lack of pre-qualification)
  - Are in regions with strong or rising demand

- **Deprioritize clinics that:**
  - Appear saturated AND at capacity, with no need for more patients
  - Have unclear fit with Novalyte's core focus (TRT, GLP-1, IV, performance medicine)

### Usage Example
```typescript
import { buildRankerPrompt, parseVertexAIResponse, RankerInput, RankerOutput } from './vertex-prompts'

const input: RankerInput = {
  clinicCandidates: [
    {
      clinicName: "Testosterone Clinic",
      region: "Texas",
      state: "TX",
      serviceLines: ["TRT"],
      adsPresence: {
        isRunningAds: true,
        platforms: ["Meta", "Google"],
        estimatedSpendBand: "high"
      },
      funnelWeaknesses: ["Weak CTA", "No pre-qualification"],
      regionDemand: {
        demandIndex: 85,
        trend: "RISING"
      }
    }
  ]
}

const userPrompt = buildRankerPrompt(input)
// Use with Vertex AI...
const output = parseVertexAIResponse<RankerOutput>(responseText)
```

---

## Template 2: Demand Forecasting & Hotspots

**File**: `vertex-prompts.ts`  
**Function**: `buildDemandForecastPrompt()`  
**System Prompt**: `VERTEX_DEMAND_FORECAST_PROMPT`  
**Used By**: `predict_region_hotspots` / `predict_clinic_demand` tools

### Purpose
Analyze regional time-series data to:
- Score how likely it is that demand will increase
- Identify **regions that will need more clinical capacity**
- Suggest where Novalyte should focus for lead generation or clinic onboarding

### Input Format
```typescript
{
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
```

### Output Format
```json
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
}
```

### Label Definitions
- **immediate_opportunity**: High demand score (75+), rising trend, actionable now
- **emerging**: Moderate demand score (50-74), positive signals, watch closely
- **watch_list**: Lower demand score (25-49), some signals, monitor
- **cooling**: Low demand score (<25), declining trend, deprioritize

### Usage Example
```typescript
import { buildDemandForecastPrompt, parseVertexAIResponse, DemandForecastInput, DemandForecastOutput } from './vertex-prompts'

const input: DemandForecastInput = {
  regions: [
    {
      regionName: "Texas",
      serviceLine: "TRT",
      metrics: {
        assessmentCount: 1250,
        leadCount: 450,
        conversionRate: 0.36,
        searchInterestScore: 85,
        trendDirection: "RISING"
      },
      timeWindow: "30d"
    }
  ]
}

const userPrompt = buildDemandForecastPrompt(input)
// Use with Vertex AI...
const output = parseVertexAIResponse<DemandForecastOutput>(responseText)
```

---

## Template 3: Outreach Pack Generation

**File**: `vertex-prompts.ts`  
**Function**: `buildOutreachBrainPrompt()`  
**System Prompt**: `VERTEX_OUTREACH_BRAIN_PROMPT`  
**Used By**: `vertex_outreach_brain` tool

### Purpose
Turn clinic intelligence into **real-world outreach messages** the founder can send via email, LinkedIn, or phone.

### Input Format
```typescript
{
  clinicProfile: {
    name: string
    website?: string
    location: { city: string; state: string }
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
```

### Output Format
```json
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
}
```

### Tone Guidelines
- **Confident, calm, expert**
- **Founder-to-founder / operator-to-operator**
- **Zero desperation**
- **No hype, no "get rich quick" language**

### Constraints
- Do NOT promise specific revenue numbers
- Do NOT mention "we saw your ad on X platform using Y tool" in a creepy way
- Speak generally and respectfully ("I've been following your clinic's growth and positioning in [region]…")
- Goal is a **warm, intelligent approach**, not a spam blast

### Usage Example
```typescript
import { buildOutreachBrainPrompt, parseVertexAIResponse, OutreachBrainInput, OutreachBrainOutput } from './vertex-prompts'

const input: OutreachBrainInput = {
  clinicProfile: {
    name: "Testosterone Clinic",
    website: "https://example.com",
    location: { city: "Dallas", state: "TX" },
    serviceLines: ["TRT"],
    brandTone: "clinical"
  },
  adsSnapshot: {
    isRunningAds: true,
    platforms: ["Meta", "Google"],
    adThemes: ["TRT energy", "Low T symptoms"],
    offers: ["Free consult"],
    estimatedSpendBand: "high"
  },
  demandSignals: {
    region: "Texas",
    demandIndex: 85,
    trend: "RISING"
  },
  tone: "expert"
}

const userPrompt = buildOutreachBrainPrompt(input)
// Use with Vertex AI...
const output = parseVertexAIResponse<OutreachBrainOutput>(responseText)
```

---

## Common Usage Pattern

All three templates follow the same pattern:

1. **Import the template and types**
```typescript
import {
  VERTEX_DEALFLOW_RANKER_PROMPT,
  buildRankerPrompt,
  parseVertexAIResponse,
  RankerInput,
  RankerOutput
} from './vertex-prompts'
```

2. **Build the prompt**
```typescript
const systemPrompt = VERTEX_DEALFLOW_RANKER_PROMPT
const userPrompt = buildRankerPrompt(input)
```

3. **Call Vertex AI**
```typescript
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || '',
  location: process.env.GCP_REGION || 'us-central1',
})

const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
})

const result = await model.generateContent({
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
```

4. **Parse the response**
```typescript
const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
const output = parseVertexAIResponse<RankerOutput>(responseText)
```

---

## Error Handling

The `parseVertexAIResponse()` helper function:
- Removes markdown code blocks if present
- Extracts JSON from mixed text responses
- Throws descriptive errors if JSON parsing fails

Always wrap in try-catch:
```typescript
try {
  const output = parseVertexAIResponse<RankerOutput>(responseText)
  // Use output...
} catch (error) {
  console.error('Failed to parse Vertex AI response:', error)
  // Fallback to rule-based logic
}
```

---

## Best Practices

1. **Always validate output**: Check that required fields exist before using
2. **Provide fallbacks**: If Vertex AI fails, use rule-based logic
3. **Log errors**: Include the raw response in error logs for debugging
4. **Use appropriate temperature**: 0.7 is recommended for balanced creativity/consistency
5. **Set maxOutputTokens**: 2048 is usually sufficient, adjust if needed
6. **Use responseMimeType**: Set to `'application/json'` for structured output

---

## Integration Points

- **Template 1** → Used by `vertex_dealflow_ranker` (to be implemented)
- **Template 2** → Used by `predict_region_hotspots` and `predict_clinic_demand`
- **Template 3** → Used by `vertex_outreach_brain` (update existing implementation)

See `MCP_MANIFEST.md` for complete tool specifications.

