# Novalyte Dealflow MCP Server

## Mission

Give Superadmin (Kaizen) **REAL DEAL FLOW** for revenue generation and closing real clinic partnerships.

## Overview

The `novalyte-dealflow-mcp` server is built **ONLY for revenue generation and closing real clinics**. It provides a complete pipeline from clinic discovery to outreach execution.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  DEALFLOW PIPELINE                                      │
│                                                         │
│  1. Find Clinics → 2. Enrich → 3. Ads Check →          │
│  4. Generate Outreach → 5. Rank by Money Potential    │
└─────────────────────────────────────────────────────────┘
```

## Tools

### 1. `find_mens_clinics_by_region`

**Purpose:** Identify men's clinics worth targeting by region and service line.

**Input:**
- `region` (required): State code, city+state, or full state name
- `serviceLine` (optional): `TRT` | `WEIGHT_LOSS` | `IV_THERAPY` | `GENERAL`

**Output:**
```typescript
{
  clinics: [
    {
      name: string
      website: string | null
      location: { city, state, country }
      category: 'mens_clinic' | 'wellness_center' | 'telehealth' | ...
      serviceLines: DealflowServiceLine[]
      phone?: string
      email?: string
    }
  ]
  totalFound: number
  region: string
  serviceLine?: string
}
```

**Production Integration:**
- Google Places API / Maps API
- Yelp Fusion API
- Healthcare provider databases
- Internal Novalyte clinic database

---

### 2. `enrich_clinic_profile`

**Purpose:** Enrich clinic profile by analyzing their website for services, pricing, CTAs, and funnel style.

**Input:**
- `websiteUrl` (required): Clinic website URL

**Output:**
```typescript
{
  profile: {
    website: string
    servicesOffered: string[]
    pricingSignals: {
      hasPricingPage: boolean
      priceRange?: string
      freeConsultOffered: boolean
      discountPrograms?: string[]
    }
    ctas: string[]
    telehealthAvailable: boolean
    funnelStyle: 'direct_booking' | 'quiz_assessment' | 'consultation_first' | ...
    keyMessaging: string[]
    targetAudience: string[]
    lastUpdated: string
  }
  confidence: number // 0-1
  sources: string[] // ['homepage', 'services_page', 'pricing_page']
}
```

**Production Integration:**
- Web scraping (homepage, services, pricing pages)
- Vertex AI for structured data extraction
- Pattern matching for CTAs and funnel detection

---

### 3. `ads_presence_snapshot`

**Purpose:** Detect if clinic is running ads, on what platforms, with what angles/offers/CTAs.

**Input:**
- `clinicName` (required)
- `websiteUrl` (optional)
- `region` (optional)

**Output:**
```typescript
{
  snapshot: {
    isRunningAds: boolean
    platforms: PlatformActivity[]
    regionsTargeted: RegionTargeting[]
    creativeAngles: string[]
    offers: string[]
    ctaPatterns: string[]
    estimatedSpendBand: 'low' | 'medium' | 'high'
    lastSeenActive: string | null
    confidence: number
  }
  notes?: string
}
```

**Production Integration:**
- Meta Ad Library API
- Google Ads Transparency Report
- TikTok Ads Library
- Internal ad intelligence databases

---

### 4. `vertex_outreach_brain`

**Purpose:** Generate comprehensive outreach strategy with email, LinkedIn DM, and call script.

**Input:**
- `clinic` (required): ClinicBasic
- `enrichedProfile` (optional): EnrichedClinicProfile
- `adsSnapshot` (required): AdsPresenceSnapshot
- `demandHints` (optional): RegionalDemandHint[]

**Output:**
```typescript
{
  pack: {
    priorityScore: 'high' | 'medium' | 'low'
    priorityReason: string
    whyNow: string
    talkingPoints: string[]
    firstEmail: {
      subjectLine: string
      body: string
    }
    firstLinkedInDM: string
    callScriptOpener: string
    estimatedValue: string // "High - $50K+ annual potential"
    nextSteps: string[]
  }
  confidence: number
  generatedAt: string
}
```

**AI Reasoning:**
- Priority scoring based on ads activity, demand, and fit
- Why-now explanation citing specific signals
- Tailored talking points referencing their actual services/ads
- Professional but conversational tone
- Revenue-focused messaging

---

### 5. `export_dealflow_batch`

**Purpose:** Batch process multiple clinics through the full dealflow pipeline and return ranked list.

**Input:**
- `region` (required)
- `serviceLine` (optional)
- `maxClinics` (optional, default: 20)
- `includeEnrichment` (optional, default: true)
- `demandHints` (optional)

**Behavior:**
1. Find clinics in region
2. For each clinic:
   - Enrich profile (if enabled)
   - Get ads snapshot
   - Generate outreach pack
3. Rank by priority score
4. Return summary with estimated total value

**Output:**
```typescript
{
  clinics: DealflowClinic[] // Ranked by priority
  totalProcessed: number
  summary: {
    highPriority: number
    mediumPriority: number
    lowPriority: number
    withAds: number
    withoutAds: number
    estimatedTotalValue: string // "$500K+ annual potential"
  }
  region: string
  serviceLine?: string
  processedAt: string
}
```

---

## API Endpoint

**Route:** `/api/admin/mcp/dealflow`

**Method:** `POST`

**Request Format:**
```json
{
  "tool": "find_mens_clinics_by_region",
  "params": {
    "region": "Texas",
    "serviceLine": "TRT"
  }
}
```

**Response Format:**
```json
{
  "tool": "find_mens_clinics_by_region",
  "results": { ... }
}
```

---

## Usage Examples

### Example 1: Find TRT Clinics in Texas

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'find_mens_clinics_by_region',
    params: {
      region: 'Texas',
      serviceLine: 'TRT',
    },
  }),
})
```

