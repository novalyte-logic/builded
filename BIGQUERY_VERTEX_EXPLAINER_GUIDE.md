# BigQuery + Vertex AI Integration with Hover Explainers

## Overview

The Novalyte™ AI Superadmin Dashboard is powered by **Google BigQuery** (data warehouse) and **Vertex AI/Gemini** (intelligence engine), with **interactive hover explainers** on every key element to create a self-explaining control tower.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Admin Dashboard UI                     │
│  (Dark Matte Theme - No Changes to Aesthetics)          │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Metric Card │  │   Chart     │  │  Filter     │    │
│  │  + Tooltip  │  │  + Tooltip  │  │  + Tooltip  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Server-Side API Routes                      │
│  /api/admin/metrics  |  /api/ai/insights                │
└─────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐        ┌──────────────────────┐
│   BigQuery       │        │    Vertex AI         │
│  Data Warehouse  │        │   (Gemini)           │
│                  │        │  Intelligence Layer  │
│  - events_app    │        │                      │
│  - ads_metrics   │        │  - Lead Scoring      │
│  - clinic_revenue│        │  - Recommendations   │
│  - assessments   │        │  - Market Insights   │
│  - marketplace   │        │                      │
└──────────────────┘        └──────────────────────┘
```

---

## 1. Hover Explainer System

### Component: `<Explainer />`

**Location:** `components/Explainer.tsx`

**Purpose:** Reusable tooltip component that appears on hover/tap, providing contextual information about any dashboard element.

**API:**
```tsx
<Explainer
  title="Metric Name"
  what="One sentence defining what this metric/visual represents"
  why="1-2 sentences explaining why it matters"
  how={[
    "Actionable bullet 1",
    "Actionable bullet 2",
    "Actionable bullet 3"
  ]}
  position="top" | "bottom" | "left" | "right"
>
  {/* The element to wrap (card, chart, filter, etc.) */}
</Explainer>
```

**Behavior:**
- **Desktop:** Hover to show, mouse leave to hide
- **Mobile:** Tap to show, tap outside or close button to hide
- **Keyboard:** Focusable, ESC to close
- **Styling:** Matches existing dark matte theme, no gradients

**Example Usage:**
```tsx
<Explainer
  title="Channel ROI"
  what="Channel ROI shows how much revenue you make for each dollar spent on ads per platform."
  why="Use this to quickly spot which channels are actually profitable and which ones are leaking budget."
  how={[
    "If ROI is low and spend is high, reduce budget here.",
    "If ROI is high but spend is low, consider scaling this channel.",
    "Click the channel name to drill into performance."
  ]}
>
  <MetricCard title="Channel ROI" value="4.2x" />
