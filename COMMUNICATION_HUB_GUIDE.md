# Communication Hub - Message Sync Guide

## Overview

Unified Communication Hub that syncs all messages and conversations from app.novalyte.io to the Novalyte™ AI Superadmin Dashboard.

---

## Architecture

```
┌─────────────────────────────────┐
│  app.novalyte.io (Frontend)     │
│  - Contact Forms                 │
│  - Patient Help                  │
│  - Clinic/Vendor Applications    │
│  - AI Chat                       │
└──────────────┬──────────────────┘
               │ POST /api/admin/messages
               │ (Create Thread/Message)
               ▼
┌─────────────────────────────────┐
│  API Layer                      │
│  /api/admin/messages             │
│  - Thread creation               │
│  - Message sync                  │
└──────────────┬──────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│  Database   │  │  LeadRecord │
│  (Threads +  │  │  Linking    │
│   Messages)  │  │             │
└─────────────┘  └─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Admin Dashboard                 │
│  /communication                  │
│  - Thread List                   │
│  - Thread Viewer                 │
└─────────────────────────────────┘
```

---

## 1. Data Models

### MessageThread

**Location:** `lib/types/message.ts`

**Fields:**
- `id` - UUID
- `related_lead_id` - Links to LeadRecord (nullable)
- `subject` - Thread subject line
- `channel` - Communication channel type
- `created_at`, `last_activity_at` - Timestamps
- `participant_type` - patient | mens_clinic | vendor | unknown
- `status` - open | pending | closed
- `tags` - Array of labels (e.g., ["TRT", "Billing"])

**Channels:**
- `contact_form` - General contact page submissions
- `patient_help` - Patient support inquiries
- `clinic_partnership` - Men's clinic partnership applications
- `vendor_network` - Vendor network applications
- `tech_support` - Technical support requests
- `ai_chat` - AI conversation handoffs

### Message

**Location:** `lib/types/message.ts`

**Fields:**
- `id` - UUID
- `thread_id` - Links to MessageThread
- `created_at` - Timestamp
- `sender_type` - user | admin | ai
- `sender_display` - Human-readable name
- `body` - Message content
- `metadata` - Flexible JSON data

---

## 2. Frontend Sync Patterns

### A) Contact Form Submission

**Endpoint:** `POST /api/admin/messages`

**Payload:**
```json
{
  "subject": "Inquiry about TRT treatment",
  "channel": "contact_form",
  "participant_type": "patient",
  "message_body": "I'm interested in learning more about...",
  "sender_display": "John Doe",
  "metadata": {
    "email": "john@example.com",
    "phone": "+1234567890",
    "page_path": "/contact"
  },
  "tags": ["TRT"],
  "create_lead": true
}
```

**Behavior:**
- Creates new MessageThread
- Creates first Message
- Optionally creates/links LeadRecord

### B) Clinic Partnership Application

**Endpoint:** `POST /api/admin/messages`

**Payload:**
```json
{
  "subject": "Clinic Partnership Application - ABC Men's Health",
  "channel": "clinic_partnership",
  "participant_type": "mens_clinic",
  "message_body": "Application summary...",
  "metadata": {
    "clinic_name": "ABC Men's Health",
    "revenue": 500000,
    "specialties": ["TRT", "GLP-1"],
    "city": "Los Angeles",
    "contact_email": "clinic@example.com"
  },
  "tags": ["partnership", "TRT", "GLP1"],
  "create_lead": true
}
```

**Behavior:**
- Creates LeadRecord (lead_type: "mens_clinic")
- Creates MessageThread
- Creates summary Message

### C) Vendor Network Application

**Endpoint:** `POST /api/admin/messages`

**Payload:**
```json
{
  "subject": "Vendor Network Application - Supplements Co",
  "channel": "vendor_network",
  "participant_type": "vendor",
  "message_body": "Vendor application summary...",
  "metadata": {
    "vendor_name": "Supplements Co",
    "product_categories": ["supplements", "equipment"],
    "contact_email": "vendor@example.com"
  },
  "tags": ["vendor", "partnership"],
  "create_lead": true
}
```

**Behavior:**
- Creates LeadRecord (lead_type: "vendor")
- Creates MessageThread
- Creates summary Message

### D) AI Chat Persistence

**Endpoint:** `POST /api/admin/messages`

**When:** AI chat conversation is persisted

**Payload:**
```json
{
  "thread_id": "existing-thread-id", // Or omit for new thread
  "subject": "Patient Help - GLP-1 Program",
  "channel": "ai_chat",
  "participant_type": "patient",
  "sender_type": "user", // or "ai"
  "message_body": "User message or AI response...",
  "sender_display": "User" // or "Novalyte AI",
  "metadata": {
    "ai_model": "gemini-1.5-pro",
    "session_id": "abc123",
    "context": {...}
  },
  "tags": ["GLP1", "help"]
}
```

**Behavior:**
- Upserts MessageThread (creates if new)
- Appends Message to thread

---

## 3. API Endpoints

### Messages

**GET `/api/admin/messages`**
- Query params: `channel`, `status`, `participant_type`, `search`, `startDate`, `endDate`
- Returns: List of threads with latest message preview

