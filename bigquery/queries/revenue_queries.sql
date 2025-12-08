-- ============================================================================
-- NOVALYTE™ AI ANALYTICS - REVENUE-FOCUSED QUERIES
-- ============================================================================
-- Example SQL queries proving the schema can answer money questions
-- All queries use exact table/column names from the schema
-- ============================================================================

-- ============================================================================
-- QUERY 1: Revenue by Ads Campaign & Source
-- ============================================================================
-- Answers: Which ad campaigns are driving the most revenue?
-- Groups by source, medium, campaign and shows revenue + conversion counts
-- ============================================================================

SELECT
  source,
  medium,
  campaign,
  COUNTIF(event_name = 'marketplace.order_complete') AS order_count,
  COUNTIF(event_name = 'mens_clinic.lead_submit') AS lead_count,
  COUNTIF(event_name = 'patient.assessment_completed') AS assessment_count,
  SUM(revenue_amount) AS total_revenue_usd,
  COUNT(DISTINCT user_id) AS unique_converting_users,
  COUNT(DISTINCT session_id) AS converting_sessions
FROM
  `novalyte-ai-analytics.events`
WHERE
  event_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND (
    event_name IN ('marketplace.order_complete', 'mens_clinic.lead_submit')
    OR revenue_amount > 0
  )
  AND source IS NOT NULL
GROUP BY
  source,
  medium,
  campaign
ORDER BY
  total_revenue_usd DESC
LIMIT
  50;

-- ============================================================================
-- QUERY 2: Top Converting Pages
-- ============================================================================
-- Answers: Which pages drive the most revenue and conversions?
-- Groups by page_path and shows assessment submits, lead submits, revenue
-- ============================================================================

SELECT
  page_path,
  COUNTIF(event_name = 'patient.assessment_submit') AS assessment_submits,
  COUNTIF(event_name = 'mens_clinic.lead_submit') AS clinic_leads,
  COUNTIF(event_name = 'marketplace.order_complete') AS orders,
  SUM(revenue_amount) AS total_revenue_usd,
  COUNT(DISTINCT session_id) AS sessions,
  SAFE_DIVIDE(
    COUNTIF(event_name IN ('patient.assessment_submit', 'mens_clinic.lead_submit', 'marketplace.order_complete')),
    COUNT(*)
  ) AS conversion_rate
FROM
  `novalyte-ai-analytics.events`
WHERE
  event_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND page_path IS NOT NULL
GROUP BY
  page_path
HAVING
  total_revenue_usd > 0
  OR assessment_submits > 0
  OR clinic_leads > 0
  OR orders > 0
ORDER BY
  total_revenue_usd DESC,
  assessment_submits DESC,
  clinic_leads DESC
LIMIT
  50;

-- ============================================================================
-- QUERY 3: Marketplace Revenue by Category/Subcategory
-- ============================================================================
-- Answers: Which marketplace categories drive the most revenue?
-- Joins events with marketplace_items to get category breakdown
-- ============================================================================

SELECT
  mi.category,
  mi.subcategory,
  COUNT(DISTINCT e.event_id) AS order_count,
  COUNT(DISTINCT e.user_id) AS unique_buyers,
  SUM(e.revenue_amount) AS total_revenue_usd,
  AVG(e.revenue_amount) AS avg_order_value_usd,
  COUNT(DISTINCT e.source) AS traffic_sources_count,
  COUNTIF(e.is_new_patient = TRUE) AS new_patient_orders
FROM
  `novalyte-ai-analytics.events` AS e
INNER JOIN
  `novalyte-ai-analytics.marketplace_items` AS mi
ON
  e.marketplace_item_id = mi.marketplace_item_id
WHERE
  e.event_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND e.event_name = 'marketplace.order_complete'
  AND e.revenue_amount > 0
GROUP BY
  mi.category,
  mi.subcategory
ORDER BY
  total_revenue_usd DESC;

-- ============================================================================
-- QUERY 4: Clinic Performance (for Admin Dashboard)
-- ============================================================================
-- Answers: Which clinics generate the most leads, orders, and revenue?
-- Joins events with mens_clinics to show per-clinic performance metrics
-- ============================================================================

