/**
 * Marketplace AI Optimization Engine
 * 
 * Analyzes marketplace behavior and generates optimization suggestions
 * Uses heuristics now, designed to be replaced with Gemini AI later
 */

import {
  MarketplaceOptimizationSuggestion,
  ProductMetrics,
  CategoryMetrics,
  ProductStackSuggestion,
  OptimizationSuggestionType,
  TargetEntityType,
} from '@/lib/types/marketplace-optimization'
import { MarketplaceProduct } from '@/lib/types/marketplace'

// Mock data stores (replace with database queries)
const productMetrics: ProductMetrics[] = []
const categoryMetrics: CategoryMetrics[] = []
const suggestions: MarketplaceOptimizationSuggestion[] = []

/**
 * Compute Product Metrics
 * 
 * Aggregates marketplace events into product performance metrics
 */
export async function computeProductMetrics(
  productId: string,
  events: any[] // MarketplaceEvent[]
): Promise<ProductMetrics> {
  const productEvents = events.filter((e) => e.product_id === productId)

  const impressions = productEvents.filter((e) => e.event_type === 'product_impression').length
  const clicks = productEvents.filter((e) => e.event_type === 'product_click').length
  const detailViews = productEvents.filter((e) => e.event_type === 'product_detail_view').length
  const addToStack = productEvents.filter((e) => e.event_type === 'add_to_stack').length
  const assessmentStarts = productEvents.filter((e) => e.event_type === 'assessment_started_from_product').length
  const clinicMatches = productEvents.filter((e) => e.event_type === 'clinic_match_from_product').length

  const ctr = impressions > 0 ? clicks / impressions : 0
  const attachRateToAssessment = detailViews > 0 ? assessmentStarts / detailViews : 0
  const attachRateToClinicMatch = detailViews > 0 ? clinicMatches / detailViews : 0

  // Revenue proxy: composite score based on engagement quality
  const revenueProxyScore = Math.min(
    100,
    (ctr * 30) +
    (attachRateToAssessment * 40) +
    (attachRateToClinicMatch * 30)
  )

  // Bounce rate: % of detail views that don't lead to any action
  const actionsFromDetail = assessmentStarts + clinicMatches + addToStack
  const bounceRate = detailViews > 0 ? 1 - (actionsFromDetail / detailViews) : 0

  return {
    product_id: productId,
    product_name: '', // Will be populated from product lookup
    category: '',
    impressions,
    clicks,
    ctr,
    detail_views: detailViews,
    add_to_stack_count: addToStack,
    attach_rate_to_assessment: attachRateToAssessment,
    attach_rate_to_clinic_match: attachRateToClinicMatch,
    revenue_proxy_score: revenueProxyScore,
    bounce_rate_from_product: bounceRate,
    last_updated: new Date(),
  }
}

/**
 * Get Marketplace AI Suggestions
 * 
 * Main engine function that analyzes metrics and generates suggestions
 * Designed to be replaced with Gemini AI later
 */
