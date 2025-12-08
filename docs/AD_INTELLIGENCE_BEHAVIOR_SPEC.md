# Ad Intelligence & Outreach System — Behavior Specification

## Overview

The Novalyte™ AI Ad Intelligence & Outreach system transforms the God's Eye Admin from a passive directory into an active partnership engine. It detects which clinics are advertising, understands their strategy, and generates actionable outreach plans.

**Core Principle:** Every clinic interaction should answer: "Are they worth approaching now, and if so, how?"

---

## 1. System Architecture (Conceptual)

### 1.1 Three-Layer Intelligence Model

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                     │
│  Clinics Control UI / Market Intelligence Console      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  REASONING LAYER                                        │
│  Vertex AI (Gemini) - Strategic Analysis               │
│  - Fit Assessment                                       │
│  - Outreach Strategy Generation                        │
│  - Message Drafting                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  DATA LAYER                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Ads Radar    │  │ Novalyte DB  │  │ Market Demand│ │
│  │ (Ad Transp.) │  │ (Clinic Data)│  │ (BigQuery)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow (Conceptual)

**When a clinic is selected:**

1. **Clinic Context Assembly** → Pull clinic profile from Novalyte DB
2. **Ads Intelligence Retrieval** → Query ad transparency sources
3. **Market Demand Fetch** → Query BigQuery for regional demand
4. **AI Reasoning** → Combine all signals → Generate strategy
5. **Presentation** → Display actionable insights + outreach plan

---

## 2. Core User Stories & Behavior

### 2.1 User Story 1.1: Clinic-Level Ad Detection

**Trigger:** Superadmin clicks a clinic row in Clinics Control

**System Behavior:**

1. **Immediately assemble clinic context:**
   - Extract: name, city, state, service lines, price band, status, lead status
   - Determine primary service line (see Section 3.1 for logic)

2. **Query Ads Radar layer:**
   - Input: `{ clinicName, domain, region, serviceLine }`
   - Output: `{ isRunningAds, platforms, regionsTargeted, creativesSummary, funnelExamples }`

3. **Display decision logic:**
   - If `isRunningAds = true`: Show platforms, regions, creative themes, offers
   - If `isRunningAds = false`: Show "No active ads detected. Great opportunity to be their growth partner early."

4. **Creative summary interpretation:**
   - Extract themes: "Energy & Vitality TRT", "Rapid GLP-1 Weight Loss", etc.
   - Extract offers: "Free consult", "First month discounted", etc.
   - Extract CTAs: "Book now", "Take free assessment", etc.
   - Display as bullet list: "Leading with 'Low T + energy' TRT messaging on Meta."

**Success Criteria:**
- Superadmin sees within 2-3 seconds whether the clinic is advertising
- Clear visual distinction between "running ads" vs "not running ads"
- Actionable summary of their positioning (themes, offers, CTAs)

---

### 2.2 User Story 1.2: Region/Service-Line Scanning

**Trigger:** Superadmin asks: "Which TRT clinics in Texas are currently spending on ads and need patients?"

**System Behavior:**

1. **Parse query intent:**
   - Extract service line: "TRT" → `serviceLine = "TRT"`
   - Extract region: "Texas" → `region = "US-TX"`
   - Extract criteria: "spending on ads" + "need patients"

2. **Query sequence:**
   - Step 1: `bigquery_clinic_search({ serviceLine: "TRT", region: "US-TX" })`
   - Step 2: For each clinic in results, call `ads_intel_clinic_activity({ clinicName, region, serviceLine })`
   - Step 3: Filter to clinics where `isRunningAds = true` AND `leadStatus = "actively_accepting"`

3. **Ranking logic:**
   - Priority 1: Running ads + actively accepting + high demand region
   - Priority 2: Running ads + actively accepting + medium demand region
   - Priority 3: Not running ads + actively accepting + high demand (opportunity)

4. **Display:**
   - Table: Clinic Name | City/State | Service Lines | Ad Status | Fit Score
   - Fit Score = f(adsActivity, leadStatus, marketDemand, priceBand)

**Success Criteria:**
- Returns list of clinics matching criteria within 5-10 seconds
- Clear indication of which clinics are actively advertising
- Fit scores help prioritize outreach

---

### 2.3 User Story 1.3: AI Outreach Strategy

**Trigger:** Clinic selected in Clinics Control (automatic) OR manual "Generate Outreach" action

**System Behavior:**

1. **Assemble input context:**
   ```
   clinicProfile = {
     name, location, serviceLines, priceBand, leadStatus
   }
   adsActivity = { ... } // from ads_intel_clinic_activity
   marketDemand = { region, serviceLine, demandIndex, trend } // optional
   ```

