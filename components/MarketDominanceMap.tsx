'use client'

import { MapPin, Building2, ShoppingBag, Activity } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface GeoRevenue {
  city: string
  state: string
  revenue: number
  penetration: number
  growth: number
}

interface CategoryRevenue {
  category: string
  revenue: number
  dominance: number
  growth: number
}

interface MarketDominanceMapProps {
  geoRevenue: GeoRevenue[]
  categoryRevenue: CategoryRevenue[]
  clinicRevenue: CategoryRevenue[]
  marketplaceRevenue: CategoryRevenue[]
}

export default function MarketDominanceMap({
  geoRevenue,
  categoryRevenue,
  clinicRevenue,
  marketplaceRevenue,
}: MarketDominanceMapProps) {
  const geoChartData = geoRevenue.map((item) => ({
    name: `${item.city}, ${item.state}`,
    value: item.revenue,
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Geographic Revenue Dominance */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Revenue by City</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={geoChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {geoChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {geoRevenue.map((geo, idx) => (
              <div key={idx} className="bg-dark-accent border border-dark-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {geo.city}, {geo.state}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      geo.growth >= 0
                        ? 'bg-status-live/20 text-status-live'
                        : 'bg-status-offline/20 text-status-offline'
                    }`}
                  >
                    {geo.growth >= 0 ? '+' : ''}{geo.growth.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Revenue: </span>
                    <span className="text-white font-medium">{formatCurrency(geo.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Penetration: </span>
                    <span className="text-white font-medium">{geo.penetration.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Dominance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-white">Service Category</h3>
          </div>
          <div className="space-y-3">
            {categoryRevenue.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{cat.category}</span>
                  <span className="text-xs font-medium text-white">
                    {formatCurrency(cat.revenue)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dark-accent rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${cat.dominance}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{cat.dominance.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-white">Clinic Type</h3>
          </div>
          <div className="space-y-3">
            {clinicRevenue.map((clinic, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{clinic.category}</span>
                  <span className="text-xs font-medium text-white">
                    {formatCurrency(clinic.revenue)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dark-accent rounded-full h-2">
                    <div
                      className="bg-status-live h-2 rounded-full"
                      style={{ width: `${clinic.dominance}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{clinic.dominance.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-white">Marketplace Vertical</h3>
          </div>
          <div className="space-y-3">
            {marketplaceRevenue.map((vert, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{vert.category}</span>
                  <span className="text-xs font-medium text-white">
                    {formatCurrency(vert.revenue)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dark-accent rounded-full h-2">
                    <div
                      className="bg-f59e0b h-2 rounded-full"
                      style={{ width: `${vert.dominance}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{vert.dominance.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