</Explainer>
```

### Wrapper Component: `<MetricCardWithExplainer />`

**Location:** `components/MetricCardWithExplainer.tsx`

**Purpose:** Convenience wrapper combining `MetricCard` + `Explainer` for common use case.

---

## 2. BigQuery Data Layer

### Query Functions

**Location:** `lib/bigquery/queries.ts`

All queries are:
- Parameterized (SQL injection safe)
- Optimized with partitioning/clustering
- Typed with TypeScript interfaces
- Cached server-side (30-second TTL)

#### Available Functions:

1. **`getAdminOverviewMetrics(dateRange)`**
   - Returns: Total revenue, new clinics, assessment stats, marketplace revenue
   - Used in: System Overview page
   - SQL: Aggregates from `clinic_revenue_daily`, `assessment_funnel`, `marketplace_orders`

2. **`getFunnelMetrics(dateRange, channel?, path?)`**
   - Returns: Funnel drop-off rates by step, completion rates
   - Used in: Patients Intelligence page
   - SQL: Analyzes `assessment_funnel` with optional filters

3. **`getClinicCohorts(dateRange, clinicId?)`**
   - Returns: Clinic performance leaderboard
   - Used in: Clinics Intelligence page
   - SQL: Aggregates `clinic_revenue_daily`

4. **`getAdPerformanceByChannel(dateRange)`**
   - Returns: ROAS, CPA, CTR by platform/campaign
   - Used in: Ads Intelligence page
   - SQL: Aggregates `ads_metrics`

5. **`getMarketplaceCategoryRevenue(dateRange, category?)`**
   - Returns: Revenue, margin, orders by category
   - Used in: Marketplace Intelligence page
   - SQL: Aggregates `marketplace_orders`

6. **`getCityPerformance(dateRange)`** ⭐ NEW
   - Returns: Revenue, assessments, conversion rates by city
   - Used in: Market Domination, System Overview
   - SQL: Joins `clinic_revenue_daily` + `assessment_funnel` by city

7. **`getTrendingProtocols(dateRange)`** ⭐ NEW
   - Returns: Growth rates, completion rates by assessment path (TRT, GLP-1, etc.)
   - Used in: System Overview, Market Domination
   - SQL: Compares current vs previous period from `assessment_funnel`

### API Endpoints

**Location:** `app/api/admin/metrics/route.ts`

- `GET /api/admin/metrics?type=overview&startDate=...&endDate=...`
- `GET /api/admin/metrics?type=funnel&channel=...&path=...`
- `GET /api/admin/metrics?type=clinics`
- `GET /api/admin/metrics?type=ads`
- `GET /api/admin/metrics?type=marketplace`
- `GET /api/admin/metrics?type=cities` ⭐ NEW
- `GET /api/admin/metrics?type=trending_protocols` ⭐ NEW

---

## 3. Vertex AI Intelligence Layer

### Service Functions

**Location:** `lib/vertex-ai/service.ts`

All functions:
- Call Gemini with structured prompts
- Return typed JSON responses
- Handle errors gracefully
- Include confidence scores

#### Available Functions:

1. **`scoreLeadQuality(features)`** ⭐ NEW
   - Input: Lead features (channel, city, path, device, etc.)
   - Output: Conversion probability, predicted LTV, routing recommendation
   - Used in: Patient intelligence, Clinic routing

2. **`recommendChannelShifts(metrics, dateRange)`**
   - Input: Ad performance metrics array
   - Output: Budget shift recommendations (increase/decrease/kill)
   - Used in: Ads Intelligence, Budget Auto-Scaling

3. **`generateWeeklyInsightsBrief(dateRange)`**
   - Input: Date range
   - Output: Market intelligence summary
   - Used in: Market Domination, System Overview

4. **`generateClinicInsight(clinicId, clinicData)`** ⭐ NEW
   - Input: Clinic ID + performance data
   - Output: Strengths, weaknesses, recommendations, risk level
   - Used in: Clinics Intelligence detail panels

5. **`generateWeeklyAdminBrief(summaries, dateRange)`** ⭐ NEW
   - Input: BigQuery summaries (top cities, paths, SKUs, clinics)
   - Output: Bullet points, revenue sources, CAC warnings, clinic risks
   - Used in: System Overview, Executive briefing

### API Endpoints

**Location:** `app/api/ai/insights/route.ts`

- `POST /api/ai/insights` with body:
  ```json
  {
    "type": "score_lead_quality" | "recommend_channels" | "weekly_brief" | "clinic_insight" | "admin_brief",
    "data": { /* type-specific data */ }
  }
  ```

**Rate Limiting:**
- 100 requests/hour per IP (configurable)
- Heavy operations (like weekly brief) should be cached

---

## 4. Dashboard UI Integration

### System Overview Page (`app/page.tsx`)

**Panels:**

1. **Top-Level KPIs** (with explainers)
   - Total Revenue (30d)
   - New Clinics
   - Assessment Starts vs Completions
   - Marketplace Revenue

2. **Trending Protocols** (with explainers)
   - Growth rates by path (TRT, GLP-1, Peptides, etc.)
   - Bar chart with hover explainers

3. **City Performance** (with explainers)
   - Revenue by city
   - Top cities table with explainers

4. **Gemini Weekly Brief** (auto-refresh every 5 min)
   - AI-generated summary
   - Bullet points, warnings, opportunities

### Adding Explainers to New Elements

**Pattern:**

```tsx
import Explainer from '@/components/Explainer'