2. **Call Vertex AI with system prompt:**
   - Role: "Expert B2B growth strategist for Novalyte™ AI"
   - Task: "Help Novalyte win this clinic as a partner"
   - Constraints: "Do NOT invent private data. Base reasoning on provided data only."

3. **AI reasoning pattern (conceptual):**
   ```
   IF adsActivity.isRunningAds:
     IF marketDemand.demandIndex > 75 AND marketDemand.trend == "RISING":
       fitAssessment = "High-priority target this month"
       whyNow = "They're spending on ads in a high-demand, rising region. Novalyte can optimize their funnel."
     ELSE IF adsActivity.platforms.length > 2:
       fitAssessment = "Medium-priority. Multi-platform advertiser, may have budget."
       whyNow = "Running ads across multiple platforms suggests growth focus. Opportunity to reduce waste."
     ELSE:
       fitAssessment = "Low-priority. Limited ad activity."
   ELSE:
     IF marketDemand.demandIndex > 75:
       fitAssessment = "High-priority. No ads but strong demand."
       whyNow = "Region shows strong demand but clinic isn't advertising. Perfect time to be their growth partner."
     ELSE:
       fitAssessment = "Monitor. Low demand region, no ad activity."
   ```

4. **Generate outreach steps (AI logic):**
   - Step 1: Research phase (website, socials, ads library)
   - Step 2: Identify decision-maker (owner, clinic director, marketing lead)
   - Step 3: Craft opening angle (reference their ads, demand, or positioning)
   - Step 4: Position Novalyte value (specific to their gaps)

5. **Draft first message (AI logic):**
   - Channel selection: Prefer email if domain available, else LinkedIn, else generic
   - Subject line: Reference clinic name + Novalyte value prop
   - Body structure:
     - Opening: Reference their service line/region/ads (if visible)
     - Value prop: How Novalyte helps (reduce waste, improve quality, scale)
     - Specific angle: Based on detected gaps (e.g., "You're spending on TRT but GLP-1 demand is rising")
     - CTA: Low-friction next step (15-min call, brief conversation)

6. **Generate alternate openers:**
   - 2-3 short hooks for different channels
   - Example: "Saw your TRT campaign in Dallas, noticed you might be leaving GLP-1 demand on the table..."

**Success Criteria:**
- Fit assessment is clear and actionable
- "Why now" cites specific signals (ads, demand, capacity)
- Outreach steps are sequential and practical
- First message is professional, concise (150-250 words), and copy-paste ready

---

## 3. Decision Logic & Algorithms

### 3.1 Primary Service Line Determination

**Input:** Clinic service lines array (e.g., `["TRT", "GLP-1", "IV Therapy"]`)

**Decision Tree:**
```
IF serviceLines.includes("GLP-1") OR serviceLines.includes("Weight Loss"):
  primaryServiceLine = "WEIGHT_LOSS"
ELSE IF serviceLines.includes("TRT"):
  primaryServiceLine = "TRT"
ELSE IF serviceLines.includes("IV") OR serviceLines.includes("IV Therapy"):
  primaryServiceLine = "IV_THERAPY"
ELSE:
  primaryServiceLine = "GENERAL"
```

**Rationale:** Weight loss/GLP-1 is highest growth category, so prioritize it for ad intel if present.

---

### 3.2 Ads Activity Detection Logic

**Input:** Clinic name, domain, region, service line

**Query Strategy:**
1. **Primary:** Search ad transparency APIs by clinic name
2. **Secondary:** If domain available, search by domain
3. **Tertiary:** Search by region + service line keywords

**Detection Criteria:**
- Active ads = ads with end date in future OR no end date (ongoing)
- Platform detection = match ad source to known platforms (Meta, Google, TikTok, etc.)
- Region targeting = extract geo-targeting from ad metadata

**Output Interpretation:**
- `isRunningAds = true` if ANY active ads found across ANY platform
- `platforms` = unique list of platforms with active campaigns
- `regionsTargeted` = aggregated regions from all active ads
- `creativesSummary` = theme extraction from ad copy/headlines
- `funnelExamples` = landing page URLs + flow notes

---

### 3.3 Fit Assessment Algorithm (AI-Driven)

**Input:** `{ clinicProfile, adsActivity, marketDemand }`

**AI Reasoning Pattern:**

