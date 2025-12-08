-- Ads Metrics Table
-- Aggregates advertising performance data from all platforms
-- Normalized schema for unified ad intelligence

CREATE TABLE IF NOT EXISTS `novalyte-analytics-project.novalyte_core.ads_metrics` (
  platform STRING NOT NULL OPTIONS(description="Ad platform: google_ads, meta, tiktok, instagram"),
  campaign_id STRING OPTIONS(description="Platform-specific campaign ID"),
  ad_group_id STRING OPTIONS(description="Platform-specific ad group ID"),
  ad_id STRING OPTIONS(description="Platform-specific ad ID"),
  campaign_name STRING OPTIONS(description="Human-readable campaign name"),
  ad_group_name STRING OPTIONS(description="Human-readable ad group name"),
  ad_name STRING OPTIONS(description="Human-readable ad name/creative name"),
  date DATE NOT NULL OPTIONS(description="Date of metrics (partition key)"),
  impressions INT64 OPTIONS(description="Number of impressions served"),
  clicks INT64 OPTIONS(description="Number of clicks received"),
  spend NUMERIC(10, 2) OPTIONS(description="Cost in USD (platform currency normalized to USD)"),
  conversions INT64 OPTIONS(description="Conversion count (platform-defined or custom)"),
  revenue_attributed NUMERIC(10, 2) OPTIONS(description="Revenue attributed to this ad/campaign (filled from attribution engine, nullable if not yet calculated)"),
  city STRING OPTIONS(description="Target city or city from conversion geo data"),
  landing_page STRING OPTIONS(description="Landing page URL or identifier"),
  placement STRING OPTIONS(description="Ad placement (feed, stories, search, display, etc.) - nullable if not applicable"),
  metadata JSON OPTIONS(description="Platform-specific fields, creative details, audience info as JSON")
)
PARTITION BY date
CLUSTER BY platform, campaign_id, city
OPTIONS(
  description="Unified advertising metrics from all platforms. Partitioned by date. Revenue attribution populated via ETL.",
  labels=[("table_type", "ads"), ("source", "multi_platform")]
);

-- Expected ingestion frequency: Daily (batch) or real-time (streaming inserts)
-- Revenue attribution backfill: Run daily to populate revenue_attributed from events_app + marketplace_orders