// Wrap any element
<Explainer
  title="Your Metric Name"
  what="What is this metric/visual in plain language?"
  why="Why should the Superadmin care about this?"
  how={[
    "Actionable instruction 1",
    "Actionable instruction 2",
    "Actionable instruction 3"
  ]}
  position="top"
>
  <YourComponent />
</Explainer>
```

**Best Practices:**

1. **Be Specific:** Explainers should answer "What, Why, How" clearly
2. **Be Actionable:** The "How" section should include real decisions
3. **Be Concise:** Keep explainers scannable (3-5 lines max per section)
4. **Match Context:** Explainers should reference actual data being shown

---

## 5. Data Ingestion Strategy

### App → BigQuery

**Frequency:** Every 5-15 minutes (batch) or real-time (streaming)

**Tables:**
- `events_app` - All user interactions
- `assessment_funnel` - Assessment journeys
- `clinic_revenue_daily` - Daily clinic aggregations
- `marketplace_orders` - Order line items

**Idempotency:**
- Use `event_id`, `assessment_id`, `order_id` as unique keys
- Use `MERGE` statements or `INSERT IGNORE` to avoid duplicates

**Partitioning:**
- All tables partitioned by `DATE(created_at)` or `date` column
- Queries MUST filter by date range to use partitions efficiently

### Ad Platforms → BigQuery

**Google Ads:**
- Use BigQuery Data Transfer Service (scheduled daily)

**Meta/TikTok/Instagram:**
- Use ETL connector (Fivetran, Airbyte) or custom pipeline
- Normalize into `ads_metrics` schema

**Frequency:**
- Daily batch (overnight)
- Revenue attribution backfilled daily

---

## 6. Cost Optimization

### BigQuery

**Storage:**
- Partitioned tables reduce storage costs
- Set expiration policies on old partitions (90+ days → archive)

**Query Costs:**
- Always filter by date range (uses partitions)
- Use `LIMIT` clauses
- Aggregate before sending to UI
- Cache heavy queries (30-second TTL in dashboard)

**Monitoring:**
```sql
-- Check query costs
SELECT 
  job_id,
  total_bytes_processed / POW(10, 12) as TB_processed,
  total_bytes_processed / POW(10, 12) * 5 as cost_usd
FROM `region-us-west1.INFORMATION_SCHEMA.JOBS`
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY total_bytes_processed DESC
LIMIT 10;
```

### Vertex AI

**Pricing:**
- Gemini 1.5 Pro: ~$0.00125 per 1K input tokens, ~$0.005 per 1K output tokens
- Gemini 1.5 Flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens

**Optimization:**
- Cache AI insights (5-minute TTL for weekly briefs, 1-hour for lead scoring)
- Use Flash model for simpler queries
- Batch requests where possible
- Limit response tokens in generation config

---

## 7. Security

### Credentials

- All service account keys in environment variables
- Never expose in client-side bundles
- Use secret manager in production (Google Secret Manager, AWS Secrets Manager)

### Access Control

- BigQuery: Service account with `BigQuery Data Viewer` + `BigQuery Job User` roles
- Vertex AI: Service account with `Vertex AI User` role
- API routes: Add authentication middleware (Superadmin only)

### Data Privacy

- Hash `user_id` if required by compliance
- Don't include PII in Vertex AI prompts
- Use aggregated data for AI analysis

---

## 8. Extending the System

### Adding a New Metric

1. **Add BigQuery Query Function** (`lib/bigquery/queries.ts`)
   - Define TypeScript interface
   - Write parameterized SQL
   - Return typed results

2. **Add API Route Case** (`app/api/admin/metrics/route.ts`)
   - Add new `type` case
   - Add caching if needed

3. **Add UI Component** (any page)
   - Fetch from API
   - Display with chart/card
   - Add `<Explainer />` wrapper

### Adding a New AI Insight

1. **Add Vertex AI Function** (`lib/vertex-ai/service.ts`)
   - Define input/output interfaces
   - Write system prompt
   - Return typed JSON

2. **Add API Route Case** (`app/api/ai/insights/route.ts`)
   - Add new `type` case
   - Handle input data

3. **Add UI Component**
   - Use `AIInsightPanel` or custom component
   - Display insights

### Adding Explainer to Existing Element

```tsx
// Before
<MetricCard title="Revenue" value="$1.2M" />