```
Priority Score Calculation (conceptual):

baseScore = 0

// Ads activity signals
IF adsActivity.isRunningAds:
  baseScore += 30
  IF adsActivity.platforms.length >= 2:
    baseScore += 10  // Multi-platform = more budget
  IF adsActivity.regionsTargeted.length >= 2:
    baseScore += 5   // Multi-region = scaling

// Market demand signals
IF marketDemand:
  IF marketDemand.demandIndex >= 85:
    baseScore += 30
  ELSE IF marketDemand.demandIndex >= 70:
    baseScore += 20
  ELSE IF marketDemand.demandIndex >= 50:
    baseScore += 10
  
  IF marketDemand.trend == "RISING":
    baseScore += 15
  ELSE IF marketDemand.trend == "STABLE":
    baseScore += 5

// Clinic capacity signals
IF clinicProfile.leadStatus == "actively_accepting":
  baseScore += 20
ELSE IF clinicProfile.leadStatus == "at_capacity":
  baseScore += 5
ELSE:
  baseScore += 0

// Strategic gap detection (AI-driven)
IF adsActivity.isRunningAds:
  IF adsActivity.creativesSummary contains primaryServiceLine:
    // They're advertising their main service - good alignment
    baseScore += 10
  ELSE:
    // Mismatch: advertising something else than their primary
    baseScore -= 5  // Opportunity to optimize

IF NOT adsActivity.isRunningAds AND marketDemand.demandIndex >= 75:
  // No ads but high demand = perfect opportunity
  baseScore += 25

// Final assessment
IF baseScore >= 80:
  fitAssessment = "High-priority target this month"
ELSE IF baseScore >= 60:
  fitAssessment = "Medium-priority. Worth approaching in next quarter"
ELSE IF baseScore >= 40:
  fitAssessment = "Low-priority. Monitor for changes"
ELSE:
  fitAssessment = "Not a priority right now"
```

**Why Now Reasoning (AI-Generated):**

The AI should cite specific signals:

- **Ads + Demand Alignment:** "They're spending on TRT ads in Texas while demand for TRT in that region is 87/100 with a rising trend."
- **Capacity + Demand:** "Clinic is actively accepting patients and their region shows 92/100 demand index."
- **Strategic Gap:** "They're advertising TRT heavily, but demand data shows GLP-1 is exploding in their region and they offer it but aren't promoting it."
- **Opportunity Window:** "No active ads detected, but region demand is 85/100 with rising trend. Perfect time to be their growth partner."

---

### 3.4 Outreach Strategy Generation (AI Logic)

**Step 1: Research Phase**
- AI should instruct: "Visit [clinic name] website and confirm their primary offer and positioning."
- Rationale: Verify data accuracy before outreach

**Step 2: Decision-Maker Identification**
- AI should suggest: "Connect with their marketing director or founder on LinkedIn."
- Rationale: Find the person who controls ad spend and partnerships

**Step 3: Opening Angle**
- AI should craft angle based on detected signals:
  - If ads detected: "Reference their current campaigns and how Novalyte can reduce wasted spend."
  - If no ads but high demand: "Reference strong regional demand and how Novalyte can help capture it."
  - If strategic gap: "Reference the opportunity to expand into [service line] where demand is rising."

**Step 4: Novalyte Positioning**
- AI should tailor value prop:
  - If they're spending heavily: "Reduce cost per lead and improve funnel efficiency."
  - If they're not advertising: "Scale patient acquisition without increasing ad spend."
  - If they have capacity issues: "Improve lead quality to reduce wasted consultations."

---

### 3.5 First Message Drafting (AI Logic)

**Structure Template (AI-Generated):**

```
Subject: Partnership opportunity: [Clinic Name] × Novalyte™ AI

Hi [Decision-Maker],

[OPENING HOOK - 1-2 sentences]
- Reference their service line/region/ads (if visible)
- Example: "I noticed [Clinic Name] focuses on [service line] in [region]..."

[VALUE PROPOSITION - 2-3 sentences]
- How Novalyte helps (reduce waste, improve quality, scale)
- Example: "We help men's health clinics reduce wasted ad spend and improve lead quality through AI-powered patient routing."

[SPECIFIC ANGLE - 1-2 sentences]
- Based on detected gaps
- Example: "I see you're running ads on Meta and Google. We can help optimize your funnel and reduce cost per lead."

[LOW-FRICTION CTA - 1 sentence]
- Example: "Would you be open to a brief 15-minute conversation to see if there's a fit?"

Best regards,
Novalyte™ AI Team
```

**Channel Selection Logic:**
- If domain available → email (more professional, trackable)
- If LinkedIn profile found → LinkedIn (more personal, direct)
- Else → generic (works for both)

**Tone Guidelines:**
- Professional but not corporate
- Consultative, not salesy
- Specific, not generic
- Respectful of their time (concise)

---

## 4. Error Handling & Edge Cases

### 4.1 Ads Radar Failures

