# Novalyte Workforce Exchange MCP Manifest

## Server Information

**Server Name**: `novalyte-workforce-mcp`  
**Version**: `2.0.0`  
**Purpose**: Find clinics hiring temp/per-diem/contract staff, discover nurses seeking flexible work, and match both sides into Workforce Exchange

**Scope**: Admin-only, Superadmin context. No storing of sensitive candidate details beyond what's needed for matching and contact summaries. No automated contacting from MCP itself — it only generates intelligence + scripts; human must send.

---

## Tool Categories

### 1. Clinic Job Discovery Tools
### 2. Nurse / Clinician Talent Discovery Tools
### 3. Workforce Exchange Matching Tools
### 4. Outreach & Follow-up Tools (Workforce)
### 5. Batch & Snapshot Tools

---

## 1. CLINIC JOB DISCOVERY TOOLS

### Tool: `find_clinic_jobs_by_region`

**Description**: Discover job postings from clinics in a given region related to men's health, TRT, weight loss, IV therapy, etc.

**Input Schema**:
```typescript
{
  region: string        // "Texas", "Miami, FL", "SoCal", etc.
  roleType: enum        // NURSE | NP_PA | MD | MA_TECH | ADMIN | OTHER
  employmentType: enum  // TEMP | PER_DIEM | CONTRACT | FULL_TIME | PART_TIME
  serviceLineFilter?: enum  // Optional: TRT | GLP-1 | IV_THERAPY | GENERAL
}
```

**Output Schema**:
```typescript
{
  jobs: Array<{
    jobId: string
    clinicName: string
    clinicWebsite: string | null
    jobTitle: string
    roleType: string
    employmentType: string
    location: { city: string; state: string }
    sourcePlatform: string  // "Indeed", "LinkedIn", "ZipRecruiter", "internal", etc.
    postingUrl: string | null
    summary: string
    postedAt: string | null
    serviceLine?: string
  }>
  totalFound: number
  region: string
  scannedAt: string
}
```

**Responsibilities**:
- Search job boards (Indeed, LinkedIn, ZipRecruiter APIs)
- Search clinic career pages
- Check internal job postings database
- Filter by region, role type, employment type, and service line

**Error Handling**: Returns empty array if no jobs found or region invalid.

**Integration**: Called by `export_workforce_batch` and `generate_workforce_matches`.

---

### Tool: `enrich_clinic_from_job`

**Description**: Given a job posting, infer more about clinic operations.

**Input Schema**:
```typescript
{
  jobId: string
  postingUrl: string | null
  clinicWebsite?: string | null
  jobPosting?: ClinicJobPosting  // Optional: Full job posting object
}
```

**Output Schema**:
```typescript
{
  enriched: {
    estimatedPatientVolumeLevel: "low" | "medium" | "high"
    serviceLinesMentioned: string[]
    schedulePatterns: string[]  // "daytime", "evenings", "weekends"
    hiringUrgencySignal: "low" | "medium" | "high"
    notes: string[]  // e.g. "expanding GLP-1 program", "opening new location"
  }
  jobId: string
  enrichedAt: string
}
```

**Responsibilities**:
- Scrape clinic website if provided
- Analyze job posting text for keywords
- Check clinic's other job postings for patterns
- Infer patient volume from hiring patterns
- Detect service lines from job descriptions

**Error Handling**: Returns partial enrichment if website inaccessible, marks confidence low.

**Integration**: Called by `export_workforce_batch` and `generate_workforce_matches`.

---

## 2. NURSE / CLINICIAN TALENT DISCOVERY TOOLS

### Tool: `find_nurses_seeking_temp_work`

**Description**: Discover profiles of nurses/clinicians open to temp or contract work.

**Input Schema**:
```typescript
{
  region: string
  roleType: enum       // RN | NP | PA | LPN | MA | OTHER
  desiredEmploymentType: enum  // TEMP | PER_DIEM | CONTRACT
  serviceLineInterest?: enum   // Optional: TRT | GLP-1 | IV_THERAPY
}
```

**Output Schema**:
```typescript
{
  candidates: Array<{
    candidateId: string
    displayName: string  // or pseudonym if needed
    roleType: string
    yearsExperience: number
    primarySkills: string[]
    preferredShifts: string[]  // "days", "nights", "weekends"
    preferredRegions: string[]
    profileSource: string  // "LinkedIn", "job board", "internal database"
    contactMethod: string  // High-level: "email", "LinkedIn", "phone"
    summary: string
    serviceLineInterest?: string[]
  }>
  totalFound: number
  region: string
  scannedAt: string
}
```

