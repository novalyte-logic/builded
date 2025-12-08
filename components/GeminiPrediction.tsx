'use client'

import { Brain, TrendingUp, AlertCircle, Target, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Prediction {
  id: string
  timeframe: '24h' | '72h' | '7d'
  platform: 'google' | 'tiktok' | 'meta' | 'global'
  prediction: string
  confidence: number
  recommendations: string[]
  risks: string[]
  opportunities: string[]
  expectedImpact?: {
    revenue: number
    spend: number
    roas: number
  }
}

interface GeminiPredictionProps {
  predictions: Prediction[]
}

export default function GeminiPrediction({ predictions }: GeminiPredictionProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-white">Gemini AI Predictive Budgeting</h3>
      </div>
      <div className="space-y-4">
        {predictions.map((pred) => (
          <div
            key={pred.id}
            className="bg-dark-accent border border-dark-border rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white uppercase">
                    {pred.timeframe} Forecast
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                    {pred.platform}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(pred.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{pred.prediction}</p>
              </div>
            </div>

            {pred.expectedImpact && (
              <div className="mt-3 pt-3 border-t border-dark-border grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Expected Revenue</p>
                  <p className="text-status-live font-medium">
                    {formatCurrency(pred.expectedImpact.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Expected Spend</p>
                  <p className="text-white font-medium">
                    {formatCurrency(pred.expectedImpact.spend)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Expected ROAS</p>
                  <p className="text-status-live font-medium">
                    {pred.expectedImpact.roas.toFixed(2)}x
                  </p>
                </div>
              </div>
            )}

            {pred.recommendations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-gray-400">Recommendations</span>
                </div>
                <ul className="space-y-1">
                  {pred.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pred.risks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-3 h-3 text-status-degraded" />
                  <span className="text-xs font-medium text-gray-400">Risks</span>
                </div>
                <ul className="space-y-1">
                  {pred.risks.map((risk, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-status-degraded mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pred.opportunities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3 h-3 text-status-live" />
                  <span className="text-xs font-medium text-gray-400">Opportunities</span>
                </div>
                <ul className="space-y-1">
                  {pred.opportunities.map((opp, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-status-live mt-1">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