**Scenario:** Ad transparency API is down or rate-limited

**Behavior:**
- Return `{ isRunningAds: false, error: "Ads detection unavailable" }`
- Continue with clinic profile + market demand
- AI reasoning proceeds without ads data
- Display: "Ad activity data unavailable. Outreach strategy based on clinic profile and market demand."

**Rationale:** Don't block the entire flow if one data source fails.

---

### 4.2 Missing Market Demand Data

**Scenario:** BigQuery query fails or region not in dataset

**Behavior:**
- Proceed with `marketDemand = null`
- AI reasoning uses only clinic profile + ads activity
- Fit assessment may be less precise but still actionable
- Display: "Market demand data unavailable for this region. Assessment based on clinic profile and ad activity."

---

### 4.3 Clinic with No Service Lines

**Scenario:** Clinic profile has empty or null `serviceLines` array

**Behavior:**
- Default to `primaryServiceLine = "GENERAL"`
- Ads intel searches broadly (clinic name + domain)
- AI reasoning focuses on location and capacity signals
- Display: "Service line focus unclear. Outreach strategy based on location and capacity."

---

### 4.4 AI Generation Failures

**Scenario:** Vertex AI API fails or times out

**Behavior:**
- Fall back to rule-based strategy generation (see Section 3.3)
- Use template-based message drafting
- Display: "AI-generated strategy unavailable. Using standard outreach template."

**Fallback Strategy:**
- Fit assessment: Based on simple scoring (ads + demand + capacity)
- Outreach steps: Generic 4-step process
- First message: Template with clinic name/region inserted

---

## 4. UI Behavior — What the Admin Sees in Clinics Control

### 4.1 Ad Activity Snapshot

**Location:** Right panel in Clinics Control, appears when clinic is selected

**Display Logic:**

**If `isRunningAds = true`:**
```
┌─────────────────────────────────────────┐
│ Ad Activity Snapshot                    │
├─────────────────────────────────────────┤
│ 🟢 Running ads                          │
│                                         │
│ Platforms:                              │
│ [Meta] [Google] [TikTok]                │
│                                         │
│ Regions Targeted:                       │
│ • Florida (HIGH)                        │
│ • Texas (MEDIUM)                        │
│                                         │
│ Themes:                                 │
│ • TRT + Energy & Vitality               │
│ • GLP-1 Rapid Weight Loss               │
└─────────────────────────────────────────┘
```

**If `isRunningAds = false`:**
```
┌─────────────────────────────────────────┐
│ Ad Activity Snapshot                    │
├─────────────────────────────────────────┤
│ ⚪ No active ads detected               │
│                                         │
│ No active campaigns visible —          │
│ potential opportunity to be their       │
│ growth partner early.                   │
└─────────────────────────────────────────┘
```

**Visual Design:**
- Status badge: Green for "Running ads", Gray for "No active ads"
- Platform badges: Color-coded (Meta = blue, Google = red, TikTok = black)
- Region intensity: HIGH (bold), MEDIUM (normal), LOW (muted)

---

### 4.2 Ad Strategy Summary

**Location:** Below Ad Activity Snapshot

**Display Format:**
```
┌─────────────────────────────────────────┐
│ Ad Strategy Summary                    │
├─────────────────────────────────────────┤
│ • Leading with: "Low T as the hook,    │
│   energy & vitality messaging"          │
│                                         │
│ • Primary offer: Free consult           │
│                                         │
│ • Funnel: Ad → Quiz → Call booking     │
│   (Meta)                                │
│                                         │
│ • Secondary: Ad → Direct booking page  │
│   (Google)                              │
└─────────────────────────────────────────┘
```

**Content Logic:**
- Extract dominant theme from `creativesSummary[0].theme`
- Extract primary offer from `creativesSummary[0].offerType`
- Extract CTA pattern from `creativesSummary[0].ctaPatterns[0]`
- Map funnel from `funnelExamples` (show top 2-3)

**If no ads detected:**
- Show: "No ad strategy detected. Clinic may be using organic channels or word-of-mouth."

---

### 4.3 Outreach Strategy

**Location:** Below Ad Strategy Summary

**Display Format:**
```
┌─────────────────────────────────────────┐
│ Outreach Strategy                       │
├─────────────────────────────────────────┤
│ High-priority target this month         │
│                                         │
│ Why now: They're spending on TRT ads   │
│ in Texas while demand for GLP-1 in     │
│ their region is rising and they offer  │
│ it but aren't promoting it heavily.    │
│                                         │
│ Steps:                                  │
│ 1. Review their current TRT landing    │
│    page to see how they capture leads.  │
│                                         │
│ 2. Connect with the founder or clinical │
│    director on LinkedIn.                │
│                                         │
│ 3. Open with a short note referencing   │
│    their current campaign and one       │
│    observed gap.                        │
│                                         │
│ 4. Offer a specific low-friction next  │
│    step (e.g. 15-minute audit).         │
└─────────────────────────────────────────┘
```

