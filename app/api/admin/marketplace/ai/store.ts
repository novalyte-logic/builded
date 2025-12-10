import { CategoryRecord, updateCategoryPriority, updateCategoryVisibility } from '../../marketplace/store'

type AudienceSplit = {
  segment: 'Patient' | "Men's Clinic" | 'Both'
  views: number
  ctr: number
  atc: number
}

export type AISuggestionType =
  | 'attach_to_assessment'
  | 'attach_to_clinic'
  | 'boost_visibility'
  | 'demote'
  | 'create_bundle'

export type AISuggestion = {
  id: string
  productId: string
  productName: string
  category: string
  suggestionType: AISuggestionType
  reasoning: string
  expectedRevenueImpact: number
  attachTargets?: string[]
  bundleComponents?: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export type PerformancePayload = {
  products: Array<{
    productId: string
    productName: string
    category: string
    impressions: number
    clicks: number
    ctr: number
    addToCart: number
    checkout: number
    refundRate: number
  }>
  categories: Array<{
    category: string
    views: number
    ctr: number
    addToStack: number
    priority: number
    isVisible: boolean
  }>
  audience: AudienceSplit[]
  trends: {
    window: '7d' | '30d'
    ctrDelta: number
    atcDelta: number
    revenueDelta: number
  }[]
  lastScan: string
}

type Attachments = {
  assessment: Record<string, string[]>
  clinic: Record<string, string[]>
}

type Effects = {
  productAdjustments: Record<
    string,
    {
      boost?: number
      demote?: number
      visibility?: boolean
    }
  >
  bundles: Record<
    string,
    {
      components: string[]
      label: string
    }
  >
  attachments: Attachments
  lastScan: string
}

let lastScan = new Date().toISOString()

const performance: PerformancePayload = {
  products: [
    {
      productId: 'prod_glp1_digestive',
      productName: 'GLP-1 Digestive Support Complex',
      category: 'Supplements',
      impressions: 12450,
      clicks: 4215,
      ctr: 0.339,
      addToCart: 0.28,
      checkout: 0.24,
      refundRate: 0.04,
    },
    {
      productId: 'prod_test_opt_stack',
      productName: 'Testosterone Optimization Stack',
      category: 'Supplements',
      impressions: 8920,
      clicks: 3650,
      ctr: 0.409,
      addToCart: 0.33,
      checkout: 0.29,
      refundRate: 0.06,
    },
    {
      productId: 'prod_hormone_panel',
      productName: 'Comprehensive Hormone Panel',
      category: 'Diagnostics',
      impressions: 5120,
      clicks: 1875,
      ctr: 0.366,
      addToCart: 0.41,
      checkout: 0.37,
      refundRate: 0.02,
    },
    {
      productId: 'prod_peptide_recovery',
      productName: 'Peptide Recovery Stack',
      category: 'Peptides',
      impressions: 2890,
      clicks: 1098,
      ctr: 0.38,
      addToCart: 0.44,
      checkout: 0.36,
      refundRate: 0.08,
    },
  ],
  categories: [
    { category: 'Supplements', views: 21500, ctr: 0.31, addToStack: 0.19, priority: 1, isVisible: true },
    { category: 'Diagnostics', views: 9800, ctr: 0.29, addToStack: 0.22, priority: 3, isVisible: true },
    { category: 'Peptides', views: 7200, ctr: 0.33, addToStack: 0.27, priority: 2, isVisible: true },
    { category: 'Equipment', views: 6400, ctr: 0.18, addToStack: 0.12, priority: 5, isVisible: true },
  ],
  audience: [
    { segment: 'Patient', views: 32000, ctr: 0.28, atc: 0.21 },
    { segment: "Men's Clinic", views: 8700, ctr: 0.31, atc: 0.24 },
    { segment: 'Both', views: 5400, ctr: 0.26, atc: 0.19 },
  ],
  trends: [
    { window: '7d', ctrDelta: 0.012, atcDelta: 0.009, revenueDelta: 0.034 },
    { window: '30d', ctrDelta: 0.021, atcDelta: 0.017, revenueDelta: 0.071 },
  ],
  lastScan,
}

let suggestions: AISuggestion[] = [
  {
    id: 'sug_1',
    productId: 'prod_glp1_digestive',
    productName: 'GLP-1 Digestive Support Complex',
    category: 'Supplements',
    suggestionType: 'attach_to_assessment',
    reasoning: 'High CTR and ATC from assessment entry. Attach to metabolic + GLP-1 assessments to lift completion.',
    expectedRevenueImpact: 18500,
    attachTargets: ['metabolic_glp1', 'weight_loss_fasttrack'],
    status: 'PENDING',
    createdAt: lastScan,
  },
  {
    id: 'sug_2',
    productId: 'prod_hormone_panel',
    productName: 'Comprehensive Hormone Panel',
    category: 'Diagnostics',
    suggestionType: 'boost_visibility',
    reasoning: 'Top checkout conversion; currently priority 3. Boost to priority 1 to surface earlier.',
    expectedRevenueImpact: 22600,
    status: 'PENDING',
    createdAt: lastScan,
  },
  {
    id: 'sug_3',
    productId: 'prod_peptide_recovery',
    productName: 'Peptide Recovery Stack',
    category: 'Peptides',
    suggestionType: 'create_bundle',
    reasoning: 'Strong ATC with recovery protocols. Bundle with red light device for higher AOV.',
    expectedRevenueImpact: 14500,
    bundleComponents: ['prod_peptide_recovery', 'prod_red_light'],
    status: 'PENDING',
    createdAt: lastScan,
  },
]

const attachments: Attachments = {
  assessment: {},
  clinic: {},
}

const productAdjustments: Effects['productAdjustments'] = {}
const bundles: Effects['bundles'] = {}

const auditLog: Array<{
  id: string
  action: 'APPROVE' | 'REJECT'
  userId: string
  suggestionId: string
  oldValue?: unknown
  newValue?: unknown
  timestamp: string
}> = []

export function getPerformance(filters?: { category?: string; audience?: string }): PerformancePayload {
  const cloned: PerformancePayload = JSON.parse(JSON.stringify({ ...performance, lastScan }))
  if (filters?.category) {
    cloned.products = cloned.products.filter((p) => p.category === filters.category)
  }
  if (filters?.audience) {
    cloned.audience = cloned.audience.filter((a) => a.segment === filters.audience)
  }
  return cloned
}

export function listSuggestions() {
  return suggestions.filter((s) => s.status === 'PENDING')
}

export function getEffects(): Effects {
  return {
    productAdjustments,
    bundles,
    attachments,
    lastScan,
  }
}

export function rejectSuggestion(id: string, userId: string) {
  const idx = suggestions.findIndex((s) => s.id === id)
  if (idx === -1) return null
  suggestions[idx].status = 'REJECTED'
  auditLog.unshift({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action: 'REJECT',
    userId,
    suggestionId: id,
    timestamp: new Date().toISOString(),
  })
  return suggestions[idx]
}

export function approveSuggestion(id: string, userId: string): AISuggestion | null {
  const sug = suggestions.find((s) => s.id === id && s.status === 'PENDING')
  if (!sug) return null
  applyEffect(sug)
  sug.status = 'APPROVED'
  auditLog.unshift({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action: 'APPROVE',
    userId,
    suggestionId: id,
    timestamp: new Date().toISOString(),
  })
  return sug
}

function applyEffect(s: AISuggestion) {
  lastScan = new Date().toISOString()
  switch (s.suggestionType) {
    case 'attach_to_assessment': {
      const key = s.attachTargets?.[0] || 'default'
      attachments.assessment[key] = Array.from(new Set([...(attachments.assessment[key] || []), s.productId]))
      break
    }
    case 'attach_to_clinic': {
      const key = s.attachTargets?.[0] || 'default'
      attachments.clinic[key] = Array.from(new Set([...(attachments.clinic[key] || []), s.productId]))
      break
    }
    case 'boost_visibility': {
      updateCategoryPriorityByName(s.category, -1)
      productAdjustments[s.productId] = { ...(productAdjustments[s.productId] || {}), boost: 20, visibility: true }
      break
    }
    case 'demote': {
      updateCategoryPriorityByName(s.category, +3)
      productAdjustments[s.productId] = { ...(productAdjustments[s.productId] || {}), demote: 20 }
      break
    }
    case 'create_bundle': {
      const id = `bundle_${Date.now()}`
      bundles[id] = {
        components: s.bundleComponents || [s.productId],
        label: `${s.productName} Bundle`,
      }
      break
    }
    default:
      break
  }
}

function updateCategoryPriorityByName(name: string, delta: number) {
  const category = categories().find((c) => c.name === name)
  if (!category) return
  const newPriority = Math.max(1, category.priority + delta)
  updateCategoryPriority(category.id, newPriority, 'ai-engine')
  if (!category.isVisible) {
    updateCategoryVisibility(category.id, true, 'ai-engine')
  }
}

function categories(): CategoryRecord[] {
  // defer import to avoid circular issue
  const store = require('../../marketplace/store') as typeof import('../../marketplace/store')
  return store.getCategories()
}

export function regenerateSuggestionsFromMCP(perf: PerformancePayload) {
  // Simulate MCP inference; in real deployment call marketplace_ai_engine_v1
  lastScan = new Date().toISOString()
  suggestions = [
    ...suggestions.filter((s) => s.status !== 'PENDING'),
    {
      id: `sug_${Date.now()}`,
      productId: perf.products[0]?.productId || 'prod_fallback',
      productName: perf.products[0]?.productName || 'Top Product',
      category: perf.products[0]?.category || 'Supplements',
      suggestionType: 'boost_visibility',
      reasoning: 'AI engine detected strong CTR uplift potential; boost visibility to capture higher ATC.',
      expectedRevenueImpact: Math.round((perf.products[0]?.impressions || 5000) * 0.8),
      status: 'PENDING',
      createdAt: lastScan,
    },
  ]
  return suggestions.filter((s) => s.status === 'PENDING')
}

export function getAuditLog() {
  return auditLog
}