**POST `/api/admin/messages`**
- Body: Thread and first message data
- Returns: Created thread and message

### Thread Detail

**GET `/api/admin/messages/:threadId`**
- Returns: Thread with all messages in chronological order

**PATCH `/api/admin/messages/:threadId`**
- Body: Updates (status, tags)
- Returns: Updated thread

**POST `/api/admin/messages/:threadId`**
- Body: Admin reply message
- Returns: Created message
- Triggers: Email/in-app delivery to user

---

## 4. Admin UI

### Communication Hub Page

**Location:** `app/communication/page.tsx`

**Layout:**
- Left column: MessageThreadList (thread list with filters)
- Right column: ThreadViewer (conversation view)

### Thread List (Left)

**MessageThreadList Component:**
- Search input (by subject, lead name, tags)
- Filters:
  - Channel (Contact, Patient Help, Clinic, Vendor, Tech, AI Chat)
  - Status (Open, Pending, Closed)
  - Participant Type (Patient, Men's Clinic, Vendor, Unknown)
- Thread previews showing:
  - Subject
  - Channel label (colored pill)
  - Last message preview
  - Status badge
  - Message count
  - Last activity time
  - Tags
- Auto-refresh every 30 seconds
- Sorted by last_activity_at DESC

**All filters have hover explainers.**

### Thread Viewer (Right)

**ThreadViewer Component shows:**
- Thread header:
  - Subject
  - Channel, participant type, tags
  - Linked Lead button (if exists)
  - Status dropdown (with explainer)
- Message list:
  - Chronological messages
  - Distinct styling for user/admin/AI
  - Sender icons (User/Shield/Bot)
  - Timestamps
- Reply input:
  - Textarea for admin reply
  - Send button
  - Mark Closed button
  - Hover explainer on reply section

**Message Styling:**
- User messages: Left-aligned, blue accent
- Admin messages: Right-aligned, primary color
- AI messages: Left-aligned, purple accent

---

## 5. Sync Behavior

### New Message Arrival

1. Frontend sends POST to `/api/admin/messages`
2. Thread created/updated
3. Message appended
4. Thread status = "open"
5. Appears at top of Communication Hub (sorted by last_activity_at)

### Thread Status Flow

- **open** - New or active conversation (default)
- **pending** - Awaiting response/admin action
- **closed** - Resolved/concluded

### Admin Actions

- **Send Reply** - Creates admin message, updates thread last_activity
- **Update Status** - Changes workflow state
- **View Lead** - Opens linked LeadRecord

---

## 6. Integration Points

### Linking to Leads

**Automatic Linking:**
- Clinic/Vendor applications create LeadRecord and link thread
- Contact forms can optionally create/link leads

**Manual Linking:**
- Admin can link thread to existing lead via API

### Linking to Assessments

**Via LeadRecord:**
- If assessment creates LeadRecord, and thread links to same lead
- Thread and assessment are related through lead

---

## 7. Frontend Integration Examples

### Contact Form

```typescript
// app.novalyte.io/contact page
const handleSubmit = async (formData) => {
  await fetch('/api/admin/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: formData.subject,
      channel: 'contact_form',
      participant_type: 'patient',
      message_body: formData.message,
      sender_display: formData.name,
      metadata: {
        email: formData.email,
        phone: formData.phone,
      },
      tags: formData.interests || [],
      create_lead: true,
    }),
  })
}
```

### AI Chat Sync

```typescript
// On AI chat message (user or AI)
await fetch('/api/admin/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    thread_id: existingThreadId || undefined, // Upsert pattern
    subject: 'Patient Help - GLP-1 Program',
    channel: 'ai_chat',
    participant_type: 'patient',
    sender_type: isUser ? 'user' : 'ai',
    message_body: messageText,
    sender_display: isUser ? userName : 'Novalyte AI',
    metadata: {
      ai_model: 'gemini-1.5-pro',
      session_id: sessionId,
    },
    tags: extractTags(messageText),
  }),
})
```

---

## 8. Security & Privacy

### PII Protection

- **Never log message bodies** in public logs
- **Encrypt sensitive data** in database
- **Admin auth required** for all message endpoints
- **Access logging** for audit trail

### Admin Authentication

All admin endpoints check for Superadmin authentication.

---

## 9. Performance Considerations

### Real-Time Updates

- Thread list auto-refreshes every 30 seconds
- New threads appear at top automatically
- Non-blocking sync from frontend

### Scalability

- Index database on thread_id, channel, status, last_activity_at
- Use pagination for large thread lists
- Cache thread previews when possible

---

## Summary

✅ **Unified Communication Hub** - Single place for all inbound messages  
✅ **Multi-Channel Support** - Contact, Help, Partnerships, Vendors, AI Chat  
✅ **Thread Management** - Organized conversations with status tracking  
✅ **Lead Integration** - Automatic linking to LeadRecords  
✅ **Admin Reply** - Direct response capability  
✅ **Search & Filters** - Efficient message discovery  
✅ **Hover Explainers** - Self-documenting UI  

**Result:** Complete communication sync from app.novalyte.io to admin dashboard, with unified thread management and workflow tracking.

