'use client'

import { TrendingUp, TrendingDown, Pause, RefreshCw } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { FatigueLevel } from './FatigueClassification'

interface Creative {
  id: string
  name: string
  platform: 'google' | 'tiktok' | 'meta'
  fatigueLevel: FatigueLevel
  fatigueScore: number
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  conversions: number
  cpa: number
  roas: number
  spend: number
  revenue: number
  frequency: number
  engagementRate: number
  status: 'active' | 'paused' | 'pending_rotation'
}

interface CreativeLeaderboardProps {
  creatives: Creative[]
  onPause?: (id: string) => void
  onRotate?: (id: string) => void
}

export default function CreativeLeaderboard({ creatives, onPause, onRotate }: CreativeLeaderboardProps) {
  const getFatigueColor = (level: FatigueLevel) => {
    switch (level) {
      case 'green':
        return 'bg-status-live/20 text-status-live border-status-live/30'
      case 'yellow':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'orange':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'red':
        return 'bg-status-offline/20 text-status-offline border-status-offline/30'
    }
  }

  const sortedCreatives = [...creatives].sort((a, b) => {
    // Sort by fatigue score (higher = worse) then by ROAS
    if (b.fatigueScore !== a.fatigueScore) {
      return b.fatigueScore - a.fatigueScore
    }
    return b.roas - a.roas
  })

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg">
      <div className="p-6 border-b border-dark-border">
        <h3 className="text-lg font-semibold text-white">Creative Leaderboard</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-accent border-b border-dark-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Creative
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fatigue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Metrics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {sortedCreatives.map((creative) => (
              <tr key={creative.id} className="hover:bg-dark-hover transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">{creative.name}</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">{creative.platform}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getFatigueColor(creative.fatigueLevel)}`}>
                      {creative.fatigueLevel.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{creative.fatigueScore}/100</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">ROAS:</span>
                      <span className={`text-sm font-medium ${
                        creative.roas > 3.5 ? 'text-status-live' : creative.roas > 2.5 ? 'text-yellow-400' : 'text-status-offline'
                      }`}>
                        {creative.roas.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">CPA:</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(creative.cpa)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">CTR:</span>
                      <span className="text-sm font-medium text-white">{(creative.ctr * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs">
                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-400">Impressions: </span>
                      <span className="text-white">{formatNumber(creative.impressions)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Clicks: </span>
                      <span className="text-white">{formatNumber(creative.clicks)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Engagement: </span>
                      <span className="text-white">{(creative.engagementRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      creative.frequency > 4 ? 'text-status-offline' : 
                      creative.frequency > 2.5 ? 'text-orange-400' : 'text-status-live'
                    }`}>
                      {creative.frequency.toFixed(1)}x
                    </span>
                    {creative.frequency > 3 && (
                      <span className="text-xs text-status-degraded">High</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {creative.status === 'active' && creative.fatigueLevel !== 'green' && (
                      <>
                        {onPause && (
                          <button
                            onClick={() => onPause(creative.id)}
                            className="p-1.5 bg-dark-accent border border-dark-border rounded hover:bg-dark-hover transition-colors"
                            title="Pause"
                          >
                            <Pause className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                        {onRotate && (
                          <button
                            onClick={() => onRotate(creative.id)}
                            className="p-1.5 bg-dark-accent border border-dark-border rounded hover:bg-dark-hover transition-colors"
                            title="Rotate"
                          >
                            <RefreshCw className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                      </>
                    )}
                    {creative.status === 'paused' && (
                      <span className="text-xs text-gray-500">Paused</span>
                    )}
                    {creative.status === 'pending_rotation' && (
                      <span className="text-xs text-status-degraded">Rotating...</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

