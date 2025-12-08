# Marketplace AI Optimization Engine

## Overview

The Marketplace AI Optimization Engine analyzes marketplace behavior and generates actionable suggestions to optimize product positioning, featuring, and bundling for maximum revenue impact.

---

## Architecture

```
┌─────────────────────────────────┐
│  Marketplace Events (Tracking)  │
│  - Views, Clicks, Adds          │
│  - Assessment Starts            │
│  - Clinic Matches               │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  MarketplaceOptimizationEngine  │
│  - Computes Product Metrics     │
│  - Generates AI Suggestions     │
│  - Stores in Suggestions Table  │
└──────────────┬──────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│  Admin UI   │  │  Public API │
│  - Review   │  │  - Uses AI  │
│  - Apply    │  │  - Ordering │
│  - Dismiss  │  │  - Featured │
└─────────────┘  └─────────────┘
```

---

## 1. Data Models

### MarketplaceEvent

Tracks all user interactions with the marketplace:
- `marketplace_page_view`
- `product_impression`
- `product_click`
- `product_detail_view`
- `add_to_stack`
- `assessment_started_from_product`
- `clinic_match_from_product`
- etc.

### ProductMetrics

Derived metrics computed from events:
- `impressions`, `clicks`, `ctr`
- `attach_rate_to_assessment`
- `attach_rate_to_clinic_match`
- `revenue_proxy_score` (0-100)
- `bounce_rate_from_product`

### MarketplaceOptimizationSuggestion

AI-generated suggestions:
- **Type**: `REORDER`, `FEATURE_PRODUCT`, `DOWNRANK_PRODUCT`, `CREATE_STACK`, `CATEGORY_PRIORITY_CHANGE`
- **Target**: Product ID, Category, or Stack
- **Rationale**: Plain English explanation
- **Impact Estimate**: 0-100 score
- **Status**: `PENDING`, `APPLIED`, `DISMISSED`

---

## 2. Admin UI

### Location: `/marketplace-optimization`

#### A) Live Performance Overview

**Displays:**
- Product performance table with:
  - CTR, Attach-to-Assessment %, Attach-to-Clinic %
  - Impressions, Revenue Potential badge
- Filters: Category, Performance Tier, Audience
- Search by product name

**Use Cases:**
- Identify top performers
- Find underperformers needing optimization
- Compare products within categories

#### B) AI Suggestions Panel

**Displays:**
- All pending suggestions with:
  - Type badge (Feature, Downrank, Reorder, etc.)
  - Target entity name
  - Rationale text
  - Impact estimate (0-100 bar)
- Actions: Apply, Dismiss, Edit Then Apply

**Workflow:**
1. Engine generates suggestions (periodically or on-demand)
2. Suggestions appear in panel
3. Superadmin reviews and applies/dismisses
4. Applied changes update marketplace ordering

---

## 3. Public Marketplace Integration

### API Endpoint

**GET `/api/marketplace/products`**

**Query Params:**
- `category` - Filter by category
- `limit` - Number of products to return
- `use_ai_ordering` - Enable/disable AI optimization (default: true)

**Returns:**
- Products ordered by AI optimization:
  1. Featured products first
  2. Products with REORDER suggestions (by position)
  3. Products by performance score
  4. Default ordering (created_at)

### Frontend Usage

For public marketplace pages (app.novalyte.io):

```typescript
// Fetch AI-optimized products
const response = await fetch('/api/marketplace/products?category=Supplements&use_ai_ordering=true')
const { products } = await response.json()

// Products are already sorted by AI optimization
// Featured products appear first, then by performance
```

### Recommended Product Stacks

On product detail pages, show:
```typescript
const recommendedProducts = await getRecommendedStackProducts(productId, allProducts)
// Display as "Often paired with: X, Y, Z"
```

---

## 4. AI Engine Logic

### Current Implementation (Heuristics)

The engine currently uses simple heuristics:
- **Top Performers**: High CTR + High attach-to-assessment rate
- **Underperformers**: High impressions but low clicks OR low attach rates
- **Reordering**: Rank by performance score within categories
- **Category Priority**: Rank by CTR * engagement time

### Future: Gemini AI Integration

Structure ready for Vertex AI (Gemini):
- `getMarketplaceAISuggestions()` function can be replaced with Gemini call
- Input: Summarized metrics + event counts
- Output: Structured suggestions with rationale

---

## 5. Safety & Telemetry

- **No Auto-Apply**: All suggestions require Superadmin approval
- **Audit Logging**: All applied changes logged with before/after state
- **Rollback**: Can revert applied suggestions (via version history)
- **Status Tracking**: Suggestions marked as APPLIED or DISMISSED

---

## 6. Metrics Tracked

### For Products:
- Profile views, clicks, CTR
- Detail views, add-to-stack counts
- Assessment starts/completions attributed
- Clinic matches attributed
- Revenue proxy score (composite)
- Bounce rate

### For Categories:
- Category views, clicks, CTR
- Scroll depth, time on category
- Product count

---

## 7. Next Steps

1. **Event Tracking**: Wire up actual event tracking from marketplace frontend
2. **Gemini Integration**: Replace heuristics with AI-generated suggestions
3. **Stack Detection**: Implement co-occurrence analysis for bundle suggestions
4. **Regional Optimization**: Add location-based recommendations
5. **A/B Testing**: Support testing multiple ordering strategies

---

## Result

The Marketplace becomes a **self-optimizing revenue engine** that:
- Learns from user behavior
- Surfaces actionable insights
- Maximizes conversions through intelligent positioning
- Gives Superadmin full control over all optimizations

