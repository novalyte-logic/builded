# Novalyte Market Intelligence MCP Server

A Model Context Protocol (MCP) server that exposes market intelligence tools for the Novalyte™ AI admin dashboard.

## Overview

This MCP server provides three core tools for analyzing men's health market demand and targeting clinics:

1. **bigquery_region_demand** - Query BigQuery for regional demand metrics
2. **bigquery_clinic_search** - Search and filter clinics by service line and region
3. **vertex_market_brain** - AI-powered strategic analysis using Vertex AI (Gemini)

## Architecture

```
Admin Dashboard (Market Intelligence Console)
    ↓
API Route: /api/admin/mcp/market-intel
    ↓
MCP Orchestrator
    ├─→ bigquery_region_demand (BigQuery)
    ├─→ bigquery_clinic_search (BigQuery)
    └─→ vertex_market_brain (Vertex AI)
```

## Tools

### 1. bigquery_region_demand

Query aggregated demand metrics by region/state.

**Input:**
```typescript
{
  serviceLine: 'TRT' | 'WEIGHT_LOSS' | 'IV_THERAPY',
  startDate?: string, // YYYY-MM-DD
  endDate?: string    // YYYY-MM-DD
}
```

**Output:**
```typescript
[
  {
    region: string,          // e.g., "TX", "FL"
    serviceLine: string,
    demand_index: number,    // 0-100
    trend: 'RISING' | 'STABLE' | 'FALLING',
    sample_size: number
  }
]
```

**Example:**
```typescript
import { queryRegionDemand } from '@/lib/mcp/market-intel'

const demand = await queryRegionDemand({
  serviceLine: 'TRT',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
})
```

### 2. bigquery_clinic_search

Search clinics by service line, region, and text query.

**Input:**
```typescript
{
  query?: string,        // free-text search
  serviceLine?: string,  // e.g., "TRT", "GLP-1"
  region?: string        // state code, e.g., "TX"
}
```

**Output:**
```typescript
[
  {
    clinic_id: string,
    name: string,
    city: string,
    state: string,
    service_lines: string[],
    status: 'verified' | 'pending' | 'rejected',
    lead_status: 'actively_accepting' | 'at_capacity' | 'paused',
    price_band: string
  }
]
```

**Example:**
```typescript
import { searchClinics } from '@/lib/mcp/market-intel'

const clinics = await searchClinics({
  serviceLine: 'TRT',
  region: 'TX'
})
```

### 3. vertex_market_brain

AI-powered market analysis using Vertex AI (Gemini).

**Input:**
```typescript
{
  question: string,              // natural language question
  serviceLine?: string,
  regionDemand: RegionDemand[],  // from bigquery_region_demand
  clinicMatches: ClinicSearchResult[] // from bigquery_clinic_search
}
```

**Output:**
```typescript
{
  interpretedQuestion: string,
  topRegions: [
    {
      region: string,
      reason: string,
      suggestedBudgetShare: number // percentage
    }
  ],
  targetClinics: [
    {
      clinic_id: string,
      name: string,
      state: string,
      why_target: string
    }
  ],
  primaryMove: string,
  secondaryMoves: string[]
}
```

**Example:**
```typescript
import { analyzeMarket } from '@/lib/mcp/market-intel'

const analysis = await analyzeMarket({
  question: "Where should we deploy TRT ads right now?",
  serviceLine: "TRT",
  regionDemand: demand,
  clinicMatches: clinics
})
```

## API Usage

### Orchestrated Call (Recommended)

The API route handles orchestration automatically:

```typescript
const response = await fetch('/api/admin/mcp/market-intel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "Where are GLP-1 clinics needing patients this month?",
    tool: 'orchestrate',
    params: {}
  })
})

const data = await response.json()
// Returns: { serviceLine, regionDemand, clinicMatches, analysis }
```

### Individual Tool Calls

Call specific tools directly:

```typescript
// Call region demand only
const response = await fetch('/api/admin/mcp/market-intel', {
  method: 'POST',
  body: JSON.stringify({
    tool: 'bigquery_region_demand',
    params: { serviceLine: 'TRT' }
  })
})

// Call clinic search only
const response = await fetch('/api/admin/mcp/market-intel', {
  method: 'POST',
  body: JSON.stringify({
    tool: 'bigquery_clinic_search',
    params: { region: 'TX', serviceLine: 'TRT' }
  })
})

// Call market brain only
const response = await fetch('/api/admin/mcp/market-intel', {
  method: 'POST',
  body: JSON.stringify({
    tool: 'vertex_market_brain',
    params: {
      question: "Where should we deploy ads?",
      regionDemand: [...],
      clinicMatches: [...]
    }
  })
})
```

## Configuration

### Required Environment Variables

```bash
# Google Cloud
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# BigQuery (optional, for custom dataset)
BIGQUERY_DATASET=novalyte
```

### BigQuery Tables (Future)

When connecting to real BigQuery tables, use this schema:

**novalyte.market_demand:**
```sql
CREATE TABLE novalyte.market_demand (
  date DATE,
  state STRING,
  service_line STRING, -- 'TRT', 'WEIGHT_LOSS', 'IV_THERAPY'
  demand_score INT64,  -- 0-100
  trend STRING,        -- 'RISING', 'STABLE', 'FALLING'
  search_volume INT64,
  assessment_starts INT64
)
```

**novalyte.clinics:**
```sql
CREATE TABLE novalyte.clinics (
  id STRING,
  name STRING,
  city STRING,
  state STRING,
  service_lines ARRAY<STRING>,
  verification_status STRING,
  lead_acceptance_status STRING,
  price_band STRING,
  last_updated TIMESTAMP
)
```

## Error Handling

The MCP server includes:
- **Graceful fallbacks**: If Vertex AI fails, falls back to rule-based analysis
- **Mock data**: If BigQuery tables don't exist, uses in-memory mock data
- **Structured errors**: Returns clear error messages with details

## Testing

Test individual tools:

```bash
# Test region demand
curl -X POST http://localhost:3004/api/admin/mcp/market-intel \
  -H "Content-Type: application/json" \
  -d '{"tool":"bigquery_region_demand","params":{"serviceLine":"TRT"}}'

# Test clinic search
curl -X POST http://localhost:3004/api/admin/mcp/market-intel \
  -H "Content-Type: application/json" \
  -d '{"tool":"bigquery_clinic_search","params":{"region":"TX"}}'

# Test full orchestration
curl -X POST http://localhost:3004/api/admin/mcp/market-intel \
  -H "Content-Type: application/json" \
  -d '{"question":"Where should we deploy TRT ads?","tool":"orchestrate","params":{}}'
```

## Future Enhancements

- [ ] Connect to actual BigQuery tables (currently uses mock data)
- [ ] Add caching layer for frequent queries
- [ ] Implement rate limiting for Vertex AI calls
- [ ] Add more granular region targeting (city-level)
- [ ] Support time-series trend analysis
- [ ] Add competitor intelligence integration
- [ ] Implement cost tracking and budget optimization

## License

Proprietary - Novalyte™ AI

