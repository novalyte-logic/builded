'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import Explainer from '../Explainer'

export type SupplyGrade = 'A' | 'B' | 'C' | 'Watch'

export interface VendorScorecard {
  id: string
  name: string
  category: 'Supplements' | 'Diagnostics' | 'Equipment' | 'Devices'
  onTimeDelivery: number // percentage
  defectReturnRate: number // percentage
  avgMargin: number // percentage
  avgRating: number // 1-5 scale
  supplyGrade: SupplyGrade
  region?: string
}

interface VendorScorecardTableProps {
  vendors: VendorScorecard[]
  onRowClick: (vendorId: string) => void
}

export default function VendorScorecardTable({
  vendors,
  onRowClick,
}: VendorScorecardTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(vendors.map((v) => v.category)))
  const uniqueRegions = Array.from(new Set(vendors.map((v) => v.region).filter(Boolean)))

  // Apply filters
  let filteredVendors = vendors

  if (search) {
    filteredVendors = filteredVendors.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (categoryFilter) {
    filteredVendors = filteredVendors.filter((v) => v.category === categoryFilter)
  }

  if (gradeFilter) {
    filteredVendors = filteredVendors.filter((v) => v.supplyGrade === gradeFilter)
  }

  if (regionFilter) {
    filteredVendors = filteredVendors.filter((v) => v.region === regionFilter)
  }

  const getGradeColor = (grade: SupplyGrade) => {
    switch (grade) {
      case 'A':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'B':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'C':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'Watch':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPerformanceColor = (value: number, type: 'delivery' | 'defect' | 'margin' | 'rating') => {
    if (type === 'delivery') {
      if (value >= 95) return 'text-status-live'
      if (value >= 85) return 'text-cyan-400'
      if (value >= 75) return 'text-amber-400'
      return 'text-red-400'
    }
    if (type === 'defect') {
      if (value <= 2) return 'text-status-live'
      if (value <= 5) return 'text-cyan-400'
      if (value <= 10) return 'text-amber-400'
      return 'text-red-400'
    }
    if (type === 'margin') {
      if (value >= 40) return 'text-status-live'
      if (value >= 30) return 'text-cyan-400'
      if (value >= 20) return 'text-amber-400'
      return 'text-red-400'
    }
    if (type === 'rating') {
      if (value >= 4.5) return 'text-status-live'
      if (value >= 4.0) return 'text-cyan-400'
      if (value >= 3.5) return 'text-amber-400'
      return 'text-red-400'
    }
    return 'text-gray-400'
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
                placeholder="Search vendors..."
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
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="Watch">Watch</option>
          </select>
          {uniqueRegions.length > 0 && (
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-dark-accent border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Regions</option>
              {uniqueRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                On-Time Delivery %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Defect / Return Rate %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Avg Margin %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Avg Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Supply Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No vendors found matching your filters
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => onRowClick(vendor.id)}
                  className="hover:bg-dark-hover cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{vendor.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{vendor.category}</td>
                  <td className="px-4 py-3">
                    <Explainer
                      title="On-Time Delivery %"
                      what={`${vendor.onTimeDelivery.toFixed(1)}% of orders from this vendor arrive on or before the promised delivery date.`}
                      why="Reliable delivery ensures patient satisfaction and clinic operations run smoothly."
                      how={[
                        'Calculated: On-Time Orders / Total Orders',
                        'On-time = delivered by or before promised date',
                        'Key metric for vendor reliability',
                      ]}
                    >
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(
                          vendor.onTimeDelivery,
                          'delivery'
                        )}`}
                      >
                        {vendor.onTimeDelivery.toFixed(1)}%
                      </span>
                    </Explainer>
                  </td>
                  <td className="px-4 py-3">
                    <Explainer
                      title="Defect / Return Rate %"
                      what={`${vendor.defectReturnRate.toFixed(1)}% of orders from this vendor are returned due to defects or quality issues.`}
                      why="Lower defect rates mean fewer refunds, better patient experience, and higher profitability."
                      how={[
                        'Calculated: Defective/Returned Orders / Total Orders',
                        'Includes all return reasons related to quality',
                        'Lower is better',
                      ]}
                    >
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(
                          vendor.defectReturnRate,
                          'defect'
                        )}`}
                      >
                        {vendor.defectReturnRate.toFixed(1)}%
                      </span>
                    </Explainer>
                  </td>
                  <td className="px-4 py-3">
                    <Explainer
                      title="Average Margin %"
                      what={`Average profit margin achieved from products sold by this vendor.`}
                      why="Higher margins mean better profitability per sale and more sustainable business relationships."
                      how={[
                        'Calculated: (Revenue - Cost) / Revenue * 100',
                        'Average across all products from this vendor',
                        'Key metric for vendor profitability',
                      ]}
                    >
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(
                          vendor.avgMargin,
                          'margin'
                        )}`}
                      >
                        {vendor.avgMargin.toFixed(1)}%
                      </span>
                    </Explainer>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-sm font-medium ${getPerformanceColor(
                          vendor.avgRating,
                          'rating'
                        )}`}
                      >
                        {vendor.avgRating.toFixed(1)}
                      </span>
                      <span className="text-yellow-400 text-xs">★</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getGradeColor(
                        vendor.supplyGrade
                      )}`}
                    >
                      {vendor.supplyGrade}
                    </span>
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

