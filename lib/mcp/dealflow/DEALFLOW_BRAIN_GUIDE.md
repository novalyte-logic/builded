# Novalyte Admin Dealflow Brain - Integration Guide

## Overview

The **Novalyte Admin Dealflow Brain** is a unified intelligence engine that runs entirely inside the Admin ecosystem. It automatically generates daily revenue opportunities using:

1. **Daily Lead Harvesting** - Scans and ranks clinics automatically
2. **Real-time Market Trend Analysis** - Google Trends + BigQuery intelligence
3. **Predictive Demand Modeling** - Vertex AI forecasting

## Admin Pages Powered by Dealflow Brain

### 1. `/admin/dealflow-drops` (NEW)
**Unified Daily Drop Display**

- Shows complete daily intelligence drop
- Hot Clinics Today (ranked, enriched, with outreach kits)
- Market Moves (ads deployment recommendations)
- Predictive Alerts (clinics/regions likely to spike)
- Action Plan (immediate actions, strategic moves, competitive plays)

**API Call:**
```typescript
POST /api/admin/mcp/dealflow
{
  tool: 'unified_dealflow_brain'
}
```

### 2. `/admin/dealflow`
**Dealflow Console**

- Uses Pipeline 1: Daily Lead Harvesting
- Displays ranked clinics with outreach packs
- Tracks outreach status

**Integration:** Already uses `export_dealflow_batch` tool, which is part of Pipeline 1.

### 3. `/admin/dealflow-engine`
**Deal Flow Engine**

- Uses Pipeline 1: Daily Lead Harvesting
- Manual scans by region/service line
- Trend-based dealflow analysis

**Integration:** Already uses `export_dealflow_batch` and `trend_based_dealflow` tools.

### 4. `/admin/market-intelligence`
**Market Intelligence**

- Uses Pipeline 2: Market Trends Intelligence
- Google Trends analysis
- BigQuery regional demand queries
- "Run Market Scan" button triggers unified brain

**Integration:** 
- Current: Uses `vertex_market_brain` tool
- Enhanced: Can call `unified_dealflow_brain` to get market moves section

**API Call for Market Scan:**
```typescript
POST /api/admin/mcp/dealflow
{
  tool: 'unified_dealflow_brain'
}
// Then extract marketMoves section from response
```

### 5. `/admin/insights/demand`
**Demand & Opportunities**

- Uses Pipeline 3: Predictive Demand Modeling
- Assessment velocity analysis
- Regional demand forecasting
- Predictive alerts

**Integration:** 
- Current: Uses BigQuery queries directly
- Enhanced: Can call `unified_dealflow_brain` to get predictiveAlerts section

**API Call for Predictive Analysis:**
```typescript
POST /api/admin/mcp/dealflow
{
  tool: 'unified_dealflow_brain'
}
// Then extract predictiveAlerts section from response
```

### 6. `/admin/ai-console`
**AI Console**

- Can manually trigger unified brain
- View raw intelligence output
- Test different configurations

## Pipeline Architecture

### Pipeline 1: Daily Lead Harvesting

**Runs:** Automatically every 24h AND on-demand

**Steps:**
1. Calls `find_mens_clinics_by_region` for:
   - Top 10 TRT states
   - Top 10 GLP-1 states
   - Regions flagged by Google Trends
2. Enriches each clinic:
   - `enrich_clinic_profile` → Services, pricing, funnel analysis
   - `ads_presence_snapshot` → Ad activity detection
3. Generates outreach:
   - `vertex_outreach_brain` → Complete outreach pack
4. Ranks by:
   - Active ad spend
   - Funnel weaknesses
   - Category demand
   - Region competitiveness
   - Estimated revenue potential

**Output:** Hot Clinics with Priority Scores and Outreach Packs

### Pipeline 2: Market Trends Intelligence

**Runs:** When Superadmin clicks "Run Market Scan" in `/admin/market-intelligence`

**Steps:**
1. Queries Google Trends MCP:
   - TRT, Low T, GLP-1, Semaglutide, Weight Loss, IV Therapy
2. Queries BigQuery:
   - Regional interest shifts
   - Competitive ad gaps
   - Underserved geo pockets
3. Detects "Move Zones":
   - Regions where demand ↑ but supply ↓
   - Regions where competitors dropped ad spend
   - States where search volume is exploding

**Output:** Market Moves with deployment recommendations

