'use client'

import { Brain, FileText, Download, Flag, AlertTriangle } from 'lucide-react'

interface RiskInsight {
  insight: string
  severity: 'Low' | 'Moderate' | 'High'
  recommendedAction?: string
}

interface AIRiskSummaryProps {
  insights: RiskInsight[]
  timeRange: '24h' | '7d' | '30d'
  onViewDetailedLog?: () => void
  onExportReport?: () => void
  onFlagForLegal?: () => void
}

export default function AIRiskSummary({
  insights,
  timeRange,
  onViewDetailedLog,
  onExportReport,
  onFlagForLegal,
}: AIRiskSummaryProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500/10 border-red-500/30'
      case 'Moderate':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'Low':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-dark-accent border-dark-border'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">
          AI Summary of Compliance Risk (Last {timeRange === '24h' ? '24 Hours' : timeRange === '7d' ? '7 Days' : '30 Days'})
        </h3>
      </div>

      <div className="space-y-3 mb-6 flex-1 overflow-y-auto">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)}`}
          >
            <div className="flex items-start gap-2 mb-2">
              {insight.severity === 'High' && (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-200 leading-relaxed">{insight.insight}</p>
                {insight.recommendedAction && (
                  <p className="text-xs text-gray-400 italic mt-2">
                    Recommended: {insight.recommendedAction}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-dark-border space-y-2">
        <button
          onClick={onViewDetailedLog}
          className="w-full flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
        >
          <FileText className="w-4 h-4" />
          View Detailed Log
        </button>
        <button
          onClick={onExportReport}
          className="w-full flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export Compliance Report
        </button>
        <button
          onClick={onFlagForLegal}
          className="w-full flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm"
        >
          <Flag className="w-4 h-4" />
          Flag for Legal Review
        </button>
      </div>
    </div>
  )
}

