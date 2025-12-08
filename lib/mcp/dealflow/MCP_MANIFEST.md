# Novalyte Dealflow MCP Manifest

## Server Information

**Server Name**: `novalyte-dealflow-mcp`  
**Version**: `1.4.0`  
**Purpose**: Bundle all tools needed to power Daily Lead Harvesting, Market Trends Intelligence, Predictive Demand Modeling, and Outreach Pack Generation

**Scope**: Server-side, admin-only. No direct patient data exposed in external calls. Provides guidance, prioritization, and strategic recommendations only. No promises of exact financial performance.

---

## Tool Categories

### 1. Clinic Discovery & Enrichment Tools
### 2. Ads & Market Presence Tools
### 3. Predictive Demand & Forecasting Tools
### 4. Outreach Brain Tools (Vertex Integration)
### 5. Batch & Pipeline Tools

---

## 1. CLINIC DISCOVERY & ENRICHMENT TOOLS

### Tool: `find_mens_clinics_by_region`

**Description**: Find men's clinics in a given region by service line.

**Input Schema**:
```typescript
{
  region: string        // Free text: "Texas", "Miami, FL", "SoCal", etc.
  serviceLine: enum     // TRT | WEIGHT_LOSS | IV_THERAPY | PEPTIDES | GENERAL
}
```

**Output Schema**:
```typescript
{
  clinics: Array<{
    name: string
    websiteUrl: string | null
    city: string
    state: string
    category: string    // "TRT clinic", "Men's health clinic", "Weight loss clinic", "IV therapy", etc.
    serviceLines?: string[]
    phone?: string
    email?: string
  }>
  totalFound: number
  region: string
  serviceLine: string
  scannedAt: string
}
```

**Responsibilities**:
- Search public directories, Google Maps, Yelp, healthcare directories
- Filter by service line relevance
- Return basic clinic information for enrichment pipeline
- Handle region name variations (e.g., "SoCal" → "Southern California")

**Error Handling**: Returns empty array if no clinics found or region invalid.

**Integration**: Called by `export_dealflow_batch` and `generate_daily_dealflow_snapshot`.

---

### Tool: `enrich_clinic_profile`

**Description**: Crawl the clinic's website and enrich its profile with detailed intelligence.

**Input Schema**:
```typescript
{
  websiteUrl: string   // Required: Full URL to clinic website
}
```

**Output Schema**:
```typescript
{
  profile: {
    servicesOffered: string[]           // List of services (TRT, GLP-1, IV Therapy, Peptides, etc.)
    pricingSignals: {
      hasPricingPage: boolean
      priceRange?: string                // e.g., "$$$", "$200-400/month"
      monthlyPrograms: boolean           // Mention of monthly programs
      oneTimeFees: boolean               // One-time fees mentioned
      freeConsultOffered: boolean
    }
    telehealthSupport: boolean | "yes" | "no" | "unclear"
    funnelNotes: {
      funnelStyle: string               // "quiz", "booking", "contact_form", "mixed"
      landingPageQuality: "high" | "medium" | "low"
      conversionOptimization: string[]  // Notes on CTA placement, trust signals, etc.
    }
    brandTone: string                  // "clinical", "luxury", "aggressive", "wellness", etc.
    ctas: string[]                     // Array of call-to-action phrases found
    keyMessaging: string[]              // Core messaging themes
    socialProof: {
      hasTestimonials: boolean
      hasReviews: boolean
      trustSignals: string[]
    }
  }
  enrichedAt: string
  confidence: number                    // 0-100, confidence in enrichment accuracy
}
```

**Responsibilities**:
- Web scrape clinic website (respect robots.txt)
- Extract services, pricing signals, funnel structure
- Analyze brand tone and messaging
- Identify conversion optimization opportunities
- Detect telehealth support availability

**Error Handling**: Returns partial profile if website inaccessible, marks confidence low.

