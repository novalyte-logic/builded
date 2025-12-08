'use client'

import { Brain, TrendingUp, AlertTriangle, Eye } from 'lucide-react'

interface VendorRecommendation {
  vendor_id: string
  vendor_name: string
  action_type: 'prioritize' | 'watch' | 'audit'
  recommendation: string
  suggested_action: string
}

interface VendorAIInsightsProps {
  recommendations: VendorRecommendation[]
}

export default function VendorAIInsights({ recommendations }: VendorAIInsightsProps) {
  const getActionColor = (type: string) => {
    switch (type) {
      case 'prioritize':
        return 'bg-status-live/10 border-status-live/30'
      case 'watch':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'audit':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-dark-accent border-dark-border'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'prioritize':
        return <TrendingUp className="w-4 h-4 text-status-live" />
      case 'watch':
        return <Eye className="w-4 h-4 text-yellow-400" />
      case 'audit':
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">AI Vendor Recommendations</h3>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Prioritize Section */}
        {recommendations.filter((r) => r.action_type === 'prioritize').length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Prioritize in Marketplace UI
            </h4>
            <div className="space-y-2">
              {recommendations
                .filter((r) => r.action_type === 'prioritize')
                .map((rec, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 ${getActionColor(rec.action_type)}`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {getActionIcon(rec.action_type)}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{rec.vendor_name}</p>
                        <p className="text-xs text-gray-300 mt-1">{rec.recommendation}</p>
                        <p className="text-xs text-gray-400 italic mt-1">
                          Suggested: {rec.suggested_action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Watch Section */}
        {recommendations.filter((r) => r.action_type === 'watch').length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Watch or Monitor
            </h4>
            <div className="space-y-2">
              {recommendations
                .filter((r) => r.action_type === 'watch')
                .map((rec, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 ${getActionColor(rec.action_type)}`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {getActionIcon(rec.action_type)}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{rec.vendor_name}</p>
                        <p className="text-xs text-gray-300 mt-1">{rec.recommendation}</p>
                        <p className="text-xs text-gray-400 italic mt-1">
                          Suggested: {rec.suggested_action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Audit Section */}
        {recommendations.filter((r) => r.action_type === 'audit').length > 0 && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Audit Required
            </h4>
            <div className="space-y-2">
              {recommendations
                .filter((r) => r.action_type === 'audit')
                .map((rec, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 ${getActionColor(rec.action_type)}`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {getActionIcon(rec.action_type)}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{rec.vendor_name}</p>
                        <p className="text-xs text-gray-300 mt-1">{rec.recommendation}</p>
                        <p className="text-xs text-gray-400 italic mt-1">
                          Suggested: {rec.suggested_action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

