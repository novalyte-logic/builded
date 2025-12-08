'use client'

import { MapPin, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface RegionData {
  city: string
  state: string
  region: string
  openRequests: number
  dominantRole: string
  avgRate: number
  opportunityLevel: 'Critical' | 'High' | 'Medium' | 'Low'
  demandScore: number
  supplyScore: number
}

interface WorkforceHeatmapProps {
  data: {
    regions: RegionData[]
    lastUpdated: string
  } | null
}

export default function WorkforceHeatmap({ data }: WorkforceHeatmapProps) {
  if (!data || !data.regions) {
    return (
      <div className="text-center py-12 text-gray-400">
        No heatmap data available
      </div>
    )
  }

  const getOpportunityColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'High':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400'
      case 'Medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'Low':
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getOpportunityIcon = (level: string) => {
    switch (level) {
      case 'Critical':
        return '🚀'
      case 'High':
        return '🔥'
      case 'Medium':
        return '⚪'
      default:
        return '⚪'
    }
  }

  // Sort by opportunity level and demand score
  const sortedRegions = [...data.regions].sort((a, b) => {
    const levelOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    if (levelOrder[a.opportunityLevel] !== levelOrder[b.opportunityLevel]) {
      return levelOrder[a.opportunityLevel] - levelOrder[b.opportunityLevel]
    }
    return b.demandScore - a.demandScore
  })

  return (
    <div className="space-y-4">
      {/* Top Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRegions.slice(0, 12).map((region, idx) => (
          <div
            key={`${region.city}-${region.state}`}
            className={`bg-dark-accent border rounded-lg p-4 hover:border-primary/30 transition-colors ${
              getOpportunityColor(region.opportunityLevel)
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <div>
                  <h3 className="font-semibold text-white">
                    {region.city}, {region.state}
                  </h3>
                  <p className="text-xs text-gray-400">{region.region}</p>
                </div>
              </div>
              <div className="text-2xl">{getOpportunityIcon(region.opportunityLevel)}</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Open Requests</span>
                <span className="font-semibold text-white">{region.openRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Dominant Role</span>
                <span className="font-medium text-white">{region.dominantRole}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Avg Rate</span>
                <span className="font-medium text-white">{formatCurrency(region.avgRate)}/hr</span>
              </div>
              
              {/* Demand vs Supply */}
              <div className="pt-2 border-t border-dark-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Demand Score</span>
                  <div className="flex items-center gap-1">
                    {region.demandScore > region.supplyScore ? (
                      <TrendingUp className="w-3 h-3 text-red-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-green-400" />
                    )}
                    <span className="text-xs font-medium">{region.demandScore}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Supply Score</span>
                  <span className="text-xs font-medium">{region.supplyScore}</span>
                </div>
              </div>

              {/* Opportunity Signal */}
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    AI Signal: {region.opportunityLevel} Opportunity
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-border text-xs text-gray-400">
        <span>Last updated: {new Date(data.lastUpdated).toLocaleString()}</span>
        <span>Showing top {sortedRegions.length} regions by opportunity</span>
      </div>
    </div>
  )
}

