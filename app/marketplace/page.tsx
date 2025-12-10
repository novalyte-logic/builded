'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { ClinicDirectoryRecord } from '@/lib/types/clinicDirectory'
import StatusBadge from '@/components/StatusBadge'
import CategoryOverview from '@/components/market-infrastructure/CategoryOverview'
import ProductPerformanceTable from '@/components/market-infrastructure/ProductPerformanceTable'
import AIMarketInsight from '@/components/market-infrastructure/AIMarketInsight'

interface CategoryData {
  name: string
  revenue30d: number
  orders30d: number
  avgOrderValue: number
  color: string
  priority: number // lower = higher priority (from schema)
  isVisible?: boolean
}

interface ProductPerformance {
  id: string
  name: string
  category: string
  clicks: number
  addToCartRate: number
  checkoutRate: number
  revenue30d: number
  refundRate: number
  attachedProtocolType: string[]
  vendor: string
  status: 'active' | 'backordered' | 'paused'
  isVisible?: boolean
  vendorStatus?: 'active' | 'inactive'
}

interface MarketInsight {
  insight: string
  type: 'opportunity' | 'warning' | 'performance'
}

type EmphasisWeight = 'high' | 'medium' | 'low' | undefined

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const stateParam = searchParams.get('state')
  const clinicIdParam = searchParams.get('clinicId')

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [clinic, setClinic] = useState<ClinicDirectoryRecord | null>(null)
  const [bannerText, setBannerText] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryData[]>([])
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN
  const [effects, setEffects] = useState<{
    productAdjustments: Record<string, { boost?: number; demote?: number; visibility?: boolean }>
    bundles: Record<string, { components: string[]; label: string }>
  }>({ productAdjustments: {}, bundles: {} })

  // Product performance data (mock - would come from BigQuery)
  const [products] = useState<ProductPerformance[]>([
    {
      id: '1',
      name: 'GLP-1 Digestive Support Complex',
      category: 'Supplements',
      clicks: 12450,
      addToCartRate: 0.34,
      checkoutRate: 0.28,
      revenue30d: 45200,
      refundRate: 0.04,
      attachedProtocolType: ['Metabolic', 'Weight Loss'],
      vendor: 'Vitality Labs',
      status: 'active',
      vendorStatus: 'active',
      isVisible: true,
    },
    {
      id: '2',
      name: 'Testosterone Optimization Stack',
      category: 'Supplements',
      clicks: 8920,
      addToCartRate: 0.41,
      checkoutRate: 0.35,
      revenue30d: 38900,
      refundRate: 0.06,
      attachedProtocolType: ['Hormone'],
      vendor: 'Men\'s Health Pro',
      status: 'active',
      isVisible: true,
    },
    {
      id: '3',
      name: 'Comprehensive Hormone Panel',
      category: 'Diagnostics',
      clicks: 3420,
      addToCartRate: 0.52,
      checkoutRate: 0.48,
      revenue30d: 28100,
      refundRate: 0.02,
      attachedProtocolType: ['Hormone', 'Diagnostic'],
      vendor: 'LabCorp Direct',
      status: 'active',
      isVisible: true,
    },
    {
      id: '4',
      name: 'Red Light Therapy Device',
      category: 'Health Tech Devices',
      clicks: 7820,
      addToCartRate: 0.18,
      checkoutRate: 0.12,
      revenue30d: 23400,
      refundRate: 0.15,
      attachedProtocolType: ['Recovery'],
      vendor: 'Recovery Tech Co',
      status: 'active',
      vendorStatus: 'inactive',
      isVisible: true,
    },
    {
      id: '5',
      name: 'Peptide Recovery Stack',
      category: 'Peptides',
      clicks: 2340,
      addToCartRate: 0.45,
      checkoutRate: 0.38,
      revenue30d: 18900,
      refundRate: 0.08,
      attachedProtocolType: ['Recovery'],
      vendor: 'Peptide Sciences',
      status: 'active',
      isVisible: true,
    },
    {
      id: '6',
      name: 'At-Home Testosterone Test Kit',
      category: 'Diagnostics',
      clicks: 5120,
      addToCartRate: 0.38,
      checkoutRate: 0.32,
      revenue30d: 16700,
      refundRate: 0.05,
      attachedProtocolType: ['Hormone', 'Diagnostic'],
      vendor: 'HomeTest Labs',
      status: 'active',
      isVisible: true,
    },
    {
      id: '7',
      name: 'Metabolic Support Bundle',
      category: 'Supplements',
      clicks: 6780,
      addToCartRate: 0.29,
      checkoutRate: 0.24,
      revenue30d: 15200,
      refundRate: 0.07,
      attachedProtocolType: ['Metabolic'],
      vendor: 'Wellness Plus',
      status: 'active',
      isVisible: true,
    },
    {
      id: '8',
      name: 'Cryotherapy Recovery Tool',
      category: 'Equipment',
      clicks: 1890,
      addToCartRate: 0.31,
      checkoutRate: 0.26,
      revenue30d: 12400,
      refundRate: 0.12,
      attachedProtocolType: ['Recovery'],
      vendor: 'Recovery Equipment Co',
      status: 'backordered',
      vendorStatus: 'inactive',
      isVisible: true,
    },
    {
      id: '9',
      name: 'Sleep Optimization Formula',
      category: 'Supplements',
      clicks: 4560,
      addToCartRate: 0.36,
      checkoutRate: 0.30,
      revenue30d: 11200,
      refundRate: 0.05,
      attachedProtocolType: ['Recovery', 'Longevity'],
      vendor: 'Vitality Labs',
      status: 'active',
      isVisible: true,
    },
    {
      id: '10',
      name: 'Smart Scale with Body Composition',
      category: 'Health Tech Devices',
      clicks: 3420,
      addToCartRate: 0.22,
      checkoutRate: 0.18,
      revenue30d: 9800,
      refundRate: 0.10,
      attachedProtocolType: ['Metabolic'],
      vendor: 'Health Tech Innovations',
      status: 'active',
    },
    {
      id: '11',
      name: 'Longevity Protocol Starter',
      category: 'Supplements',
      clicks: 2340,
      addToCartRate: 0.28,
      checkoutRate: 0.23,
      revenue30d: 8900,
      refundRate: 0.06,
      attachedProtocolType: ['Longevity'],
      vendor: 'Longevity Labs',
      status: 'active',
    },
    {
      id: '12',
      name: 'BPC-157 Recovery Peptide',
      category: 'Peptides',
      clicks: 1890,
      addToCartRate: 0.42,
      checkoutRate: 0.36,
      revenue30d: 7800,
      refundRate: 0.09,
      attachedProtocolType: ['Recovery'],
      vendor: 'Peptide Sciences',
      status: 'active',
    },
    {
      id: '13',
      name: 'Thyroid Function Panel',
      category: 'Diagnostics',
      clicks: 2890,
      addToCartRate: 0.44,
      checkoutRate: 0.39,
      revenue30d: 7100,
      refundRate: 0.03,
      attachedProtocolType: ['Hormone', 'Diagnostic'],
      vendor: 'LabCorp Direct',
      status: 'active',
    },
    {
      id: '14',
      name: 'Pre-Workout Energy Stack',
      category: 'Supplements',
      clicks: 3450,
      addToCartRate: 0.25,
      checkoutRate: 0.20,
      revenue30d: 6800,
      refundRate: 0.08,
      attachedProtocolType: ['Recovery'],
      vendor: 'Performance Supplements',
      status: 'paused',
      vendorStatus: 'inactive',
    },
    {
      id: '15',
      name: 'Continuous Glucose Monitor',
      category: 'Health Tech Devices',
      clicks: 4120,
      addToCartRate: 0.19,
      checkoutRate: 0.15,
      revenue30d: 6400,
      refundRate: 0.11,
      attachedProtocolType: ['Metabolic'],
      vendor: 'Health Tech Innovations',
      status: 'active',
      isVisible: true,
    },
  ])

  // AI Insights (mock - would come from Gemini)
  const [insights] = useState<MarketInsight[]>([
    {
      insight: 'GLP-1 Digestive Support is outperforming core GLP-1 content in upsell take-rate (+18% higher attachment).',
      type: 'performance',
    },
    {
      insight: 'Red Light devices show high clicks (7.8k) but low conversions (12%); consider education content and testimonials.',
      type: 'warning',
    },
    {
      insight: 'Peptides category has highest AOV ($380.90) and strong protocol attachment. Scale visibility.',
      type: 'opportunity',
    },
    {
      insight: 'Diagnostics have 48% checkout rate (highest) but low traffic volume. Boost discovery placement.',
      type: 'opportunity',
    },
  ])

  const categoryWeights = useMemo(() => {
    const weights: Record<string, number> = {}
    const weightFromEmphasis = (level?: EmphasisWeight) =>
      level === 'high' ? 30 : level === 'medium' ? 15 : level === 'low' ? 0 : 0

    categories.forEach((c) => {
      const base = 100 - (c.priority || 100)
      let bonus = 0
      if (clinic?.marketplaceEmphasis) {
        if (c.name === 'Supplements') bonus = weightFromEmphasis(clinic.marketplaceEmphasis.supplements)
        if (c.name === 'Diagnostics') bonus = weightFromEmphasis(clinic.marketplaceEmphasis.diagnostics)
        if (c.name === 'Peptides') bonus = weightFromEmphasis(clinic.marketplaceEmphasis.peptides)
        if (c.name === 'Equipment') bonus = weightFromEmphasis(clinic.marketplaceEmphasis.equipment)
        if (c.name === 'Health Tech Devices') bonus = weightFromEmphasis(clinic.marketplaceEmphasis.healthTech)
      }
      weights[c.name] = base + bonus
    })
    return weights
  }, [clinic, categories])

  const orderedCategories = useMemo(() => {
    return [...categories]
      .filter((c) => c.isVisible !== false)
      .sort((a, b) => categoryWeights[b.name] - categoryWeights[a.name])
  }, [categories, categoryWeights])

  const focusKeywords = useMemo(() => {
    const lines = clinic?.focusServiceLines || clinic?.serviceLines || []
    return lines.map((s) => s.toLowerCase())
  }, [clinic])

  const sortedProducts = useMemo(() => {
    const weightByCategory = (cat: string) => categoryWeights[cat] || 0
    const keywordScore = (name: string) => {
      const lower = name.toLowerCase()
      return focusKeywords.reduce((score, kw) => (lower.includes(kw) ? score + 1 : score), 0)
    }
    const visibleProducts = products.filter((p) => {
      const adjustment = effects.productAdjustments[p.id]
      if (adjustment?.visibility === false) return false
      return p.isVisible !== false && p.status !== 'paused' && p.vendorStatus !== 'inactive'
    })
    return [...visibleProducts].sort((a, b) => {
      const adjA = effects.productAdjustments[a.id] || {}
      const adjB = effects.productAdjustments[b.id] || {}
      const catDiff = (weightByCategory(b.category) + (adjB.boost || 0) - (adjB.demote || 0)) -
        (weightByCategory(a.category) + (adjA.boost || 0) - (adjA.demote || 0))
      if (catDiff !== 0) return catDiff
      const kwDiff = keywordScore(b.name) - keywordScore(a.name)
      if (kwDiff !== 0) return kwDiff
      return b.revenue30d - a.revenue30d
    })
  }, [products, categoryWeights, focusKeywords, effects.productAdjustments])

  useEffect(() => {
    const loadClinic = async () => {
      if (stateParam === 'TX' && clinicIdParam) {
        try {
          const res = await fetch(`/api/clinics-directory?clinicId=${clinicIdParam}`)
          const data = await res.json()
          const c = data.clinics?.[0] as ClinicDirectoryRecord | undefined
          if (c) {
            setClinic(c)
            setBannerText(`State-aware view: Optimized for ${c.name} in TX (marketplace routing applied)`)
          }
        } catch {
          // ignore
        }
      }
    }
    loadClinic()
  }, [stateParam, clinicIdParam])

  useEffect(() => {
    // TODO: Fetch real data from API based on timeRange
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/marketplace/categories', {
          headers: adminToken ? { 'x-novalyte-admin': adminToken } : undefined,
        })
        if (!res.ok) throw new Error('Failed to load categories')
        const data = await res.json()
        const mapped: CategoryData[] = (data.categories || []).map((c: any) => ({
          name: c.name,
          revenue30d: 0,
          orders30d: 0,
          avgOrderValue: 0,
          color: '#3b82f6',
          priority: c.priority,
          isVisible: c.isVisible,
        }))
        setCategories(mapped)
      } catch (err) {
        console.error(err)
        setCategories((prev) =>
          prev.length
            ? prev
            : [
                {
                  name: 'Supplements',
                  revenue30d: 0,
                  orders30d: 0,
                  avgOrderValue: 0,
                  color: '#3b82f6',
                  priority: 999,
                  isVisible: true,
                },
              ]
        )
      }
    }
    loadCategories()
  }, [adminToken])

  useEffect(() => {
    const loadEffects = async () => {
      try {
        const res = await fetch('/api/admin/marketplace/ai/effects', {
          headers: adminToken ? { 'x-novalyte-admin': adminToken } : undefined,
        })
        if (!res.ok) throw new Error('Failed to load effects')
        const data = await res.json()
        setEffects({
          productAdjustments: data.productAdjustments || {},
          bundles: data.bundles || {},
        })
      } catch (err) {
        console.error(err)
      }
    }
    loadEffects()
  }, [adminToken])

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Market Infrastructure — Men&apos;s Health Commerce Grid
            </h1>
            <p className="text-gray-400 mt-1">
              Which products, categories, and partners are actually driving revenue and LTV?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status="live" />
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {bannerText && (
        <div className="mb-4 px-4 py-3 bg-primary/10 border border-primary/30 rounded-lg text-sm text-primary">
          {bannerText}
        </div>
      )}

      {/* Three-Panel Layout */}
      {/* Top Row: Category Overview (Left) + AI Market Insight (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* PANEL 1: Category Overview (Top Left) */}
        <div>
          <CategoryOverview
            categories={orderedCategories}
            selectedCategory={selectedCategory}
            onCategoryClick={setSelectedCategory}
          />
        </div>

        {/* PANEL 3: AI Market Insight (Top Right) */}
        <div>
          <AIMarketInsight
            insights={insights}
            timeRange={timeRange}
            onBoostCategory={() => {
              // TODO: Implement boost category action
              console.log('Boost category')
            }}
            onCreateBlog={() => {
              // TODO: Implement create blog action
              console.log('Create blog')
            }}
            onOfferBundle={() => {
              // TODO: Implement offer bundle action
              console.log('Offer bundle')
            }}
          />
        </div>
      </div>

      {/* PANEL 2: Product Performance Table (Bottom Full Width) */}
      <div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Product Performance — Top 25</h3>
            <p className="text-xs text-gray-400">
              {selectedCategory
                ? `Showing products in ${selectedCategory} category`
                : 'Showing all products'}
            </p>
          </div>
          <div className="h-[600px]">
            <ProductPerformanceTable
              products={sortedProducts}
              selectedCategory={selectedCategory}
              timeRange={timeRange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