**Responsibilities**:
- Search LinkedIn for profiles with temp/flexible work keywords
- Query job board candidate databases
- Check internal talent database
- Filter by region, role type, and service line interest

**Error Handling**: Returns empty array if no candidates found.

**Integration**: Called by `export_workforce_batch` and `generate_workforce_matches`.

---

### Tool: `enrich_candidate_fit`

**Description**: Score a candidate vs a given clinic job.

**Input Schema**:
```typescript
{
  candidateProfile: NurseCandidate
  jobPosting: ClinicJobPosting
  enrichedClinic?: EnrichedClinicFromJob  // Optional: Pre-enriched clinic data
}
```

**Output Schema**:
```typescript
{
  fit: {
    fitScore: number        // 0-100
    reason: string          // Short explanation
    shiftCompatibility: "good" | "partial" | "poor"
    serviceLineAlignment: "good" | "partial" | "poor"
  }
  candidateId: string
  jobId: string
  scoredAt: string
}
```

**Responsibilities**:
- Calculate fit score based on role type match, employment type, region, service line alignment, shift compatibility, and experience
- Provide clear reasoning for the score
- Identify compatibility factors

**Error Handling**: Returns score of 0 with error reason if calculation fails.

**Integration**: Called by `generate_workforce_matches` for each job-candidate pair.

---

## 3. WORKFORCE EXCHANGE MATCHING TOOLS

### Tool: `generate_workforce_matches`

**Description**: For a given region + roleType, generate a match list between clinics and candidates.

**Input Schema**:
```typescript
{
  region: string
  roleType: enum       // NURSE | NP_PA | MD | MA_TECH | ADMIN | OTHER
  serviceLineFilter?: enum  // Optional: TRT | GLP-1 | IV_THERAPY | GENERAL
  maxClinics?: number   // Default: 10
  maxCandidates?: number  // Default: 20
}
```

**Behavior** (Pipeline Execution Order):
1. `find_clinic_jobs_by_region` → Get clinic jobs
2. `find_nurses_seeking_temp_work` → Get candidates
3. For each job:
   - `enrich_clinic_from_job` → Enrich clinic profile
4. For each job-candidate pair:
   - `enrich_candidate_fit` → Calculate fit score
5. Rank matches by fit score
6. Return top matches

**Output Schema**:
```typescript
{
  matches: Array<{
    clinicJob: {
      clinicName: string
      jobTitle: string
      employmentType: string
      serviceLines: string[]
      location: { city: string; state: string }
    }
    candidate: {
      displayName: string
      roleType: string
      yearsExperience: number
    }
    fitScore: number        // 0-100
    priority: "high" | "medium" | "low"
    notes: string           // Why they fit
  }>
  summary: {
    highPriorityMatches: number
    mediumPriorityMatches: number
    lowPriorityMatches: number
    strongestRegions: string[]
    strongestServiceLines: string[]
  }
  generatedAt: string
}
```

**Responsibilities**:
- Orchestrate full matching pipeline
- Rank matches by fit score
- Provide summary statistics
- Identify strongest regions and service lines

**Error Handling**: Returns partial matches if some steps fail, logs errors.

**Integration**: Called by Admin Dashboard (`/workforce-exchange`, `/admin/workforce`) and `export_workforce_batch`.

---

## 4. OUTREACH & FOLLOW-UP TOOLS (WORKFORCE)

### Tool: `vertex_workforce_outreach_brain`

**Description**: Turn job + candidate intel into outreach scripts (for clinics AND for talent).

**Input Schema**:
```typescript
{
  clinicJob: ClinicJobPosting
  candidateProfile: NurseCandidate
  direction: enum      // "TO_CLINIC" | "TO_CANDIDATE"
  tone?: string        // Optional: "professional", "concise", "opportunity-focused" (default: "professional")
}
```

**Output Schema**:
```typescript
{
  pack: {
    emailSubject: string
    emailBody: string
    dmScript: string      // Short version for LinkedIn / chat
    callOpener: string
  }
  direction: string
  generatedAt: string
}
```

**Responsibilities**:
- Generate personalized outreach content
- Create different messaging for clinics vs candidates
- Provide multiple touchpoints (email, DM, call)
- Adapt tone based on direction and preferences

**Error Handling**: Falls back to template-based generation if Vertex AI fails.

**Integration**: Called by `export_workforce_batch` for top matches.

---

## 5. BATCH & SNAPSHOT TOOLS

### Tool: `export_workforce_batch`

**Description**: End-to-end pipeline for Workforce in a region.