**Integration**: Called by `export_dealflow_batch` for each clinic found.

---

## 2. ADS & MARKET PRESENCE TOOLS

### Tool: `ads_presence_snapshot`

**Description**: Detect and summarize ad activity for a clinic across platforms.

**Input Schema**:
```typescript
{
  clinicName: string
  websiteUrl?: string    // Optional: Used for domain-based ad detection
  region: string         // Used for geo-targeting analysis
}
```

**Output Schema**:
```typescript
{
  snapshot: {
    isRunningAds: boolean
    platforms: Array<{
      platform: string              // "Meta", "Google", "TikTok", "LinkedIn", etc.
      activeCampaignCount: number
      estimatedSpendBand: "low" | "medium" | "high"
      lastSeenActive?: string      // ISO timestamp
    }>
    adThemes: string[]              // "TRT energy", "GLP-1 transformation", "IV recovery", etc.
    offers: string[]                // "free consult", "discounted first month", etc.
    ctaPatterns: string[]            // "Book now", "Take quiz", "Claim offer"
    targetingNotes: string[]        // Geo hints, demographics, etc.
    creativeAngles?: string[]       // Messaging angles detected
    regionsTargeted?: Array<{
      region: string
      intensity: "high" | "medium" | "low"
    }>
    estimatedSpendBand: "low" | "medium" | "high"
    confidence: number              // 0-100
    lastSeenActive?: string         // ISO timestamp
  }
  scannedAt: string
}
```

**Responsibilities**:
- Check Meta Ads Library, Google Ads transparency, TikTok ads, etc.
- Analyze ad creative and messaging
- Estimate spend based on frequency and reach
- Identify targeting patterns and geo-targeting
- Extract offers and CTA patterns

**Error Handling**: Returns `isRunningAds: false` if detection fails, marks confidence low.

**Integration**: Called by `export_dealflow_batch` and used by `vertex_outreach_brain`.

---

### Tool: `market_trends_insights`

**Description**: Combine Google Trends MCP + BigQuery into one unified market intelligence result.

**Input Schema**:
```typescript
{
  serviceLine: enum      // TRT | GLP-1 | IV_THERAPY | GENERAL
  timeWindow?: string    // "7d" | "30d" | "90d" (default: "30d")
}
```

**Output Schema**:
```typescript
{
  insights: {
    topRisingRegions: Array<{
      region: string
      serviceLine: string
      interestScore: number        // 0-100
      growthRate: number          // Percentage change
      trendDirection: "RISING" | "STABLE" | "FALLING"
      trajectory30d?: {
        direction: "RISING" | "STABLE" | "FALLING"
        changePercent: number
      }
    }>
    coolingRegions: Array<{
      region: string
      serviceLine: string
      interestScore: number
      declineRate: number
      reason: string
    }>
    keywordsSpiking: Array<{
      keyword: string
      growthScore: number
      relatedRegions: string[]
    }>
    searchVelocityNotes: string[]  // High-level observations about search trends
    opportunityZones: Array<{
      region: string
      serviceLine: string
      demandIndex: number          // 0-100 (from BigQuery)
      supplyIndex: number         // Clinic count or ad spend proxy
      adSpendIndex?: number       // Estimated competitor ad spend
      opportunityGap: number      // demandIndex - (supplyIndex + adSpendIndex)
      recommendedAction: string
    }>
  }
  generatedAt: string
  dataSources: string[]            // ["google_trends", "bigquery", "vertex_ai"]
}
```

**Responsibilities**:
- Query Google Trends API for search volume trends
- Query BigQuery for regional demand/supply data
- Combine signals to identify opportunity zones
- Flag regions where demand ↑ but supply/ad spend ↓
- Detect spiking keywords and cooling regions

**Error Handling**: Returns partial insights if one source fails, marks dataSources accordingly.

**Integration**: Called by `export_dealflow_batch` for context and by scheduler for temperature checks.