### Pipeline 3: Predictive Demand Modeling

**Runs:** Inside `/admin/insights/demand`

**Inputs:**
- Assessment velocity
- Patient registrations
- LTV bands
- Completed vs incomplete assessments
- Click → Lead → Clinic ratios
- Regional seasonal patterns

**AI Tasks:**
1. Predict future shortages:
   - "These 14 Florida clinics will need TRT leads within 10–14 days."
2. Predict revenue hotspots:
   - "Dallas → GLP-1 demand up 32% in 7 days."
3. Predict clinical staffing needs:
   - "Texas IV clinics likely to request staffing support."

**Output:** Predictive Alerts with scores and recommendations

## Unified Output Structure

```typescript
interface DailyDealflowDrop {
  timestamp: string
  generatedAt: string
  
  // Pipeline 1
  hotClinics: {
    clinics: HotClinic[]
    summary: { highPriority, mediumPriority, lowPriority, withAds, weakFunnels }
    top5ToContact: HotClinic[]
  }
  
  // Pipeline 2
  marketMoves: {
    topRegionsToDeployAds: MarketMove[]
    categoriesSurging: Array<{ category, growthRate, topRegions }>
    underservedZones: Array<{ region, serviceLine, opportunityGap }>
    suggestedMoves: string[]
  }
  
  // Pipeline 3
  predictiveAlerts: {
    alerts: PredictiveAlert[]
    regionsExploding: Array<{ region, serviceLine, explosionScore }>
    clinicsStruggling: Array<{ clinicName, region, urgency }>
    recommendations: string[]
  }
  
  // Unified Action Plan
  actionPlan: {
    immediateActions: string[]      // "Contact these 5 clinics first"
    strategicMoves: string[]         // "Deploy Weight Loss ads in these 3 regions"
    competitivePlays: string[]       // "Run outreach on competitor clinics"
    supplyPrep: string[]             // "Prepare GLP-1 supply for Miami"
  }
  
  // Executive Summary
  executiveSummary: {
    totalOpportunities: number
    criticalActions: number
    estimatedRevenuePotential: string
    confidenceLevel: 'high' | 'medium' | 'low'
  }
}
```

## Usage Examples

### 1. Get Daily Drop (Full Intelligence)

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'unified_dealflow_brain',
  }),
})

const { results } = await response.json()
// results contains complete DailyDealflowDrop
```

### 2. Get Only Hot Clinics (Pipeline 1)

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'unified_dealflow_brain',
  }),
})

const { results } = await response.json()
const hotClinics = results.hotClinics
```

### 3. Get Only Market Moves (Pipeline 2)

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'unified_dealflow_brain',
  }),
})

const { results } = await response.json()
const marketMoves = results.marketMoves
```

### 4. Get Only Predictive Alerts (Pipeline 3)

```typescript
const response = await fetch('/api/admin/mcp/dealflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'unified_dealflow_brain',
  }),
})

const { results } = await response.json()
const predictiveAlerts = results.predictiveAlerts
```

## Automatic Daily Execution

The unified brain can be set up to run automatically every 24 hours via:

1. **Cron Job** (recommended)
2. **Vercel Cron** (if deployed on Vercel)
3. **Cloud Scheduler** (GCP)
4. **Manual trigger** from `/admin/dealflow-drops` page

**Cron Setup Example:**
```bash
# Run every day at 6 AM UTC
0 6 * * * curl -X POST https://your-domain.com/api/admin/mcp/dealflow \
  -H "Content-Type: application/json" \
  -d '{"tool": "unified_dealflow_brain"}'
```

## Key Features

✅ **Admin-Only** - No public UI, no patient-facing code
✅ **Zero Manual Research** - Fully automated intelligence
✅ **Actionable Moves** - Not reports, but revenue actions
✅ **Revenue-Focused** - Every output optimized for closing deals
✅ **Hedge Fund Quant + Growth Strategist + Dealmaker** - Combined intelligence approach

## System Requirements

- Must function ONLY inside Admin dashboard
- Must not modify frontend or patient systems
- Must output MOVES, not reports
- Must require zero manual research from Superadmin
- Must be optimized entirely for revenue creation

## Final Objective

**Daily leads + Market trends + Predictive demand = Automatic Dealflow For Novalyte™ AI**

No frontend. No public UI. Admin dashboard only — pure intelligence layer.