**Content Source:**
- `fitAssessment` → Header text
- `whyNow` → Subheader explanation
- `outreachSteps` → Numbered list (1-4 steps)

**Visual Design:**
- Fit assessment badge: High (green), Medium (yellow), Low (gray)
- Steps: Numbered list with clear spacing
- Each step: Actionable verb + specific detail

---

### 4.4 First Message Draft

**Location:** Below Outreach Strategy

**Display Format:**
```
┌─────────────────────────────────────────┐
│ First Message Draft                     │
│                    [Regenerate Variant] │
├─────────────────────────────────────────┤
│ Subject: Partnership opportunity:       │
│ Miami Optimal Health × Novalyte™ AI    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Hi there,                            │ │
│ │                                      │ │
│ │ I noticed Miami Optimal Health       │ │
│ │ focuses on TRT in Florida, and      │ │
│ │ wanted to introduce Novalyte™ AI.   │ │
│ │                                      │ │
│ │ We help men's health clinics reduce  │ │
│ │ wasted ad spend and improve lead     │ │
│ │ quality through AI-powered patient   │ │
│ │ routing.                             │ │
│ │                                      │ │
│ │ I see you're running ads on Meta     │ │
│ │ and Google. We can help optimize     │ │
│ │ your funnel and reduce cost per      │ │
│ │ lead.                                │ │
│ │                                      │ │
│ │ Would you be open to a brief 15-     │ │
│ │ minute conversation to see if        │ │
│ │ there's a fit?                       │ │
│ │                                      │ │
│ │ Best regards,                        │ │
│ │ Novalyte™ AI Team                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Copy to Clipboard]                     │
└─────────────────────────────────────────┘
```

**Content Source:**
- `firstMessage.subjectLine` → Email subject (if channel = email)
- `firstMessage.body` → Message body (multi-line, formatted)
- `alternateOpeners` → Shown below message as "Alternate hooks"

**Actions:**
- **"Regenerate Variant" button:**
  - Re-calls `vertex_clinic_outreach_brain` with same inputs
  - Adds `temperature: 0.9` (higher creativity) or `variation: true` flag
  - Replaces message content without changing strategy
  - Shows loading state: "Generating alternative..."

- **"Copy to Clipboard" button:**
  - Copies `firstMessage.body` to clipboard
  - Shows confirmation: "Copied!" (2 seconds)

**Visual Design:**
- Message body: Monospace or serif font (email-like)
- Subject line: Bold, above message box
- Alternate openers: Italic, smaller font, below message
- Copy button: Subtle, below message box

---

## 5. Secondary Flow — Region/Keyword-Based Scanning

### 5.1 Trigger: No Clinic Selected

**Scenario:** Superadmin wants to scan a region without selecting a specific clinic

**Entry Points:**
1. Market Intelligence Console: "Show me TRT clinics in Texas running ads that are likely good targets for Novalyte."
2. Clinics Control: Filter by region + service line, then click "Scan for Ad Activity"

**System Behavior:**

### 5.2 Scanning Process

**Step 1: Query Clinic Database**
- Filter clinics by: `region = "US-TX"` AND `serviceLines.includes("TRT")`
- Return: List of matching clinics (e.g., 15 clinics)

**Step 2: Lightweight Ads Radar Process**
- For each clinic, call `ads_intel_clinic_activity` with:
  - `clinicName`
  - `region = "US-TX"`
  - `serviceLine = "TRT"`
- Extract: `isRunningAds`, `platforms`, `creativesSummary[0].theme`

**Step 3: Demand Alignment Check**
- For each clinic, fetch `marketDemand` for their state + service line
- Calculate alignment score:
  - `isRunningAds` + `demandIndex > 75` + `trend == "RISING"` = High alignment

**Step 4: AI Ranking**
- Pass clinic list + ads data + demand data to Vertex AI
- AI ranks by:
  - **Fit:** Do they offer the right services? (TRT, GLP-1, IV)
  - **Ads Presence:** Are they investing? (Multi-platform = higher score)
  - **Demand/Growth:** Is their region heating up? (Rising trend = higher score)
  - **Capacity:** Are they accepting patients? (Actively accepting = higher score)

### 5.3 Display: Ranked Clinic List

