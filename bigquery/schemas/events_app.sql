-- Events App Table
-- Tracks all user interactions across the Novalyte™ AI platform
-- Partitioned by date for cost optimization and query performance

CREATE TABLE IF NOT EXISTS `novalyte-analytics-project.novalyte_core.events_app` (
  event_id STRING NOT NULL OPTIONS(description="Unique event identifier, UUID format"),
  user_id STRING OPTIONS(description="User ID if authenticated, NULL for anonymous users"),
  role STRING OPTIONS(description="User role: patient, mens_clinic, vendor, or NULL for anonymous"),
  event_type STRING NOT NULL OPTIONS(description="Event type: page_view, assessment_start, assessment_complete, clinic_view, clinic_book, marketplace_view, product_click, purchase, chat_open, chat_message, etc."),
  page_path STRING OPTIONS(description="URL path where event occurred"),
  referrer STRING OPTIONS(description="HTTP referrer URL"),
  session_id STRING NOT NULL OPTIONS(description="Session identifier for grouping events"),
  city STRING OPTIONS(description="User city from IP geolocation or profile"),
  state STRING OPTIONS(description="User state from IP geolocation or profile"),
  country STRING OPTIONS(description="User country from IP geolocation or profile"),
  device_type STRING OPTIONS(description="Device type: desktop, mobile, tablet"),
  created_at TIMESTAMP NOT NULL OPTIONS(description="Event timestamp in UTC"),
  metadata JSON OPTIONS(description="Additional event data as JSON (flexible schema for custom fields)")
)
PARTITION BY DATE(created_at)
CLUSTER BY event_type, role, city
OPTIONS(
  description="Core events table tracking all user interactions. Partitioned by date for query performance.",
  labels=[("table_type", "events"), ("source", "app")]
);

-- Index suggestions (BigQuery uses clustering, but we can add these as metadata):
-- Primary clustering: event_type, role, city (for common filter patterns)
-- Partition: DATE(created_at) (for date-range queries)

