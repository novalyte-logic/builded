# Patient Assessment → Admin Sync Pipeline

## Overview

Complete synchronization system between patient assessment frontend (app.novalyte.io) and the Novalyte™ AI Superadmin Dashboard.

---

## Architecture

```
┌─────────────────────────────────┐
│  app.novalyte.io (Frontend)     │
│  Patient Assessment Flows        │
└──────────────┬──────────────────┘
               │ POST /api/admin/assessments
               │ (Assessment Progress/Completion)
               ▼
┌─────────────────────────────────┐
│  API Layer                      │
│  /api/admin/assessments          │
│  - Progress sync                 │
│  - Completion processing         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Assessment Sync Service         │
│  - AI Scoring Integration        │
│  - Lead Creation Logic           │
└──────────────┬──────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│  Database   │  │  Vertex AI  │
│  (Assessments│  │  (Gemini)   │
│   + Leads)   │  │  Scoring    │
└─────────────┘  └─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Admin Dashboard                 │
│  /assessments                    │
│  - Assessment Queue              │
│  - Detail View                   │
└─────────────────────────────────┘
```

---

## 1. Data Models

### PatientAssessment

**Location:** `lib/types/assessment.ts`

**Fields:**
- `id` - UUID
- `user_id` - Nullable (anonymous assessments)
- `status` - "in_progress" | "completed" | "qualified" | "unqualified" | "needs_review"
- `path` - "TRT" | "GLP1" | "PEPTIDES" | "RECOVERY" | "LONGEVITY" | "GENERAL"
- `answers` - Full answer payload (JSON)
- `summary` - AI-generated summary (JSON)
- `qualification_reason` - Why qualified/unqualified
- `predicted_LTV` - AI-predicted lifetime value
- `city`, `country` - Geographic data
- `acquisition_channel` - Traffic source

**Relationship to LeadRecord:**
- LeadRecord is created when assessment is completed AND qualified
- `assessment_id` links LeadRecord to source assessment
- Assessment is source of truth; LeadRecord is for workflow management

### LeadRecord

**Location:** `lib/types/assessment.ts`

**Fields:**
- `id` - UUID
- `assessment_id` - Links to PatientAssessment (nullable for non-assessment leads)
- `lead_type` - "patient" | "mens_clinic" | "vendor"
- `origin` - "assessment" | "contact_form" | "marketplace" | "chat" | "manual"
- `status` - "new" | "in_review" | "contacted" | "converted" | "closed"
- `priority` - "low" | "medium" | "high" (determined by AI)
- `tags` - Optional labels
- `notes` - Admin notes

---

## 2. Sync Flow

### A) Assessment Progress (In-Progress)

**Endpoint:** `POST /api/admin/assessments`

**When:** Patient moves through assessment steps

**Payload:**
```json
{
  "status": "in_progress",
  "path": "TRT",
  "answers": { /* step answers */ },
  "metadata": {
    "currentStep": 3,
    "totalSteps": 7
  }
}
```

**Behavior:**
- Updates assessment with progress
- Sets status = "in_progress"
- No lead creation
- No AI scoring yet

### B) Assessment Completion

**Endpoint:** `POST /api/admin/assessments`

**When:** Patient completes final step

**Payload:**
```json
{
  "status": "completed",
  "path": "TRT",
  "answers": { /* full assessment answers */ },
  "city": "Los Angeles",
  "country": "US",
  "acquisition_channel": "google_ads"
}
```

**Process:**
1. Update assessment status = "completed"
2. Call Vertex AI scoring (`scoreLeadQuality()`)
3. Determine qualification:
   - High probability + High LTV → "qualified"
   - Low probability + Low LTV → "unqualified"
   - Otherwise → "needs_review"
4. If qualified → Create LeadRecord automatically
5. Set predicted_LTV and qualification_reason

**AI Scoring Logic:**
```typescript
if (conversionProbability >= 0.7 && predictedLTV === 'high') {
  status = 'qualified'
  createLeadRecord()
} else if (conversionProbability < 0.3 || predictedLTV === 'low') {
  status = 'unqualified'
} else {
  status = 'needs_review'
}
```

### C) Admin Review

**No separate sync needed** - Admin dashboard reads directly from database

---

## 3. API Endpoints

### Assessments

**GET `/api/admin/assessments`**
- Query params: `status`, `path`, `startDate`, `endDate`, `priority`
- Returns: List of assessments with linked leads

**GET `/api/admin/assessments/:id`**
- Returns: Single assessment with linked lead details

**POST `/api/admin/assessments`**
- Body: Assessment data (progress or completion)
- Returns: Created/updated assessment + lead (if created)

### Leads

**GET `/api/admin/leads`**
- Query params: `status`, `origin`, `startDate`, `endDate`, `priority`
- Returns: List of leads

**GET `/api/admin/leads/:id`**
- Returns: Single lead details

**PATCH `/api/admin/leads/:id`**
- Body: Updates (status, priority, notes)
- Returns: Updated lead

---

## 4. Admin UI

### Assessment Queue Page

**Location:** `app/assessments/page.tsx`

**Layout:**
- Left: Filterable table (AssessmentQueue component)
- Right: Detail panel (AssessmentDetail component)

### Filters

**AssessmentQueue Component:**
- Status filter (in_progress, completed, qualified, unqualified, needs_review)
- Path filter (TRT, GLP-1, Peptides, Recovery, Longevity, General)
- Priority filter (from linked LeadRecord)
- Date range (startDate, endDate)

