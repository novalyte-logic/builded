# Google Trends Integration for Novalyte™ Market Intelligence

## Overview

The Google Trends integration adds real-time search demand signals to the Novalyte™ AI Market Intelligence stack, allowing the admin to make data-driven decisions based on both BigQuery demand data AND Google search trends.

## Architecture

### MCP Tool: `google_trends_service_line_interest`

**Location:** `lib/mcp/market-intel/google-trends-service-interest.ts`

**Purpose:** Fetch Google Trends data for Novalyte service lines (TRT, Weight Loss, IV Therapy) to identify real-time demand momentum.

**Inputs:**
- `serviceLine` (required): `"TRT" | "WEIGHT_LOSS" | "IV_THERAPY"`
- `region` (optional): e.g., `"US"`, `"US-TX"`, `"US-CA"` (default: `"US"`)
- `timeRange` (optional): e.g., `"now 7-d"`, `"now 30-d"`, `"today 3-m"` (default: `"now 30-d"`)

**Outputs:**
```typescript
{
  serviceLine: string
  region: string
  timeRange: string
  trendDirection: "RISING" | "STABLE" | "FALLING"
  trendStrength: number // 0-1, where 1 = very strong
  interestOverTime: Array<{ timestamp: string; value: number }>
  topRegions: Array<{ region: string; interestIndex: number }>
  risingQueries: Array<{ query: string; growthScore: number }>
}
```

### Keyword Mapping

Each service line maps to specific Google Trends search terms:

**TRT:**
- "testosterone replacement therapy"
- "TRT clinic"
- "low testosterone treatment"

**WEIGHT_LOSS:**
- "weight loss clinic"
- "GLP-1 clinic"
- "semaglutide near me"

**IV_THERAPY:**
- "IV therapy"
- "IV drip near me"
- "IV hydration clinic"

## Enhanced Vertex AI Analysis

The `vertex_market_brain` tool now accepts `trendsData` and produces enhanced output:

**New Output Fields:**
- `trendSummary`: 2-3 sentence summary of Google Trends signals
- `trendConfidence`: 0-1 confidence score based on trend strength
- `firstMove`: Specific action to take in the next 7 days
- `firstMoveReason`: Explanation citing trend momentum and demand data

**Analysis Logic:**
- Identifies regions where BOTH BigQuery demand AND Google Trends interest are high
- Interprets whether NOW is a good, neutral, or bad moment to deploy ads
- Uses rising queries to suggest ad copy angles
- Adjusts recommendations based on trend direction (RISING/STABLE/FALLING)

## UI Integration

### 1. Market Intelligence Console (`/admin/market-intelligence`)

**Google Trends Signal Card:**
- Service line, region, and time range
- Trend direction with visual badge (Rising/Stable/Falling)
- Trend strength percentage
- Top 5 search regions with interest bars
- Rising queries with growth scores
- AI trend summary

**First Move This Week Section:**
- Highlighted action based on trend + demand alignment
- Confidence score
- Reasoning citing specific trend signals

### 2. Clinics Control (`/clinics-control`)

**Local Trends Signal (in Clinic Market Intel panel):**
- Service line and region-specific trends
- Trend direction badge
- Top 3 rising queries
- Truncated AI trend summary
- First move recommendation

**Trend-Aligned Regions:**
- Region demand table highlights regions appearing in both BigQuery demand AND Google Trends top regions
- Purple "Trend-aligned" badge for optimal deployment targets

## Orchestration Flow

When admin runs a market scan:

1. **Interpret Question:**
   - Derive `serviceLine` from text ("TRT", "weight loss", "IV therapy")
   - Infer `region` from mentions ("Texas" → "US-TX", "Florida" → "US-FL", etc.)

2. **Call `bigquery_region_demand`:**
   - Fetch regional demand metrics from BigQuery

3. **Call `bigquery_clinic_search`:**
   - Find matching clinics in target regions

4. **Call `google_trends_service_line_interest`:**
   - Fetch Google Trends data for the service line and region
   - Get interest over time, top regions, rising queries

5. **Call `vertex_market_brain`:**
   - Combine all data sources
   - Generate AI analysis with trend summary and first move
   - Identify trend + demand alignment opportunities

6. **Display Results:**
   - AI Market Briefing (standard)
   - Google Trends Signal (new)
   - First Move This Week (new, highlighted)
   - Demand by Region (with trend-aligned badges)
   - Clinics to Target
   - Action Recommendations

