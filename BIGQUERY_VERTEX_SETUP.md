# BigQuery + Vertex AI Integration Guide

## Overview

The Novalyte™ AI Superadmin Dashboard is now powered by **Google BigQuery** (analytics warehouse) and **Vertex AI** (Gemini intelligence engine). This integration provides:

- **One source of truth** for all revenue, traffic, and attribution data
- **AI-powered insights** and predictions via Gemini
- **Real-time intelligence** for critical business decisions

---

## Architecture

```
┌─────────────────┐
│  Application    │
│  (Postgres/     │
│   Supabase)     │
└────────┬────────┘
         │ ETL/Batch Jobs
         │ (Every 5-15 min)
         ▼
┌─────────────────┐
│   BigQuery      │
│   Data Warehouse│
│   (Analytics)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vertex AI     │
│   (Gemini)      │
│   Intelligence  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Admin Dashboard│
│  (Next.js UI)   │
└─────────────────┘
```

---

## 1. BigQuery Setup

### Step 1: Create Project & Dataset

1. Create Google Cloud Project: `novalyte-analytics-project`
2. Enable BigQuery API
3. Create dataset: `novalyte_core` in region `us-west1`

### Step 2: Create Tables

Run the SQL files in `bigquery/schemas/` in order:

1. `events_app.sql` - Core events tracking
2. `ads_metrics.sql` - Advertising metrics
3. `clinic_revenue_daily.sql` - Clinic revenue aggregations
4. `assessment_funnel.sql` - Assessment funnel data
5. `marketplace_orders.sql` - Marketplace order line items

**Important Notes:**
- All tables are partitioned by date for cost optimization
- Clustering is configured for common query patterns
- Use `DATE()` partitioning for tables with timestamps

### Step 3: Set Up Data Ingestion

#### Option A: Batch ETL (Recommended for most use cases)

**Frequency:** Every 5-15 minutes

**Tools:**
- Google Cloud Functions (serverless)
- Cloud Scheduler (cron)
- Or custom Node.js service

**ETL Flow:**
```
App Database → Extract → Transform → BigQuery Load
```

**Idempotency:**
- Use `event_id`, `order_id`, `assessment_id` as unique keys
- Upsert logic: `MERGE` statements or `INSERT IGNORE`

**Example ETL Function:**
```javascript
// Pseudocode
async function syncEventsToBigQuery() {
  const recentEvents = await appDb.query(`
    SELECT * FROM events 
    WHERE created_at > (SELECT MAX(created_at) FROM bigquery.events_app)
  `)
  
  await bigquery.dataset('novalyte_core')
    .table('events_app')
    .insert(recentEvents)
}
```

#### Option B: Streaming Inserts (For real-time critical events)

**Use for:**
- `assessment_complete`
- `clinic_book`
- `purchase` events

**Tools:**
- BigQuery Streaming API
- Google Pub/Sub → BigQuery subscription
- Or direct streaming inserts from app

**Example:**
```javascript
// On assessment completion in your app
await bigquery.table('assessment_funnel').insert([{
  assessment_id: '...',
  user_id: '...',
  created_at: new Date(),
  // ... other fields
}])
```

#### Option C: Connected Transfers (For Ad Platforms)

**Google Ads → BigQuery:**
- Use BigQuery Data Transfer Service
- Set up connected account
- Schedule daily transfers

**TikTok / Meta → BigQuery:**
- Use third-party ETL (Fivetran, Airbyte)
- Or custom API polling script
- Normalize into `ads_metrics` schema

---

## 2. Vertex AI Setup

### Step 1: Enable Vertex AI API

```bash
gcloud services enable aiplatform.googleapis.com
```

### Step 2: Configure Project & Model

- **Project ID:** Same as BigQuery (`novalyte-analytics-project`)
- **Location:** `us-central1` or `us-west1`
- **Model:** `gemini-1.5-pro` or `gemini-1.5-flash`

### Step 3: Service Account Permissions

Your service account needs:
- `BigQuery Data Viewer` (read data)
- `Vertex AI User` (call Gemini)
- `BigQuery Job User` (run queries)

---

## 3. Environment Configuration

### Required Environment Variables

Create `.env.local` (never commit this):