**Format:**
```
┌─────────────────────────────────────────┐
│ TRT Clinics in Texas - Ad Activity Scan │
├─────────────────────────────────────────┤
│                                         │
│ [High Priority]                         │
│ ┌─────────────────────────────────────┐ │
│ │ Austin Vitality Clinic               │ │
│ │ Austin, TX | TRT, GLP-1              │ │
│ │ 🟢 Running ads: Meta, Google          │ │
│ │ Theme: Energy & Vitality TRT          │ │
│ │ Demand: 92/100 (Rising)              │ │
│ │ [View Details →]                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [High Priority]                         │
│ ┌─────────────────────────────────────┐ │
│ │ Dallas Optimal Health                │ │
│ │ Dallas, TX | TRT                     │ │
│ │ 🟢 Running ads: Meta                 │ │
│ │ Theme: Low T Symptoms                │ │
│ │ Demand: 87/100 (Rising)              │ │
│ │ [View Details →]                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Medium Priority]                        │
│ ┌─────────────────────────────────────┐ │
│ │ Houston Men's Clinic                │ │
│ │ Houston, TX | TRT, IV                │ │
│ │ ⚪ No active ads detected            │ │
│ │ Demand: 85/100 (Rising)              │ │
│ │ [View Details →]                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Priority Badges:**
- **High Priority:** Green badge, top of list
- **Medium Priority:** Yellow badge, middle of list
- **Monitor Only:** Gray badge, bottom of list

**Click Behavior:**
- Clicking "View Details →" or clinic name:
  - Navigates to Clinics Control
  - Selects that clinic
  - Auto-loads Ads Activity + Outreach panel
  - Shows full ad intel + outreach strategy

---

## 6. Failsafe & Edge Case Logic (Expanded)

### 6.1 Ads Data Unavailable

**Scenario:** Ad transparency API is down, rate-limited, or returns no data

**System Behavior:**

**Ad Activity Snapshot Display:**
```
┌─────────────────────────────────────────┐
│ Ad Activity Snapshot                    │
├─────────────────────────────────────────┤
│ ⚠️ Could not verify ad activity         │
│                                         │
│ Still safe to use clinic + demand       │
│ context for outreach.                   │
└─────────────────────────────────────────┘
```

**Outreach Strategy Adjustment:**
- **Fit Assessment:** Based on clinic profile + market demand only
- **Why Now:** Focus on demand signals, not ad activity
  - Example: "High demand (92/100) in your region with rising trend. Novalyte can help capture this demand efficiently."
- **Outreach Steps:** Shift focus
  - Instead of: "Reference their current campaigns..."
  - Use: "Introduce Novalyte as a way to test performance campaigns and scale patient acquisition."
- **First Message:** Avoid referencing ads
  - Instead of: "I see you're running ads on Meta..."
  - Use: "I noticed [Clinic Name] focuses on [service line] in [region]. We help clinics like yours scale patient acquisition through AI-powered routing."

**Rationale:** Don't block outreach if ads data fails. Clinic profile + demand data is still valuable.

---

### 6.2 Clinic at Capacity

**Scenario:** `leadStatus = "at_capacity"`

**System Behavior:**

**Fit Assessment Adjustment:**
- **AI Logic:**
  ```
  IF leadStatus == "at_capacity":
    fitAssessment = "Good partner but may not want more volume right now — focus conversation on profitability, not volume."
    priorityScore -= 20  // Lower priority than actively accepting
  ```

**Outreach Strategy Adjustment:**
- **Steps:** Emphasize quality over quantity
  - Step 3: "Position Novalyte as a way to improve lead quality and appointment conversion, not just increase volume."
  - Step 4: "Focus on better filtering and higher-quality leads that match their ideal patient profile."

**First Message Tone:**
- **Emphasis:**
  - "Better filtering / higher-quality leads"
  - "Controlling appointment quality, not brute-force more leads"
  - "Reduce wasted consultations by pre-qualifying patients"
- **Avoid:**
  - "Scale your patient volume"
  - "Send you more leads"
  - "Increase your capacity"

**Example Message Adjustment:**
```
Instead of: "We can help you scale patient acquisition..."

