# Novalyte Dealflow Scheduler Guide

## Overview

The **novalyte-dealflow-scheduler** is a backend scheduler system that runs Dealflow Brain cycles automatically on three schedules:

- **Every 24 hours**: Full daily drop
- **Every 6 hours**: Market temperature check
- **Every 1 hour**: Light refresh

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  SCHEDULER LAYER (Backend Only)                        │
│                                                         │
│  24h Cycle → Daily Drop                                 │
│  6h Cycle → Temperature Check                           │
│  1h Cycle → Light Refresh                              │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  DEALFLOW BRAIN                                         │
│  - Daily Lead Harvesting                                │
│  - Market Trends Intelligence                           │
│  - Predictive Demand Modeling                           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  SNAPSHOT STORAGE                                       │
│  - Daily Snapshots                                      │
│  - Temperature Logs                                     │
│  - Refresh Heartbeats                                   │
└─────────────────────────────────────────────────────────┘
```

## Schedules

### 1. 24-Hour Cycle — Daily Dealflow Drop

**Purpose**: Produce the complete "Daily Dealflow Drop" that feeds `/admin/dealflow-drops`

**Runs**: Once per day (configurable time, default: midnight)

**Steps**:
1. Full Daily Lead Harvesting
   - Calls `unified_dealflow_brain` which internally:
     - Scans TRT in Texas, Florida, California
     - Scans GLP-1 in Texas, Florida, California
     - Scans IV Therapy in Arizona + flagged regions
2. Full Market Trends Scan
   - Google Trends MCP + BigQuery
   - Detects spiking regions and categories
   - Stores top 10 "Move Zones" and top 3 "High Leverage Categories"
3. Full Predictive Demand Forecast
   - Vertex AI on assessment counts, lead conversion rates, LTV bands, regional metrics
   - Outputs regions likely to spike next 7-30 days
   - Flags clinics likely to need more patients
4. Persist Daily Snapshot
   - Stores complete snapshot with all data

**Output**: `DailySnapshot` object stored and accessible via API

### 2. 6-Hour Cycle — Market Temperature Check

**Purpose**: Track trend shifts and prevent missing fast-moving opportunities

**Runs**: Every 6 hours

**Steps**:
1. Lighter Market Trends scan
   - Google Trends MCP for TRT/GLP-1/IV Therapy
   - BigQuery only for regions already flagged as important
2. Adjust region priority scores
3. Detect emerging regions crossing thresholds
4. Mark status changes (Emerging → Immediate Opportunity, or downgrades)
5. Append Temperature Log entry

**Output**: `TemperatureLog` with region changes and quick moves

**Surfaces in**:
- `/admin/market-intelligence` as "Last 6h Moves"
- `/admin/dealflow-drops` as "Trend Updates" tiles

### 3. 1-Hour Cycle — Light Refresh

**Purpose**: Keep Admin brain feeling alive without heavy API calls

**Runs**: Every 1 hour

**Steps**:
1. Update status of leads → clinics (conversions, pipeline stages)
2. Update assessment counts per service line
3. Re-score top 20 clinics using Vertex AI
4. Store heartbeat record with updated scores and summary notes

**Output**: `RefreshHeartbeat` with updated clinic scores and metrics

**Surfaces in**:
- `/admin/dealflow` (priority badges adjust)
- `/admin/dealflow-drops` (e.g., "Clinic X moved from Medium → High priority")

## Manual Triggers

All cycles can be triggered manually from Admin pages:

### From `/admin/dealflow`:
- "Run Daily Lead Harvesting" → Triggers daily cycle
- "Run a fresh Dealflow Batch now" → Triggers export_dealflow_batch

### From `/admin/market-intelligence`:
- "Run Market Scan Now" → Triggers temperature check

### From `/admin/insights/demand`:
- "Refresh Forecasts now" → Triggers daily cycle (includes predictive modeling)

### From `/admin/dealflow-drops`:
- "Regenerate Today's Action Plan" → Triggers daily cycle

**Manual runs are tagged** with `scheduleType: 'manual'` for audit purposes.

## API Endpoints

### GET `/api/admin/dealflow/scheduler`

Retrieve snapshots or logs:

**Query Parameters**:
- `type`: `snapshot` | `temperature` | `refresh`
- `date`: Optional date (YYYY-MM-DD), defaults to today

**Examples**:
```bash
# Get latest snapshot
GET /api/admin/dealflow/scheduler?type=snapshot

# Get temperature logs for specific date
GET /api/admin/dealflow/scheduler?type=temperature&date=2024-01-15

