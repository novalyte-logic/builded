/**
 * Marketplace Optimization Engine Data Models
 * 
 * Tracks marketplace behavior and AI-generated optimization suggestions
 */

export type OptimizationSuggestionType =
  | 'REORDER'
  | 'FEATURE_PRODUCT'
  | 'DOWNRANK_PRODUCT'
  | 'CREATE_STACK'
  | 'CATEGORY_PRIORITY_CHANGE'

export type TargetEntityType = 'PRODUCT' | 'CATEGORY' | 'STACK'

export type SuggestionStatus = 'PENDING' | 'APPLIED' | 'DISMISSED'

export interface MarketplaceOptimizationSuggestion {
  id: string
  type: OptimizationSuggestionType
  target_entity_type: TargetEntityType
  target_id: string // Product ID, Category name, or Stack ID
  rationale_text: string // Plain English explanation
  impact_estimate_score: number // 0-100
  created_at: Date
  status: SuggestionStatus
  applied_by: string | null // Superadmin ID who applied it
  applied_at: Date | null
  metadata?: Record<string, any> // Additional context (e.g., new position, stack products, etc.)
}

export interface ProductMetrics {
  product_id: string
  product_name: string
  category: string
  impressions: number
  clicks: number
  ctr: number // Click-through rate
  detail_views: number
  add_to_stack_count: number
  attach_rate_to_assessment: number // % of views that led to assessment start
  attach_rate_to_clinic_match: number // % of views that led to clinic match
  revenue_proxy_score: number // 0-100, derived from engagement metrics
  bounce_rate_from_product: number
  last_updated: Date
}

export interface CategoryMetrics {
  category: string
  category_views: number
  category_clicks: number
  category_ctr: number
  depth_of_scroll: number // Average scroll depth percentage
  time_on_category: number // Average time in seconds
  product_count: number
  last_updated: Date
}

export interface MarketplaceEvent {
  id: string
  event_type:
    | 'marketplace_page_view'
    | 'product_impression'
    | 'product_click'
    | 'product_detail_view'
    | 'add_to_stack'
    | 'outbound_vendor_click'
    | 'assessment_started_from_product'
    | 'assessment_completed_from_product'
    | 'clinic_match_from_product'
    | 'purchase_or_intent_event'
  user_id: string | null
  product_id: string | null
  category: string | null
  location: string | null // City/State
  referrer: string | null
  position: number | null // Position in list/carousel
  stack_id: string | null
  vendor: string | null
  clinic_id: string | null
  metadata: Record<string, any> | null
  created_at: Date
}

export interface ProductStackSuggestion {
  product_ids: string[]
  stack_name: string
  confidence: number // 0-1
  rationale: string
  frequency: number // How often these products are viewed/added together
}

