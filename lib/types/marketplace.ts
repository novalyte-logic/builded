/**
 * Marketplace Product Data Model
 * 
 * Represents a product in the Novalyte™ AI marketplace
 */

export type MarketplaceCategory =
  | 'Supplements'
  | 'Equipment'
  | 'Diagnostics'
  | 'Digital Health'
  | 'Home Gym'
  | 'Health Tech Devices'
  | 'Recovery Tools'
  | 'Peptides'
  | 'Other'

export type ProductAudience = 'Patient' | "Men's Clinic" | 'Both'

export type PriceBand = '$' | '$$' | '$$$' | '$$$$'

export type InventoryStatus = 'in_stock' | 'low' | 'out_of_stock' | 'preorder'

export type ProtocolType = 'Baseline' | 'Cycle' | 'Diagnostic' | 'Stack'

export interface ProductMetricsSnapshot {
  impressions: number
  product_detail_views: number
  ctr: number // Click-through rate
  add_to_stack_clicks: number
  view_protocol_clicks: number
  clicks_out_to_vendor: number
  bounce_rate: number
  search_queries: string[] // Top search queries that led to this product
  attach_rate: number // How often AI recommends this product
  conversion_events: number
  last_updated: string
}

export interface MarketplaceProduct {
  id: string
  name: string
  slug: string
  category: MarketplaceCategory
  subcategory: string | null
  for_who: ProductAudience
  use_case_tags: string[] // e.g., ["TRT", "GLP-1", "Longevity", "Recovery"]
  short_description: string
  long_description: string // Rich text / markdown
  price: number
  price_band: PriceBand
  recurring: boolean
  protocol_type: ProtocolType
  recommended_stack_ids: string[] // IDs of related products
  is_featured: boolean
  show_in_marketplace: boolean
  vendor_name: string
  vendor_contact_email: string | null
  inventory_status: InventoryStatus
  seo_title: string | null
  seo_meta_description: string | null
  metrics_snapshot_json: ProductMetricsSnapshot | null
  created_at: Date
  updated_at: Date
}

export interface CategoryMetrics {
  category: MarketplaceCategory
  product_count: number
  total_views: number
  ctr_to_detail: number
  add_to_cart_rate: number | null
  show_in_marketplace: boolean
  display_priority: number
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  productCount: number
  views: number
  ctr: number
  addToStack: number
  priority: number
  isVisible: boolean
  updatedAt: string
}