```bash
# BigQuery
BIGQUERY_PROJECT_ID=novalyte-analytics-project
BIGQUERY_DATASET_ID=novalyte_core
BIGQUERY_REGION=us-west1

# Vertex AI
VERTEX_AI_PROJECT_ID=novalyte-analytics-project
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-1.5-pro

# Authentication
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Service Account Setup

1. Create service account in GCP Console
2. Download JSON key file
3. Set `GOOGLE_APPLICATION_CREDENTIALS` to key file path
4. Or set key JSON directly in env var (base64 encoded)

**Security:**
- Never commit service account keys
- Use secret manager in production (Google Secret Manager, AWS Secrets Manager)
- Rotate keys regularly

---

## 4. Data Access Layer

### Server-Side Functions

Located in `lib/bigquery/queries.ts`:

- `getAdminOverviewMetrics()` - System overview KPIs
- `getFunnelMetrics()` - Assessment funnel analysis
- `getClinicCohorts()` - Clinic performance data
- `getAdPerformanceByChannel()` - Ad platform metrics
- `getMarketplaceCategoryRevenue()` - Marketplace analytics

**All queries:**
- Use parameterization (no SQL injection risk)
- Respect date partitions
- Return typed TypeScript interfaces

### API Routes

Located in `app/api/admin/metrics/route.ts`:

- **GET** `/api/admin/metrics?type=overview&startDate=...&endDate=...`
- **GET** `/api/admin/metrics?type=funnel&channel=...`
- **GET** `/api/admin/metrics?type=clinics`
- **GET** `/api/admin/metrics?type=ads`
- **GET** `/api/admin/metrics?type=marketplace`

**Features:**
- In-memory caching (30-second TTL)
- Error handling
- Rate limiting ready

---

## 5. Vertex AI Intelligence Layer

### Service Functions

Located in `lib/vertex-ai/service.ts`:

1. **`scoreLead(features)`**
   - Scores lead quality
   - Predicts conversion probability
   - Recommends routing

2. **`recommendChannelShifts(metrics)`**
   - Analyzes ad performance
   - Recommends budget shifts
   - Identifies dying channels

3. **`generateWeeklyInsightsBrief(dateRange)`**
   - Market intelligence briefing
   - Best cities analysis
   - Competitive warnings

### API Routes

Located in `app/api/ai/insights/route.ts`:

- **POST** `/api/ai/insights` with body:
  ```json
  {
    "type": "score_lead" | "recommend_channels" | "weekly_brief",
    "data": { /* input data */ }
  }
  ```

**Rate Limiting:**
- 100 requests per hour per IP
- Increase for production needs

---

## 6. UI Integration

### New Pages

**`/app/ai-intelligence/page.tsx`**
- AI Revenue Intelligence Panel
- AI Clinic Performance Insights
- AI Ads & Marketplace Engine

### Components

**`BigQueryMetrics`** - Fetches and caches BigQuery data
**`AIInsightPanel`** - Displays Vertex AI insights

### Existing Pages Enhanced

- **System Overview** (`/`) - Uses BigQuery for real metrics
- **Patients** (`/patients`) - Funnel data from BigQuery
- **Clinics** (`/clinics`) - Clinic cohorts from BigQuery
- **Ads Intelligence** (`/ads-intelligence`) - Ad metrics from BigQuery
- **Marketplace** (`/marketplace`) - Category revenue from BigQuery

---

## 7. Cost Optimization

### BigQuery Costs

**Storage:**
- Partitioned tables reduce storage costs
- Set expiration policies on old partitions (90+ days → archive)

**Query Costs:**
- Use `LIMIT` clauses
- Aggregate before sending to UI
- Cache heavy queries (30-second TTL in dashboard)
- Use `EXPLAIN` to optimize slow queries

**Monitoring:**
```sql
-- Check query costs
SELECT 
  job_id,
  total_bytes_processed,
  total_bytes_processed / POW(10, 12) as TB_processed,
  total_bytes_processed / POW(10, 12) * 5 as cost_usd
