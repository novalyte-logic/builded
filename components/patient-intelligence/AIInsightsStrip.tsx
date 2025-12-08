'use client'

import { Brain, Users, Rocket, BookOpen, AlertTriangle } from 'lucide-react'

interface AIInsight {
  text: string
  type?: 'positive' | 'warning' | 'neutral'
}

interface AIInsightsStripProps {
  insights: AIInsight[]
  onViewAtRisk?: () => void
  onLaunchReactivation?: () => void
  onSuggestBlog?: () => void
}

export default function AIInsightsStrip({
  insights,
  onViewAtRisk,
  onLaunchReactivation,
  onSuggestBlog,
}: AIInsightsStripProps) {
  const getInsightIcon = (type?: string) => {
    switch (type) {
      case 'positive':
        return <Brain className="w-4 h-4 text-status-live" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-status-degraded" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  const getInsightColor = (type?: string) => {
    switch (type) {
      case 'positive':
        return 'text-status-live'
      case 'warning':
        return 'text-status-degraded'
      default:
        return 'text-gray-300'
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">
          AI Read on Patient Activity (Last 7 Days)
        </h3>
      </div>

      <div className="space-y-3 mb-6">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 bg-dark-accent/50 border border-dark-border rounded-lg p-3"
          >
            <div className="flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</div>
            <p className={`text-sm flex-1 ${getInsightColor(insight.type)}`}>{insight.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-dark-border">
        <button
          onClick={onViewAtRisk}
          className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          View At-Risk Patients
        </button>
        <button
          onClick={onLaunchReactivation}
          className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm font-medium"
        >
          <Rocket className="w-4 h-4" />
          Launch Reactivation Sequence
        </button>
        <button
          onClick={onSuggestBlog}
          className="flex items-center gap-2 px-4 py-2 bg-dark-accent border border-dark-border rounded-lg text-gray-300 hover:text-white hover:bg-dark-hover transition-colors text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          Suggest Blog Topics
        </button>
      </div>
    </div>
  )
}

