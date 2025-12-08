# Novalyte™ AI — MCP-Powered Clinical Operating System
## ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND UI MODULES                                  │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ /admin/dealflow  │  │/admin/market-intel│  │/admin/workforce  │        │
│  │                  │  │                  │  │                  │        │
│  │ • Clinic Pipeline│  │ • Market Trends  │  │ • Staff Search   │        │
│  │ • Revenue Intel  │  │ • Competitor Maps│  │ • Shift Matching │        │
│  │ • Opportunity    │  │ • Product Perf   │  │ • Gap Alerts     │        │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘        │
│           │                      │                      │                   │
└───────────┼──────────────────────┼──────────────────────┼───────────────────┘
            │                      │                      │
            │ API Calls            │ API Calls            │ API Calls
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MCP SERVER LAYER                                   │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐│
│  │novalyte-dealflow-mcp │  │novalyte-market-intel  │  │novalyte-workforce││
│  │                      │  │        -mcp           │  │      -mcp        ││
│  │ • get_clinic_pipeline│  │ • get_treatment_trend  │  │ • find_staff     ││
│  │ • get_demand_spikes  │  │ • get_competitor_dens │  │ • match_shifts   ││
│  │ • rank_clinics       │  │ • list_products       │  │ • alert_gaps     ││
│  └───────┬──────────────┘  └───────┬──────────────┘  └───────┬────────────┘│
│          │                         │                         │              │
│  ┌───────┴──────────┐  ┌───────────┴──────────┐  ┌───────────┴──────────┐ │
│  │ BigQuery MCP     │  │ PostgreSQL MCP      │  │ Web Search MCP       │ │
│  │ Gmail MCP        │  │ Slack MCP           │  │ Twilio MCP           │ │
│  └──────────────────┘  └─────────────────────┘  └───────────────────────┘ │
└───────────┬──────────────────────┬──────────────────────┬───────────────────┘
            │                      │                      │
            │ Delegate             │ Delegate             │ Delegate
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYER (Vertex AI)                           │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │ Demand Spike     │  │ Clinic Ranking    │  │ Workforce Match   │       │
│  │ Detection        │  │ Models           │  │ Engine            │       │
│  │                  │  │                  │  │                   │       │
│  │ • Regional trends│  │ • Opportunity    │  │ • Compatibility   │       │
│  │ • Forecasting    │  │   scoring        │  │   scoring         │       │
│  │ • Pattern recog  │  │ • Revenue calc   │  │ • Skill alignment │       │
│  └──────────────────┘  └──────────────────┘  └───────────────────┘       │
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │ Treatment Trend  │                                                       │
│  │ Analysis         │                                                       │
│  │                  │                                                       │
│  │ • Market movement│                                                       │
│  │ • Competitor pat │                                                       │
│  └──────────────────┘                                                       │
└───────────┬──────────────────────┬──────────────────────┬───────────────────┘
            │                      │                      │
            │ Query                │ Query                │ Query
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ BigQuery         │  │ PostgreSQL       │  │ External APIs    │        │
│  │                  │  │                  │  │                  │        │
│  │ • Demand signals │  │ • Clinics        │  │ • Staffing       │        │
│  │ • Intent track   │  │ • Staff          │  │   platforms      │        │
│  │ • Regional spikes│  │ • Vendors        │  │ • Vendor catalogs│        │
│  │ • Event streams  │  │ • Shifts         │  │ • Competitor intel│       │
│  │                  │  │ • Pipeline data  │  │                  │        │
│  └──────────────────┘  └──────────────────┘  └───────────────────┘        │
└───────────┬──────────────────────┬──────────────────────┬───────────────────┘
            │                      │                      │
            │ Trigger              │ Trigger              │ Trigger
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ACTIVATION LAYER                                    │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Gmail            │  │ Slack            │  │ Twilio           │        │
│  │                  │  │                  │  │                  │        │
│  │ • Clinic outreach│  │ • Demand alerts  │  │ • SMS to staff   │        │
│  │ • Vendor comms   │  │ • Staffing gaps  │  │ • Urgent alerts  │        │
│  │ • Follow-ups     │  │ • Revenue alerts │  │ • Notifications  │        │
│  └──────────────────┘  └──────────────────┘  └───────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
│                                                                              │
│  User Request:                                                               │
│  Superadmin → Admin UI → MCP Server → Data/Vertex → Results → Admin UI     │
│                                                                              │
│  Intelligence Flow:                                                          │
│  MCP Server → Vertex AI → Analysis → Insights → MCP Server → Admin UI     │
│                                                                              │
│  Activation Flow:                                                            │
│  MCP Server → Detection → Activation MCP → External Service → Recipient    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPONENT SUMMARY                                   │
│                                                                              │
│  Frontend UI Modules:    3 pages                                            │
│  MCP Servers:            9 servers (3 custom + 6 external)                  │
│  MCP Tools:              15+ tools                                          │
│  Vertex AI Models:       4 intelligence engines                              │
│  Data Sources:           3 primary (BigQuery, PostgreSQL, External APIs)    │
│  Activation Services:    3 channels (Gmail, Slack, Twilio)                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Connections

### Frontend → MCP Layer
```
/admin/dealflow      → novalyte-dealflow-mcp
/admin/market-intel  → novalyte-market-intel-mcp
/admin/workforce     → novalyte-workforce-mcp
```

### MCP → Data Layer
```
novalyte-dealflow-mcp    → BigQuery (demand) + PostgreSQL (clinics)
novalyte-market-intel-mcp → BigQuery (trends) + Web Search (competitors)
novalyte-workforce-mcp    → PostgreSQL (staff) + External APIs (jobs)
```

### MCP → Intelligence Layer
```
novalyte-dealflow-mcp    → Vertex AI (Demand Detection, Clinic Ranking)
novalyte-market-intel-mcp → Vertex AI (Trend Analysis)
novalyte-workforce-mcp    → Vertex AI (Matching Engine)
```

### MCP → Activation Layer
```
novalyte-dealflow-mcp    → Gmail MCP (outreach) + Slack MCP (alerts)
novalyte-market-intel-mcp → Gmail MCP (vendor comms) + Slack MCP (trends)
novalyte-workforce-mcp    → Slack MCP (gaps) + Twilio MCP (urgent)
```