### Example 2: Enrich a Clinic Profile

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'enrich_clinic_profile',
    params: {
      websiteUrl: 'https://exampleclinic.com',
    },
  }),
})
```

### Example 3: Get Ads Snapshot

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'ads_presence_snapshot',
    params: {
      clinicName: 'Dallas Vitality Clinic',
      websiteUrl: 'https://dallasvitality.com',
      region: 'US-TX',
    },
  }),
})
```

### Example 4: Generate Outreach Pack

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'vertex_outreach_brain',
    params: {
      clinic: {
        name: 'Dallas Vitality Clinic',
        website: 'https://dallasvitality.com',
        location: { city: 'Dallas', state: 'TX', country: 'US' },
        serviceLines: ['TRT'],
        category: 'mens_clinic',
      },
      adsSnapshot: { ... },
      enrichedProfile: { ... },
      demandHints: [
        {
          region: 'US-TX',
          serviceLine: 'TRT',
          demandIndex: 92,
          trend: 'RISING',
        },
      ],
    },
  }),
})
```

### Example 5: Batch Export Dealflow

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'export_dealflow_batch',
    params: {
      region: 'Texas',
      serviceLine: 'TRT',
      maxClinics: 20,
      includeEnrichment: true,
    },
  }),
})
```

---

## Priority Scoring Logic

**High Priority:**
- Actively advertising (high spend band) + high demand region
- OR: No ads but high demand (95+ index) with rising trend
- Estimated value: $50K+ annual potential

**Medium Priority:**
- Some ad activity OR moderate demand
- OR: Good fit but unclear signals
- Estimated value: $20-50K annual potential

**Low Priority:**
- No ad activity + low demand
- OR: Weak fit signals
- Estimated value: <$20K annual potential

---

## Production Deployment

### Required Integrations

1. **Clinic Discovery:**
   - Google Places API / Maps API
   - Yelp Fusion API
   - Healthcare provider databases

2. **Profile Enrichment:**
   - Web scraping infrastructure
   - Vertex AI for data extraction
   - Rate limiting and caching

3. **Ads Detection:**
   - Meta Ad Library API
   - Google Ads Transparency Report
   - TikTok Ads Library

4. **Outreach Generation:**
   - Vertex AI (Gemini) for strategy generation
   - Template system for fallbacks

### Caching Strategy

- **Clinic Discovery:** Cache for 24 hours (clinics don't change frequently)
- **Profile Enrichment:** Cache for 7 days (websites change slowly)
- **Ads Snapshots:** Cache for 4-6 hours (ads change more frequently)
- **Outreach Packs:** Cache for 1 hour (should be fresh)

### Rate Limiting

- Batch exports: Process max 20 clinics at a time
- Add delays between API calls (500ms-1s)
- Respect external API rate limits
- Queue system for large batches

---

## Revenue Focus

This MCP is **ONLY for revenue generation**. Every tool is designed to:

1. **Identify** clinics worth targeting
2. **Enrich** their profiles to understand fit
3. **Detect** their ad activity to gauge budget
4. **Generate** actionable outreach that closes deals
5. **Rank** by money potential (not just fit)

**Success Metrics:**
- % of outreach packs that lead to conversations
- % of conversations that become partnerships
- Average annual value per closed clinic
- Time from discovery to first contact

---

**Version:** 1.0.0  
**Last Updated:** December 8, 2025  
**Status:** Mock implementation ready for production API integration