// After
<Explainer
  title="Total Revenue"
  what="Total revenue from all clinics and marketplace over the selected time period."
  why="This is your primary health metric - tracks overall business performance."
  how={[
    "Compare to previous period to track growth.",
    "Break down by city or clinic to identify top performers.",
    "Use trends to forecast future revenue."
  ]}
>
  <MetricCard title="Revenue" value="$1.2M" />
</Explainer>
```

---

## 9. Performance Considerations

### Query Performance

- **Always filter by date** (uses partitioning)
- **Use clustering** (event_type, role, city for `events_app`)
- **Limit result sets** before sending to UI
- **Aggregate in SQL** rather than in JavaScript

### Caching Strategy

- **Server-side:** In-memory cache (30-second TTL for metrics)
- **Client-side:** React Query or SWR for auto-refetching
- **AI insights:** Cache for 5 minutes (weekly briefs) to 1 hour (lead scoring)

### Rendering Performance

- **Lazy load charts** (only render when scrolled into view)
- **Debounce hover tooltips** (prevent flicker)
- **Use React.memo** for expensive components

---

## 10. Example: Complete Integration

**File:** `app/page.tsx` (System Overview)

```tsx
'use client'

import BigQueryMetrics from '@/components/BigQueryMetrics'
import MetricCardWithExplainer from '@/components/MetricCardWithExplainer'
import Explainer from '@/components/Explainer'
import { DollarSign, Building2 } from 'lucide-react'

export default function SystemOverviewPage() {
  return (
    <div className="p-8">
      {/* Revenue Metric with Explainer */}
      <BigQueryMetrics endpoint="overview" params={{ startDate: '2024-01-01', endDate: '2024-01-31' }}>
        {(data, loading, error) => (
          <MetricCardWithExplainer
            title="Total Revenue (30d)"
            value={`$${(data?.totalRevenue || 0).toLocaleString()}`}
            icon={<DollarSign />}
            explainerTitle="Total Revenue"
            explainerWhat="Total revenue from all clinics and marketplace over the last 30 days."
            explainerWhy="This is your primary health metric - tracks overall business performance and growth velocity."
            explainerHow={[
              "Compare to previous period to track growth trends.",
              "Break down by city or clinic to identify top performers.",
              "Use revenue trends to forecast future performance."
            ]}
          />
        )}
      </BigQueryMetrics>

      {/* Chart with Explainer */}
      <Explainer
        title="Revenue by Protocol"
        what="Shows revenue breakdown by assessment path (TRT, GLP-1, Peptides, etc.)."
        why="Identifies which protocols drive the most revenue and where to focus marketing."
        how={[
          "Focus marketing on highest-revenue protocols.",
          "Investigate low-revenue protocols for optimization opportunities.",
          "Track growth trends to spot emerging winners."
        ]}
      >
        <RealtimeChart dataKey="revenue" />
      </Explainer>
    </div>
  )
}
```

---

## Summary

The dashboard now provides:

✅ **BigQuery** = Central data warehouse with optimized queries  
✅ **Vertex AI** = Intelligent recommendations and insights  
✅ **Hover Explainers** = Self-explaining UI on every element  
✅ **Actionable Intelligence** = Every number is explainable, every chart is actionable  

**Result:** A true control tower where the Superadmin can hover over any element to understand what it is, why it matters, and how to use it to make better decisions.