---

## 3. PREDICTIVE DEMAND & FORECASTING TOOLS

### Tool: `predict_clinic_demand`

**Description**: Predict near-term demand pressure for clinics in a region.

**Input Schema**:
```typescript
{
  region: string
  serviceLine: enum      // TRT | WEIGHT_LOSS | IV_THERAPY
  timeHorizon?: string   // "7d" | "14d" | "30d" (default: "14d")
  aggregatedMetrics?: {  // Optional: Pre-computed metrics for faster prediction
    assessmentCount?: number
    leadCount?: number
    avgLTV?: number
    conversionRate?: number
  }
}
```

**Output Schema**:
```typescript
{
  prediction: {
    predictedDemandScore: number   // 0-100
    timeHorizon: string            // "7d" | "14d" | "30d"
    riskOfShortage: "low" | "medium" | "high"
    supportingSignals: Array<{
      signal: string                // "assessment_spike", "seasonality", "regional_trend", etc.
      strength: number              // 0-100
      description: string
    }>
    projectedLeadVolume?: {
      min: number
      max: number
      expected: number
    }
    confidence: number              // 0-100
  }
  generatedAt: string
}
```

**Responsibilities**:
- Analyze assessment velocity trends from BigQuery
- Consider seasonal patterns (e.g., New Year resolutions for weight loss)
- Factor in regional market dynamics
- Predict clinic capacity gaps
- Use Vertex AI for pattern recognition if available

**Error Handling**: Returns conservative predictions if data insufficient, marks confidence low.

**Integration**: Called by `export_dealflow_batch` and `generate_daily_dealflow_snapshot`.

---

### Tool: `predict_region_hotspots`

**Description**: Rank regions for future demand opportunity.

**Input Schema**:
```typescript
{
  serviceLine: enum      // TRT | WEIGHT_LOSS | IV_THERAPY
  timeWindow?: string    // "7d" | "30d" (default: "30d")
  maxResults?: number    // Default: 10
}
```

**Output Schema**:
```typescript
{
  hotspots: Array<{
    name: string         // Region name (state or city+state)
    score: number        // 0-100, opportunity score
    justification: string
    suggestedAction: string  // "deploy_ads", "onboard_clinics", "watch_list", etc.
    projectedDemandIncrease: number  // Percentage
    currentSupplyLevel: "low" | "medium" | "high"
    urgency: "critical" | "high" | "medium" | "low"
  }>
  generatedAt: string
}
```

**Responsibilities**:
- Analyze historical demand patterns from BigQuery
- Project future demand based on trends and seasonality
- Compare demand vs. current supply (clinic count)
- Rank by opportunity score
- Suggest specific actions per region

**Error Handling**: Returns empty array if insufficient data, logs warning.

**Integration**: Called by `generate_daily_dealflow_snapshot` for predictive alerts.

---

## 4. OUTREACH BRAIN TOOLS (VERTEX INTEGRATION)

### Tool: `vertex_outreach_brain`

**Description**: Turn clinic + ads + demand data into a complete outreach pack using Vertex AI.

**Input Schema**:
```typescript
{
  clinicProfile: {
    name: string
    website?: string
    location: {
      city: string
      state: string
    }
    serviceLines: string[]
    enrichedProfile?: {     // Optional: From enrich_clinic_profile
      servicesOffered: string[]
      pricingSignals: any
      funnelNotes: any
      brandTone: string
    }
  }
  adsSnapshot?: {          // Optional: From ads_presence_snapshot
    isRunningAds: boolean
    platforms: any[]
    adThemes: string[]
    offers: string[]
  }
  demandSignals?: {        // Optional: From predict_clinic_demand
    predictedDemandScore: number
    riskOfShortage: string
  }
  tone?: string            // Optional: "founder-led", "concise", "expert", "non-desperate" (default: "expert")
}
```

