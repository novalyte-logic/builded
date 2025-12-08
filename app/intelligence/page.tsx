'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Building2, ShoppingBag, Search, MapPin } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import MetricCard from '@/components/MetricCard'
import Explainer from '@/components/Explainer'

interface TopClinic {
  id: string
  name: string
  city: string
  matches: number
  show_rate: number
  avg_ltv_band: 'low' | 'medium' | 'high'
  revenue_quality_score: number
}

interface TopProduct {
  id: string
  name: string
  category: string
  clicks: number
  attach_rate: number
  conversion_rate: number
}

interface TopSearchQuery {
  query: string
  volume: number
  conversion_rate: number
  leading_to_assessment: number
}

interface CityDemand {
  city: string
  state: string
  trt_demand: number
  glp1_demand: number
  recovery_demand: number
  longevity_demand: number
}

export default function IntelligencePage() {
  const [topClinics, setTopClinics] = useState<TopClinic[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topQueries, setTopQueries] = useState<TopSearchQuery[]>([])
  const [cityDemand, setCityDemand] = useState<CityDemand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntelligence()
    const interval = setInterval(fetchIntelligence, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchIntelligence = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      // const [clinicsRes, productsRes, queriesRes, citiesRes] = await Promise.all([
      //   fetch('/api/admin/intelligence/top-clinics'),
      //   fetch('/api/admin/intelligence/top-products'),
      //   fetch('/api/admin/intelligence/top-queries'),
      //   fetch('/api/admin/intelligence/city-demand'),
      // ])

      // Mock data
      setTopClinics([
        {
          id: '1',
          name: 'Los Angeles Men\'s Health',
          city: 'Los Angeles',
          matches: 1247,
          show_rate: 0.87,
          avg_ltv_band: 'high',
          revenue_quality_score: 9.2,
        },
        {
          id: '2',
          name: 'New York Premier Clinic',
          city: 'New York',
          matches: 2156,
          show_rate: 0.82,
          avg_ltv_band: 'high',
          revenue_quality_score: 8.9,
        },
        {
          id: '3',
          name: 'Austin Wellness Center',
          city: 'Austin',
          matches: 892,
          show_rate: 0.91,
          avg_ltv_band: 'medium',
          revenue_quality_score: 8.5,
        },
        {
          id: '4',
          name: 'Miami Peak Performance',
          city: 'Miami',
          matches: 634,
          show_rate: 0.79,
          avg_ltv_band: 'high',
          revenue_quality_score: 8.3,
        },
        {
          id: '5',
          name: 'Seattle Men\'s Health',
          city: 'Seattle',
          matches: 523,
          show_rate: 0.88,
          avg_ltv_band: 'medium',
          revenue_quality_score: 7.9,
        },
      ])

      setTopProducts([
        {
          id: '1',
          name: 'Testosterone Support Stack',
          category: 'Supplements',
          clicks: 4520,
          attach_rate: 0.34,
          conversion_rate: 0.18,
        },
        {
          id: '2',
          name: 'GLP-1 Nausea Relief',
          category: 'Supplements',
          clicks: 3890,
          attach_rate: 0.28,
          conversion_rate: 0.15,
        },
        {
          id: '3',
          name: 'At-Home Hormone Test Kit',
          category: 'Diagnostics',
          clicks: 3120,
          attach_rate: 0.42,
          conversion_rate: 0.22,
        },
        {
          id: '4',
          name: 'Recovery Protocol Bundle',
          category: 'Supplements',
          clicks: 2780,
          attach_rate: 0.31,
          conversion_rate: 0.16,
        },
        {
          id: '5',
          name: 'Longevity Peptide Stack',
          category: 'Supplements',
          clicks: 2450,
          attach_rate: 0.26,
          conversion_rate: 0.14,
        },
      ])

      setTopQueries([
        { query: 'low testosterone symptoms', volume: 12450, conversion_rate: 0.32, leading_to_assessment: 3984 },
        { query: 'GLP-1 weight loss', volume: 9870, conversion_rate: 0.28, leading_to_assessment: 2764 },
        { query: 'TRT clinic near me', volume: 8450, conversion_rate: 0.45, leading_to_assessment: 3803 },
        { query: 'peptide therapy benefits', volume: 7230, conversion_rate: 0.22, leading_to_assessment: 1591 },
        { query: 'men\'s health optimization', volume: 6890, conversion_rate: 0.35, leading_to_assessment: 2412 },
        { query: 'hormone replacement therapy', volume: 6120, conversion_rate: 0.38, leading_to_assessment: 2326 },
        { query: 'recovery protocols', volume: 5890, conversion_rate: 0.25, leading_to_assessment: 1473 },
        { query: 'brain fog treatment', volume: 5420, conversion_rate: 0.29, leading_to_assessment: 1572 },
        { query: 'longevity protocols', volume: 4980, conversion_rate: 0.27, leading_to_assessment: 1345 },
        { query: 'ED treatment options', volume: 4560, conversion_rate: 0.41, leading_to_assessment: 1870 },
      ])

      setCityDemand([
        { city: 'Los Angeles', state: 'CA', trt_demand: 12450, glp1_demand: 8920, recovery_demand: 5670, longevity_demand: 4230 },
        { city: 'New York', state: 'NY', trt_demand: 15680, glp1_demand: 11200, recovery_demand: 7890, longevity_demand: 6120 },
        { city: 'Austin', state: 'TX', trt_demand: 8920, glp1_demand: 6340, recovery_demand: 4120, longevity_demand: 3120 },
        { city: 'Miami', state: 'FL', trt_demand: 7230, glp1_demand: 5230, recovery_demand: 3890, longevity_demand: 2890 },
        { city: 'Seattle', state: 'WA', trt_demand: 6120, glp1_demand: 4450, recovery_demand: 3120, longevity_demand: 2450 },
      ])
    } catch (error) {
      console.error('Error fetching intelligence:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8" />
              Platform Intelligence
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time insights into demand, conversions, and revenue quality across the platform
            </p>
          </div>
          <StatusBadge status="live" />
        </div>
      </div>

      {/* Top Clinics by Revenue Quality */}
      <div className="mb-8">
        <Explainer
          title="Top Clinics by Revenue Quality"
          what="Clinics ranked by a composite score of matches, show rate, and average LTV band of matched patients."
          why="Identify which clinics generate the highest-quality patient relationships and revenue."
          how={['Higher score = better revenue quality', 'Use to prioritize clinic partnerships', 'Monitor show rates to identify operational issues']}
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Top 5 Clinics by Revenue Quality
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Clinic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Matches</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Show Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg LTV</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Quality Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {topClinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{clinic.name}</p>
                          <p className="text-xs text-gray-400">{clinic.city}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{clinic.matches.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{(clinic.show_rate * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          clinic.avg_ltv_band === 'high' ? 'text-status-live' :
                          clinic.avg_ltv_band === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {clinic.avg_ltv_band.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-primary">{clinic.revenue_quality_score.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Explainer>
      </div>

      {/* Top Products by AI Attach Rate */}
      <div className="mb-8">
        <Explainer
          title="Top Products by AI Attach Rate"
          what="Products ranked by how often the AI recommends them and their conversion performance."
          why="Identify which products the AI successfully recommends and which drive conversions."
          how={['Higher attach rate = AI recommends more often', 'Higher conversion = better product-market fit', 'Use to optimize product positioning']}
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Top 5 Products by AI Attach Rate
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Attach Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {topProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{product.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{product.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{(product.attach_rate * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{(product.conversion_rate * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Explainer>
      </div>

      {/* Top Search Queries */}
      <div className="mb-8">
        <Explainer
          title="Top Search Queries by Conversion"
          what="Most common search queries ranked by volume and conversion rate to assessment starts."
          why="Understand what users are searching for and which queries lead to assessments."
          how={['Higher volume = more demand', 'Higher conversion = better content match', 'Use to optimize SEO and content']}
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Top 10 Search Queries by Conversion
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Conversion Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Assessment Starts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {topQueries.map((query, idx) => (
                    <tr key={idx} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{query.query}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{query.volume.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{(query.conversion_rate * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{query.leading_to_assessment.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Explainer>
      </div>

      {/* City-Level Demand */}
      <div>
        <Explainer
          title="City-Level Demand by Treatment"
          what="Demand signals by city for different treatment types (TRT, GLP-1, Recovery, Longevity)."
          why="Identify geographic opportunities and optimize clinic placement and marketing."
          how={['Higher demand = more opportunity', 'Compare cities to prioritize expansion', 'Use to guide clinic partnerships']}
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg">
            <div className="p-6 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                City-Level Demand by Treatment
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-accent border-b border-dark-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">TRT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">GLP-1</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Recovery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Longevity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {cityDemand.map((city, idx) => (
                    <tr key={idx} className="hover:bg-dark-hover transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{city.city}, {city.state}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{city.trt_demand.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{city.glp1_demand.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{city.recovery_demand.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{city.longevity_demand.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Explainer>
      </div>
    </div>
  )
}