**All filters have hover explainers:**
- What the filter does
- Why it matters
- How to use it

### Table Columns

1. Created At
2. Path (with priority badge if lead exists)
3. Status (with icon)
4. Location (city, country)
5. Qualification (reason if available)
6. Predicted LTV (band: High/Medium/Low)

### Detail Panel

**AssessmentDetail Component shows:**
- Assessment status and predicted LTV
- AI Summary:
  - Key highlights
  - Key symptoms (tags)
  - Risk factors (tags)
  - Urgency level
- Qualification reason
- Linked Lead (if exists):
  - Lead status
  - Priority
  - Notes
  - Actions: "View Lead", "Update Status"

---

## 5. AI Integration

### Vertex AI Scoring

**Function:** `scoreLeadQuality()` in `lib/vertex-ai/service.ts`

**Input:**
- Source channel
- City
- Assessment path
- Device type
- Time to completion

**Output:**
- Conversion probability (0-1)
- Predicted LTV band (low/medium/high)
- Routing recommendation
- Confidence score

**Called:** Automatically on assessment completion

---

## 6. Lead Creation Rules

### Automatic Lead Creation

**When:** Assessment status = "qualified" after AI scoring

**Lead Fields:**
- `lead_type`: "patient"
- `origin`: "assessment"
- `status`: "new"
- `priority`: Based on AI predicted LTV (high/medium/low)
- `tags`: [assessment.path, predictedLTV]
- `notes`: AI routing recommendation

### Manual Lead Creation

**When:** Admin wants to create lead from unqualified assessment

**Function:** `createLeadFromAssessment()` in `lib/services/assessment-sync.ts`

---

## 7. Database Schema (Example)

### PatientAssessment Table

```sql
CREATE TABLE patient_assessments (
  id UUID PRIMARY KEY,
  user_id UUID NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL,
  path VARCHAR(20) NOT NULL,
  answers JSONB NOT NULL,
  summary JSONB NULL,
  qualification_reason TEXT NULL,
  predicted_LTV NUMERIC(10, 2) NULL,
  city VARCHAR(100) NULL,
  country VARCHAR(100) NULL,
  acquisition_channel VARCHAR(50) NULL,
  metadata JSONB NULL
);

CREATE INDEX idx_assessments_status ON patient_assessments(status);
CREATE INDEX idx_assessments_path ON patient_assessments(path);
CREATE INDEX idx_assessments_created ON patient_assessments(created_at DESC);
```

### LeadRecord Table

```sql
CREATE TABLE lead_records (
  id UUID PRIMARY KEY,
  assessment_id UUID NULL REFERENCES patient_assessments(id),
  user_id UUID NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  lead_type VARCHAR(20) NOT NULL,
  origin VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  priority VARCHAR(10) NOT NULL,
  tags TEXT[] NULL,
  notes TEXT NULL,
  assigned_to UUID NULL,
  converted_at TIMESTAMP NULL,
  metadata JSONB NULL
);

CREATE INDEX idx_leads_assessment ON lead_records(assessment_id);
CREATE INDEX idx_leads_status ON lead_records(status);
CREATE INDEX idx_leads_priority ON lead_records(priority);
CREATE INDEX idx_leads_created ON lead_records(created_at DESC);
```

---

## 8. Frontend Integration (app.novalyte.io)

### Assessment Progress Sync

```typescript
// On each step completion
await fetch('/api/admin/assessments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: assessmentId,
    status: 'in_progress',
    path: currentPath,
    answers: currentAnswers,
    metadata: {
      currentStep: stepNumber,
      totalSteps: totalSteps,
    },
  }),
})
```

### Assessment Completion Sync

```typescript
// On final step completion
const response = await fetch('/api/admin/assessments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: assessmentId,
    status: 'completed',
    path: assessmentPath,
    answers: allAnswers,
    city: userCity,
    country: userCountry,
    acquisition_channel: trafficSource,
  }),
})

const { assessment, lead } = await response.json()
// Assessment is now synced to admin dashboard
// Lead created if qualified
```

---

## 9. Security & Privacy

### PII/PHI Protection

- **Never log raw answers** in public logs
- **Encrypt sensitive data** in database
- **Admin auth required** for all assessment endpoints
- **Access logging** for audit trail

### Admin Authentication

All admin endpoints must check for Superadmin authentication:

```typescript
// Add middleware to API routes
export async function middleware(request: NextRequest) {
  // Check for admin auth token/session
  // Return 401 if not authenticated
}
```

---

## 10. Performance Considerations

### Real-Time Updates

- Assessment Queue auto-refreshes every 30 seconds
- New assessments appear at top (sorted by created_at DESC)
- No blocking - sync happens in background

### Scalability

- Index database tables on frequently queried fields (status, path, created_at)
- Use pagination for large result sets
- Cache AI scoring results when possible

---

## Summary

✅ **Data Models** - PatientAssessment and LeadRecord with clear relationships  
✅ **Sync Pipeline** - Progress tracking and completion processing  
✅ **AI Integration** - Automatic qualification and lead creation  
✅ **Admin UI** - Assessment Queue with filters and detail view  
✅ **API Endpoints** - Complete CRUD for assessments and leads  

**Result:** Seamless sync between patient frontend and admin dashboard, with AI-powered qualification and automatic lead management.

