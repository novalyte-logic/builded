# Novalyte Workforce MCP Server

## Mission

Turn staffing intelligence into a live revenue engine by identifying clinics hiring, nurses available, and matching them through AI-powered recommendations.

## Overview

The `novalyte-workforce-mcp` server provides comprehensive workforce intelligence tools for connecting healthcare practitioners with men's health clinics. It scans job boards, temp marketplaces, BigQuery workforce data, and social media to identify opportunities and generate outreach strategies.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  WORKFORCE INTELLIGENCE PIPELINE                        │
│                                                         │
│  1. Scan Job Boards → 2. Scrape Temp Shifts →          │
│  3. Query BigQuery → 4. Extract Social Signals →        │
│  5. AI Brain Analysis → 6. Generate Outreach          │
└─────────────────────────────────────────────────────────┘
```

## Tools

### 1. `scan_clinic_staffing_needs`

**Purpose:** Find clinics hiring nurses, injectors, IV techs, or temp staff from public job boards and careers pages.

**Input:**
- `region` (optional): State code, city+state, or full state name
- `role` (optional): `nurse` | `injector` | `iv_tech` | `temp_staff` | `practitioner`
- `serviceLine` (optional): e.g., "TRT", "IV_THERAPY"
- `maxResults` (optional): Default 20

**Output:**
```typescript
{
  needs: [
    {
      clinicName: string
      role: StaffingRole
      location: { city, state, country }
      urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
      salarySignals: {
        range?: string
        competitive: boolean
        disclosed: boolean
      }
      serviceLines: string[]
      source: string
      postedDate?: string
      description?: string
    }
  ]
  totalFound: number
  scannedAt: string
}
```

**Production Integration:**
- Indeed API
- LinkedIn Jobs API
- Web scraping clinic careers pages
- Healthcare staffing boards

---

### 2. `scrape_temp_shift_listings`

**Purpose:** Pull PRN/locum/contract nursing shifts from public temp marketplaces.

**Input:**
- `region` (optional): State code, city+state, or full state name
- `shiftType` (optional): `PRN` | `locum` | `contract` | `per_diem` | `travel`
- `minHourlyRate` (optional): Minimum hourly rate filter
- `maxResults` (optional): Default 30

**Output:**
```typescript
{
  listings: [
    {
      platform: string
      shiftType: ShiftType
      hourlyRate: { min, max, currency }
      location: { city, state, country }
      clinicName?: string
      credentialReqs: CredentialReq[]
      shiftDetails: {
        startDate: string
        duration?: string
        schedule?: string
      }
      serviceLines?: string[]
      postedDate: string
    }
  ]
  totalFound: number
  platforms: string[]
  avgHourlyRate: { min, max }
  scrapedAt: string
}
```

**Production Integration:**
- Nomad Health API
- Aya Healthcare API
- Trusted Health API
- Vivian Health API
- Web scraping temp staffing platforms

---

### 3. `query_bigquery_healthworkforce`

**Purpose:** Use Google Cloud Marketplace datasets via BigQuery to analyze healthcare workforce supply/demand.

**Input:**
- `region` (optional): State code, e.g., "TX", "FL"
- `role` (optional): e.g., "RN", "NP", "PA"
- `includeProjections` (optional): Default true

**Output:**
```typescript
{
  data: [
    {
      region: string
      supplyDemandIndex: number // 0-100, higher = more shortage
      projectedShortages: [
        {
          role: string
          shortageCount: number
          timeframe: string
        }
      ]
      roleGrowthRate: [
        {
          role: string
          growthRate: number // percentage
          trend: 'RISING' | 'STABLE' | 'FALLING'
        }
      ]
      lastUpdated: string
    }
  ]
  totalRegions: number
  queryExecutedAt: string
}
```

**Production Integration:**
- Google Cloud Marketplace healthcare workforce datasets
- Bureau of Labor Statistics data via BigQuery public datasets
- State nursing board licensing data
- Healthcare employment projections

---

### 4. `extract_social_staffing_signals`

**Purpose:** Scan public social posts for nurses advertising availability, clinics urgently hiring, and new clinic openings.

**Input:**
- `region` (optional): State code, city+state, or full state name
- `signalType` (optional): `nurse_available` | `clinic_hiring` | `new_clinic_opening` | `shift_available` | `staffing_crisis`
- `minCredibility` (optional): Default 50 (0-100)
- `maxResults` (optional): Default 25

**Output:**
```typescript
{
  signals: [
    {
      signalType: SignalType
      source: string // 'linkedin', 'facebook', 'twitter', 'reddit'
      clinic?: string
      role?: string
      location?: { city, state }
      credibilityScore: number // 0-100
      postContent: string
      postUrl?: string
      postedDate: string
      engagement?: { likes, comments, shares }
    }
  ]
  totalFound: number
  signalTypeBreakdown: Record<SignalType, number>
  avgCredibilityScore: number
  extractedAt: string
}
```

**Production Integration:**
- LinkedIn API (job posts, professional updates)
- Facebook Groups API (healthcare job groups)
- Twitter/X API (hashtag monitoring)
- Reddit API (r/nursing, r/healthcare, etc.)
- Instagram API (clinic announcements)

---

### 5. `vertex_workforce_brain`

**Purpose:** Combine all MCP outputs to determine opportunity scores, clinic outreach scripts, and nurse match recommendations.

**Input:**
- `staffingNeeds` (optional): Array from `scan_clinic_staffing_needs`
- `tempShifts` (optional): Array from `scrape_temp_shift_listings`
- `workforceData` (optional): Array from `query_bigquery_healthworkforce`
- `socialSignals` (optional): Array from `extract_social_staffing_signals`
- `region` (optional)
- `serviceLine` (optional)

**Output:**
```typescript
{
  timestamp: string
  clinicOpportunities: [
    {
      clinicName: string
      opportunityScore: number // 0-100
      urgencyLevel: 'critical' | 'high' | 'medium' | 'low'
      closingEase: 'easy' | 'medium' | 'hard'
      reasoning: string
      outreachScript: {
        email?: { subjectLine, body }
        linkedInDM?: string
        callOpener?: string
      }
      recommendedOffer: string
    }
  ]
  nurseMatches: [
    {
      nurseIdentifier: string
      matchScore: number // 0-100
      source: string
      location: { city, state }
      credentials: string[]
      availability?: string
      dmScript: string
      estimatedHourlyRate?: { min, max }
    }
  ]
  summary: {
    totalOpportunities: number
    easyCloses: number
    highValueMatches: number
    avgOpportunityScore: number
  }
  strategicRecommendations: string[]
}
```

**Production Integration:**
- Vertex AI (Gemini) for strategic analysis
- Template system for fallbacks

---

## Example Usage

### Complete Workforce Intelligence Pipeline

```typescript
// 1. Scan for clinic staffing needs
const staffingNeeds = await scanClinicStaffingNeeds({
  region: 'Texas',
  role: 'nurse',
  serviceLine: 'TRT',
})

