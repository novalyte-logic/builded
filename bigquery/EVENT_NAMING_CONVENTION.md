# Event Naming Convention - Novalyte™ AI Analytics

## Overview

All events logged to the `events` table must use a standardized `event_name` following this convention. This ensures consistent analytics, easy querying, and clear attribution.

---

## A. Global Naming Rules

### Structure
- **Format**: `area.entity.action` (dot-separated, three parts)
- **Case**: All lowercase
- **Verbs**: Use present tense (`view`, `start`, `submit`, `complete`, `click`)
- **Parts**:
  1. **Area** = Domain/feature area (`patient`, `mens_clinic`, `marketplace`, `support`, `ads`)
  2. **Entity** = Specific object/feature (`assessment`, `directory`, `item`, `chat`)
  3. **Action** = What happened (`view`, `start`, `submit`, `click`, `complete`)

### Rules
- **Be specific**: `patient.assessment_start` not `patient.start`
- **Be consistent**: Use same verbs across similar actions (`submit`, not `submit` sometimes and `send` others)
- **Use past context carefully**: Events represent what just happened, so use present tense ("user views page" = `view`, not `viewed`)

### Verb Guidelines
- `view` = User sees/displays something
- `start` = User begins a process
- `submit` = User submits a form/action
- `complete` = User finishes a process
- `click` = User clicks a link/button
- `open` = User opens a modal/component
- `close` = User closes a modal/component
- `select` = User selects an option/choice
- `search` = User runs a search
- `filter` = User applies a filter

---

## B. Concrete Event Names for Novalyte™ AI

### App / Global Events

| Event Name | When Fired | Key Fields |
|------------|-----------|------------|
| `app.session_start` | New user session begins | `session_id`, `user_id` (if known), `source`, `medium` |
| `app.page_view` | Any page is viewed | `page_path`, `page_title`, `referrer` |
| `app.nav_click` | User clicks navigation link | `page_path` (destination) |
| `app.search_run` | User executes search | `params.query`, `params.category` |

**Usage**: Track general app usage, navigation patterns, search behavior.

---

### Patient / Men's Health Assessment

| Event Name | When Fired | Key Fields |
|------------|-----------|------------|
| `patient.assessment_start` | User starts Men's Health assessment | `assessment_id`, `page_path`, `source` |
| `patient.assessment_step_view` | User views a step/question | `assessment_id`, `params.step_number`, `params.step_name` |
| `patient.assessment_submit` | User submits an answer/step | `assessment_id`, `params.step_number`, `params.answers` |
| `patient.assessment_completed` | User finishes entire assessment | `assessment_id`, `params.recommended_path`, `params.scores` |
| `patient.symptom_checker_open` | User opens symptom checker tool | `page_path` |
| `patient.symptom_checker_result` | Symptom checker returns results | `params.symptoms`, `params.results` |

**Usage**: Track assessment funnel, drop-off points, completion rates. Link to revenue via `assessment_id` in downstream events.

**Revenue Attribution**: Assessments that lead to clinic bookings or purchases should have matching `assessment_id` in revenue events.

---

### Men's Clinics

| Event Name | When Fired | Key Fields |
|------------|-----------|------------|
| `mens_clinic.directory_view` | User views clinic directory page | `page_path`, `params.category`, `params.city` |
| `mens_clinic.profile_view` | User views specific clinic profile | `mens_clinic_id`, `page_path` |
| `mens_clinic.book_cta_click` | User clicks "Book" or "Schedule" button | `mens_clinic_id`, `page_path` |
| `mens_clinic.lead_submit` | User submits clinic inquiry/booking form | `mens_clinic_id`, `lead_id`, `revenue_amount` (if booking fee), `params.booking_type` |
| `mens_clinic.application_start` | Clinic starts partnership application | `user_type='mens_clinic'`, `page_path` |
| `mens_clinic.application_submit` | Clinic submits partnership application | `lead_id`, `params.clinic_name`, `params.revenue`, `params.specializations` |
| `mens_clinic.application_approved` | Admin approves clinic application | `mens_clinic_id`, `lead_id` |
| `mens_clinic.application_rejected` | Admin rejects clinic application | `lead_id` |

**Usage**: Track clinic directory performance, booking conversions, partnership pipeline.

**Revenue Attribution**: `mens_clinic.lead_submit` with `revenue_amount` > 0 indicates a booking/purchase. Link to ads via `source`, `campaign`.

---

### Marketplace

| Event Name | When Fired | Key Fields |
|------------|-----------|------------|
| `marketplace.category_view` | User views marketplace category page | `page_path`, `params.category`, `params.subcategory` |
| `marketplace.item_view` | User views specific product/item detail page | `marketplace_item_id`, `page_path` |
| `marketplace.item_analyze_roi_click` | User clicks "Analyze ROI" button | `marketplace_item_id`, `page_path` |
| `marketplace.item_outbound_click` | User clicks link to vendor/external site | `marketplace_item_id`, `params.vendor_url` |
| `marketplace.cart_add` | User adds item to cart | `marketplace_item_id`, `params.quantity`, `params.price` |
| `marketplace.checkout_start` | User begins checkout process | `params.cart_items` (array), `params.total_amount` |
| `marketplace.order_complete` | Order is successfully completed | `marketplace_item_id` (or multiple items in `params.items`), `revenue_amount`, `revenue_currency`, `lead_id` (if applicable) |

