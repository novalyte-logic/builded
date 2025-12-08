'use client'

import { useState } from 'react'
import { MapPin, Users, TrendingUp, Eye, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Opportunity {
  city: string
  state: string
  metro: string
  topRoles: string[]
  opportunityLevel: 'Critical' | 'High' | 'Moderate'
  internalDemandScore: number
  externalDemandScore: number
  supplyScore: number
  novalyteOpportunityScore: number
  avgBillRate: number
  recommendation: string
  projectedMonthlyRevenue?: number
}

interface AIOpportunityScannerProps {
  opportunities: Opportunity[]
}

export default function AIOpportunityScanner({ opportunities }: AIOpportunityScannerProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="mb-2">Scanning markets for opportunities...</div>
        <div className="text-xs">AI analysis in progress</div>
      </div>
    )
  }

  const getOpportunityIcon = (level: string) => {
    switch (level) {
      case 'Critical':
        return '🚀'
      case 'High':
        return '🔥'
      case 'Moderate':
        return '⚪'
      default:
        return '⚪'
    }
  }

  const getOpportunityColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'border-red-500/50 bg-red-500/10'
      case 'High':
        return 'border-orange-500/50 bg-orange-500/10'
      case 'Moderate':
        return 'border-yellow-500/50 bg-yellow-500/10'
      default:
        return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const levelOrder = { Critical: 0, High: 1, Moderate: 2 }
    if (levelOrder[a.opportunityLevel] !== levelOrder[b.opportunityLevel]) {
      return levelOrder[a.opportunityLevel] - levelOrder[b.opportunityLevel]
    }
    return b.novalyteOpportunityScore - a.novalyteOpportunityScore
  })

  return (
    <div className="space-y-4">
      {/* Opportunity Radar List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedOpportunities.map((opp, idx) => (
          <div
            key={`${opp.city}-${opp.state}-${idx}`}
            className={`border rounded-lg p-5 hover:border-primary/50 transition-all ${
              selectedCity === `${opp.city}-${opp.state}` ? 'border-primary' : getOpportunityColor(opp.opportunityLevel)
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {opp.city}, {opp.state}
                  </h3>
                  <p className="text-xs text-gray-400">{opp.metro}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-2xl">{getOpportunityIcon(opp.opportunityLevel)}</span>
                <span className="text-xs text-gray-400">{opp.opportunityLevel}</span>
              </div>
            </div>

            {/* Top Roles Needed */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Top Roles Needed</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {opp.topRoles.map((role, roleIdx) => (
                  <span
                    key={roleIdx}
                    className="text-xs px-2 py-1 bg-dark-accent border border-dark-border rounded text-white"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-dark-accent border border-dark-border rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Internal Demand</div>
                <div className="text-sm font-semibold text-white">{opp.internalDemandScore}</div>
              </div>
              <div className="bg-dark-accent border border-dark-border rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">External Demand</div>
                <div className="text-sm font-semibold text-white">{opp.externalDemandScore}</div>
              </div>
              <div className="bg-dark-accent border border-dark-border rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Supply</div>
                <div className="text-sm font-semibold text-white">{opp.supplyScore}</div>
              </div>
            </div>

            {/* Opportunity Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Novalyte Opportunity Score</span>
                <span className="text-sm font-bold text-primary">{opp.novalyteOpportunityScore}</span>
              </div>
              <div className="h-2 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(opp.novalyteOpportunityScore, 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <div>
                <span className="text-gray-400">Avg Bill Rate:</span>
                <span className="text-white font-medium ml-2">{formatCurrency(opp.avgBillRate)}/hr</span>
              </div>
              {opp.projectedMonthlyRevenue && (
                <div>
                  <span className="text-gray-400">Projected Revenue:</span>
                  <span className="text-green-400 font-medium ml-2">
                    {formatCurrency(opp.projectedMonthlyRevenue)}/mo
                  </span>
                </div>
              )}
            </div>

            {/* AI Recommendation */}
            <div className="bg-dark-accent border border-dark-border rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">AI Recommendation</div>
              <p className="text-sm text-white leading-relaxed">{opp.recommendation}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Navigate to matching practitioners view
                  console.log('View matching practitioners for:', opp.city, opp.state)
                }}
                className="flex-1 bg-dark-accent border border-dark-border hover:border-primary/50 rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-3 h-3" />
                View Practitioners
              </button>
              <button
                onClick={() => {
                  // Navigate to clinics in region
                  console.log('View clinics in:', opp.city, opp.state)
                }}
                className="flex-1 bg-dark-accent border border-dark-border hover:border-primary/50 rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-3 h-3" />
                View Clinics
              </button>
              <button
                onClick={() => {
                  // Launch outreach sequence
                  console.log('Launch outreach for:', opp.city, opp.state)
                }}
                className="flex-1 bg-primary hover:bg-primary-dark rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3 h-3" />
                Launch Outreach
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-dark-border text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Showing {sortedOpportunities.length} opportunity markets (sorted by opportunity score)
          </span>
          <span>
            Critical: {sortedOpportunities.filter((o) => o.opportunityLevel === 'Critical').length} | High:{' '}
            {sortedOpportunities.filter((o) => o.opportunityLevel === 'High').length} | Moderate:{' '}
            {sortedOpportunities.filter((o) => o.opportunityLevel === 'Moderate').length}
          </span>
        </div>
      </div>
    </div>
  )
}

