# BigQuery Analytics Schema - Novalyte™ AI

## Overview

This directory contains the complete BigQuery analytics schema for Novalyte™ AI, designed for revenue-focused analytics and attribution tracking.

---

## Files

### 1. `schemas/analytics_schema.sql`
**Complete SQL DDL for all tables**

- Creates dataset: `novalyte-ai-analytics`
- Fact table: `events` (partitioned by date, clustered by event_name, user_type, source)
- Dimension tables: `mens_clinics`, `marketplace_items`, `assessments`

**Run this first** to set up the schema.

---

### 2. `EVENT_NAMING_CONVENTION.md`
**Complete event naming guide**

- Naming rules and structure (`area.entity.action`)
- Full list of event names with descriptions
- Field population guidelines
- Example event payloads

**Reference this** when implementing event tracking in your app.

---

### 3. `queries/revenue_queries.sql`
**Ready-to-run example queries**

5 main queries + 2 bonus queries:
1. Revenue by ads campaign & source
2. Top converting pages
3. Marketplace revenue by category/subcategory
4. Clinic performance dashboard
5. Assessment → revenue conversion funnel
6. (Bonus) Ads ROI by campaign
7. (Bonus) Product performance with funnel drop-off

**Use these** as templates for your analytics dashboard.

---

## Quick Start

### Step 1: Create Schema
```bash
# Run in BigQuery console or via bq CLI
bq query --use_legacy_sql=false < schemas/analytics_schema.sql
```

### Step 2: Verify Tables
```sql
-- List tables in dataset
SELECT table_name 
FROM `novalyte-ai-analytics.INFORMATION_SCHEMA.TABLES`;
```

### Step 3: Insert Test Data
```sql
-- Example event insert
INSERT INTO `novalyte-ai-analytics.events` (
  event_id, event_ts, event_date, event_name,
  user_id, user_type, session_id,
  source, medium, campaign,
  page_path, page_title,
  revenue_amount, revenue_currency
) VALUES (
  GENERATE_UUID(),
  CURRENT_TIMESTAMP(),
  CURRENT_DATE(),
  'marketplace.order_complete',
  'user_123',
  'patient',
  'session_456',
  'google_ads',
  'cpc',
  'trt_campaign',
  '/marketplace/supplements',
  'Marketplace - Supplements',
  89.99,
  'USD'
);
```

### Step 4: Run Example Queries
```bash
# Test a revenue query
bq query --use_legacy_sql=false < queries/revenue_queries.sql
```

---

## Schema Design Principles

1. **Revenue-Focused**: All revenue events tracked with `revenue_amount`
2. **Attribution-Ready**: `source`, `medium`, `campaign` fields on all events
3. **Partitioned**: Events table partitioned by `event_date` for efficient queries
4. **Clustered**: Clustered by `event_name`, `user_type`, `source` for common filters
5. **Flexible**: `params` JSON column for additional context

---

## Event Tracking Integration

When implementing event tracking in your app:

1. **Use exact event names** from `EVENT_NAMING_CONVENTION.md`
2. **Populate required fields** per event type
3. **Always set `event_date`** as `DATE(event_ts)` when inserting
4. **Set revenue fields** (`revenue_amount`, `revenue_currency`) on revenue events
5. **Link entities** via `mens_clinic_id`, `marketplace_item_id`, `assessment_id`

---

## Common Patterns

### Track Assessment → Revenue
```sql
-- Link assessment_id across events
SELECT 
  a.assessment_id,
  e.event_name,
  e.revenue_amount
FROM events a
LEFT JOIN events e ON a.assessment_id = e.assessment_id
WHERE a.event_name = 'patient.assessment_completed'
```

### Attribution by Campaign
```sql
-- Revenue by campaign
SELECT 
  source, medium, campaign,
  SUM(revenue_amount) as revenue
FROM events
WHERE revenue_amount > 0
GROUP BY 1, 2, 3
```

### Conversion Funnel
```sql
-- Page views → conversions
SELECT 
  page_path,
  COUNTIF(event_name = 'app.page_view') as views,
  COUNTIF(event_name = 'marketplace.order_complete') as orders
FROM events
GROUP BY page_path
```

---

## Next Steps

1. **Set up BigQuery dataset** using `schemas/analytics_schema.sql`
2. **Implement event tracking** in your app using naming convention
3. **Create data pipeline** to insert events (batch or streaming)
4. **Build dashboards** using example queries as templates
5. **Set up monitoring** for data quality and completeness

---

## Notes

- **Partitioning**: Always filter by `event_date` in queries for best performance
- **Clustering**: Use `event_name`, `user_type`, `source` in WHERE clauses for faster queries
- **Cost Optimization**: Use `LIMIT` and date ranges in all queries
- **Data Retention**: Consider setting up partition expiration (e.g., 24 months)

---

## Support

For questions or issues:
- Review `EVENT_NAMING_CONVENTION.md` for event naming
- Check `queries/revenue_queries.sql` for query examples
- Ensure `event_date` is set correctly on all inserts