# Get refresh heartbeats
GET /api/admin/dealflow/scheduler?type=refresh
```

### POST `/api/admin/dealflow/scheduler`

Trigger scheduler cycles manually:

**Body**:
```json
{
  "action": "trigger",
  "scheduleType": "daily" | "temperature" | "refresh"
}
```

**Example**:
```bash
POST /api/admin/dealflow/scheduler
{
  "action": "trigger",
  "scheduleType": "daily"
}
```

## Data Structures

### DailySnapshot
```typescript
{
  date: string // YYYY-MM-DD
  timestamp: string // ISO timestamp
  runId: string
  scheduleType: 'daily' | 'temperature' | 'refresh' | 'manual'
  status: 'pending' | 'running' | 'completed' | 'failed'
  hotClinics: HotClinic[]
  marketMoves: MarketMove[]
  predictiveAlerts: PredictiveAlert[]
  actionPlan: {
    immediateActions: string[]
    strategicMoves: string[]
    competitivePlays: string[]
    supplyPrep: string[]
  }
  executiveSummary: {
    totalOpportunities: number
    criticalActions: number
    estimatedRevenuePotential: string
    confidenceLevel: 'high' | 'medium' | 'low'
  }
  error?: string
  cached?: boolean // True if using last known good snapshot due to error
}
```

### TemperatureLog
```typescript
{
  timestamp: string
  runId: string
  regionChanges: Array<{
    region: string
    serviceLine: string
    previousStatus: string
    newStatus: string
    reason: string
  }>
  emergingRegions: Array<{
    region: string
    serviceLine: string
    searchVolume: number
    velocity: number
  }>
  quickMoves: string[]
}
```

### RefreshHeartbeat
```typescript
{
  timestamp: string
  runId: string
  updatedClinicScores: Array<{
    clinicName: string
    previousScore: number
    newScore: number
    reason: string
  }>
  summaryNote: string[]
  assessmentCounts: Record<string, number>
  leadConversions: number
}
```

## Guarantees & Safety

### Idempotency
- All scheduler jobs are idempotent per run ID
- Never double-insert identical snapshots for the same timestamp
- If a snapshot already exists for a date, the cycle skips (unless it failed)

### Error Handling
- All cycles fail gracefully if MCP or external APIs are down
- Errors are logged with run ID
- On failure, system uses last known good snapshot
- Admin UI shows: "Using cached intel due to source issue" when cached data is used

### Data Retention
- Daily snapshots: Last 7 days
- Temperature logs: Last 7 days
- Refresh heartbeats: Last 7 days

## Production Deployment

### Cron Setup

**Option 1: Vercel Cron (if deployed on Vercel)**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/admin/dealflow/scheduler",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/admin/dealflow/scheduler",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/admin/dealflow/scheduler",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Option 2: Cloud Scheduler (GCP)**
```bash
# Daily cycle (midnight)
gcloud scheduler jobs create http daily-dealflow \
  --schedule="0 0 * * *" \
  --uri="https://your-domain.com/api/admin/dealflow/scheduler" \
  --http-method=POST \
  --message-body='{"action":"trigger","scheduleType":"daily"}'

# Temperature check (every 6 hours)
gcloud scheduler jobs create http temperature-check \
  --schedule="0 */6 * * *" \
  --uri="https://your-domain.com/api/admin/dealflow/scheduler" \
  --http-method=POST \
  --message-body='{"action":"trigger","scheduleType":"temperature"}'

# Light refresh (every hour)
gcloud scheduler jobs create http light-refresh \
  --schedule="0 * * * *" \
  --uri="https://your-domain.com/api/admin/dealflow/scheduler" \
  --http-method=POST \
  --message-body='{"action":"trigger","scheduleType":"refresh"}'
```

**Option 3: Node.js Cron**
```typescript
import cron from 'node-cron'

// Daily cycle (midnight)
cron.schedule('0 0 * * *', async () => {
  await runDailyCycle()
})

// Temperature check (every 6 hours)
cron.schedule('0 */6 * * *', async () => {
  await runTemperatureCheck()
})

// Light refresh (every hour)
cron.schedule('0 * * * *', async () => {
  await runLightRefresh()
})
```

## Database Migration (Production)

Replace in-memory storage with database:

```sql
-- Daily snapshots table
CREATE TABLE dealflow_snapshots (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  run_id VARCHAR(255) UNIQUE NOT NULL,
  schedule_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  snapshot_data JSONB NOT NULL,
  error TEXT,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_snapshots_date_type ON dealflow_snapshots(date, schedule_type);
CREATE INDEX idx_snapshots_status ON dealflow_snapshots(status);

-- Temperature logs table
CREATE TABLE temperature_logs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  run_id VARCHAR(255) UNIQUE NOT NULL,
  log_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_temp_logs_date ON temperature_logs(date);

-- Refresh heartbeats table
CREATE TABLE refresh_heartbeats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  run_id VARCHAR(255) UNIQUE NOT NULL,
  heartbeat_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_heartbeats_date ON refresh_heartbeats(date);
```

## Monitoring

### Health Checks

Monitor scheduler health:
- Check for failed runs: `status = 'failed'`
- Check for stale snapshots: No snapshot in last 25 hours
- Check for API errors: Review error logs

### Alerts

Set up alerts for:
- Daily cycle fails 2+ times in a row
- No snapshot generated in 25+ hours
- Temperature check fails 3+ times in a row
- Light refresh fails 5+ times in a row

## Final Effect

Superadmin always wakes up to:
- ✅ Fresh daily brain (24h cycle)
- ✅ Lightly updated every hour (1h cycle)
- ✅ Recalibrated every 6 hours (6h cycle)
- ✅ Zero manual effort required
- ✅ Graceful degradation if APIs are down

