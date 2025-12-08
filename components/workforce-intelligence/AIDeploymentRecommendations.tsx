'use client'

import { MapPin, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface DeploymentRecommendation {
  city: string
  state: string
  metro: string
  bestRoles: Array<{
    role: string
    recommendedFTE: number
    reasoning: string
  }>
  totalRecommendedFTE: number
  expectedMonthlyRevenue: number
  expectedPlacementFees: number
  explanation: string
  priority: 'High' | 'Medium' | 'Low'
  deploymentTimeline: string
  constraints: string[]
}

interface AIDeploymentRecommendationsProps {
  recommendations: DeploymentRecommendation[]
}

export default function AIDeploymentRecommendations({
  recommendations,
}: AIDeploymentRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="mb-2">Generating deployment recommendations...</div>
        <div className="text-xs">AI analysis in progress</div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-red-500/50 bg-red-500/10'
      case 'Medium':
        return 'border-orange-500/50 bg-orange-500/10'
      case 'Low':
        return 'border-yellow-500/50 bg-yellow-500/10'
      default:
        return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const sortedRecs = [...recommendations].sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return b.expectedMonthlyRevenue - a.expectedMonthlyRevenue
  })

  return (
    <div className="space-y-4">
      {sortedRecs.map((rec, idx) => (
        <div
          key={`${rec.city}-${rec.state}-${idx}`}
          className={`border rounded-lg p-6 ${getPriorityColor(rec.priority)}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-white text-lg">
                  {rec.city}, {rec.state}
                </h3>
                <p className="text-xs text-gray-400">{rec.metro}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs px-2 py-1 rounded-full border ${
                rec.priority === 'High' 
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : rec.priority === 'Medium'
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              }`}>
                {rec.priority} Priority
              </div>
            </div>
          </div>

          {/* Role Recommendations */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Recommended Deployment</span>
            </div>
            <div className="space-y-2">
              {rec.bestRoles.map((roleRec, roleIdx) => (
                <div
                  key={roleIdx}
                  className="bg-dark-accent border border-dark-border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{roleRec.role}</span>
                    <span className="text-sm font-bold text-primary">
                      {formatNumber(roleRec.recommendedFTE)} FTE
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{roleRec.reasoning}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between bg-dark-surface border border-dark-border rounded-lg p-3">
              <span className="text-sm font-medium text-gray-400">Total Recommended FTE</span>
              <span className="text-lg font-bold text-white">{formatNumber(rec.totalRecommendedFTE)}</span>
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Monthly Revenue</span>
              </div>
              <div className="text-lg font-bold text-green-400">
                {formatCurrency(rec.expectedMonthlyRevenue)}
              </div>
            </div>
            <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-gray-400">Placement Fees</span>
              </div>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(rec.expectedPlacementFees)}
              </div>
            </div>
            <div className="bg-dark-accent border border-dark-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Timeline</span>
              </div>
              <div className="text-sm font-bold text-blue-400">{rec.deploymentTimeline}</div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="bg-dark-accent border border-dark-border rounded-lg p-4 mb-4">
            <div className="text-xs text-gray-400 mb-2">AI Analysis</div>
            <p className="text-sm text-white leading-relaxed">{rec.explanation}</p>
          </div>

          {/* Constraints */}
          {rec.constraints && rec.constraints.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">Constraints & Considerations</div>
              <ul className="space-y-1">
                {rec.constraints.map((constraint, constraintIdx) => (
                  <li key={constraintIdx} className="text-xs text-yellow-400 flex items-start gap-2">
                    <span>•</span>
                    <span>{constraint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-dark-border">
            <button className="flex-1 bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors">
              View Detailed Plan
            </button>
            <button className="flex-1 bg-dark-accent border border-dark-border hover:border-primary/50 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors">
              Export Recommendation
            </button>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="pt-4 border-t border-dark-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Markets</div>
            <div className="text-lg font-bold text-white">{recommendations.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Total FTE Recommended</div>
            <div className="text-lg font-bold text-white">
              {formatNumber(
                recommendations.reduce((sum, r) => sum + r.totalRecommendedFTE, 0)
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Monthly Revenue</div>
            <div className="text-lg font-bold text-green-400">
              {formatCurrency(
                recommendations.reduce((sum, r) => sum + r.expectedMonthlyRevenue, 0)
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Placement Fees</div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(
                recommendations.reduce((sum, r) => sum + r.expectedPlacementFees, 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

