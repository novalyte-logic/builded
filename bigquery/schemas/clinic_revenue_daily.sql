-- Clinic Revenue Daily Table
-- Daily revenue aggregations per men's clinic
-- Enables cohort analysis and clinic performance intelligence

CREATE TABLE IF NOT EXISTS `novalyte-analytics-project.novalyte_core.clinic_revenue_daily` (
  mens_clinic_id STRING NOT NULL OPTIONS(description="Unique identifier for men's health clinic"),
  clinic_name STRING NOT NULL OPTIONS(description="Human-readable clinic name"),
  city STRING OPTIONS(description="Clinic city location"),
  state STRING OPTIONS(description="Clinic state location"),
  country STRING OPTIONS(description="Clinic country location (default: US)"),
  date DATE NOT NULL OPTIONS(description="Revenue date (partition key)"),
  new_patients INT64 OPTIONS(description="Count of new patient bookings/registrations"),
  returning_patients INT64 OPTIONS(description="Count of returning patient visits"),
  total_revenue NUMERIC(10, 2) NOT NULL OPTIONS(description="Total revenue for this clinic on this date"),
  recurring_revenue NUMERIC(10, 2) OPTIONS(description="Revenue from recurring subscriptions/services"),
  avg_order_value NUMERIC(10, 2) OPTIONS(description="Average order value for this date"),
  source_channel STRING OPTIONS(description="Primary acquisition channel: organics, paid, referral, marketplace, unknown")
)
PARTITION BY date
CLUSTER BY mens_clinic_id, city, state
OPTIONS(
  description="Daily revenue and patient metrics per clinic. Partitioned by date for time-series analysis.",
  labels=[("table_type", "revenue"), ("source", "clinic_system")]
);

-- Use case: Clinic leaderboards, geographic revenue analysis, cohort tracking
-- Aggregation level: One row per clinic per day