SELECT
  mc.mens_clinic_id,
  mc.name AS clinic_name,
  mc.city,
  mc.state,
  mc.specialization,
  mc.avg_ltv_usd,
  COUNTIF(e.event_name = 'mens_clinic.lead_submit') AS total_leads,
  COUNTIF(e.event_name = 'mens_clinic.lead_submit' AND e.revenue_amount > 0) AS paid_bookings,
  COUNTIF(e.event_name = 'marketplace.order_complete' AND e.mens_clinic_id = mc.mens_clinic_id) AS marketplace_orders,
  SUM(e.revenue_amount) AS total_revenue_usd,
  AVG(e.revenue_amount) AS avg_revenue_per_event,
  COUNT(DISTINCT e.user_id) AS unique_patients,
  COUNTIF(e.is_new_patient = TRUE) AS new_patients,
  COUNTIF(e.source = 'google_ads' OR e.source = 'meta' OR e.source = 'tiktok') AS paid_traffic_events
FROM
  `novalyte-ai-analytics.mens_clinics` AS mc
LEFT JOIN
  `novalyte-ai-analytics.events` AS e
ON
  e.mens_clinic_id = mc.mens_clinic_id
  AND e.event_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND (
    e.event_name IN ('mens_clinic.lead_submit', 'marketplace.order_complete')
    OR e.revenue_amount > 0
  )
GROUP BY
  mc.mens_clinic_id,
  mc.name,
  mc.city,
  mc.state,
  mc.specialization,
  mc.avg_ltv_usd
HAVING
  total_revenue_usd > 0
  OR total_leads > 0
ORDER BY
  total_revenue_usd DESC,
  total_leads DESC;

-- ============================================================================
-- QUERY 5: Assessment → Revenue Path (Conversion Funnel)
-- ============================================================================
-- Answers: How many assessments convert to leads and purchases?
-- Tracks assessment_id through downstream revenue events
-- ============================================================================

WITH assessment_completions AS (
  SELECT
    assessment_id,
    user_id,
    session_id,
    event_ts,
    source,
    medium,
    campaign,
    params.recommended_path AS recommended_path
  FROM
    `novalyte-ai-analytics.events`
  WHERE
    event_date BETWEEN '2024-01-01' AND '2024-01-31'
    AND event_name = 'patient.assessment_completed'
),
downstream_conversions AS (
  SELECT
    e.assessment_id,
    COUNTIF(e.event_name = 'mens_clinic.lead_submit') AS converted_to_lead,
    COUNTIF(e.event_name = 'marketplace.order_complete') AS converted_to_purchase,
    SUM(CASE WHEN e.event_name = 'mens_clinic.lead_submit' THEN e.revenue_amount ELSE 0 END) AS lead_revenue_usd,
    SUM(CASE WHEN e.event_name = 'marketplace.order_complete' THEN e.revenue_amount ELSE 0 END) AS purchase_revenue_usd,
    MAX(e.event_ts) AS last_conversion_ts
  FROM
    `novalyte-ai-analytics.events` AS e
  INNER JOIN
    assessment_completions AS ac
  ON
    e.assessment_id = ac.assessment_id
    AND e.event_ts >= ac.event_ts
    AND e.event_date BETWEEN '2024-01-01' AND '2024-01-31'
  WHERE
    e.event_name IN ('mens_clinic.lead_submit', 'marketplace.order_complete')
  GROUP BY
    e.assessment_id
)
SELECT
  ac.recommended_path,
  COUNT(DISTINCT ac.assessment_id) AS total_assessments,
  COUNT(DISTINCT dc.assessment_id) AS assessments_with_conversions,
  SUM(dc.converted_to_lead) AS total_leads,
  SUM(dc.converted_to_purchase) AS total_purchases,
  SAFE_DIVIDE(COUNT(DISTINCT dc.assessment_id), COUNT(DISTINCT ac.assessment_id)) AS conversion_rate,
  SAFE_DIVIDE(SUM(dc.converted_to_lead), COUNT(DISTINCT ac.assessment_id)) AS lead_rate,
  SAFE_DIVIDE(SUM(dc.converted_to_purchase), COUNT(DISTINCT ac.assessment_id)) AS purchase_rate,
  SUM(dc.lead_revenue_usd) AS total_lead_revenue_usd,
  SUM(dc.purchase_revenue_usd) AS total_purchase_revenue_usd,
  SUM(dc.lead_revenue_usd + dc.purchase_revenue_usd) AS total_revenue_usd,
  -- Attribution breakdown
  COUNT(DISTINCT CASE WHEN ac.source IN ('google_ads', 'meta', 'tiktok') THEN ac.assessment_id END) AS paid_traffic_assessments,
  COUNT(DISTINCT CASE WHEN ac.source IN ('google_ads', 'meta', 'tiktok') THEN dc.assessment_id END) AS paid_traffic_conversions
