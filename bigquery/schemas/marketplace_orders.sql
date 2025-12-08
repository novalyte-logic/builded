-- Marketplace Orders Table
-- Line-item level order data from Novalyte marketplace
-- Enables product/category analysis and margin intelligence

CREATE TABLE IF NOT EXISTS `novalyte-analytics-project.novalyte_core.marketplace_orders` (
  order_id STRING NOT NULL OPTIONS(description="Unique order identifier"),
  user_id STRING OPTIONS(description="Customer user ID"),
  order_date DATE NOT NULL OPTIONS(description="Order date (partition key)"),
  category STRING NOT NULL OPTIONS(description="Product category: supplements, equipment, diagnostics, devices, home_gym, health_tech"),
  product_id STRING NOT NULL OPTIONS(description="Product SKU/identifier"),
  product_name STRING OPTIONS(description="Human-readable product name"),
  qty INT64 NOT NULL OPTIONS(description="Quantity ordered"),
  line_revenue NUMERIC(10, 2) NOT NULL OPTIONS(description="Line item revenue (qty * unit_price)"),
  cost_basis NUMERIC(10, 2) OPTIONS(description="Cost basis for this line item (for margin calculation)"),
  margin NUMERIC(10, 2) OPTIONS(description="Calculated margin (line_revenue - cost_basis), nullable if cost_basis not available"),
  clinic_partner_id STRING OPTIONS(description="Associated clinic partner ID if order originated from clinic referral, NULL otherwise"),
  source_channel STRING OPTIONS(description="Order source: marketplace_direct, clinic_referral, assessment_upsell, email, etc.")
)
PARTITION BY order_date
CLUSTER BY category, product_id, clinic_partner_id
OPTIONS(
  description="Marketplace order line items. Partitioned by order date. Enables category/category analysis and margin tracking.",
  labels=[("table_type", "orders"), ("source", "marketplace")]
);

-- Use cases:
-- - Top products/categories by revenue
-- - Margin analysis
-- - Clinic partner revenue share
-- - Category growth trends