**Usage**: Track marketplace funnel, product performance, conversion optimization.

**Revenue Attribution**: `marketplace.order_complete` is the primary revenue event. Always set `revenue_amount`, link to ads via `source`, `campaign`, link to assessment via `assessment_id` if applicable.

---

### Communication / Support

| Event Name | When Fired | Key Fields |
|------------|-----------|------------|
| `support.contact_form_submit` | User submits contact form | `lead_id`, `params.message_type`, `params.topic` |
| `support.chat_open` | User opens support chat | `session_id`, `page_path` |
| `support.chat_message_send` | User sends chat message | `params.message_length`, `params.chat_session_id` |
| `support.chat_escalate_human` | Chat is escalated to human agent | `params.chat_session_id`, `params.escalation_reason` |

**Usage**: Track support volume, response times, escalation rates.

**Revenue Attribution**: Link to revenue via `lead_id` if support interaction converts to booking/purchase.

---

### Ads / Attribution

| Event Name | When Fired | Key Fields |
|------------|-----------|------------|
| `ads.click_attributed` | Ad click is recorded (first touch) | `source`, `medium`, `campaign`, `ad_group`, `ad_creative_id`, `session_id` |
| `ads.first_touch_attributed` | First touchpoint attributed to conversion | `source`, `medium`, `campaign`, `lead_id` or `assessment_id` |
| `ads.last_touch_attributed` | Last touchpoint before conversion | `source`, `medium`, `campaign`, `revenue_amount` (if conversion has revenue) |
| `ads.conversion_recorded` | Conversion event tied to ad campaign | `source`, `medium`, `campaign`, `revenue_amount`, `params.conversion_type` (assessment, booking, purchase) |

**Usage**: Track ad performance, attribution models, ROI by campaign.

**Revenue Attribution**: Use `ads.last_touch_attributed` + `ads.conversion_recorded` to attribute revenue to specific campaigns. Always set `revenue_amount` when applicable.

---

## C. Field Population Guidelines

### Required Fields by Event Type

**All Events:**
- `event_id`, `event_ts`, `event_date`, `event_name`, `session_id`

**Traffic Events:**
- `source`, `medium` (always set if known)
- `campaign`, `ad_group`, `ad_creative_id` (for paid traffic)

**Revenue Events:**
- `revenue_amount`, `revenue_currency` (required)
- `is_new_patient` (for patient revenue)
- `source`, `medium`, `campaign` (for attribution)

**Assessment Events:**
- `assessment_id` (required)
- `user_id`, `user_type` (if known)

**Clinic Events:**
- `mens_clinic_id` (required for profile/view events)

**Marketplace Events:**
- `marketplace_item_id` (required for item-specific events)
- `revenue_amount` (required for `marketplace.order_complete`)

---

## D. Example Event Payloads

### Patient Assessment Completed
```json
{
  "event_name": "patient.assessment_completed",
  "assessment_id": "assess_abc123",
  "user_id": "user_xyz789",
  "user_type": "patient",
  "source": "google_ads",
  "campaign": "trt_search_campaign",
  "params": {
    "recommended_path": "trt",
    "score_overall": 72,
    "score_hormonal": 45,
    "score_metabolic": 88,
    "symptoms": ["low_energy", "brain_fog"]
  }
}
```

### Marketplace Order Complete
```json
{
  "event_name": "marketplace.order_complete",
  "marketplace_item_id": "item_def456",
  "revenue_amount": 89.99,
  "revenue_currency": "USD",
  "source": "meta",
  "campaign": "supplements_retargeting",
  "assessment_id": "assess_abc123",
  "params": {
    "items": [
      {"item_id": "item_def456", "quantity": 1, "price": 89.99}
    ],
    "order_id": "order_ghi789"
  }
}
```

### Clinic Lead Submit
```json
{
  "event_name": "mens_clinic.lead_submit",
  "mens_clinic_id": "clinic_jkl012",
  "lead_id": "lead_mno345",
  "revenue_amount": 199.00,
  "source": "tiktok",
  "campaign": "clinic_booking_campaign",
  "params": {
    "booking_type": "initial_consultation",
    "scheduled_date": "2024-01-15"
  }
}
```

---

## E. Enforcement Checklist

Before deploying event tracking:

- [ ] Event name follows `area.entity.action` format
- [ ] All lowercase, dot-separated
- [ ] Present tense verbs only
- [ ] Required fields populated (see guidelines above)
- [ ] Revenue events have `revenue_amount` set
- [ ] Attribution fields (`source`, `medium`, `campaign`) set for paid traffic
- [ ] Entity IDs (`mens_clinic_id`, `marketplace_item_id`, `assessment_id`) set when applicable
- [ ] `params` JSON contains additional context (not required fields)

---

## Summary

**Convention**: `area.entity.action` (all lowercase, dot-separated)

**Areas**: `app`, `patient`, `mens_clinic`, `marketplace`, `support`, `ads`

**Entities**: Vary by area (e.g., `assessment`, `directory`, `item`, `chat`)

**Actions**: `view`, `start`, `submit`, `complete`, `click`, `open`, `search`, etc.

**Goal**: Every event name should answer "What happened?" in 3 words or less.