**Output Schema**:
```typescript
{
  pack: {
    priorityScore: "high" | "medium" | "low"
    whyNow: string
    outreachStrategySteps: string[]
    firstEmailDraft: {
      subjectLine: string
      body: string              // 4-6 paragraphs, 200-300 words
    }
    linkedinDM: string         // 2-3 sentences, personal and direct
    callOpener: string         // 1-2 sentences
    altHooks: string[]         // Short openers for variations
    estimatedValue?: string    // e.g., "$50K+ annual potential"
    nextSteps?: string[]
  }
  generatedAt: string
  model: string                // Vertex AI model used (e.g., "gemini-1.5-flash")
}
```

**Responsibilities**:
- Analyze clinic profile, ads, and demand signals holistically
- Generate personalized outreach content using Vertex AI
- Create multiple touchpoints (email, LinkedIn, call)
- Provide strategic talking points
- Generate alternative hooks for A/B testing

**Error Handling**: Falls back to template-based generation if Vertex AI fails.

**Integration**: Called by `export_dealflow_batch` for each clinic.

---

### Tool: `vertex_dealflow_ranker`

**Description**: Rank clinics for today's action list using Vertex AI.

**Input Schema**:
```typescript
{
  clinicCandidates: Array<{
    clinic: {
      name: string
      location: { city: string; state: string }
      serviceLines: string[]
    }
    adsPresence?: {
      isRunningAds: boolean
      estimatedSpendBand: string
    }
    regionDemand?: {
      demandIndex: number
      trend: string
    }
    predictedDemandScore?: number
    servicesOffered?: string[]
    funnelWeaknesses?: string[]
    enrichedProfile?: any
  }>
  maxResults?: number    // Default: 20
}
```

**Output Schema**:
```typescript
{
  rankedClinics: Array<{
    clinic: {
      name: string
      location: { city: string; state: string }
      serviceLines: string[]
    }
    priorityScore: number        // 0-100
    reason: string              // Why this clinic is ranked here
    recommendedAction: string   // Specific action to take
    opportunityFactors: string[] // What makes this a good opportunity
  }>
  summary: {
    highPriority: number         // Count of clinics with score >= 75
    mediumPriority: number       // Count with score 50-74
    lowPriority: number          // Count with score < 50
    avgScore: number
  }
  generatedAt: string
  model: string                  // Vertex AI model used
}
```

**Responsibilities**:
- Analyze all clinic signals holistically using Vertex AI
- Rank by revenue potential and closing ease
- Provide clear reasoning for each rank
- Suggest specific actions per clinic
- Consider urgency, ad spend, funnel weaknesses, demand signals

**Error Handling**: Falls back to rule-based ranking if Vertex AI fails.

**Integration**: Called by `export_dealflow_batch` to rank final output.

---

## 5. BATCH & PIPELINE TOOLS

### Tool: `export_dealflow_batch`

**Description**: End-to-end pipeline for one region+service line combination.

**Input Schema**:
```typescript
{
  region: string
  serviceLine: enum      // TRT | WEIGHT_LOSS | IV_THERAPY | GENERAL
  maxClinics?: number    // Cap on number of clinics to process (default: 20)
  includeEnrichment?: boolean  // Whether to enrich profiles (default: true)
}
```

**Behavior** (Pipeline Execution Order):
1. `find_mens_clinics_by_region` → Get clinic list
2. For each clinic (up to maxClinics):
   - `enrich_clinic_profile` (if includeEnrichment)
   - `ads_presence_snapshot`
3. `market_trends_insights` → Get regional context
4. `predict_clinic_demand` → Get demand predictions (if data available)
5. For each clinic:
   - `vertex_outreach_brain` → Generate outreach pack
6. `vertex_dealflow_ranker` → Rank all clinics
7. Return ranked list with outreach packs