// 2. Scrape temp shift listings
const tempShifts = await scrapeTempShiftListings({
  region: 'Texas',
  shiftType: 'PRN',
  minHourlyRate: 50,
})

// 3. Query BigQuery for workforce data
const workforceData = await queryBigQueryHealthWorkforce({
  region: 'TX',
  role: 'RN',
})

// 4. Extract social signals
const socialSignals = await extractSocialStaffingSignals({
  region: 'Texas',
  signalType: 'nurse_available',
  minCredibility: 60,
})

// 5. Generate AI-powered analysis
const analysis = await vertexWorkforceBrain({
  staffingNeeds: staffingNeeds.needs,
  tempShifts: tempShifts.listings,
  workforceData: workforceData.data,
  socialSignals: socialSignals.signals,
  region: 'Texas',
  serviceLine: 'TRT',
})
```

---

## Revenue Focus

This MCP is **ONLY for revenue generation**. Every tool is designed to:

1. **Identify** clinics with urgent staffing needs
2. **Find** available practitioners and shifts
3. **Analyze** supply/demand dynamics
4. **Match** clinics with practitioners
5. **Generate** ready-to-send outreach scripts

---

## Production Deployment

### Required Integrations

1. **Job Board APIs:**
   - Indeed API
   - LinkedIn Jobs API
   - Web scraping infrastructure

2. **Temp Marketplace APIs:**
   - Nomad Health API
   - Aya Healthcare API
   - Trusted Health API

3. **BigQuery Datasets:**
   - Healthcare workforce public datasets
   - BLS employment data
   - State licensing data

4. **Social Media APIs:**
   - LinkedIn API
   - Facebook Groups API
   - Twitter/X API
   - Reddit API

5. **AI Analysis:**
   - Vertex AI (Gemini) for strategy generation

### Caching Strategy

- **Job Board Scans:** Cache for 4-6 hours (jobs change frequently)
- **Temp Shift Listings:** Cache for 2-4 hours (shifts fill quickly)
- **BigQuery Data:** Cache for 24 hours (workforce data changes daily)
- **Social Signals:** Cache for 1-2 hours (real-time signals)
- **AI Analysis:** Cache for 1 hour (should be fresh)

### Rate Limiting

- Respect external API rate limits
- Add delays between API calls (500ms-1s)
- Queue system for large batches
- Batch processing for multiple regions

---

## Current Implementation

**Status:** Mock implementation with realistic synthetic data

The current version generates realistic mock data that:
- Simulates clinic staffing needs with urgency levels
- Provides plausible temp shift listings with rates
- Calculates supply/demand indices
- Generates social signals with credibility scores

**Next Steps for Production:**

1. Integrate with job board APIs
2. Integrate with temp marketplace APIs
3. Set up BigQuery queries for workforce data
4. Integrate with social media APIs
5. Add caching layer (Redis)
6. Add rate limiting and error handling

