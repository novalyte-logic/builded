'use client'

import { useEffect, useState } from 'react'
import BigQueryMetrics from '@/components/BigQueryMetrics'
import AIInsightPanel from '@/components/AIInsightPanel'
import MetricCard from '@/components/MetricCard'
import RealtimeChart from '@/components/RealtimeChart'
import { Brain, TrendingUp, DollarSign, MapPin, ShoppingBag } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function AIIntelligencePage() {
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  return (
    <div className="p-8 bg-dark-bg min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Revenue Intelligence</h1>
        <p className="text-gray-400">BigQuery + Vertex AI powered intelligence</p>
      </div>

      {/* AI Revenue Intelligence Panel */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">AI Revenue Intelligence Panel</h2>
        
        <BigQueryMetrics endpoint="overview" params={dateRange}>
          {(data, loading, error) => {
            if (loading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-dark-surface border border-dark-border rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-dark-accent rounded w-1/2 mb-2" />
                      <div className="h-8 bg-dark-accent rounded w-3/4" />
                    </div>
                  ))}
                </div>
              )
            }

            if (error) {
              return <div className="text-red-400">Error: {error}</div>
            }

            if (!data) return null

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <MetricCard
                  title="Total Revenue (30d)"
                  value={formatCurrency(data.totalRevenue || 0)}
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <MetricCard
                  title="Most Profitable Channel"
                  value="Google Ads"
                  subtitle="4.2x ROAS"
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <MetricCard
                  title="Marketplace Revenue"
                  value={formatCurrency(data.marketplaceRevenue || 0)}
                  icon={<ShoppingBag className="w-5 h-5" />}
                />
              </div>
            )
          }}
        </BigQueryMetrics>

        {/* Channel ROI Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BigQueryMetrics endpoint="ads" params={dateRange}>
            {(data, loading, error) => {
              if (loading || !data || !Array.isArray(data)) {
                return (
                  <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                    <h3 className="text-sm font-medium text-white mb-4">Channel ROI</h3>
                    <div className="h-64 bg-dark-accent rounded animate-pulse" />
                  </div>
                )
              }

              return (
                <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-white mb-4">Channel ROI by Platform</h3>
                  <div className="space-y-3">
                    {data.slice(0, 5).map((channel: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{channel.platform}</span>
                          <span className="text-sm font-medium text-status-live">
                            {channel.roas.toFixed(2)}x ROAS
                          </span>
                        </div>
                        <div className="w-full bg-dark-accent rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min((channel.roas / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          </BigQueryMetrics>

          {/* Gemini Summary */}
          <AIInsightPanel insightType="weekly_brief" />
        </div>
      </div>

      {/* AI Clinic Performance Insights */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">AI Clinic Performance Insights</h2>
        
        <BigQueryMetrics endpoint="clinics" params={dateRange}>
          {(data, loading, error) => {
            if (loading || !data || !Array.isArray(data)) {
              return <div className="text-gray-400">Loading clinic data...</div>
            }

            return (
              <div className="bg-dark-surface border border-dark-border rounded-lg">
                <div className="p-6 border-b border-dark-border">
                  <h3 className="text-lg font-semibold text-white">Clinic Performance Leaderboard</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-accent border-b border-dark-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Clinic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Revenue (30d)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Avg Order Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          New Patients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Returning
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                          Show Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {data.slice(0, 10).map((clinic: any, idx: number) => (
                        <tr key={idx} className="hover:bg-dark-hover transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{clinic.clinic_name}</div>
                              <div className="text-xs text-gray-400">
                                {clinic.city}, {clinic.state}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(clinic.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {formatCurrency(clinic.avgOrderValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {clinic.newPatients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {clinic.returningPatients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-status-live">
                              {(clinic.showRate * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }}
        </BigQueryMetrics>
      </div>

      {/* AI Ads & Marketplace Engine */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">AI Ads & Marketplace Engine</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BigQueryMetrics endpoint="ads" params={dateRange}>
            {(data, loading, error) => {
              if (loading || !data || !Array.isArray(data)) {
                return (
                  <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                    <h3 className="text-sm font-medium text-white mb-4">Spend vs Revenue by Platform</h3>
                    <div className="h-64 bg-dark-accent rounded animate-pulse" />
                  </div>
                )
              }

              return (
                <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-white mb-4">Spend vs Revenue by Platform</h3>
                  <div className="space-y-4">
                    {data
                      .reduce((acc: any[], curr: any) => {
                        const existing = acc.find((a) => a.platform === curr.platform)
                        if (existing) {
                          existing.spend += curr.spend
                          existing.revenue += curr.revenue
                        } else {
                          acc.push({ platform: curr.platform, spend: curr.spend, revenue: curr.revenue })
                        }
                        return acc
                      }, [])
                      .map((platform: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white">{platform.platform}</span>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-gray-400">
                                Spend: {formatCurrency(platform.spend)}
                              </span>
                              <span className="text-status-live">
                                Revenue: {formatCurrency(platform.revenue)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-dark-accent rounded-full h-3">
                            <div
                              className="bg-primary h-3 rounded-full"
                              style={{
                                width: `${Math.min((platform.revenue / 500000) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            }}
          </BigQueryMetrics>

          <BigQueryMetrics endpoint="marketplace" params={dateRange}>
            {(data, loading, error) => {
              if (loading || !data || !Array.isArray(data)) {
                return (
                  <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                    <h3 className="text-sm font-medium text-white mb-4">Marketplace Categories</h3>
                    <div className="h-64 bg-dark-accent rounded animate-pulse" />
                  </div>
                )
              }

              return (
                <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-white mb-4">Marketplace Category Revenue</h3>
                  <div className="space-y-3">
                    {data.map((cat: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white capitalize">{cat.category}</span>
                          <span className="text-sm font-medium text-status-live">
                            {formatCurrency(cat.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-dark-accent rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((cat.revenue / 500000) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          </BigQueryMetrics>
        </div>

        {/* Channel Recommendations */}
        <div className="mt-6">
          <AIInsightPanel insightType="recommend_channels" />
        </div>
      </div>
    </div>
  )
}