## Current Implementation

**Status:** Mock implementation with realistic synthetic data

The current version generates realistic mock trends data that:
- Simulates rising/stable/falling trends based on service line
- Provides plausible top regions and rising queries
- Calculates trend strength and direction

**Next Steps for Production:**

1. **Integrate Real Google Trends API:**
   ```bash
   npm install google-trends-api
   ```

2. **Update `fetchGoogleTrends` function:**
   - Replace `generateMockTrendsData` with actual API calls
   - Use the `google-trends-api` package or alternative (SerpAPI, DataForSEO)
   - Handle rate limits and API errors

3. **Consider Alternatives:**
   - **SerpAPI Google Trends API** (paid, reliable)
   - **DataForSEO Google Trends API** (paid, enterprise)
   - **Custom scraper** (free but fragile)
   - **google-trends-api npm package** (unofficial but widely used)

4. **Add Caching:**
   - Cache trends data for 1-4 hours to reduce API calls
   - Store in Redis or in-memory cache

5. **Add Historical Tracking:**
   - Store trends snapshots in BigQuery
   - Track trend changes over time
   - Build predictive models

## Example Usage

### From Market Intelligence Console:

**Question:** "Where should we deploy TRT ads right now?"

**Response:**
- **Trend Summary:** "TRT interest is rising moderately nationwide, with strong spikes in TX and FL over the last 30 days."
- **Trend Confidence:** 85%
- **First Move:** "Launch a 7-day TRT test campaign in TX and FL with moderate budget to validate funnel performance while demand is climbing."
- **Top Regions (Trend-Aligned):** Texas (92 demand, 92 search interest), Florida (87 demand, 87 search interest)
- **Rising Queries:** "trt clinic near me" (+850%), "testosterone therapy cost" (+620%)

### From Clinics Control:

When selecting a Texas TRT clinic:

**Local Trends Signal:**
- Service Line: TRT in Texas
- Trend: RISING
- Rising queries: "trt clinic near me", "testosterone therapy cost"
- AI view: "TRT interest is strongly rising with 0.82 strength..."
- First move: "Launch a 7-day test campaign..."

## Benefits

1. **Timing Intelligence:** Know when to deploy ads based on search momentum
2. **Regional Insights:** Identify regions with both demand AND search interest
3. **Ad Copy Ideas:** Use rising queries to write high-converting ad copy
4. **Confidence Scores:** Data-backed recommendations with quantified confidence
5. **Market Timing:** Pause or accelerate campaigns based on trend direction
6. **Competitive Edge:** Act on demand spikes before competitors notice

## API Endpoint

**Route:** `/api/admin/mcp/market-intel`

**Supported Tools:**
- `bigquery_region_demand`
- `bigquery_clinic_search`
- `google_trends_service_line_interest` ← **NEW**
- `vertex_market_brain` (enhanced with trends)
- `orchestrate` (full workflow including trends)

**Example Request:**
```json
{
  "tool": "google_trends_service_line_interest",
  "params": {
    "serviceLine": "TRT",
    "region": "US-TX",
    "timeRange": "now 30-d"
  }
}
```

**Example Response:**
```json
{
  "tool": "google_trends_service_line_interest",
  "results": {
    "serviceLine": "TRT",
    "region": "US-TX",
    "timeRange": "now 30-d",
    "trendDirection": "RISING",
    "trendStrength": 0.82,
    "topRegions": [
      { "region": "Texas", "interestIndex": 92 },
      { "region": "Florida", "interestIndex": 87 }
    ],
    "risingQueries": [
      { "query": "trt clinic near me", "growthScore": 850 },
      { "query": "testosterone therapy cost", "growthScore": 620 }
    ]
  }
}
```

## Testing

1. **Navigate to Market Intelligence Console:**
   ```
   http://localhost:3004/admin/market-intelligence
   ```

2. **Run a test query:**
   - "Where should we deploy TRT ads right now?"
   - Click "Run Market Scan"

3. **Verify Google Trends Signal card displays:**
   - Service line and region
   - Trend direction and strength
   - Top regions
   - Rising queries
   - Trend summary

4. **Check First Move This Week section:**
   - Action recommendation
   - Confidence score
   - Reasoning

5. **Test in Clinics Control:**
   - Select a clinic
   - Run a market scan
   - Verify Local Trends Signal appears

---

**Version:** 1.1.0  
**Last Updated:** December 8, 2025  
**Status:** Mock implementation ready for production API integration