Use: "We help clinics like yours improve lead quality and 
reduce wasted consultations by pre-qualifying patients 
through AI-powered assessments. This means you spend less 
time on unqualified leads and more time with patients who 
are a great fit."
```

---

### 6.3 Services Outside Novalyte Focus

**Scenario:** Clinic offers services Novalyte doesn't support (e.g., cosmetic surgery, primary care)

**System Behavior:**

**Service Line Filtering:**
- **AI Logic:**
  ```
  novalyteServices = ["TRT", "GLP-1", "Weight Loss", "IV Therapy", "Recovery", "Longevity"]
  
  clinicServices = ["TRT", "Cosmetic Surgery", "Primary Care"]
  
  relevantServices = clinicServices.filter(s => novalyteServices.includes(s))
  // Result: ["TRT"]
  
  IF relevantServices.length > 0:
    primaryServiceLine = relevantServices[0]
    deprioritizeOtherServices = true
  ELSE:
    fitAssessment = "Not a priority — clinic focus doesn't align with Novalyte services"
  ```

**Outreach Strategy Adjustment:**
- **Focus:** Only mention Novalyte-supported services
- **Message:**
  - "I noticed [Clinic Name] offers TRT in [region]..."
  - NOT: "I noticed you offer TRT, cosmetic surgery, and primary care..."
- **Value Prop:** Tailored to supported services
  - "We help TRT clinics reduce wasted ad spend..."
  - NOT: "We help with all your services..."

**Fit Assessment:**
- If clinic offers TRT + non-Novalyte services:
  - "Medium-priority. Clinic offers TRT (Novalyte-supported) but also focuses on services outside our marketplace. Focus outreach on TRT partnership only."

---

## 7. Positioning Constraints & Tone

### 7.1 Novalyte Positioning (Always)

**The system must always position Novalyte as:**

1. **Growth Infrastructure & Intelligence Layer**
   - NOT: "Just lead gen"
   - YES: "AI-powered patient routing and demand intelligence"

2. **Data-Driven Optimization**
   - NOT: "We send leads"
   - YES: "We help you allocate ad spend based on demand + clinic fit"

3. **Pre-Qualified Patient Volume**
   - NOT: "Raw leads"
   - YES: "Intelligent routing of pre-qualified patients"

### 7.2 What to Avoid Promising

**Never promise:**
- ❌ Specific revenue guarantees ("We'll increase your revenue by 50%")
- ❌ Exact performance multipliers ("2x your ROI")
- ❌ Guaranteed lead volumes ("We'll send you 100 leads/month")
- ❌ Specific cost reductions ("Cut your CAC by 30%")

**Instead, emphasize:**
- ✅ "Intelligent routing based on demand signals"
- ✅ "Pre-qualified patient volume"
- ✅ "Better allocation of your ad spend"
- ✅ "Data-driven optimization"

### 7.3 Message Tone Guidelines

**Always:**
- ✅ Respectful
- ✅ Non-aggressive
- ✅ Conversational but professional
- ✅ Specific (cite their service line, region, ads if visible)
- ✅ Value-focused (how Novalyte helps, not what Novalyte is)

**Never:**
- ❌ Pushy or salesy
- ❌ Generic ("We help all clinics...")
- ❌ Overly technical jargon
- ❌ Making assumptions about their current performance
- ❌ Criticizing their current strategy

**Example Good Tone:**
```
"I noticed Miami Optimal Health focuses on TRT in Florida, 
and wanted to introduce Novalyte™ AI. We help men's health 
clinics reduce wasted ad spend and improve lead quality 
through AI-powered patient routing.

I see you're running ads on Meta and Google. We can help 
optimize your funnel and reduce cost per lead.

