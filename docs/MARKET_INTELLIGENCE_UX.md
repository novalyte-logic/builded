# Novalyte™ Market Intelligence Console – User Experience Guide

## Overview

The Market Intelligence Console connects Superadmins directly to live demand signals, combining **BigQuery analytics**, **Google Trends**, and **Vertex AI** to answer: _"What's happening, and what should I do first?"_

---

## Example 1: Weight Loss Clinic Demand Analysis

### Scenario
Superadmin wants to know if weight loss clinics need patients and where to deploy ads.

### User Action
Navigate to `/admin/market-intelligence` and ask:

> **"Are weight loss clinics needing patients right now, and where should we deploy ads?"**

Click **"Run Market Scan"**

### System Response

#### 1. AI Market Briefing
**Interpreted Question:**  
"Which regions have high demand for weight loss services and which clinics are actively accepting patients?"

**Top Regions to Target:**
- California
- New York
- Florida

**Why These Regions:**
- California: High demand index (95/100) with rising trend. Strong search momentum.
- New York: Demand index (88/100) with stable trend. Premium market fit.
- Florida: Demand index (82/100) with rising trend. Clinic capacity available.

**Recommended Move:**
"Deploy weight loss ads in California with 45% of budget, New York with 30%, and Florida with 25%."

---

#### 2. Google Trends Signal
**Service Line:** WEIGHT_LOSS  
**Region:** US  
**Time Range:** now 30-d  
**Trend:** 🟢 **RISING (76% strength)**

**Top Search Regions:**
- California: █████████████████████ 95
- New York: ████████████████ 88  
- Florida: ██████████████ 82
- Texas: ████████████ 76
- Illinois: ██████████ 71

**Rising Queries:**
- ↗ semaglutide weight loss (+1200% growth)
- ↗ glp-1 near me (+980% growth)
- ↗ ozempic clinic (+870% growth)
- ↗ medical weight loss (+650% growth)
- ↗ weight loss injection (+540% growth)

**AI Trend Summary:**
"WEIGHT_LOSS interest is rising moderately nationwide, with strong spikes in CA, NY, and FL over the last 30 days. GLP-1 and semaglutide queries are spiking, indicating high consumer awareness. Now is an optimal time to deploy ads."

---

#### 3. First Move This Week
**🎯 Confidence: 82%**

**Action:**
"Launch a 7-day test campaign for GLP-1 weight loss clinics in California and New York with moderate budget to validate funnel performance while demand is climbing."

**Why:**
"Google Trends shows rising interest (0.76 strength) with spiking GLP-1-related queries aligning with high BigQuery demand (95/100 in CA, 88/100 in NY). Strike while momentum is building."

---

#### 4. Demand by Region
| Region | Service Line | Demand Index | Trend | Sample Size |
|--------|--------------|--------------|-------|-------------|
| California 🟣 **Trend-aligned** | Weight Loss | 95 | Rising | 1,247 |
| New York 🟣 **Trend-aligned** | Weight Loss | 88 | Stable | 892 |
| Florida 🟣 **Trend-aligned** | Weight Loss | 82 | Rising | 743 |
| Texas | Weight Loss | 76 | Rising | 654 |
| Illinois | Weight Loss | 71 | Stable | 521 |

---

#### 5. Clinics to Target
| Clinic Name | City/State | Service Lines | Needs Patients? | Why Target |
|-------------|------------|---------------|-----------------|------------|
| LA Wellness Center | Los Angeles, CA | Weight Loss, TRT, IV | Yes | Actively accepting in high-demand region. Premium price band. |
| NYC Vitality Clinic | New York, NY | Weight Loss, Longevity | Yes | Strong GLP-1 capacity. Trend-aligned location. |
| Miami Optimal Health | Miami, FL | Weight Loss, TRT | Yes | Rising demand region. Telehealth-enabled. |

---

#### 6. Recommended Moves
1. **Deploy weight loss ads in California with 45% of budget, New York with 30%, and Florida with 25%.**
2. Reach out to LA Wellness Center with lead partnership proposal
3. Launch retargeting campaign in New York (30% budget)
4. Test new creative angles emphasizing "medical weight loss" and "GLP-1"
5. Monitor conversion rates and adjust budget allocation between regions after 2 weeks

---

## Example 2: Clinic-Specific Trends Analysis

### Scenario
Superadmin selects **Miami Optimal Health** (a TRT clinic in Florida) from the Clinics Control page and wants to know if TRT demand is heating up or cooling off in that region.

### User Action
1. Navigate to `/clinics-control`
2. Click on **Miami Optimal Health** (Florida, TRT clinic)
3. In the **Clinic Market Intel** panel, ask:

> **"Is TRT in Florida heating up or cooling off?"**

Click **"Run Scan"**

### System Response

#### 1. AI Market Briefing
**Interpreted Question:**  
"What is the current TRT demand trend in Florida?"

**Primary Move:**
"Deploy targeted TRT ads in Florida metro areas (Miami, Tampa, Orlando) with emphasis on men 30-55. Demand is rising with strong search momentum."

**Secondary Moves:**
1. Reach out to Miami Optimal Health with 20 high-intent TRT leads
2. Test "low testosterone treatment" and "TRT clinic near me" ad copy
3. Launch retargeting for users who visited TRT assessment but didn't complete

---

#### 2. Local Trends Signal
**Service Line:** TRT in **US-FL** (Florida)  
**Trend Status:** 🟢 **RISING**

**Top Rising Queries:**
- ↗ trt clinic near me
- ↗ testosterone therapy cost
- ↗ low t symptoms

**AI View:**
"TRT interest is strongly rising with 0.82 strength in Florida over the last 30 days. Miami and Tampa show particularly high search volume..."

