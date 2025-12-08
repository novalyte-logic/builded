'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ProductMetrics } from '@/lib/types/marketplace-optimization'
import { getRevenuePotentialBadge } from '@/lib/services/marketplace-optimization-engine'
import Explainer from '../Explainer'

interface ProductPerformance extends ProductMetrics {
  product_name: string
  category: string
  for_who?: string
}

export default function LivePerformanceOverview() {
  const [products, setProducts] = useState<ProductPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    performance: '',
    for_who: '',
    search: '',
  })

  useEffect(() => {
    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [filters])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.set('category', filters.category)
      if (filters.performance) params.set('performance', filters.performance)
      if (filters.for_who) params.set('for_who', filters.for_who)

      const response = await fetch(`/api/admin/marketplace-optimization/performance?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch performance data')

      const data = await response.json()
      // Filter by search locally
      let filtered = data.products || []
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter((p: ProductPerformance) =>
          p.product_name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
        )
      }
      setProducts(filtered)
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRevenueBadgeColor = (badge: 'Low' | 'Medium' | 'High') => {
    switch (badge) {
      case 'High':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      {/* Filters */}
      <div className="p-6 border-b border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Explainer
            title="Search Products"
            what="Search by product name or category to find specific products."
            why="Quickly locate products in the performance table."
            how={['Type product name or category', 'Results filter in real-time', 'Combine with other filters for precise results']}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </Explainer>

          <Explainer
            title="Category Filter"
            what="Filter products by marketplace category."
            why="Focus on specific product categories to analyze performance."
            how={['Select a category to see only products in that category', 'Useful for category-specific optimization', 'Combine with performance filter for targeted insights']}
          >
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              <option value="Supplements">Supplements</option>
              <option value="Equipment">Equipment</option>
              <option value="Diagnostics">Diagnostics</option>
              <option value="Digital Health">Digital Health</option>
              <option value="Home Gym">Home Gym</option>
              <option value="Health Tech Devices">Health Tech Devices</option>
            </select>
          </Explainer>

          <Explainer
            title="Performance Filter"
            what="Filter products by performance tier (Top / Middle / Low)."
            why="Quickly identify top performers, underperformers, and middle-tier products."
            how={['Select "Top" to see best-performing products', 'Select "Low" to find optimization opportunities', 'Useful for prioritization']}
          >
            <select
              value={filters.performance}
              onChange={(e) => setFilters({ ...filters, performance: e.target.value })}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Performance</option>
              <option value="top">Top Performers</option>
              <option value="middle">Middle Tier</option>
              <option value="low">Low Performers</option>
            </select>
          </Explainer>

          <Explainer
            title="Audience Filter"
            what="Filter products by target audience (Patient, Men's Clinic, Both)."
            why="Analyze performance for specific user segments."
            how={['Select audience to see products for that segment', 'Useful for audience-specific optimization', 'Helps identify product-market fit']}
          >
            <select
              value={filters.for_who}
              onChange={(e) => setFilters({ ...filters, for_who: e.target.value })}
              className="w-full bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Audiences</option>
              <option value="Patient">Patient</option>
              <option value="Men's Clinic">Men's Clinic</option>
              <option value="Both">Both</option>
            </select>
          </Explainer>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Attach to Assessment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Attach to Clinic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Impressions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Revenue Potential
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Loading performance data...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const revenueBadge = getRevenuePotentialBadge(product.revenue_proxy_score)
                return (
                  <tr key={product.product_id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{product.product_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">
                          {(product.ctr * 100).toFixed(1)}%
                        </span>
                        {product.ctr > 0.1 ? (
                          <TrendingUp className="w-4 h-4 text-status-live" />
                        ) : product.ctr < 0.05 ? (
                          <TrendingDown className="w-4 h-4 text-status-offline" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {(product.attach_rate_to_assessment * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {(product.attach_rate_to_clinic_match * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {product.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getRevenueBadgeColor(revenueBadge)}`}>
                        {revenueBadge}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