export async function getMarketplaceAISuggestions(
  products: MarketplaceProduct[],
  productMetricsData: ProductMetrics[],
  categoryMetricsData: CategoryMetrics[]
): Promise<MarketplaceOptimizationSuggestion[]> {
  const newSuggestions: MarketplaceOptimizationSuggestion[] = []

  // Sort products by performance score
  const sortedProducts = productMetricsData
    .map((metrics) => ({
      metrics,
      product: products.find((p) => p.id === metrics.product_id),
      performanceScore: metrics.ctr * metrics.attach_rate_to_assessment * metrics.attach_rate_to_clinic_match,
    }))
    .filter((item) => item.product)
    .sort((a, b) => b.performanceScore - a.performanceScore)

  // Suggestion 1: Feature top performers
  const topPerformers = sortedProducts.slice(0, 3).filter(
    (item) => item.metrics.impressions >= 100 && !item.product?.is_featured
  )

  topPerformers.forEach((item, idx) => {
    newSuggestions.push({
      id: crypto.randomUUID(),
      type: 'FEATURE_PRODUCT',
      target_entity_type: 'PRODUCT',
      target_id: item.metrics.product_id,
      rationale_text: `${item.product?.name} shows strong performance: ${(item.metrics.ctr * 100).toFixed(1)}% CTR, ${(item.metrics.attach_rate_to_assessment * 100).toFixed(1)}% attach-to-assessment rate. Featuring this product could increase conversions.`,
      impact_estimate_score: Math.min(100, 70 + (idx * 5)), // 70-80% impact
      created_at: new Date(),
      status: 'PENDING',
      applied_by: null,
      applied_at: null,
    })
  })

  // Suggestion 2: Downrank underperformers
  const underperformers = sortedProducts
    .slice(-5)
    .filter(
      (item) =>
        item.metrics.impressions >= 50 &&
        item.metrics.ctr < 0.05 &&
        item.metrics.attach_rate_to_assessment < 0.1
    )

  underperformers.forEach((item) => {
    newSuggestions.push({
      id: crypto.randomUUID(),
      type: 'DOWNRANK_PRODUCT',
      target_entity_type: 'PRODUCT',
      target_id: item.metrics.product_id,
      rationale_text: `${item.product?.name} shows low engagement: ${(item.metrics.ctr * 100).toFixed(1)}% CTR, ${(item.metrics.attach_rate_to_assessment * 100).toFixed(1)}% attach rate. Consider moving to lower position or improving product presentation.`,
      impact_estimate_score: 40, // Moderate impact
      created_at: new Date(),
      status: 'PENDING',
      applied_by: null,
      applied_at: null,
    })
  })

  // Suggestion 3: Reorder products within categories
  const categories = new Set(productMetricsData.map((m) => m.category))
  categories.forEach((category) => {
    const categoryProducts = sortedProducts.filter((item) => item.metrics.category === category)

    if (categoryProducts.length > 3) {
      const topProduct = categoryProducts[0]
      if (topProduct && topProduct.metrics.impressions >= 100) {
        newSuggestions.push({
          id: crypto.randomUUID(),
          type: 'REORDER',
          target_entity_type: 'PRODUCT',
          target_id: topProduct.metrics.product_id,
          rationale_text: `Move ${topProduct.product?.name} to top of ${category} category. It has the highest performance score (${(topProduct.performanceScore * 100).toFixed(1)}) with ${(topProduct.metrics.ctr * 100).toFixed(1)}% CTR.`,
          impact_estimate_score: 60,
          created_at: new Date(),
          status: 'PENDING',
          applied_by: null,
          applied_at: null,
          metadata: {
            category,
            suggested_position: 1,
          },
        })
      }
    }
  })

  // Suggestion 4: Category priority changes
  const sortedCategories = categoryMetricsData
    .map((cat) => ({
      metrics: cat,
      score: cat.category_ctr * (cat.time_on_category / 60), // CTR weighted by engagement time
    }))
    .sort((a, b) => b.score - a.score)

  if (sortedCategories.length > 0) {
    const topCategory = sortedCategories[0]
    newSuggestions.push({
      id: crypto.randomUUID(),
      type: 'CATEGORY_PRIORITY_CHANGE',
      target_entity_type: 'CATEGORY',
      target_id: topCategory.metrics.category,
      rationale_text: `${topCategory.metrics.category} category shows strong engagement: ${(topCategory.metrics.category_ctr * 100).toFixed(1)}% CTR, ${Math.round(topCategory.metrics.time_on_category)}s average time. Consider promoting this category with more above-the-fold real estate.`,
      impact_estimate_score: 65,
      created_at: new Date(),
      status: 'PENDING',
      applied_by: null,
      applied_at: null,
    })
  }

  // TODO: Stack suggestions (when we have co-occurrence data)
  // This would analyze products frequently added together and suggest bundles

  return newSuggestions
}

