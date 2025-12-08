# Novalyte™ AI — MCP-Powered Clinical Operating System
## Detailed Architecture Documentation

## System Overview

The Novalyte™ AI Clinical Operating System is a comprehensive MCP-powered platform that combines frontend intelligence dashboards, backend MCP servers, Vertex AI intelligence, and activation services to provide a complete clinical operations management system.

---

## Architecture Layers

### Layer 1: Frontend UI Modules

**Location**: `/app/admin/*`

#### `/admin/dealflow`
- **Purpose**: Clinic pipeline analysis and revenue intelligence
- **Key Features**:
  - Clinic pipeline visualization
  - Regional demand spike detection
  - Opportunity ranking and scoring
  - Revenue potential analysis
- **MCP Integration**: `novalyte-dealflow-mcp`
- **Tools Used**:
  - `get_clinic_pipeline`
  - `get_regional_demand_spikes`
  - `rank_clinics_by_opportunity`

#### `/admin/market-intel`
- **Purpose**: Market trends and competitor analysis
- **Key Features**:
  - Treatment trend mapping
  - Competitor density analysis
  - High-performing product identification
  - Market saturation scoring
- **MCP Integration**: `novalyte-market-intel-mcp`
- **Tools Used**:
  - `get_treatment_trend_map`
  - `get_competitor_density`
  - `list_high_performing_products`

#### `/admin/workforce`
- **Purpose**: Staffing and shift matching
- **Key Features**:
  - Available staff search
  - Shift-to-staff matching
  - Staffing gap alerts
  - Compatibility scoring
- **MCP Integration**: `novalyte-workforce-mcp`
- **Tools Used**:
  - `find_available_staff`
  - `match_shifts_to_staff`
  - `alert_clinic_staffing_gap`

---

### Layer 2: MCP Server Layer

#### Custom Novalyte MCP Servers

**1. novalyte-dealflow-mcp**
- **Endpoint**: `http://localhost:3000/api/admin/mcp/dealflow`
- **Version**: 2.0.0
- **Tools**: 3
- **Data Sources**: BigQuery, PostgreSQL, External APIs
- **Intelligence**: Vertex AI (Demand Detection, Clinic Ranking)

**2. novalyte-market-intel-mcp**
- **Endpoint**: `http://localhost:3000/api/admin/mcp/market-intel`
- **Version**: 2.0.0
- **Tools**: 3
- **Data Sources**: BigQuery, Web Search, PostgreSQL
- **Intelligence**: Vertex AI (Trend Analysis)

**3. novalyte-workforce-mcp**
- **Endpoint**: `http://localhost:3000/api/admin/mcp/workforce`
- **Version**: 2.0.0
- **Tools**: 3
- **Data Sources**: PostgreSQL, External Staffing APIs
- **Intelligence**: Vertex AI (Matching Engine)

#### External MCP Servers

**4. BigQuery MCP**
- **Purpose**: Query demand, intent, marketplace events
- **Transport**: stdio
- **Configuration**: Requires Google Cloud credentials

**5. PostgreSQL MCP**
- **Purpose**: Read/write clinic, vendor, workforce data
- **Transport**: stdio
- **Configuration**: Requires connection string

**6. Web Search MCP**
- **Purpose**: Competitor + market research
- **Transport**: stdio
- **Configuration**: Requires Serper API key

**7. Gmail MCP**
- **Purpose**: Clinic/vendor outreach
- **Transport**: stdio
- **Configuration**: Requires OAuth credentials

**8. Slack MCP**
- **Purpose**: Internal operational alerts
- **Transport**: stdio
- **Configuration**: Requires bot token

**9. Twilio MCP**
- **Purpose**: SMS activation layer
- **Transport**: stdio
- **Configuration**: Requires Twilio credentials

---

### Layer 3: Intelligence Layer (Vertex AI)

#### Demand Spike Detection
- **Input**: Regional data, treatment categories, time windows
- **Output**: Spike magnitude, trend analysis, opportunity scores
- **Used By**: `novalyte-dealflow-mcp`
- **Models**: Gemini Pro, custom forecasting models

#### Clinic Ranking Models
- **Input**: Pipeline data, conversion rates, demand signals
- **Output**: Opportunity scores, ranking rationale, recommended actions
- **Used By**: `novalyte-dealflow-mcp`
- **Models**: Custom scoring algorithms + Vertex AI

#### Workforce Matching Engine
- **Input**: Shifts, staff profiles, availability windows
- **Output**: Compatibility scores, match recommendations
- **Used By**: `novalyte-workforce-mcp`
- **Models**: Skill matching algorithms + Vertex AI