**Output Schema**:
```typescript
{
  batch: {
    clinics: Array<{
      clinic: {
        name: string
        website: string | null
        location: { city: string; state: string; country: string }
        category: string
        serviceLines: string[]
      }
      enrichedProfile?: any
      adsSnapshot: any
      outreachPack: {
        priorityScore: "high" | "medium" | "low"
        priorityReason: string
        whyNow: string
        firstEmailDraft: { subjectLine: string; body: string }
        linkedinDM: string
        callOpener: string
        altHooks?: string[]
        estimatedValue?: string
      }
      priorityScore: "high" | "medium" | "low"
      estimatedValue: string
    }>
    totalProcessed: number
    summary: {
      highPriority: number
      mediumPriority: number
      lowPriority: number
      withAds: number
      withoutAds: number
      estimatedTotalValue: string
    }
  }
  region: string
  serviceLine: string
  processedAt: string
}
```

**Responsibilities**:
- Orchestrate full pipeline execution
- Handle errors gracefully (continue with partial data)
- Return ranked, enriched clinics with outreach packs
- Provide batch summary statistics

**Error Handling**: Returns partial results if some steps fail, logs errors per clinic.

**Integration**: Called by Admin Dashboard (`/admin/dealflow`, `/admin/dealflow-engine`) and scheduler.

---

### Tool: `generate_daily_dealflow_snapshot`

**Description**: Unified output generator for `/admin/dealflow-drops` page.

**Input Schema**:
```typescript
{
  config?: {              // Optional: Override default regions/service lines
    regions?: string[]     // Default: Top 10 TRT states + Top 10 GLP-1 states
    serviceLines?: enum[]  // Default: ["TRT", "WEIGHT_LOSS"]
    includePredictive?: boolean  // Default: true
  }
}
```

**Behavior**:
1. Run `export_dealflow_batch` for each region+service line combination
2. Run `market_trends_insights` for all service lines
3. Run `predict_region_hotspots` for all service lines
4. Run `predict_clinic_demand` for top regions
5. Combine all outputs into unified snapshot
6. Generate action plan using Vertex AI

**Output Schema**:
```typescript
{
  snapshot: {
    date: string                    // YYYY-MM-DD
    timestamp: string               // ISO timestamp
    hotClinics: Array<{
      name: string
      region: string
      category: string
      priorityScore: number         // 0-100
      whyHot: string
      outreachPack: {
        email: { subjectLine: string; body: string }
        linkedInDM: string
        callOpener: string
      }
      revenuePotential: "high" | "medium" | "low"
      funnelWeaknesses: string[]
      categoryDominance: number     // 0-100
    }>
    marketMoves: Array<{
      region: string
      serviceLine: string
      moveType: "deploy_ads" | "increase_budget" | "target_clinics" | "prepare_supply"
      urgency: "critical" | "high" | "medium"
      reasoning: string
      suggestedAction: string
      opportunityScore: number       // 0-100
    }>
    predictiveAlerts: Array<{
      clinicName?: string
      region: string
      serviceLine: string
      predictiveScore: number       // 0-100
      timeframe: string             // e.g., "10-14 days"
      predictedShortage: {
        type: "patient_volume" | "capacity_gap" | "demand_spike"
        severity: "critical" | "high" | "medium"
      }
      recommendation: string
      confidence: number            // 0-100
    }>
    actionPlan: {
      immediateActions: string[]    // "Contact these 5 clinics first"
      strategicMoves: string[]       // "Deploy Weight Loss ads in these 3 regions"
      competitivePlays: string[]    // "Run outreach on competitor clinics"
      supplyPrep: string[]          // "Prepare GLP-1 supply for Miami"
    }
    executiveSummary: {
      totalOpportunities: number
      criticalActions: number
      estimatedRevenuePotential: string
      confidenceLevel: "high" | "medium" | "low"
    }
  }
  generatedAt: string
}
```

**Responsibilities**:
- Orchestrate all three pipelines (Lead Harvesting, Market Trends, Predictive)
- Combine outputs into unified intelligence
- Generate actionable recommendations using Vertex AI
- Provide executive summary

