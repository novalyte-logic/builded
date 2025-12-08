'use client'

import { Brain, TrendingUp, MapPin, DollarSign, Users } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface Narrative {
  id: string
  timestamp: Date
  category: 'market_share' | 'revenue_growth' | 'traffic_quality' | 'market_dominance' | 'funnel_economics'
  headline: string
  narrative: string
  metrics: {
    label: string
    value: string | number
    change?: number
  }[]
  context?: string
}

interface InvestorNarrativeProps {
  narratives: Narrative[]
}

export default function InvestorNarrative({ narratives }: InvestorNarrativeProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market_share':
        return <MapPin className="w-4 h-4 text-primary" />
      case 'revenue_growth':
        return <TrendingUp className="w-4 h-4 text-status-live" />
      case 'traffic_quality':
        return <Users className="w-4 h-4 text-primary" />
      case 'market_dominance':
        return <DollarSign className="w-4 h-4 text-status-live" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Gemini Investor Narrator</h3>
      </div>
      <div className="space-y-4">
        {narratives.map((narrative) => (
          <div
            key={narrative.id}
            className="bg-dark-accent border border-dark-border rounded-lg p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              {getCategoryIcon(narrative.category)}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">{narrative.headline}</h4>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{narrative.narrative}</p>
                {narrative.context && (
                  <p className="text-xs text-gray-400 italic mb-3">{narrative.context}</p>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {narrative.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-dark-border">
              {narrative.metrics.map((metric, idx) => (
                <div key={idx}>
                  <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-bold text-white">
                      {typeof metric.value === 'number' && metric.value > 1000
                        ? formatNumber(metric.value)
                        : typeof metric.value === 'number'
                        ? formatCurrency(metric.value)
                        : metric.value}
                    </p>
                    {metric.change !== undefined && (
                      <span
                        className={`text-xs ${
                          metric.change >= 0 ? 'text-status-live' : 'text-status-offline'
                        }`}
                      >
                        {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