#### Treatment Trend Analysis
- **Input**: Market data, search trends, competitor activity
- **Output**: Trend maps, growth rates, market signals
- **Used By**: `novalyte-market-intel-mcp`
- **Models**: Time series analysis + Vertex AI

---

### Layer 4: Data Layer

#### BigQuery Datasets
- **demand_signals**: Regional demand indices
- **intent_tracking**: Search intent, assessment starts
- **regional_spikes**: Demand spike events
- **event_streams**: Real-time clinic events

#### PostgreSQL Tables
- **clinics**: Clinic profiles, locations, service lines
- **staff**: Staff profiles, skills, availability
- **vendors**: Vendor catalogs, pricing, availability
- **shifts**: Shift definitions, assignments, status
- **pipeline**: Lead → Assessment → Patient conversion data

#### External APIs
- **Staffing Platforms**: Job boards, temp agencies, nurse marketplaces
- **Vendor Catalogs**: Product pricing, availability, specifications
- **Competitor Intelligence**: Ad activity, market presence, pricing

---

### Layer 5: Activation Layer

#### Gmail Integration
- **Triggered By**: Dealflow opportunities, market intelligence alerts
- **Actions**: 
  - Clinic outreach emails
  - Vendor communication
  - Follow-up sequences
- **MCP**: `Gmail MCP`

#### Slack Integration
- **Triggered By**: Demand spikes, staffing gaps, revenue alerts
- **Actions**:
  - Real-time notifications
  - Channel updates
  - Alert summaries
- **MCP**: `Slack MCP`

#### Twilio Integration
- **Triggered By**: Urgent staffing needs, critical alerts
- **Actions**:
  - SMS notifications to staff
  - Clinic alerts
  - Urgent communications
- **MCP**: `Twilio MCP`

---

## Data Flow Patterns

### Pattern 1: Clinic Pipeline Analysis
```
User → /admin/dealflow → novalyte-dealflow-mcp → 
  [BigQuery MCP → BigQuery] + 
  [PostgreSQL MCP → PostgreSQL] → 
  Vertex AI (Ranking) → 
  Results → /admin/dealflow → User
```

### Pattern 2: Market Intelligence Query
```
User → /admin/market-intel → novalyte-market-intel-mcp → 
  [BigQuery MCP → BigQuery] + 
  [Web Search MCP → External APIs] → 
  Vertex AI (Trend Analysis) → 
  Results → /admin/market-intel → User
```

### Pattern 3: Workforce Matching
```
User → /admin/workforce → novalyte-workforce-mcp → 
  [PostgreSQL MCP → PostgreSQL] + 
  [External Staffing APIs] → 
  Vertex AI (Matching Engine) → 
  Results → /admin/workforce → User
```

### Pattern 4: Alert Activation
```
MCP Server → Detection → 
  [Slack MCP → Slack] OR 
  [Gmail MCP → Gmail] OR 
  [Twilio MCP → SMS] → 
  Recipient
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **UI**: React, Tailwind CSS
- **State**: React Hooks, Local Storage
- **Routing**: Next.js App Router

### Backend
- **API Routes**: Next.js API Routes
- **MCP Protocol**: Model Context Protocol 2024-11-05
- **AI**: Google Vertex AI (Gemini Pro)
- **Database**: PostgreSQL, BigQuery

### External Services
- **Email**: Gmail API (via MCP)
- **Messaging**: Slack API (via MCP)
- **SMS**: Twilio API (via MCP)
- **Search**: Serper API (via MCP)

---

## Security & Access

- **Admin-Only**: All MCP servers require admin authentication
- **API Keys**: Stored in environment variables
- **Data Privacy**: No patient data in external MCP calls
- **Audit Logging**: All tool calls logged with timestamps

---

## Scalability

- **Horizontal Scaling**: MCP servers can be distributed
- **Caching**: Results cached for performance
- **Rate Limiting**: API rate limits enforced
- **Async Processing**: Long-running tasks use background jobs

---

## Monitoring & Observability

- **MCP Server Status**: Tracked in admin dashboard
- **Tool Call Logs**: Stored in PostgreSQL
- **Error Tracking**: Centralized error logging
- **Performance Metrics**: Response times, success rates

---

## Future Enhancements

- **Real-time Updates**: WebSocket connections for live data
- **Batch Processing**: Scheduled MCP tool executions
- **Multi-tenant Support**: Clinic-specific data isolation
- **Advanced Analytics**: ML models for predictive insights