**First Move:**
"Launch a 7-day TRT test campaign in Miami and Tampa with small budget ($500-1000) to validate local funnel performance while search interest is climbing."

---

#### 3. Region Demand Snapshot
| Region | Service Line | Demand Index | Trend |
|--------|--------------|--------------|-------|
| Florida 🟣 **Trend-aligned** | TRT | 87 | Rising |
| Texas | TRT | 92 | Rising |
| Arizona | TRT | 78 | Stable |
| Nevada | TRT | 72 | Rising |

**Note:** Florida appears in both high BigQuery demand AND high Google Trends interest = optimal deployment target.

---

#### 4. Target Clinics
| Clinic Name | City/State | Service Lines | Why Target |
|-------------|------------|---------------|------------|
| Miami Optimal Health | Miami, FL | TRT, Weight Loss | Selected clinic. High capacity. Trend-aligned region. |
| Tampa Vitality Hub | Tampa, FL | TRT, Recovery | Rising demand city. Actively accepting. |

---

## Example 3: Graceful Degradation (Trends Unavailable)

### Scenario
Google Trends API is temporarily unavailable or rate-limited.

### User Action
Ask: "Where should we deploy IV therapy ads?"

### System Response

#### Standard Results (Still Work!)
✅ AI Market Briefing (using BigQuery + clinics data)  
✅ Demand by Region table  
✅ Clinics to Target table  
✅ Recommended Moves

#### Trends-Specific Section
⚠️ **Subtle Warning:**

```
⚠️ Trends signal unavailable. BigQuery demand + clinics still loaded.
```

**User Impact:** Minimal  
- Core functionality intact
- BigQuery demand data still accurate
- Vertex AI still provides recommendations (based on demand + clinics)
- Only missing: real-time search trends and rising queries

---

## Quick Action Chips

Pre-defined questions for instant insights:

1. **"Where should we deploy TRT ads right now?"**
   - Auto-infers: serviceLine = TRT, region = US
   - Returns nationwide TRT analysis

2. **"Which regions are spiking in weight loss demand?"**
   - Auto-infers: serviceLine = WEIGHT_LOSS
   - Highlights rising trend regions

3. **"List clinics in Texas likely needing TRT patients."**
   - Auto-infers: serviceLine = TRT, region = US-TX
   - Returns Texas-specific clinic matches

4. **"Where is IV therapy demand growing but supply is weak?"**
   - Auto-infers: serviceLine = IV_THERAPY
   - Identifies high-demand, low-capacity regions

---

## Key Visual Elements

### Trend Direction Badges
- 🟢 **RISING** (green) – Search interest increasing
- 🟡 **STABLE** (yellow) – Search interest steady
- 🔴 **FALLING** (red) – Search interest declining

### Trend-Aligned Badges
- 🟣 **Trend-aligned** – Region high in both BigQuery demand AND Google Trends
- These are your **optimal deployment targets**

### Confidence Scores
- **First Move This Week** section shows AI confidence (0-100%)
- Higher confidence = stronger alignment between all data signals

---

## Technical Architecture

### Orchestration Flow
```
User Question
    ↓
[MCP Orchestration API]
    ↓
1. Infer serviceLine & region
    ↓
2. Call bigquery_region_demand
    ↓
3. Call bigquery_clinic_search
    ↓
4. Call google_trends_service_line_interest (graceful fail)
    ↓
5. Call vertex_market_brain (with all data)
    ↓
6. Return combined analysis
    ↓
[UI displays: Briefing, Trends, First Move, Demand, Clinics, Actions]
```

### Data Sources
1. **BigQuery** – Historical demand metrics, clinic performance
2. **Google Trends** – Real-time search interest, rising queries
3. **Vertex AI (Gemini)** – Strategic analysis, recommendations

### No Direct Frontend Calls
✅ All API calls go through MCP orchestration  
✅ Frontend only displays results  
✅ No external API keys in frontend code

---

## Benefits for Superadmin

### Before Market Intelligence Console
❌ "Where should we deploy ads?"  
→ Check multiple dashboards, spreadsheets, guess

❌ "Are weight loss clinics needing patients?"  
→ Call clinics, manual surveys, slow feedback

❌ "Is this a good time to launch a campaign?"  
→ No real-time timing intelligence

### After Market Intelligence Console
✅ **Ask natural language questions**  
✅ **Get demand + trends + clinics in one view**  
✅ **See "First Move" with confidence score**  
✅ **Identify trend-aligned regions instantly**  
✅ **Use rising queries for ad copy**  
✅ **Know when to deploy, pause, or scale**

---

## Production Deployment Checklist

- [x] MCP tools created and tested
- [x] Orchestration API with error handling
- [x] Market Intelligence Console UI
- [x] Clinics Control integration
- [x] Graceful degradation for trends failures
- [x] Documentation
- [ ] **Connect real Google Trends API** (currently mock data)
- [ ] Add caching layer (1-4 hour cache)
- [ ] Set up monitoring and alerts
- [ ] Track API usage and costs
- [ ] Add historical trends tracking (store in BigQuery)

---

## Next Evolution

### Phase 2 Ideas
1. **Predictive Trends:** Use historical data to forecast demand 7-30 days out
2. **Competitive Intelligence:** Track competitor clinic ads and positioning
3. **Auto-Campaign Launch:** One-click deploy from "First Move" recommendation
4. **Budget Optimizer:** Auto-adjust ad spend based on trend momentum
5. **Alerts:** Notify when demand spikes in a region
6. **Custom Playbooks:** Save common queries as one-click scans

---

**Status:** ✅ Production-ready with mock Google Trends data  
**Version:** 1.1.0  
**Last Updated:** December 8, 2025

🎯 The Market Intelligence Console makes Novalyte™ AI feel like it's plugged directly into live demand and knows not just what's happening—**but what to do first**.

