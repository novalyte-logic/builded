'use client'

import { Brain, TrendingUp, TrendingDown, Target, AlertCircle, DollarSign } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface BrainDecision {
  id: string
  timestamp: Date
  question: string
  answer: string
  metrics: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'stable'
  }[]
  action?: string
  confidence: number
}

interface GeminiCentralBrainProps {
  decisions: BrainDecision[]
}

export default function GeminiCentralBrain({ decisions }: GeminiCentralBrainProps) {
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-status-live" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-status-offline" />
      default:
        return null
    }
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Gemini AI Central Brain</h3>
      </div>
      <div className="space-y-4">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className="bg-dark-accent border border-dark-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-white">{decision.question}</h4>
                  <span className="text-xs text-gray-500">
                    {(decision.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{decision.answer}</p>
                {decision.action && (
                  <div className="mb-3 p-2 bg-primary/10 border border-primary/30 rounded">
                    <p className="text-xs font-medium text-primary mb-1">Action:</p>
                    <p className="text-xs text-gray-300">{decision.action}</p>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {decision.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-dark-border">
              {decision.metrics.map((metric, idx) => (
                <div key={idx}>
                  <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                  <div className="flex items-baseline gap-1">
                    {getTrendIcon(metric.trend)}
                    <p className="text-sm font-medium text-white">
                      {typeof metric.value === 'number' && metric.value > 1000
                        ? formatNumber(metric.value)
                        : typeof metric.value === 'number'
                        ? formatCurrency(metric.value)
                        : metric.value}
                    </p>
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

