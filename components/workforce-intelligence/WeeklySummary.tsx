'use client'

import { Sparkles, TrendingUp, AlertCircle, Users } from 'lucide-react'

interface WeeklySummaryProps {
  summary: {
    text: string
    keyHighlights: Array<{
      metric: string
      value: string
      trend?: 'up' | 'down' | 'stable'
    }>
    recommendedActions: string[]
  } | null
  loading?: boolean
}

export default function WeeklySummary({ summary, loading }: WeeklySummaryProps) {
  if (loading || !summary) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-white">This Week's Workforce Summary</h2>
        </div>
        <div className="text-gray-400">Generating AI summary...</div>
      </div>
    )
  }

  return (
    <div className="bg-dark-surface border border-primary/30 rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-white">This Week's Workforce Summary</h2>
        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
          AI-Generated
        </span>
      </div>

      {/* Main Summary Text */}
      <div className="mb-6">
        <p className="text-base text-gray-100 leading-relaxed">{summary.text}</p>
      </div>

      {/* Key Highlights */}
      {summary.keyHighlights && summary.keyHighlights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {summary.keyHighlights.map((highlight, idx) => (
            <div
              key={idx}
              className="bg-dark-accent border border-dark-border rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {highlight.trend === 'up' && (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                )}
                {highlight.trend === 'down' && (
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                )}
                {!highlight.trend && <Users className="w-4 h-4 text-primary" />}
                <span className="text-xs text-gray-400">{highlight.metric}</span>
              </div>
              <div className="text-lg font-bold text-white">{highlight.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Actions */}
      {summary.recommendedActions && summary.recommendedActions.length > 0 && (
        <div className="pt-4 border-t border-dark-border">
          <div className="text-sm font-medium text-gray-300 mb-3">Recommended Actions</div>
          <ul className="space-y-2">
            {summary.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-primary mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