/**
 * Apply Optimization Suggestion
 * 
 * Executes the suggestion by updating the target entity
 */
export async function applyOptimizationSuggestion(
  suggestionId: string,
  appliedBy: string
): Promise<void> {
  const suggestion = suggestions.find((s) => s.id === suggestionId)
  if (!suggestion || suggestion.status !== 'PENDING') {
    throw new Error('Suggestion not found or already processed')
  }

  // Apply the suggestion based on type
  if (suggestion.type === 'FEATURE_PRODUCT' && suggestion.target_entity_type === 'PRODUCT') {
    // Update product is_featured flag
    // TODO: Call product update API
    // await fetch(`/api/admin/marketplace/${suggestion.target_id}`, { method: 'PATCH', body: { is_featured: true } })
  } else if (suggestion.type === 'DOWNRANK_PRODUCT' && suggestion.target_entity_type === 'PRODUCT') {
    // Mark product for lower position (could use a priority field)
    // TODO: Implement downranking logic
  } else if (suggestion.type === 'REORDER' && suggestion.target_entity_type === 'PRODUCT') {
    // Update product position within category
    // TODO: Implement reordering logic (could use a position field in product)
  } else if (suggestion.type === 'CATEGORY_PRIORITY_CHANGE' && suggestion.target_entity_type === 'CATEGORY') {
    // Update category display priority
    // TODO: Update category priority in global settings
  }

  // Update suggestion status
  suggestion.status = 'APPLIED'
  suggestion.applied_by = appliedBy
  suggestion.applied_at = new Date()

  // TODO: Create audit log entry
  // await createAuditLog('MarketplaceOptimization', suggestionId, 'apply', ...)
}

/**
 * Dismiss Optimization Suggestion
 */
export async function dismissOptimizationSuggestion(suggestionId: string): Promise<void> {
  const suggestion = suggestions.find((s) => s.id === suggestionId)
  if (!suggestion || suggestion.status !== 'PENDING') {
    throw new Error('Suggestion not found or already processed')
  }

  suggestion.status = 'DISMISSED'
}

/**
 * Get All Pending Suggestions
 */
export async function getPendingSuggestions(): Promise<MarketplaceOptimizationSuggestion[]> {
  return suggestions.filter((s) => s.status === 'PENDING')
}

/**
 * Get Product Performance Data
 * 
 * Returns products with their metrics for the Live Performance Overview
 */
export async function getProductPerformanceData(
  filters?: {
    category?: string
    performance?: 'top' | 'middle' | 'low'
    for_who?: string
  }
): Promise<Array<ProductMetrics & { product: MarketplaceProduct | null }>> {
  // TODO: Replace with actual database query
  // Join ProductMetrics with MarketplaceProduct

  const data = productMetrics.map((metrics) => ({
    ...metrics,
    product: null as MarketplaceProduct | null, // Would be populated from DB
  }))

  // Apply filters
  let filtered = data
  if (filters?.category) {
    filtered = filtered.filter((d) => d.category === filters.category)
  }

  // Performance filter based on revenue_proxy_score
  if (filters?.performance) {
    const sorted = [...filtered].sort((a, b) => b.revenue_proxy_score - a.revenue_proxy_score)
    const topThird = Math.ceil(sorted.length / 3)
    if (filters.performance === 'top') {
      filtered = sorted.slice(0, topThird)
    } else if (filters.performance === 'middle') {
      filtered = sorted.slice(topThird, topThird * 2)
    } else {
      filtered = sorted.slice(topThird * 2)
    }
  }

  return filtered
}

/**
 * Helper: Get Revenue Potential Badge
 */
export function getRevenuePotentialBadge(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

/**
 * Mock helper to populate suggestions (for demo)
 */
export function seedMockSuggestions(): void {
  // This would be called by a scheduled job or admin action
  // For now, just a placeholder
}

