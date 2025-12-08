'use client'

import { Brain, AlertCircle, TrendingUp, Target } from 'lucide-react'

interface AIInsight {
  type: 'explanation' | 'prediction' | 'recommendation' | 'alert'
  title: string
  content: string
  confidence?: number
  urgency?: 'high' | 'medium' | 'low'
}

interface AIAnalysisPanelProps {
  platform: 'google' | 'tiktok' | 'meta'
  insights: AIInsight[]
}

export default function AIAnalysisPanel({ platform, insights }: AIAnalysisPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'explanation':
        return <Brain className="w-4 h-4 text-primary" />
      case 'prediction':
        return <TrendingUp className="w-4 h-4 text-status-live" />
      case 'recommendation':
        return <Target className="w-4 h-4 text-primary" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-status-degraded" />
      default:
        return null
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10'
      default:
        return 'border-dark-border bg-dark-accent'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-white">
          AI Analysis ({platform.toUpperCase()})
        </h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${getUrgencyColor(insight.urgency)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wide">
                    {insight.type}
                  </h4>
                  {insight.confidence && (
                    <span className="text-xs text-gray-400">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-white mb-1">{insight.title}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{insight.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

