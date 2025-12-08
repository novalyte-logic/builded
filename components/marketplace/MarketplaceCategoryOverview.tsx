'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, TrendingUp, ShoppingCart } from 'lucide-react'
import { CategoryMetrics, MarketplaceCategory } from '@/lib/types/marketplace'
import Explainer from '../Explainer'

export default function MarketplaceCategoryOverview() {
  const [categories, setCategories] = useState<CategoryMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    const interval = setInterval(fetchCategories, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/marketplace/categories')
      // const data = await response.json()
      
      // Mock data
      const mockCategories: CategoryMetrics[] = [
        {
          category: 'Supplements',
          product_count: 45,
          total_views: 12500,
          ctr_to_detail: 0.32,
          add_to_cart_rate: 0.18,
          show_in_marketplace: true,
          display_priority: 1,
        },
        {
          category: 'Equipment',
          product_count: 23,
          total_views: 8900,
          ctr_to_detail: 0.28,
          add_to_cart_rate: 0.15,
          show_in_marketplace: true,
          display_priority: 2,
        },
        {
          category: 'Diagnostics',
          product_count: 12,
          total_views: 5600,
          ctr_to_detail: 0.35,
          add_to_cart_rate: 0.22,
          show_in_marketplace: true,
          display_priority: 3,
        },
        {
          category: 'Digital Health',
          product_count: 8,
          total_views: 3200,
          ctr_to_detail: 0.25,
          add_to_cart_rate: 0.12,
          show_in_marketplace: true,
          display_priority: 4,
        },
        {
          category: 'Home Gym',
          product_count: 15,
          total_views: 7800,
          ctr_to_detail: 0.30,
          add_to_cart_rate: 0.20,
          show_in_marketplace: true,
          display_priority: 5,
        },
        {
          category: 'Health Tech Devices',
          product_count: 19,
          total_views: 10200,
          ctr_to_detail: 0.33,
          add_to_cart_rate: 0.19,
          show_in_marketplace: true,
          display_priority: 6,
        },
      ]
      
      setCategories(mockCategories.sort((a, b) => a.display_priority - b.display_priority))
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (category: MarketplaceCategory) => {
    // TODO: Implement API call to toggle category visibility
    setCategories((prev) =>
      prev.map((c) =>
        c.category === category
          ? { ...c, show_in_marketplace: !c.show_in_marketplace }
          : c
      )
    )
  }

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="text-center text-gray-400">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-xl font-semibold text-white">Category Overview</h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage category visibility, priority order, and view performance metrics
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Add-to-Stack
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Visibility
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {categories.map((category) => (
              <tr key={category.category} className="hover:bg-dark-hover transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-white">{category.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {category.product_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {category.total_views.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {(category.ctr_to_detail * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {category.add_to_cart_rate ? `${(category.add_to_cart_rate * 100).toFixed(1)}%` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {category.display_priority}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Explainer
                    title="Category Visibility"
                    what="Toggle whether this category appears on the public marketplace."
                    why="Control which product categories are visible to users."
                    how={['Click to toggle visibility', 'Hidden categories remain accessible via direct links', 'Useful for seasonal or testing categories']}
                  >
                    <button
                      onClick={() => handleToggleVisibility(category.category)}
                      className={`p-2 rounded-lg transition-colors ${
                        category.show_in_marketplace
                          ? 'bg-status-live/20 text-status-live hover:bg-status-live/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {category.show_in_marketplace ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </Explainer>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