FROM
  assessment_completions AS ac
LEFT JOIN
  downstream_conversions AS dc
ON
  ac.assessment_id = dc.assessment_id
GROUP BY
  ac.recommended_path
ORDER BY
  total_revenue_usd DESC,
  conversion_rate DESC;

-- ============================================================================
-- BONUS QUERY 6: Ads ROI by Campaign (with Cost Data)
-- ============================================================================
-- Answers: Which campaigns have the best ROI?
-- Requires ads cost data (can be joined from ads_metrics table if available)
-- ============================================================================

-- Note: This query assumes you have an ads_metrics table with cost data
-- If not, revenue can still be calculated from events table

SELECT
  e.source,
  e.medium,
  e.campaign,
  COUNT(DISTINCT e.event_id) AS conversion_events,
  SUM(e.revenue_amount) AS total_revenue_usd,
  COUNT(DISTINCT e.user_id) AS converting_users,
  -- If you have ads_metrics table with cost data:
  -- SUM(am.spend) AS total_spend_usd,
  -- SAFE_DIVIDE(SUM(e.revenue_amount), SUM(am.spend)) AS roas,
  -- For now, revenue proxy:
  SUM(e.revenue_amount) AS revenue_proxy_usd
FROM
  `novalyte-ai-analytics.events` AS e
WHERE
  e.event_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND e.event_name IN ('marketplace.order_complete', 'mens_clinic.lead_submit')
  AND e.revenue_amount > 0
  AND e.source IN ('google_ads', 'meta', 'tiktok')
  AND e.campaign IS NOT NULL
GROUP BY
  e.source,
  e.medium,
  e.campaign
ORDER BY
  total_revenue_usd DESC;

-- ============================================================================
-- BONUS QUERY 7: Product Performance with Funnel Drop-off
-- ============================================================================
-- Answers: Which products have the best impression → click → purchase funnel?
-- Shows conversion rates at each stage
-- ============================================================================

SELECT
  mi.marketplace_item_id,
  mi.name AS product_name,
  mi.category,
  mi.subcategory,
  mi.price_usd,
  COUNTIF(e.event_name = 'marketplace.item_view') AS item_views,
  COUNTIF(e.event_name = 'marketplace.cart_add') AS cart_adds,
  COUNTIF(e.event_name = 'marketplace.checkout_start') AS checkout_starts,
  COUNTIF(e.event_name = 'marketplace.order_complete') AS orders,
  SAFE_DIVIDE(
    COUNTIF(e.event_name = 'marketplace.cart_add'),
    COUNTIF(e.event_name = 'marketplace.item_view')
  ) AS view_to_cart_rate,
  SAFE_DIVIDE(
    COUNTIF(e.event_name = 'marketplace.checkout_start'),
    COUNTIF(e.event_name = 'marketplace.cart_add')
  ) AS cart_to_checkout_rate,
  SAFE_DIVIDE(
    COUNTIF(e.event_name = 'marketplace.order_complete'),
    COUNTIF(e.event_name = 'marketplace.checkout_start')
  ) AS checkout_to_order_rate,
  SAFE_DIVIDE(
    COUNTIF(e.event_name = 'marketplace.order_complete'),
    COUNTIF(e.event_name = 'marketplace.item_view')
  ) AS overall_conversion_rate,
  SUM(CASE WHEN e.event_name = 'marketplace.order_complete' THEN e.revenue_amount ELSE 0 END) AS total_revenue_usd
FROM
  `novalyte-ai-analytics.marketplace_items` AS mi
LEFT JOIN
  `novalyte-ai-analytics.events` AS e
ON
  e.marketplace_item_id = mi.marketplace_item_id
  AND e.event_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND e.event_name IN ('marketplace.item_view', 'marketplace.cart_add', 'marketplace.checkout_start', 'marketplace.order_complete')
GROUP BY
  mi.marketplace_item_id,
  mi.name,
  mi.category,
  mi.subcategory,
  mi.price_usd
HAVING
  item_views > 10  -- Only show products with meaningful traffic
ORDER BY
  overall_conversion_rate DESC,
  total_revenue_usd DESC
LIMIT
  50;