Would you be open to a brief 15-minute conversation to see 
if there's a fit?"
```

**Example Bad Tone:**
```
"Your current ad strategy is inefficient. We can fix it 
and guarantee 2x ROI. Sign up now!"
```

---

## 8. End State — How It Should Feel for Superadmin

### 8.1 The Experience

**Scenario:** Superadmin (Kaizen) clicks "Miami Optimal Health" in Clinics Control

**Within 1 second:**
- Right panel updates with clinic details
- Loading state: "Fetching ad intelligence..."

**Within 2-3 seconds:**
- Ad Activity Snapshot appears:
  - "🟢 Running ads on Meta + Google in FL & TX"
  - Platforms: [Meta] [Google]
  - Regions: Florida (HIGH), Texas (MEDIUM)

**Within 3-5 seconds:**
- Ad Strategy Summary appears:
  - "Leading with TRT energy/mood angle, offer: free consult"
  - "Funnel: Ad → Quiz → Call booking (Meta)"

**Within 5-7 seconds:**
- Outreach Strategy appears:
  - "High-priority outreach this month"
  - "Why now: GLP-1 demand up in their region but not strongly promoted in their current campaigns"
  - 4 numbered steps

**Within 7-10 seconds:**
- First Message Draft appears:
  - Subject line
  - Professional, concise message (6-8 lines)
  - References: clinic name, region, service line, ad activity
  - Specific Novalyte value prop
  - Low-friction CTA

**Result:**
- Kaizen sees everything needed to make a decision and take action
- No need to leave the dashboard
- No need to research manually
- Ready-to-send message in hand

### 8.2 The Feeling

**This is not just "data".**

**It's a move generator embedded in the dashboard.**

**Every clinic click answers:**
1. **Are they worth approaching?** (Fit assessment)
2. **Why now?** (Strategic signals)
3. **How do I approach them?** (Outreach steps)
4. **What do I say?** (First message draft)

**The system transforms:**
- ❌ "I need to research this clinic" → ✅ "I know exactly what to do"
- ❌ "I'll draft a message later" → ✅ "I can send this now"
- ❌ "Is this a good target?" → ✅ "High-priority, here's why"

**End Goal:** From Clinics Control, Superadmin clicks a clinic and immediately knows: **"Are they worth approaching now, and if so, how?"**

---

## 9. Performance & Scalability Considerations

### 5.1 Caching Strategy

**Ads Activity Data:**
- Cache for 4-6 hours (ads don't change minute-to-minute)
- Key: `clinicName + region + serviceLine`
- Invalidate on manual refresh

**Market Demand Data:**
- Cache for 24 hours (demand trends change daily)
- Key: `region + serviceLine`
- Shared across all clinics in same region

**AI Outreach Strategy:**
- Cache for 1 hour (strategy should be fresh)
- Key: `clinicProfile + adsActivity + marketDemand` (hash)
- Invalidate if any input changes

---

### 5.2 Batch Processing

**Scenario:** Superadmin wants to scan 50 clinics for ad activity

**Behavior:**
- Queue requests to Ads Radar API
- Process in batches of 10 (respect rate limits)
- Show progress: "Scanning 15/50 clinics..."
- Return results as they complete (streaming)

---

## 10. Future Enhancements (Conceptual)

### 6.1 Competitive Intelligence

**Concept:** Track which clinics are advertising in the same regions as Novalyte partners

**Behavior:**
- When a Novalyte partner clinic is selected, show:
  - "3 other clinics in your region are advertising TRT"
  - "Your competitors are spending on Meta and Google"
  - "Opportunity: They're not targeting GLP-1, but demand is rising"

---

### 6.2 Ad Spend Estimation

**Concept:** Estimate ad spend ranges (not exact numbers, but bands)

**Behavior:**
- Analyze ad frequency, platform, region coverage
- Estimate: "Low spend ($500-2K/month)", "Medium ($2K-10K/month)", "High ($10K+/month)"
- Use for prioritization: High spenders = more budget = better partnership fit

---

### 6.3 Automated Outreach

**Concept:** One-click send outreach message (future)

**Behavior:**
- "Send Outreach" button in Clinics Control
- Generates email via Novalyte's email system
- Tracks: sent, opened, replied
- Updates clinic status: "Outreach sent on [date]"

---

## 11. Success Metrics

### 7.1 System Performance

- **Ads Detection Accuracy:** >90% (true positive rate for clinics actually running ads)
- **Response Time:** <5 seconds for clinic-level ad intel
- **AI Generation Quality:** >85% of outreach strategies rated "actionable" by Superadmin

### 7.2 Business Impact

- **Outreach Conversion:** % of clinics contacted that become Novalyte partners
- **Time to First Contact:** Reduction in time from clinic discovery to outreach
- **Partnership Quality:** % of new partners that were identified via ad intelligence

---

## 12. Security & Privacy

### 8.1 Data Sources

- **Ad Transparency APIs:** Only public ad data (policy-compliant)
- **No Private Data:** Never access private clinic financials, patient data, or internal systems
- **Novalyte Data:** Only clinic profile data already in Novalyte system

### 8.2 AI Constraints

- **No Fabrication:** AI must not invent private data about clinics
- **Source Attribution:** All claims must be traceable to provided data
- **Professional Tone:** AI-generated messages must be professional and compliant

---

## Summary

The Ad Intelligence & Outreach system transforms Novalyte's God's Eye Admin from a passive directory into an active partnership engine. By combining ad transparency data, market demand signals, and AI reasoning, it enables Superadmins to:

1. **See** which clinics are advertising and what they're saying
2. **Understand** strategic gaps and opportunities
3. **Act** with AI-generated outreach strategies and ready-to-send messages

The system is designed to be:
- **Fast:** Results in seconds, not minutes
- **Accurate:** Based on real data, not assumptions
- **Actionable:** Every insight leads to a clear next step
- **Resilient:** Graceful degradation when data sources fail

**End Goal:** From Clinics Control, Superadmin clicks a clinic and immediately knows: "Are they worth approaching now, and if so, how?"

---

**Version:** 2.0.0  
**Last Updated:** December 8, 2025  
**Status:** Complete behavior specification including UI behavior, secondary flows, edge cases, and positioning constraints

