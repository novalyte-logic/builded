'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import Explainer from '../Explainer'

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
}

interface ProductPerformanceTableProps {
  products: ProductPerformance[]
  selectedCategory: string | null
  timeRange: '7d' | '30d' | '90d'
}

export default function ProductPerformanceTable({
  products,
  selectedCategory,
  timeRange,
}: ProductPerformanceTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Get unique categories and vendors for filters
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)))
  const uniqueVendors = Array.from(new Set(products.map((p) => p.vendor)))

  // Apply filters
  let filteredProducts = products

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter((p) => p.category === selectedCategory)
  }

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter((p) => p.category === categoryFilter)
  }

  if (vendorFilter) {
    filteredProducts = filteredProducts.filter((p) => p.vendor === vendorFilter)
  }

  if (statusFilter) {
    filteredProducts = filteredProducts.filter((p) => p.status === statusFilter)
  }

  if (search) {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Sort by revenue descending and take top 25
  const topProducts = [...filteredProducts]
    .sort((a, b) => b.revenue30d - a.revenue30d)
    .slice(0, 25)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'backordered':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'paused':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg flex flex-col h-full">
      {/* Filters */}
      <div className="p-4 border-b border-dark-border space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-accent border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Vendors</option>
            {uniqueVendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="backordered">Backordered</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        {selectedCategory && (
          <div className="text-xs text-gray-400">
            Filtered by category: <span className="text-primary">{selectedCategory}</span>{' '}
            <button
              onClick={() => setCategoryFilter('')}
              className="text-primary hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Add-to-Cart Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Checkout Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Revenue (30d)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Refund Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Attached Protocol
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No products found matching your filters
                </td>
              </tr>
            ) : (
              topProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-dark-hover transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{product.vendor}</div>
                      <span
                        className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full border ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{product.category}</td>
                  <td className="px-4 py-3 text-sm text-white">
                    {formatNumber(product.clicks)}
                  </td>
                  <td className="px-4 py-3">
                    <Explainer
                      title="Add-to-Cart Rate"
                      what={`${(product.addToCartRate * 100).toFixed(1)}% of product views result in items being added to cart.`}
                      why="Higher rates indicate strong product appeal and pricing. Low rates suggest need for optimization."
                      how={[
                        'Calculated: Add-to-Cart Events / Product Views',
                        `Time window: Last ${timeRange}`,
                        'Key metric for product-market fit',
                      ]}
                    >
                      <span className="text-sm text-gray-300">
                        {(product.addToCartRate * 100).toFixed(1)}%
                      </span>
                    </Explainer>
                  </td>
                  <td className="px-4 py-3">
                    <Explainer
                      title="Checkout Rate"
                      what={`${(product.checkoutRate * 100).toFixed(1)}% of views result in completed checkouts (conversion rate).`}
                      why="Shows product conversion effectiveness. High checkout rates mean strong demand and pricing fit."
                      how={[
                        'Calculated: Completed Checkouts / Product Views',
                        `Time window: Last ${timeRange}`,
                        'This is conversion rate from view → checkout over the selected time window.',
                      ]}
                    >
                      <span className="text-sm text-gray-300">
                        {(product.checkoutRate * 100).toFixed(1)}%
                      </span>
                    </Explainer>
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {formatCurrency(product.revenue30d)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        product.refundRate < 0.05
                          ? 'bg-status-live/20 text-status-live border-status-live/30'
                          : product.refundRate < 0.15
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {(product.refundRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.attachedProtocolType.map((type, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-dark-accent border border-dark-border rounded text-gray-300"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

