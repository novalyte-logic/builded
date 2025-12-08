'use client'

import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'
import StatusBadge from './StatusBadge'

interface Campaign {
  id: string
  name: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  cpa: number
  roas: number
  status: 'active' | 'paused' | 'limited'
}

interface PlatformPanelProps {
  platform: 'google' | 'tiktok' | 'meta'
  metrics: {
    impressions: number
    clicks: number
    ctr: number
    cpc: number
    cpa: number
    roas: number
    spend: number
    revenue: number
  }
  campaigns: Campaign[]
  topInsights?: string[]
}

export default function PlatformPanel({ platform, metrics, campaigns, topInsights }: PlatformPanelProps) {
  const platformColors = {
    google: { primary: '#4285F4', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    tiktok: { primary: '#000000', bg: 'bg-black/20', border: 'border-gray-500/30' },
    meta: { primary: '#1877F2', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  }

  const colors = platformColors[platform]

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg}`}>
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white capitalize">{platform} Ads</h2>
          <StatusBadge status="live" />
        </div>
      </div>

      <div className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Impressions</p>
            <p className="text-lg font-bold text-white">{formatNumber(metrics.impressions)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Clicks</p>
            <p className="text-lg font-bold text-white">{formatNumber(metrics.clicks)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">CTR</p>
            <p className="text-lg font-bold text-white">{(metrics.ctr * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">CPC</p>
            <p className="text-lg font-bold text-white">{formatCurrency(metrics.cpc)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">CPA</p>
            <p className="text-lg font-bold text-white">{formatCurrency(metrics.cpa)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">ROAS</p>
            <p className="text-lg font-bold text-status-live">{metrics.roas.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Spend</p>
            <p className="text-lg font-bold text-white">{formatCurrency(metrics.spend)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Revenue</p>
            <p className="text-lg font-bold text-status-live">{formatCurrency(metrics.revenue)}</p>
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-4">Top Campaigns</h3>
          <div className="space-y-2">
            {campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                className="bg-dark-accent border border-dark-border rounded-lg p-4 hover:bg-dark-hover transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{campaign.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : campaign.status === 'paused'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-status-live">
                    {campaign.roas.toFixed(2)}x ROAS
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Spend: </span>
                    <span className="text-white">{formatCurrency(campaign.spend)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Conv: </span>
                    <span className="text-white">{campaign.conversions}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">CPA: </span>
                    <span className="text-white">{formatCurrency(campaign.cpa)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Revenue: </span>
                    <span className="text-status-live">{formatCurrency(campaign.spend * campaign.roas)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform-Specific Insights */}
        {topInsights && topInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Top Insights</h3>
            <div className="space-y-2">
              {topInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-gray-300 bg-dark-accent rounded-lg p-3"
                >
                  <AlertTriangle className="w-3 h-3 text-status-degraded mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