**Input Schema**:
```typescript
{
  region: string
  roleType: enum       // NURSE | NP_PA | MD | MA_TECH | ADMIN | OTHER
  employmentType: enum  // TEMP | PER_DIEM | CONTRACT
  serviceLineFilter?: enum  // Optional: TRT | GLP-1 | IV_THERAPY
  maxJobs?: number      // Default: 10
}
```

**Behavior** (Pipeline Execution Order):
1. `find_clinic_jobs_by_region` → Get clinic jobs
2. `enrich_clinic_from_job` → Enrich each job
3. `find_nurses_seeking_temp_work` → Get candidates
4. `generate_workforce_matches` → Generate matches
5. For top matches:
   - `vertex_workforce_outreach_brain` (TO_CLINIC) → Generate clinic outreach
   - `vertex_workforce_outreach_brain` (TO_CANDIDATE) → Generate candidate outreach
6. Return complete batch with outreach assets

**Output Schema**:
```typescript
{
  workforceSummary: {
    totalJobs: number
    totalCandidates: number
    totalMatches: number
    highPriorityMatches: number
  }
  jobs: Array<{
    job: ClinicJobPosting
    enriched?: EnrichedClinicFromJob
  }>
  candidates: NurseCandidate[]
  matches: Array<{
    match: WorkforceMatch
    outreachToClinic?: WorkforceOutreachPack
    outreachToCandidate?: WorkforceOutreachPack
  }>
  generatedAt: string
}
```

**Responsibilities**:
- Orchestrate full pipeline execution
- Handle errors gracefully (continue with partial data)
- Return ranked matches with outreach packs
- Provide batch summary statistics

**Error Handling**: Returns partial results if some steps fail, logs errors per job/candidate.

**Integration**: Called by Admin Dashboard (`/workforce-exchange`, `/admin/workforce`).

---

## Tool Summary Table

| Tool Name | Category | Input Complexity | Output Complexity | Vertex AI | External APIs |
|-----------|----------|------------------|-------------------|-----------|---------------|
| `find_clinic_jobs_by_region` | Job Discovery | Low | Medium | No | Job boards, clinic sites |
| `enrich_clinic_from_job` | Job Discovery | Low | Medium | No | Web scraping |
| `find_nurses_seeking_temp_work` | Talent Discovery | Low | Medium | No | LinkedIn, job boards |
| `enrich_candidate_fit` | Matching | Medium | Medium | No | None |
| `generate_workforce_matches` | Matching | Medium | High | No | All above |
| `vertex_workforce_outreach_brain` | Outreach | High | High | Yes | None |
| `export_workforce_batch` | Pipeline | Medium | Very High | Yes | All above |

---

## Integration Points

### Admin Dashboard Integration

- `/workforce-exchange` → Uses `export_workforce_batch`, `generate_workforce_matches`
- `/admin/workforce` → Uses `find_clinic_jobs_by_region`, `find_nurses_seeking_temp_work`
- `/workforce-intelligence` → Uses `generate_workforce_matches`, `enrich_candidate_fit`

---

## Error Handling Standards

All tools must:

1. **Return structured errors**: Include error type, message, and partial data if available
2. **Log failures**: Log to console/logger with run ID for debugging
3. **Graceful degradation**: Return partial results rather than failing completely
4. **Confidence scores**: Include fit scores (0-100) in matching outputs
5. **Privacy protection**: Never expose full candidate contact details in logs

---

## Performance Expectations

- **Job discovery tools**: < 10 seconds per region
- **Talent discovery tools**: < 15 seconds per region
- **Fit scoring**: < 2 seconds per candidate-job pair
- **Matching tools**: < 30 seconds for 10 jobs × 20 candidates
- **Outreach tools**: < 5 seconds per pack
- **Batch tools**: < 2 minutes for full pipeline

---

## Security & Privacy

- **Admin-only**: All tools require admin authentication
- **No sensitive data storage**: Candidate details only stored for matching purposes
- **No automated contacting**: MCP only generates scripts; human must send
- **Data retention**: Job and candidate data retained for 30 days only
- **Audit logging**: All tool calls logged with timestamp and user

---

## Scope & Constraints

- ✅ All tools are **server-side, admin-only**
- ✅ No storing of sensitive candidate details beyond what's needed for matching
- ✅ No automated contacting from MCP itself — only generates intelligence + scripts
- ✅ Human must review and send all outreach
- ✅ All tools callable by Admin Dashboard

---

## Version History

- **v2.0.0** (Current): Added Workforce Exchange tools (job discovery, talent discovery, matching, outreach)
- **v1.0.0**: Initial release with staffing needs scanning and temp shift listings

