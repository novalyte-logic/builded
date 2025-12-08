-- ============================================================================
-- NOVALYTE™ AI ANALYTICS - BIGQUERY SCHEMA
-- ============================================================================
-- Revenue-focused analytics layer for ads → behavior → revenue attribution
-- Supports Patients, Men's Clinics, Vendors, and Marketplace performance
-- ============================================================================

-- Create dataset (run this first)
CREATE SCHEMA IF NOT EXISTS `novalyte-ai-analytics`
OPTIONS(
  description='Novalyte™ AI Analytics - Revenue-focused event tracking and attribution',
  location='US'
);

-- ============================================================================
-- FACT TABLE: events (Central Event Log)
-- ============================================================================
-- This is the main event table tracking all user interactions
-- Partitioned by date, clustered for performance
-- ============================================================================

CREATE TABLE IF NOT EXISTS `novalyte-ai-analytics.events` (
  -- Event identification
  event_id STRING NOT NULL OPTIONS(description='Unique UUID per event'),
  event_ts TIMESTAMP NOT NULL OPTIONS(description='Event timestamp'),
  event_date DATE NOT NULL OPTIONS(description='Event date (DATE(event_ts) - set on insert for partitioning)'),
  event_name STRING NOT NULL OPTIONS(description='Semantic event name (see event naming convention)'),

  -- User / identity
  user_id STRING OPTIONS(description='Internal user ID or hashed identifier'),
  user_type STRING OPTIONS(description='patient, mens_clinic, vendor, anonymous'),
  session_id STRING OPTIONS(description='Session identifier for grouping events'),

  -- Traffic / attribution
  source STRING OPTIONS(description='Traffic source: google_ads, meta, tiktok, direct, organic, referral'),
  medium STRING OPTIONS(description='Traffic medium: cpc, paid_social, organic, referral, email'),
  campaign STRING OPTIONS(description='Campaign name/ID from ad platform'),
  ad_group STRING OPTIONS(description='Ad group name/ID from ad platform'),
  ad_creative_id STRING OPTIONS(description='Specific ad creative identifier'),

  -- Page / context
  page_path STRING OPTIONS(description='URL path: /patient, /clinics/directory, /marketplace/equipment'),
  page_title STRING OPTIONS(description='Page title'),
  referrer STRING OPTIONS(description='HTTP referrer URL'),

  -- Device / geo
  device_type STRING OPTIONS(description='desktop, mobile, tablet'),
  os_name STRING OPTIONS(description='Operating system name'),
  browser_name STRING OPTIONS(description='Browser name'),
  country STRING OPTIONS(description='Country code (ISO 3166-1 alpha-2)'),
  region STRING OPTIONS(description='State or region code'),
  city STRING OPTIONS(description='City name'),

  -- Domain-specific references
  mens_clinic_id STRING OPTIONS(description='Links to mens_clinics dimension table'),
  marketplace_item_id STRING OPTIONS(description='Links to marketplace_items dimension table'),
  assessment_id STRING OPTIONS(description='Links to assessments dimension table'),
  lead_id STRING OPTIONS(description='Generic lead identifier'),

  -- Revenue & value
  revenue_amount NUMERIC OPTIONS(description='Positive when money is made, in USD'),
  revenue_currency STRING OPTIONS(description='Currency code, default USD'),
  is_new_patient BOOL OPTIONS(description='True if first-time patient revenue'),

  -- Flexible payload
  params JSON OPTIONS(description='Nested context: symptoms, scoring, tags, metadata, etc.')
)
PARTITION BY event_date
CLUSTER BY event_name, user_type, source
OPTIONS(
  description='Central event log for all Novalyte™ AI user interactions and revenue events'
);

-- ============================================================================
-- DIMENSION TABLE: mens_clinics
-- ============================================================================
-- Metadata about Men's Clinics in the network
-- ============================================================================

CREATE TABLE IF NOT EXISTS `novalyte-ai-analytics.mens_clinics` (
  mens_clinic_id STRING NOT NULL OPTIONS(description='Unique identifier for Men\'s Clinic'),
  name STRING OPTIONS(description='Clinic name'),
  city STRING OPTIONS(description='City location'),
  state STRING OPTIONS(description='State/Province code'),
  country STRING OPTIONS(description='Country code'),
  specialization ARRAY<STRING> OPTIONS(description='Array of specializations: TRT, Peptides, GLP-1, etc.'),
  avg_ltv_usd NUMERIC OPTIONS(description='Average lifetime value estimate in USD'),
  created_at TIMESTAMP OPTIONS(description='When clinic was added to network')
)
CLUSTER BY city, state
OPTIONS(
  description='Dimension table for Men\'s Clinics - links to events via mens_clinic_id'
);

-- ============================================================================
-- DIMENSION TABLE: marketplace_items
-- ============================================================================
-- Everything in the marketplace (supplements, equipment, diagnostics, devices)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `novalyte-ai-analytics.marketplace_items` (
  marketplace_item_id STRING NOT NULL OPTIONS(description='Unique identifier for marketplace item'),
  name STRING OPTIONS(description='Product/item name'),
  category STRING OPTIONS(description='Main category: supplement, equipment, diagnostic, device'),
  subcategory STRING OPTIONS(description='Subcategory: hormone_optimization, metabolic_health, etc.'),
  price_usd NUMERIC OPTIONS(description='Price in USD'),
  recurring BOOL OPTIONS(description='True if subscription-like recurring purchase'),
  created_at TIMESTAMP OPTIONS(description='When item was added to marketplace')
)
CLUSTER BY category, subcategory
OPTIONS(
  description='Dimension table for Marketplace items - links to events via marketplace_item_id'
);

-- ============================================================================
-- DIMENSION TABLE: assessments
-- ============================================================================
-- High-level results of Patient Men's Health assessments
-- ============================================================================

CREATE TABLE IF NOT EXISTS `novalyte-ai-analytics.assessments` (
  assessment_id STRING NOT NULL OPTIONS(description='Unique identifier for assessment'),
  user_id STRING OPTIONS(description='User who completed assessment'),
  user_type STRING OPTIONS(description='Usually patient'),
  created_at TIMESTAMP OPTIONS(description='When assessment was created/completed'),
  score_overall NUMERIC OPTIONS(description='Overall assessment score'),
  score_hormonal NUMERIC OPTIONS(description='Hormonal health score'),
  score_metabolic NUMERIC OPTIONS(description='Metabolic health score'),
  score_cognitive NUMERIC OPTIONS(description='Cognitive health score'),
  recommended_path STRING OPTIONS(description='AI-recommended path: trt, glp1, peptides_recovery, etc.')
)
CLUSTER BY recommended_path, created_at
OPTIONS(
  description='Dimension table for Patient Assessments - links to events via assessment_id'
);

-- ============================================================================
-- INDEXES / OPTIMIZATION NOTES
-- ============================================================================
-- 
-- Partitioning: events table partitioned by event_date for efficient date range queries
-- Clustering: events clustered by event_name, user_type, source for common filter patterns
-- 
-- Recommended indexes (if needed for specific queries):
-- - Consider materialized views for common revenue aggregations
-- - Use DATE() function on event_ts in queries (event_date is generated column)
-- 
-- ============================================================================