**Error Handling**: Returns partial snapshot if some pipelines fail, marks confidence level accordingly.

**Integration**: Called by scheduler (24h cycle) and Admin Dashboard (`/admin/dealflow-drops`).

---

## Tool Summary Table

| Tool Name | Category | Input Complexity | Output Complexity | Vertex AI | External APIs |
|-----------|----------|------------------|-------------------|-----------|---------------|
| `find_mens_clinics_by_region` | Discovery | Low | Medium | No | Google Maps, Yelp |
| `enrich_clinic_profile` | Discovery | Low | High | No | Web scraping |
| `ads_presence_snapshot` | Market Presence | Medium | High | No | Meta Ads, Google Ads |
| `market_trends_insights` | Market Presence | Low | High | No | Google Trends, BigQuery |
| `predict_clinic_demand` | Predictive | Medium | Medium | Yes | BigQuery |
| `predict_region_hotspots` | Predictive | Low | Medium | Yes | BigQuery |
| `vertex_outreach_brain` | Outreach | High | High | Yes | None |
| `vertex_dealflow_ranker` | Outreach | High | Medium | Yes | None |
| `export_dealflow_batch` | Pipeline | Medium | Very High | Yes | All above |
| `generate_daily_dealflow_snapshot` | Pipeline | Low | Very High | Yes | All above |

---

## Integration Points

### Admin Dashboard Integration

- `/admin/dealflow` → Uses `export_dealflow_batch`
- `/admin/dealflow-engine` → Uses `export_dealflow_batch`
- `/admin/market-intelligence` → Uses `market_trends_insights`
- `/admin/insights/demand` → Uses `predict_clinic_demand`, `predict_region_hotspots`
- `/admin/dealflow-drops` → Uses `generate_daily_dealflow_snapshot`

### Scheduler Integration (novalyte-dealflow-scheduler)

- **24h Cycle** → Calls `generate_daily_dealflow_snapshot`
- **6h Cycle** → Calls `market_trends_insights` (lighter scan)
- **1h Cycle** → Uses cached data, calls `vertex_dealflow_ranker` for re-scoring

---

## Error Handling Standards

All tools must:

1. **Return structured errors**: Include error type, message, and partial data if available
2. **Log failures**: Log to console/logger with run ID for debugging
3. **Graceful degradation**: Return partial results rather than failing completely
4. **Confidence scores**: Include confidence (0-100) in all outputs
5. **Caching fallbacks**: Use last known good data when external APIs fail

---

## Performance Expectations

- **Discovery tools**: < 5 seconds per clinic
- **Enrichment tools**: < 10 seconds per clinic
- **Market tools**: < 30 seconds per region
- **Predictive tools**: < 15 seconds per region
- **Outreach tools**: < 10 seconds per clinic
- **Batch tools**: < 5 minutes for 20 clinics
- **Snapshot tools**: < 10 minutes for full daily drop

---

## Security & Privacy

- **No patient data**: All tools operate on clinic/public data only
- **Rate limiting**: Respect external API rate limits
- **Data retention**: Snapshots retained for 7 days only
- **Access control**: All tools require admin authentication
- **Audit logging**: All tool calls logged with timestamp and user

---

## Scope & Constraints

- ✅ All tools are **server-side, admin-only**
- ✅ No direct patient data exposed in external calls
- ✅ No promises of exact financial performance — only guidance, prioritization, and strategic recommendations
- ✅ All tools callable by Admin Dashboard and Scheduler layer

---

## Version History

- **v1.4.0** (Current): Added scheduler integration, unified snapshot tool
- **v1.3.0**: Added predictive tools, vertex ranking
- **v1.2.0**: Added market trends insights
- **v1.1.0**: Added ads presence snapshot
- **v1.0.0**: Initial release with discovery and enrichment tools