FROM `region-us-west1.INFORMATION_SCHEMA.JOBS`
WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY total_bytes_processed DESC
LIMIT 10;
```

### Vertex AI Costs

**Gemini Pricing (approximate):**
- Gemini 1.5 Pro: ~$0.00125 per 1K input tokens, ~$0.005 per 1K output tokens
- Gemini 1.5 Flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens

**Optimization:**
- Cache AI insights (5-minute TTL)
- Use Flash model for simpler queries
- Batch requests where possible
- Limit response tokens in generation config

**Monitor Usage:**
- Enable Vertex AI usage logging
- Set budget alerts in GCP Console

---

## 8. Performance Considerations

### Query Performance

**Partitioning:**
- All tables partitioned by date
- Always filter by date range in WHERE clauses

**Clustering:**
- `events_app`: clustered by `event_type`, `role`, `city`
- `ads_metrics`: clustered by `platform`, `campaign_id`, `city`
- Query patterns should use clustered columns in WHERE clauses

**Example Optimized Query:**
```sql
-- Good: Uses partition and cluster
SELECT * FROM events_app
WHERE DATE(created_at) = '2024-01-15'
  AND event_type = 'assessment_complete'
  AND city = 'Los Angeles'

-- Bad: Full table scan
SELECT * FROM events_app
WHERE user_id = '...'
```

### Caching Strategy

**Server-Side:**
- In-memory cache (30-second TTL)
- Consider Redis for production

**Client-Side:**
- React Query or SWR for automatic refetching
- Cache invalidation on user actions

---

## 9. Security

### Access Control

**BigQuery:**
- Service account with minimal permissions
- Dataset-level access control
- Row-level security if needed (future enhancement)

**Vertex AI:**
- Service account with `Vertex AI User` role only
- No sensitive data in prompts (PII scrubbing)

### Data Privacy

**PII Handling:**
- Hash `user_id` if required by compliance
- Don't include PII in Vertex AI prompts
- Use aggregated data for AI analysis

**Audit Logging:**
- Enable BigQuery audit logs
- Log all admin API calls
- Track Vertex AI usage

---

## 10. Extending the System

### Adding New Metrics

1. **Add BigQuery Table** (if new data source)
   - Create schema SQL file
   - Run in BigQuery console

2. **Create Query Function**
   - Add to `lib/bigquery/queries.ts`
   - Define TypeScript interface
   - Write parameterized SQL

3. **Expose API Route**
   - Add case to `/api/admin/metrics/route.ts`
   - Add caching if needed

4. **Update UI**
   - Add component using `BigQueryMetrics`
   - Display in appropriate dashboard page

### Adding New AI Insights

1. **Define Input/Output Types**
   - Add interfaces to `lib/vertex-ai/service.ts`

2. **Create Gemini Function**
   - Write system prompt
   - Define JSON response format
   - Add to service layer

3. **Expose API**
   - Add case to `/api/ai/insights/route.ts`

4. **Update UI**
   - Use `AIInsightPanel` component
   - Display insights in relevant page

---

## 11. Troubleshooting

### BigQuery Connection Issues

**Error: "Could not load the default credentials"**
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify service account key file exists
- Ensure key has correct permissions

**Error: "Access Denied: Dataset"**
- Verify service account has `BigQuery Data Viewer` role
- Check dataset ID matches `BIGQUERY_DATASET_ID` env var

### Vertex AI Issues

**Error: "Model not found"**
- Verify `VERTEX_AI_MODEL` env var
- Check model is available in specified location
- Ensure Vertex AI API is enabled

**Rate Limiting:**
- Increase rate limits in `/api/ai/insights/route.ts`
- Add exponential backoff
- Use caching to reduce API calls

---

## 12. Production Checklist

- [ ] BigQuery tables created and partitioned
- [ ] ETL pipeline running (batch or streaming)
- [ ] Service account configured with correct permissions
- [ ] Environment variables set (not committed to git)
- [ ] Vertex AI API enabled
- [ ] Rate limiting configured
- [ ] Caching enabled (Redis recommended for production)
- [ ] Cost alerts set up in GCP Console
- [ ] Audit logging enabled
- [ ] Error monitoring (Sentry, etc.)
- [ ] Performance monitoring

---

## Summary

The Novalyte™ AI dashboard now has:

✅ **BigQuery** as central analytics warehouse  
✅ **Vertex AI (Gemini)** as intelligence engine  
✅ **Server-side data access** layer with typed functions  
✅ **AI insights** integrated into UI  
✅ **Secure** credential management  
✅ **Optimized** queries with partitioning & caching  

**Result:** A true data-driven, AI-powered control tower for men's health platform operations.

