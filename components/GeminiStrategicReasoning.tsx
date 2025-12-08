'use client'

import { Brain, Target, TrendingUp, AlertCircle, MapPin, DollarSign, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StrategicDecision {
  id: string
  timestamp: Date
  question: string
  answer: string
  marketDetails: {
    marketSize: number
    speedToProfit: number
    competitionIntensity: 'none' | 'low' | 'medium' | 'high'
    regulatoryFriction: 'low' | 'medium' | 'high'
    clinicalSupply: number
    marketplaceReadiness: number
    requiredCapital: number
    revenue30d: number
    revenue60d: number
    revenue90d: number
  }
  confidence: number
  recommendation: string
}

interface GeminiStrategicReasoningProps {
  decisions: StrategicDecision[]
}

export default function GeminiStrategicReasoning({ decisions }: GeminiStrategicReasoningProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">Gemini Strategic Reasoning Core</h3>
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
                <p className="text-xs text-gray-300 leading-relaxed mb-4">{decision.answer}</p>
              </div>
              <span className="text-xs text-gray-500">
                {decision.timestamp.toLocaleTimeString()}
              </span>
            </div>

            {/* Market Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400">Market Size</p>
                </div>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(decision.marketDetails.marketSize)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400">Speed to Profit</p>
                </div>
                <p className="text-sm font-medium text-white">
                  {decision.marketDetails.speedToProfit} days
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Competition</p>
                <p className="text-sm font-medium text-white capitalize">
                  {decision.marketDetails.competitionIntensity}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Regulatory</p>
                <p className="text-sm font-medium text-white capitalize">
                  {decision.marketDetails.regulatoryFriction}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Required Capital</p>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(decision.marketDetails.requiredCapital)}
                </p>
              </div>
            </div>

            {/* Revenue Projections */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-dark-surface rounded-lg p-2">
                <p className="text-xs text-gray-400 mb-1">30-Day Revenue</p>
                <p className="text-sm font-bold text-status-live">
                  {formatCurrency(decision.marketDetails.revenue30d)}
                </p>
              </div>
              <div className="bg-dark-surface rounded-lg p-2">
                <p className="text-xs text-gray-400 mb-1">60-Day Revenue</p>
                <p className="text-sm font-bold text-status-live">
                  {formatCurrency(decision.marketDetails.revenue60d)}
                </p>
              </div>
              <div className="bg-dark-surface rounded-lg p-2">
                <p className="text-xs text-gray-400 mb-1">90-Day Revenue</p>
                <p className="text-sm font-bold text-status-live">
                  {formatCurrency(decision.marketDetails.revenue90d)}
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="pt-3 border-t border-dark-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-gray-400">Recommendation:</span>
              </div>
              <p className="text-sm text-white font-medium">{decision.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

