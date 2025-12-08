-- Assessment Funnel Table
-- Tracks patient assessment journeys and qualification outcomes
-- Enables funnel analysis and LTV prediction

CREATE TABLE IF NOT EXISTS `novalyte-analytics-project.novalyte_core.assessment_funnel` (
  assessment_id STRING NOT NULL OPTIONS(description="Unique assessment identifier"),
  user_id STRING OPTIONS(description="User ID (nullable for anonymous starts)"),
  created_at TIMESTAMP NOT NULL OPTIONS(description="Assessment start timestamp"),
  completed_at TIMESTAMP OPTIONS(description="Assessment completion timestamp (NULL if abandoned)"),
  path STRING NOT NULL OPTIONS(description="Assessment path: TRT, GLP-1, peptides, recovery, longevity, general"),
  step_started INT64 NOT NULL OPTIONS(description="Number of assessment steps started"),
  step_completed INT64 OPTIONS(description="Number of assessment steps completed (NULL if not completed)"),
  qualification_flag STRING OPTIONS(description="Qualification outcome: qualified, unqualified, borderline (NULL if not completed)"),
  predicted_LTV NUMERIC(10, 2) OPTIONS(description="Predicted lifetime value from Vertex AI model (NULL if not yet scored)"),
  city STRING OPTIONS(description="User city from IP or profile"),
  acquisition_channel STRING OPTIONS(description="How user arrived: google_ads, meta_ads, organic_search, referral, direct, etc.")
)
PARTITION BY DATE(created_at)
CLUSTER BY path, qualification_flag, city
OPTIONS(
  description="Patient assessment funnel data. Enables drop-off analysis and LTV prediction. Partitioned by creation date.",
  labels=[("table_type", "funnel"), ("source", "assessment_engine")]
);

-- Use cases:
-- - Funnel drop-off analysis by path, channel, city
-- - Conversion rate optimization
-- - LTV prediction model training (using predicted_LTV vs actual LTV from clinic_revenue_daily)

